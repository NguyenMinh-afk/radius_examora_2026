"""
OCR local bằng Tesseract cho PDF scan và ảnh.

File này chỉ xử lý nhánh OCR nội bộ; các dependency OCR được nạp muộn để không
làm ảnh hưởng luồng đọc TXT/DOCX/PDF text-layer thông thường.
"""

from io import BytesIO
from pathlib import Path
import re
import time
from typing import Any, Callable

from app.core.config import Settings, get_settings
from app.core.exceptions import DocumentError
from app.core.logging import get_logger
from app.infrastructure.documents.ocr_provider_base import (
    BaseOCRProvider,
    OCRProviderResult,
)

logger = get_logger(__name__)

_PDF_SCAN_ERROR = "PDF scan/image-only, OCR is required but not enabled."
_IMAGE_OCR_DISABLED_ERROR = "Image OCR requires local OCR. Set ENABLE_OCR=true or switch OCR_PROVIDER to ocr_space/auto."
_OCR_TOO_SHORT_ERROR = "OCR completed but extracted text is too short."
_MISSING_PYTESSERACT_ERROR = (
    "OCR Python dependency 'pytesseract' is missing. "
    "Please install pytesseract or rebuild the Docker image."
)
_MISSING_PDF2IMAGE_ERROR = (
    "OCR Python dependency 'pdf2image' is missing. "
    "Please install pdf2image or rebuild the Docker image."
)
_MISSING_PILLOW_ERROR = (
    "OCR Python dependency 'Pillow' is missing. "
    "Please install Pillow or rebuild the Docker image."
)
_MISSING_TESSERACT_ERROR = (
    "OCR is enabled but Tesseract is not installed or not configured. "
    "Please install Tesseract OCR and set TESSERACT_CMD."
)
_MISSING_POPPLER_ERROR = (
    "OCR requires Poppler for PDF to image conversion. "
    "Please install Poppler and set POPPLER_PATH."
)
_LOCAL_OCR_BATCH_SIZE = 4


