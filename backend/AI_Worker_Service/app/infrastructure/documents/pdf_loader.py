"""
PDF document loader using pypdf.
"""
import io

from app.core.exceptions import DocumentError
from app.core.logging import get_logger

logger = get_logger(__name__)


def load_pdf(file_bytes: bytes, filename: str = "file.pdf") -> str:
    """
    Extract text from a PDF file.

    Args:
        file_bytes: Raw PDF bytes
        filename: Original filename for logging

    Returns:
        Extracted text content

    Raises:
        DocumentError: If PDF cannot be read or is empty
    """
    try:
        from pypdf import PdfReader
    except ImportError:
        raise DocumentError("pypdf is not installed. Run: pip install pypdf")

    try:
        reader = PdfReader(io.BytesIO(file_bytes))

        if len(reader.pages) == 0:
            raise DocumentError(f"PDF '{filename}' has no pages.")

        pages_text = []
        for i, page in enumerate(reader.pages):
            try:
                text = page.extract_text() or ""
                pages_text.append(text)
            except Exception as e:
                logger.warning("Could not extract text from page %d of '%s': %s", i + 1, filename, e)
                continue

        full_text = "\n".join(pages_text).strip()

        if not full_text:
            raise DocumentError(
                f"PDF '{filename}' yielded no extractable text. "
                "It may be scanned/image-based."
            )

        logger.info(
            "Loaded PDF '%s': %d pages, %d characters", filename, len(reader.pages), len(full_text)
        )
        return full_text

    except DocumentError:
        raise
    except Exception as e:
        raise DocumentError(f"Failed to read PDF '{filename}': {e}") from e
