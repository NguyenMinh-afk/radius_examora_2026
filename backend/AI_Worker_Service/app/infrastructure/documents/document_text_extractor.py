"""
Trích xuất text từ file đã lưu trên shared volume.

TXT/DOCX/PDF có text layer sẽ đọc trực tiếp; PDF scan và ảnh mới đi qua nhánh
OCR theo cấu hình hiện tại.
"""
from pathlib import Path
from typing import Any

from app.core.config import Settings, get_settings
from app.core.exceptions import DocumentError, UnsupportedFileTypeError
from app.core.logging import get_logger
from app.infrastructure.documents import docx_loader, pdf_loader, txt_loader
from app.infrastructure.documents.ocr_provider_base import OCRProviderResult
from app.infrastructure.documents.ocr_service import OCRService
from app.infrastructure.documents.ocr_space_service import OCRSpaceService

logger = get_logger(__name__)

_PDF_SCAN_ERROR = "PDF scan/image-only, OCR is required but not enabled."
_OCR_TOO_SHORT_ERROR = "OCR completed but extracted text is too short."
_OCR_UNAVAILABLE_ERROR = (
    "No OCR provider is available. Set OCR_SPACE_API_KEY or ENABLE_OCR=true."
)
_OCR_SPACE_QUOTA_LIMIT_ERROR = (
    "OCR.Space quota limit reached. Use OCR_PROVIDER=local or wait until quota resets."
)
_OCR_SPACE_FREE_GUARD_ERROR = (
    "OCR.Space Free is intended for small images or short scans. "
    "Use OCR_PROVIDER=local or reduce OCR_MAX_PAGES."
)
_IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}