class OCRService(BaseOCRProvider):
    """Extract text from scanned PDFs and images with local Tesseract OCR."""

    provider_name = "local"

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    def extract_text_from_pdf(self, pdf_path: Path) -> OCRProviderResult:
        if not self.settings.enable_ocr:
            raise DocumentError(_PDF_SCAN_ERROR)

        path = Path(pdf_path)
        if not path.exists() or not path.is_file():
            raise DocumentError(f"OCR input PDF not found: {path}")

        convert_from_path, pdfinfo_from_path, poppler_error_type = (
            self._load_pdf2image()
        )
        pytesseract, tesseract_error_type = self._load_pytesseract()
        self._configure_tesseract(pytesseract)

        poppler_path = (self.settings.poppler_path or "").strip() or None
        language = (self.settings.ocr_language or "vie+eng").strip() or "vie+eng"
        dpi = int(self.settings.ocr_dpi)
        max_pages = int(self.settings.ocr_max_pages)
        min_text_length = int(self.settings.ocr_min_text_length)

        logger.info(
            "Starting OCR | ocr_provider=local | path=%s | language=%s | dpi=%d | max_pages=%d",
            path,
            language,
            dpi,
            max_pages,
        )

        started = time.perf_counter()
        total_pages = self._read_page_count(
            pdfinfo_from_path=pdfinfo_from_path,
            poppler_error_type=poppler_error_type,
            pdf_path=path,
            poppler_path=poppler_path,
        )
        pages_to_process = min(total_pages, max_pages) if total_pages else max_pages
        if total_pages and total_pages > max_pages:
            logger.warning(
                "PDF exceeds OCR_MAX_PAGES; OCR will process first pages only | path=%s | total_pages=%d | max_pages=%d",
                path,
                total_pages,
                max_pages,
            )

        page_texts: list[str] = []
        for batch_start in range(1, pages_to_process + 1, _LOCAL_OCR_BATCH_SIZE):
            batch_end = min(batch_start + _LOCAL_OCR_BATCH_SIZE - 1, pages_to_process)
            images = self._convert_pdf_pages(
                convert_from_path=convert_from_path,
                poppler_error_type=poppler_error_type,
                pdf_path=path,
                dpi=dpi,
                first_page=batch_start,
                last_page=batch_end,
                poppler_path=poppler_path,
            )
            logger.info(
                "PDF batch converted for OCR | ocr_provider=local | path=%s | batch=%d-%d | pages=%d",
                path,
                batch_start,
                batch_end,
                len(images),
            )

            for index, image in enumerate(images):
                page_number = batch_start + index
                try:
                    page_text = self._ocr_image(
                        pytesseract=pytesseract,
                        tesseract_error_type=tesseract_error_type,
                        image=image,
                        language=language,
                        source_name=f"{path.name}#page{page_number}",
                    )
                    page_texts.append(page_text)
                    logger.info(
                        "OCR page %d/%d completed | ocr_provider=local | path=%s",
                        page_number,
                        pages_to_process,
                        path,
                    )
                finally:
                    self._close_image(image)
            images.clear()

        text = self._normalize_text("\n\n".join(page_texts))
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        logger.info(
            "OCR completed | ocr_provider=local | path=%s | pages=%d | text_chars=%d | elapsed_time=%.2fs",
            path,
            pages_to_process,
            len(text),
            elapsed_ms / 1000.0,
        )

        if len(text.strip()) < min_text_length:
            raise DocumentError(_OCR_TOO_SHORT_ERROR)
        return OCRProviderResult(
            provider=self.provider_name,
            text=text,
            pages_processed=pages_to_process,
            elapsed_time_ms=elapsed_ms,
        )

    def extract_text_from_image_file(
        self,
        image_path: Path,
        *,
        content_type: str | None = None,
    ) -> OCRProviderResult:
        path = Path(image_path)
        if not path.exists() or not path.is_file():
            raise DocumentError(f"OCR input image not found: {path}")
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
        if not self.settings.enable_ocr:
            raise DocumentError(_IMAGE_OCR_DISABLED_ERROR)

        pytesseract, tesseract_error_type = self._load_pytesseract()
        image_type = self._load_pillow_image_type()
        self._configure_tesseract(pytesseract)

        language = (self.settings.ocr_language or "vie+eng").strip() or "vie+eng"
        min_text_length = int(self.settings.ocr_min_text_length)
        started = time.perf_counter()
        logger.info(
            "Starting OCR | ocr_provider=local | filename=%s | content_type=%s | bytes=%d",
            filename,
            content_type or "application/octet-stream",
            len(image_bytes),
        )

        try:
            with image_type.open(BytesIO(image_bytes)) as image:
                page_text = self._ocr_image(
                    pytesseract=pytesseract,
                    tesseract_error_type=tesseract_error_type,
                    image=image,
                    language=language,
                    source_name=filename,
                )
        except DocumentError:
            raise
        except Exception as exc:
            raise DocumentError(
                f"OCR failed while opening image '{filename}': {exc}"
            ) from exc

        text = self._normalize_text(page_text)
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        logger.info(
            "OCR completed | ocr_provider=local | filename=%s | text_chars=%d | elapsed_time=%.2fs",
            filename,
            len(text),
            elapsed_ms / 1000.0,
        )
        if len(text.strip()) < min_text_length:
            raise DocumentError(_OCR_TOO_SHORT_ERROR)
        return OCRProviderResult(
            provider=self.provider_name,
            text=text,
            pages_processed=1,
            elapsed_time_ms=elapsed_ms,
        )

    def _load_pdf2image(
        self,
    ) -> tuple[
        Callable[..., list[Any]], Callable[..., dict[str, Any]], type[Exception]
    ]:
        try:
            from pdf2image import convert_from_path, pdfinfo_from_path
            from pdf2image.exceptions import PDFInfoNotInstalledError
        except ImportError as exc:
            raise DocumentError(_MISSING_PDF2IMAGE_ERROR) from exc
        return convert_from_path, pdfinfo_from_path, PDFInfoNotInstalledError

    def _load_pytesseract(self) -> tuple[Any, type[Exception]]:
        try:
            import pytesseract
        except ImportError as exc:
            raise DocumentError(_MISSING_PYTESSERACT_ERROR) from exc

        error_type = getattr(pytesseract, "TesseractNotFoundError", RuntimeError)
        return pytesseract, error_type

    def _load_pillow_image_type(self) -> Any:
        try:
            from PIL import Image
        except ImportError as exc:
            raise DocumentError(_MISSING_PILLOW_ERROR) from exc
        return Image

    def _configure_tesseract(self, pytesseract: Any) -> None:
        tesseract_cmd = (self.settings.tesseract_cmd or "").strip()
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    def _ocr_image(
        self,
        *,
        pytesseract: Any,
        tesseract_error_type: type[Exception],
        image: Any,
        language: str,
        source_name: str,
    ) -> str:
        try:
            return pytesseract.image_to_string(image, lang=language) or ""
        except tesseract_error_type as exc:
            raise DocumentError(_MISSING_TESSERACT_ERROR) from exc
        except FileNotFoundError as exc:
            raise DocumentError(_MISSING_TESSERACT_ERROR) from exc
        except Exception as exc:
            if self._looks_like_tesseract_error(exc):
                raise DocumentError(_MISSING_TESSERACT_ERROR) from exc
            raise DocumentError(f"OCR failed for {source_name}: {exc}") from exc

    def _read_page_count(
        self,
        *,
        pdfinfo_from_path: Callable[..., dict[str, Any]],
        poppler_error_type: type[Exception],
        pdf_path: Path,
        poppler_path: str | None,
    ) -> int | None:
        try:
            info = pdfinfo_from_path(str(pdf_path), poppler_path=poppler_path)
        except poppler_error_type as exc:
            raise DocumentError(_MISSING_POPPLER_ERROR) from exc
        except FileNotFoundError as exc:
            raise DocumentError(_MISSING_POPPLER_ERROR) from exc
        except Exception as exc:
            if self._looks_like_poppler_error(exc):
                raise DocumentError(_MISSING_POPPLER_ERROR) from exc
            logger.warning(
                "Could not read PDF page count before OCR; continuing with OCR_MAX_PAGES | path=%s | error=%s",
                pdf_path,
                str(exc)[:300],
            )
            return None

        try:
            return int(info.get("Pages") or 0) or None
        except (TypeError, ValueError):
            logger.warning(
                "Invalid PDF page count from Poppler | path=%s | info=%s",
                pdf_path,
                info,
            )
            return None

    def _convert_pdf_pages(
        self,
        *,
        convert_from_path: Callable[..., list[Any]],
        poppler_error_type: type[Exception],
        pdf_path: Path,
        dpi: int,
        first_page: int,
        last_page: int,
        poppler_path: str | None,
    ) -> list[Any]:
        try:
            return convert_from_path(
                str(pdf_path),
                dpi=dpi,
                first_page=first_page,
                last_page=last_page,
                poppler_path=poppler_path,
                thread_count=1,
            )
        except poppler_error_type as exc:
            raise DocumentError(_MISSING_POPPLER_ERROR) from exc
        except FileNotFoundError as exc:
            raise DocumentError(_MISSING_POPPLER_ERROR) from exc
        except Exception as exc:
            if self._looks_like_poppler_error(exc):
                raise DocumentError(_MISSING_POPPLER_ERROR) from exc
            raise DocumentError(
                f"OCR failed while converting PDF to images: {exc}"
            ) from exc

    def _close_image(self, image: Any) -> None:
        close = getattr(image, "close", None)
        if callable(close):
            close()

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

    def _looks_like_poppler_error(self, exc: Exception) -> bool:
        message = str(exc).lower()
        return (
            "poppler" in message
            or "pdfinfo" in message
            or "unable to get page count" in message
        )

    def _looks_like_tesseract_error(self, exc: Exception) -> bool:
        message = str(exc).lower()
        return (
            "tesseract is not installed" in message
            or "tesseract executable" in message
            or "tesseract_cmd" in message
            or "no such file" in message
        )
