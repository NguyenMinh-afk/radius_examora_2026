"""
Tích hợp OCR.Space cho ảnh nhỏ và PDF scan ngắn.

Provider này phù hợp nhánh OCR nhanh khi còn key/quota; nếu không ổn, hệ thống
sẽ để tầng gọi phía trên fallback về OCR local.
"""

from pathlib import Path
import re
import time
from typing import Any

from app.core.config import Settings, get_settings
from app.core.exceptions import DocumentError
from app.core.logging import get_logger
from app.infrastructure.documents.ocr_provider_base import (
    BaseOCRProvider,
    OCRProviderResult,
)

logger = get_logger(__name__)

_OCR_TOO_SHORT_ERROR = "OCR completed but extracted text is too short."
_OCR_SPACE_MISSING_KEY_ERROR = "OCR.Space API key is missing. Set OCR_SPACE_API_KEY or switch OCR_PROVIDER to local."
_OCR_SPACE_INVALID_KEY_ERROR = (
    "OCR.Space API key is invalid or rejected by the service."
)
_OCR_SPACE_TIMEOUT_ERROR = "OCR.Space request timed out."
_OCR_SPACE_QUOTA_LIMIT_ERROR = (
    "OCR.Space quota limit reached. Use OCR_PROVIDER=local or wait until quota resets."
)
_OCR_SPACE_FILETYPE_ERROR = "OCR.Space could not detect the uploaded file type."
_OCR_SPACE_RESPONSE_ERROR = "OCR.Space returned an invalid response payload."
_OCR_SPACE_FREE_GUARD_ERROR = (
    "OCR.Space Free is intended for small images or short scans. "
    "Use OCR_PROVIDER=local or reduce OCR_MAX_PAGES."
)