class DocumentTextExtractor:
    """Load a stored document file and extract plain text for the AI pipeline."""

    def __init__(
        self,
        *,
        settings: Settings | None = None,
        enable_ocr: bool | None = None,
        ocr_service: OCRService | None = None,
        ocr_space_service: OCRSpaceService | None = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.enable_ocr = self.settings.enable_ocr if enable_ocr is None else bool(enable_ocr)
        self.ocr_service = ocr_service or OCRService(settings=self.settings)
        self.ocr_space_service = ocr_space_service or OCRSpaceService(settings=self.settings)
        self.ocr_min_text_chars = int(self.settings.ocr_min_text_length)
        self.ocr_provider_mode = (self.settings.ocr_provider or "auto").strip().lower() or "auto"
        self.runtime_ocr_space_status: dict[str, Any] | None = None
        self.last_ocr_decision: dict[str, Any] | None = None
        self.last_ocr_result: OCRProviderResult | None = None
        self.last_ocr_space_response_received = False

    def set_ocr_space_runtime_status(self, status: dict[str, Any] | None) -> None:
        """Inject async quota status prepared by the worker before extraction."""
        self.runtime_ocr_space_status = status

    def extract_from_path(
        self,
        storage_path: str,
        *,
        original_filename: str | None = None,
        content_type: str | None = None,
    ) -> str:
        """
        Read a stored PDF/DOCX/TXT/image file and return extracted text.

        Raises:
            DocumentError: file missing, empty text, or OCR-required source.
            UnsupportedFileTypeError: extension is not supported.
        """
        self._reset_runtime_state()
        path = Path(storage_path)
        display_name = original_filename or path.name

        if not path.exists() or not path.is_file():
            raise DocumentError(
                f"Stored document file not found: {storage_path}. "
                "Check that API and Worker share the same ./data volume."
            )

        suffix = path.suffix.lower()
        file_bytes = path.read_bytes()
        logger.info(
            "Worker reading document | path=%s | filename=%s | content_type=%s | bytes=%d",
            storage_path,
            display_name,
            content_type or "unknown",
            len(file_bytes),
        )

        if suffix == ".pdf":
            return self._extract_pdf(path, file_bytes, display_name)
        if suffix == ".docx":
            self._log_decision(
                filename=display_name,
                source_kind="docx",
                need_ocr=False,
                selected_provider="none",
                reason="DOCX is parsed directly",
            )
            return docx_loader.load_docx(file_bytes, display_name)
        if suffix == ".txt":
            self._log_decision(
                filename=display_name,
                source_kind="txt",
                need_ocr=False,
                selected_provider="none",
                reason="TXT is plain text",
            )
            return txt_loader.load_txt(file_bytes, display_name)
        if suffix in _IMAGE_SUFFIXES:
            return self._extract_image(path, display_name, content_type)

        raise UnsupportedFileTypeError(display_name)

    def _extract_pdf(self, path: Path, file_bytes: bytes, filename: str) -> str:
        """Extract PDF text, falling back to OCR only when the PDF needs it."""
        try:
            text = pdf_loader.load_pdf(file_bytes, filename)
        except DocumentError as exc:
            if self._looks_like_scanned_pdf_error(str(exc)):
                return self._extract_scanned_pdf(path, filename, reason="PDF has no extractable text layer")
            raise

        if len(text.strip()) < self.ocr_min_text_chars:
            return self._extract_scanned_pdf(path, filename, reason="PDF text layer is too short")

        self._log_decision(
            filename=filename,
            source_kind="pdf_text",
            need_ocr=False,
            selected_provider="none",
            reason="PDF has extractable text layer",
        )
        return text

    def _extract_scanned_pdf(self, path: Path, filename: str, *, reason: str) -> str:
        mode = self.ocr_provider_mode
        if mode == "local":
            self._log_decision(
                filename=filename,
                source_kind="pdf_scan",
                need_ocr=True,
                selected_provider="local",
                reason="Local-only mode uses local OCR",
            )
            return self._accept_ocr_result(self.ocr_service.extract_text_from_pdf(path), filename)

        if mode == "ocr_space":
            self._ensure_ocr_space_configured(filename=filename, source_kind="pdf_scan")
            allowed, _ = self.ocr_space_service.assess_pdf_input(path)
            if not allowed:
                self._log_decision(
                    filename=filename,
                    source_kind="pdf_scan",
                    need_ocr=True,
                    selected_provider="ocr_space",
                    reason="Cloud-only mode rejects large scanned PDF",
                )
                raise DocumentError(_OCR_SPACE_FREE_GUARD_ERROR)
            self._log_decision(
                filename=filename,
                source_kind="pdf_scan",
                need_ocr=True,
                selected_provider="ocr_space",
                reason="Cloud-only mode uses OCR.Space",
            )
            return self._accept_ocr_result(self._run_ocr_space_pdf(path), filename)

        if mode == "auto":
            if not self._has_ocr_space_key():
                self._log_decision(
                    filename=filename,
                    source_kind="pdf_scan",
                    need_ocr=True,
                    selected_provider="local",
                    reason="OCR.Space API key missing, using local OCR",
                )
                return self._accept_ocr_result(self.ocr_service.extract_text_from_pdf(path), filename)

            if not self._ocr_space_quota_available():
                self._log_decision(
                    filename=filename,
                    source_kind="pdf_scan",
                    need_ocr=True,
                    selected_provider="local",
                    reason="OCR.Space quota reached, fallback to local OCR",
                )
                return self._accept_ocr_result(self.ocr_service.extract_text_from_pdf(path), filename)

            allowed, _ = self.ocr_space_service.assess_pdf_input(path)
            if not allowed:
                self._log_decision(
                    filename=filename,
                    source_kind="pdf_scan",
                    need_ocr=True,
                    selected_provider="local",
                    reason="Large scanned PDF uses local OCR",
                )
                return self._accept_ocr_result(self.ocr_service.extract_text_from_pdf(path), filename)

            self._log_decision(
                filename=filename,
                source_kind="pdf_scan",
                need_ocr=True,
                selected_provider="ocr_space",
                reason="Auto mode uses OCR.Space first",
            )
            try:
                return self._accept_ocr_result(self._run_ocr_space_pdf(path), filename)
            except DocumentError:
                self._log_fallback(
                    from_provider="ocr_space",
                    to_provider="local",
                    reason="OCR.Space failed or returned insufficient text",
                )
                return self._accept_ocr_result(self.ocr_service.extract_text_from_pdf(path), filename)

        raise DocumentError(f"Unsupported OCR_PROVIDER: {mode}")

    def _extract_image(
        self,
        path: Path,
        filename: str,
        content_type: str | None,
    ) -> str:
        mode = self.ocr_provider_mode
        if mode == "local":
            self._log_decision(
                filename=filename,
                source_kind="image",
                need_ocr=True,
                selected_provider="local",
                reason="Local-only mode uses local OCR",
            )
            return self._accept_ocr_result(
                self.ocr_service.extract_text_from_image_file(path, content_type=content_type),
                filename,
            )

        if mode == "ocr_space":
            self._ensure_ocr_space_configured(filename=filename, source_kind="image")
            allowed, reason = self.ocr_space_service.assess_image_input(path)
            if not allowed:
                self._log_decision(
                    filename=filename,
                    source_kind="image",
                    need_ocr=True,
                    selected_provider="ocr_space",
                    reason=reason,
                )
                raise DocumentError(_OCR_SPACE_FREE_GUARD_ERROR)
            self._log_decision(
                filename=filename,
                source_kind="image",
                need_ocr=True,
                selected_provider="ocr_space",
                reason="Cloud-only mode uses OCR.Space",
            )
            return self._accept_ocr_result(
                self._run_ocr_space_image(path, content_type=content_type),
                filename,
            )

        if mode == "auto":
            if not self._has_ocr_space_key():
                self._log_decision(
                    filename=filename,
                    source_kind="image",
                    need_ocr=True,
                    selected_provider="local",
                    reason="OCR.Space API key missing, using local OCR",
                )
                return self._accept_ocr_result(
                    self.ocr_service.extract_text_from_image_file(path, content_type=content_type),
                    filename,
                )

            if not self._ocr_space_quota_available():
                self._log_decision(
                    filename=filename,
                    source_kind="image",
                    need_ocr=True,
                    selected_provider="local",
                    reason="OCR.Space quota reached, fallback to local OCR",
                )
                return self._accept_ocr_result(
                    self.ocr_service.extract_text_from_image_file(path, content_type=content_type),
                    filename,
                )

            allowed, _ = self.ocr_space_service.assess_image_input(path)
            if not allowed:
                self._log_decision(
                    filename=filename,
                    source_kind="image",
                    need_ocr=True,
                    selected_provider="local",
                    reason="Large image uses local OCR",
                )
                return self._accept_ocr_result(
                    self.ocr_service.extract_text_from_image_file(path, content_type=content_type),
                    filename,
                )

            self._log_decision(
                filename=filename,
                source_kind="image",
                need_ocr=True,
                selected_provider="ocr_space",
                reason="Auto mode uses OCR.Space first",
            )
            try:
                return self._accept_ocr_result(
                    self._run_ocr_space_image(path, content_type=content_type),
                    filename,
                )
            except DocumentError:
                self._log_fallback(
                    from_provider="ocr_space",
                    to_provider="local",
                    reason="OCR.Space failed or returned insufficient text",
                )
                return self._accept_ocr_result(
                    self.ocr_service.extract_text_from_image_file(path, content_type=content_type),
                    filename,
                )

        raise DocumentError(f"Unsupported OCR_PROVIDER: {mode}")

    def _accept_ocr_result(self, result: OCRProviderResult, filename: str) -> str:
        text = (result.text or "").strip()
        if len(text) < self.ocr_min_text_chars:
            raise DocumentError(_OCR_TOO_SHORT_ERROR)
        self.last_ocr_result = result
        logger.info(
            "OCR text accepted | filename=%s | provider=%s | chars=%d",
            filename,
            result.provider,
            len(text),
        )
        return text

    def _run_ocr_space_pdf(self, path: Path) -> OCRProviderResult:
        try:
            return self.ocr_space_service.extract_text_from_pdf(path)
        finally:
            self.last_ocr_space_response_received = bool(self.ocr_space_service.last_response_received)

    def _run_ocr_space_image(
        self,
        path: Path,
        *,
        content_type: str | None,
    ) -> OCRProviderResult:
        try:
            return self.ocr_space_service.extract_text_from_image_file(path, content_type=content_type)
        finally:
            self.last_ocr_space_response_received = bool(self.ocr_space_service.last_response_received)

    def _ensure_ocr_space_configured(self, *, filename: str, source_kind: str) -> None:
        if not self._has_ocr_space_key():
            self._log_decision(
                filename=filename,
                source_kind=source_kind,
                need_ocr=True,
                selected_provider="ocr_space",
                reason="Cloud-only mode requires OCR.Space API key",
            )
            raise DocumentError("OCR.Space API key is missing. Set OCR_SPACE_API_KEY or switch OCR_PROVIDER to local.")
        if not self._ocr_space_quota_available():
            self._log_decision(
                filename=filename,
                source_kind=source_kind,
                need_ocr=True,
                selected_provider="ocr_space",
                reason="Cloud-only mode quota reached",
            )
            raise DocumentError(_OCR_SPACE_QUOTA_LIMIT_ERROR)

    def _reset_runtime_state(self) -> None:
        self.last_ocr_decision = None
        self.last_ocr_result = None
        self.last_ocr_space_response_received = False

    def _has_ocr_space_key(self) -> bool:
        return bool((self.settings.ocr_space_api_key or "").strip())

    def _ocr_space_quota_available(self) -> bool:
        status = self.runtime_ocr_space_status or {}
        remaining = status.get("remaining_today")
        if remaining is None:
            return True
        return int(remaining) > 0

    def _log_decision(
        self,
        *,
        filename: str,
        source_kind: str,
        need_ocr: bool,
        selected_provider: str,
        reason: str,
    ) -> None:
        used_today, daily_limit = self._ocr_space_usage_fields()
        self.last_ocr_decision = {
            "filename": filename,
            "source_kind": source_kind,
            "need_ocr": need_ocr,
            "ocr_provider_mode": self.ocr_provider_mode,
            "selected_provider": selected_provider,
            "reason": reason,
            "ocr_space_used_today": used_today,
            "ocr_space_daily_limit": daily_limit,
        }
        logger.info(
            "OCR decision | filename=%s | source_kind=%s | need_ocr=%s | ocr_provider_mode=%s | selected_provider=%s | reason=%s | ocr_space_used_today=%s | ocr_space_daily_limit=%s",
            filename,
            source_kind,
            need_ocr,
            self.ocr_provider_mode,
            selected_provider,
            reason,
            used_today,
            daily_limit,
        )

    def _log_fallback(self, *, from_provider: str, to_provider: str, reason: str) -> None:
        logger.warning(
            "OCR fallback | from=%s | to=%s | reason=%s",
            from_provider,
            to_provider,
            reason,
        )

    def _ocr_space_usage_fields(self) -> tuple[str, str]:
        status = self.runtime_ocr_space_status or {}
        used_today = status.get("used_today")
        daily_limit = status.get("daily_limit")
        return str(used_today) if used_today is not None else "n/a", str(daily_limit) if daily_limit is not None else "n/a"

    def _looks_like_scanned_pdf_error(self, message: str) -> bool:
        lowered = message.lower()
        return (
            "no extractable text" in lowered
            or "scanned" in lowered
            or "image-based" in lowered
        )
