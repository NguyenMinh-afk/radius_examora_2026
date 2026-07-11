"""
Shared OCR provider abstractions.
"""
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class OCRProviderResult:
    """Normalized OCR result returned by any OCR provider."""

    provider: str
    text: str
    pages_processed: int | None = None
    elapsed_time_ms: int | None = None


class BaseOCRProvider:
    """Minimal provider contract for local/cloud OCR implementations."""

    provider_name = "base"

    def extract_text_from_pdf(self, pdf_path: Path) -> OCRProviderResult:
        raise NotImplementedError

    def extract_text_from_image_bytes(
        self,
        image_bytes: bytes,
        *,
        filename: str,
        content_type: str | None = None,
    ) -> OCRProviderResult:
        raise NotImplementedError

    def extract_text_from_image_file(
        self,
        image_path: Path,
        *,
        content_type: str | None = None,
    ) -> OCRProviderResult:
        raise NotImplementedError