class OCRSpaceService(BaseOCRProvider):
    """OCR.Space integration optimized for quick image OCR and short scans."""

    provider_name = "ocr_space"

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.last_response_received = False

    def extract_text_from_pdf(self, pdf_path: Path) -> OCRProviderResult:
        self._require_api_key()
        path = Path(pdf_path)
        if not path.exists() or not path.is_file():
            raise DocumentError(f"OCR input PDF not found: {path}")

        allowed, _ = self.assess_pdf_input(path)
        if not allowed:
            raise DocumentError(_OCR_SPACE_FREE_GUARD_ERROR)

        file_bytes = path.read_bytes()
        return self.extract_text_from_image_bytes(
            file_bytes,
            filename=path.name,
            content_type="application/pdf",
        )

    def extract_text_from_image_file(
        self,
        image_path: Path,
        *,
        content_type: str | None = None,
    ) -> OCRProviderResult:
        self._require_api_key()
        path = Path(image_path)
        if not path.exists() or not path.is_file():
            raise DocumentError(f"OCR input image not found: {path}")

        allowed, reason = self.assess_image_input(path)
        if not allowed:
            raise DocumentError(reason)

        return self.extract_text_from_image_bytes(
            path.read_bytes(),
            filename=path.name,
            content_type=content_type,
        )

    def extract_text_from_image_bytes(
        self,
        image_bytes: bytes,
        *,
        filename: str,
        content_type: str | None = None,
    ) -> OCRProviderResult:
        self.last_response_received = False
        self._require_api_key()
        try:
            import httpx
        except ImportError as exc:
            raise DocumentError(
                "OCR.Space dependency 'httpx' is missing. Please rebuild the Docker image."
            ) from exc

        endpoint = (
            self.settings.ocr_space_endpoint or ""
        ).strip() or "https://api.ocr.space/parse/image"
        filetype = self._infer_filetype(filename=filename, content_type=content_type)
        started = time.perf_counter()
        logger.info(
            "OCR.Space request started | ocr_provider=ocr_space | filename=%s | content_type=%s | bytes=%d",
            filename,
            content_type or "application/octet-stream",
            len(image_bytes),
        )

        data = {
            "language": (self.settings.ocr_space_language or "eng").strip() or "eng",
            "OCREngine": str(self.settings.ocr_space_engine),
            "detectOrientation": self._bool_to_string(
                self.settings.ocr_space_detect_orientation
            ),
            "scale": self._bool_to_string(self.settings.ocr_space_scale),
            "isTable": self._bool_to_string(self.settings.ocr_space_is_table),
        }
        if filetype:
            data["filetype"] = filetype

        headers = {"apikey": (self.settings.ocr_space_api_key or "").strip()}
        files = {
            "file": (
                filename,
                image_bytes,
                content_type or self._default_content_type(filename),
            )
        }

        timeout_seconds = float(self.settings.ocr_space_timeout_seconds)
        try:
            with httpx.Client(timeout=timeout_seconds, follow_redirects=True) as client:
                response = client.post(
                    endpoint, data=data, files=files, headers=headers
                )
                self.last_response_received = True
                response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise DocumentError(_OCR_SPACE_TIMEOUT_ERROR) from exc
        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            if status_code in {401, 403}:
                raise DocumentError(_OCR_SPACE_INVALID_KEY_ERROR) from exc
            if status_code == 429:
                raise DocumentError(_OCR_SPACE_QUOTA_LIMIT_ERROR) from exc
            raise DocumentError(
                f"OCR.Space HTTP {status_code}: {str(exc)[:200]}"
            ) from exc
        except httpx.HTTPError as exc:
            raise DocumentError(f"OCR.Space request failed: {str(exc)[:200]}") from exc

        try:
            payload = response.json()
        except ValueError as exc:
            raise DocumentError(_OCR_SPACE_RESPONSE_ERROR) from exc

        text, pages_processed, processing_ms = self._parse_payload(payload)
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        logger.info(
            "OCR.Space completed | ocr_provider=ocr_space | filename=%s | content_type=%s | text_chars=%d | elapsed_time=%.2fs | pages=%s",
            filename,
            content_type or self._default_content_type(filename),
            len(text),
            elapsed_ms / 1000.0,
            pages_processed if pages_processed is not None else "unknown",
        )
        return OCRProviderResult(
            provider=self.provider_name,
            text=text,
            pages_processed=pages_processed,
            elapsed_time_ms=processing_ms or elapsed_ms,
        )

    def assess_pdf_input(self, pdf_path: Path) -> tuple[bool, str]:
        page_count = self._read_pdf_page_count(pdf_path)
        file_size_bytes = pdf_path.stat().st_size
        if file_size_bytes > self._max_file_bytes:
            return False, "Large scanned PDF exceeds OCR.Space file-size guard"
        if page_count is not None and page_count > int(
            self.settings.ocr_space_max_pdf_pages
        ):
            return False, "Large scanned PDF exceeds OCR.Space page-count guard"
        return True, "OCR.Space PDF input is within free-tier guard"

    def assess_image_input(self, image_path: Path) -> tuple[bool, str]:
        file_size_bytes = image_path.stat().st_size
        if file_size_bytes > self._max_file_bytes:
            return False, "Large image exceeds OCR.Space file-size guard"
        return True, "OCR.Space image input is within free-tier guard"

    @property
    def _max_file_bytes(self) -> int:
        return int(self.settings.ocr_space_max_file_mb) * 1024 * 1024

    def _parse_payload(self, payload: Any) -> tuple[str, int | None, int | None]:
        if not isinstance(payload, dict):
            raise DocumentError(_OCR_SPACE_RESPONSE_ERROR)

        parsed_results = payload.get("ParsedResults")
        if parsed_results is not None and not isinstance(parsed_results, list):
            raise DocumentError(_OCR_SPACE_RESPONSE_ERROR)

        top_error = self._combine_error_messages(
            payload.get("ErrorMessage"),
            payload.get("ErrorDetails"),
        )
        exit_code = self._to_int(payload.get("OCRExitCode"))
        is_errored = bool(payload.get("IsErroredOnProcessing"))
        processing_ms = self._to_int(payload.get("ProcessingTimeInMilliseconds"))

        page_texts: list[str] = []
        page_errors: list[str] = []
        for item in parsed_results or []:
            if not isinstance(item, dict):
                continue
            parsed_text = str(item.get("ParsedText") or "")
            if parsed_text.strip():
                page_texts.append(parsed_text)

            page_exit_code = self._to_int(item.get("FileParseExitCode"))
            page_error = self._combine_error_messages(
                item.get("ErrorMessage"),
                item.get("ErrorDetails"),
            )
            if page_error and page_exit_code != 1:
                page_errors.append(page_error)

        text = self._normalize_text("\n\n".join(page_texts))
        if text:
            if len(text.strip()) < int(self.settings.ocr_min_text_length):
                raise DocumentError(_OCR_TOO_SHORT_ERROR)
            return text, len(parsed_results or []) or None, processing_ms

        error_message = top_error or (page_errors[0] if page_errors else "")
        if is_errored or exit_code in {3, 4} or error_message:
            raise DocumentError(self._map_api_error(error_message))
        raise DocumentError(_OCR_TOO_SHORT_ERROR)

    def _require_api_key(self) -> None:
        if not (self.settings.ocr_space_api_key or "").strip():
            raise DocumentError(_OCR_SPACE_MISSING_KEY_ERROR)

    def _read_pdf_page_count(self, pdf_path: Path) -> int | None:
        try:
            from pypdf import PdfReader
        except ImportError:
            logger.warning(
                "pypdf unavailable while checking OCR.Space PDF guard; continuing without page count | path=%s",
                pdf_path,
            )
            return None

        try:
            with pdf_path.open("rb") as handle:
                return len(PdfReader(handle).pages)
        except Exception as exc:
            logger.warning(
                "Could not read PDF page count for OCR.Space guard | path=%s | error=%s",
                pdf_path,
                str(exc)[:300],
            )
            return None

    def _infer_filetype(self, *, filename: str, content_type: str | None) -> str | None:
        suffix = Path(filename).suffix.lower()
        mapping = {
            ".pdf": "PDF",
            ".png": "PNG",
            ".jpg": "JPG",
            ".jpeg": "JPG",
            ".gif": "GIF",
            ".tif": "TIF",
            ".tiff": "TIF",
            ".bmp": "BMP",
        }
        if suffix in mapping:
            return mapping[suffix]

        normalized_content_type = (content_type or "").lower()
        if normalized_content_type == "application/pdf":
            return "PDF"
        if normalized_content_type == "image/png":
            return "PNG"
        if normalized_content_type in {"image/jpeg", "image/jpg"}:
            return "JPG"
        return None

    def _default_content_type(self, filename: str) -> str:
        suffix = Path(filename).suffix.lower()
        mapping = {
            ".pdf": "application/pdf",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".bmp": "image/bmp",
            ".tif": "image/tiff",
            ".tiff": "image/tiff",
        }
        return mapping.get(suffix, "application/octet-stream")

    def _map_api_error(self, message: str) -> str:
        normalized = re.sub(r"\s+", " ", (message or "").strip())
        lowered = normalized.lower()
        if not normalized:
            return "OCR.Space returned no text."
        if "file size exceeds" in lowered or "maximum permissible file size" in lowered:
            return _OCR_SPACE_FREE_GUARD_ERROR
        if "page limit" in lowered or "maximum pages" in lowered:
            return _OCR_SPACE_FREE_GUARD_ERROR
        if (
            "quota" in lowered
            or "rate limit" in lowered
            or "too many requests" in lowered
        ):
            return _OCR_SPACE_QUOTA_LIMIT_ERROR
        if "api key" in lowered or ("key" in lowered and "invalid" in lowered):
            return _OCR_SPACE_INVALID_KEY_ERROR
        if "timeout" in lowered:
            return _OCR_SPACE_TIMEOUT_ERROR
        if "file type" in lowered or "file extension" in lowered:
            return _OCR_SPACE_FILETYPE_ERROR
        return f"OCR.Space request failed: {normalized[:300]}"

    def _combine_error_messages(self, *values: Any) -> str:
        parts: list[str] = []
        for value in values:
            if value is None:
                continue
            if isinstance(value, str):
                text = value.strip()
                if text:
                    parts.append(text)
                continue
            if isinstance(value, list):
                for item in value:
                    text = str(item or "").strip()
                    if text:
                        parts.append(text)
                continue
            text = str(value).strip()
            if text:
                parts.append(text)
        return " | ".join(parts)

    def _normalize_text(self, text: str) -> str:
        normalized_lines: list[str] = []
        previous_blank = False
        for raw_line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
            line = re.sub(r"[ \t\f\v]+", " ", raw_line).strip()
            if line:
                normalized_lines.append(line)
                previous_blank = False
            elif not previous_blank:
                normalized_lines.append("")
                previous_blank = True

        normalized = "\n".join(normalized_lines).strip()
        return re.sub(r"\n{3,}", "\n\n", normalized)

    def _to_int(self, value: Any) -> int | None:
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    def _bool_to_string(self, value: bool) -> str:
        return "true" if value else "false"
