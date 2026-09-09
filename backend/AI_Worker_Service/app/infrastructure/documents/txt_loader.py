"""
Plain text document loader with encoding detection.
"""

from app.core.exceptions import DocumentError
from app.core.logging import get_logger

logger = get_logger(__name__)

# Encoding detection order
_ENCODINGS = ["utf-8", "utf-8-sig", "utf-16", "latin-1", "cp1252"]


def load_txt(file_bytes: bytes, filename: str = "file.txt") -> str:
    """
    Decode a text file trying multiple encodings.

    Args:
        file_bytes: Raw file bytes
        filename: Original filename for logging

    Returns:
        Decoded text content

    Raises:
        DocumentError: If file cannot be decoded or is empty
    """
    for encoding in _ENCODINGS:
        try:
            text = file_bytes.decode(encoding).strip()
            if text:
                logger.info(
                    "Loaded TXT '%s' with encoding=%s | %d characters",
                    filename,
                    encoding,
                    len(text),
                )
                return text
        except (UnicodeDecodeError, ValueError):
            continue

    raise DocumentError(
        f"Cannot decode '{filename}' with any supported encoding "
        f"({', '.join(_ENCODINGS)}). Ensure the file is a valid text file."
    )
