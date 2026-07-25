"""
Local document storage helpers for uploaded source files.

Files are written to local disk under data/raw using safe, readable names:
{short_document_id}-{safe_slug_original_filename}.{ext}
The original filename is stored only as metadata.
"""

import re
import unicodedata
import uuid
from pathlib import Path
from typing import BinaryIO

from fastapi import UploadFile

from app.core.exceptions import FileTooLargeError

_CHUNK_SIZE = 1024 * 1024
_MAX_SLUG_LENGTH = 80
_ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".webp"}


def _basename(filename: str) -> str:
    """Return the final path segment from user-supplied filename text."""
    normalized = (filename or "upload").replace("\\", "/")
    return normalized.rsplit("/", 1)[-1]


def _strip_vietnamese_accents(value: str) -> str:
    """Convert accented Unicode text to a simple ASCII representation."""
    normalized = unicodedata.normalize("NFKD", value)
    without_marks = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return without_marks.replace("\u0111", "d").replace("\u0110", "D")


def _safe_slug(value: str) -> str:
    """Lowercase and slugify a filename stem for safe local storage."""
    ascii_text = _strip_vietnamese_accents(value)
    slug = ascii_text.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    slug = re.sub(r"-{2,}", "-", slug)
    return slug[:_MAX_SLUG_LENGTH].strip("-")


def safe_storage_name(
    original_filename: str,
    document_id: uuid.UUID | str | None = None,
) -> str:
    """
    Create a collision-resistant, debug-friendly storage filename.

    User filename text is never used directly: only a sanitized slug from the
    basename is retained, and a short document id prevents collisions.
    """
    basename = _basename(original_filename)
    suffix = Path(basename).suffix.lower()
    if suffix not in _ALLOWED_EXTENSIONS:
        suffix = ""

    stem = Path(basename).stem
    slug = _safe_slug(stem) or "document"
    raw_id = str(document_id or uuid.uuid4()).replace("-", "")
    short_id = raw_id[:8] or uuid.uuid4().hex[:8]
    return f"{short_id}-{slug}{suffix}"


async def save_upload_file(
    upload_file: UploadFile,
    *,
    destination_dir: str,
    max_size_bytes: int,
    max_size_mb: int,
    document_id: uuid.UUID | str | None = None,
) -> tuple[str, int]:
    """
    Save an UploadFile to local disk in chunks.

    Returns:
        (storage_path, file_size)

    Raises:
        FileTooLargeError: if the upload exceeds max_size_bytes.
    """
    original_filename = upload_file.filename or "upload"
    destination = Path(destination_dir)
    destination.mkdir(parents=True, exist_ok=True)

    storage_path = destination / safe_storage_name(original_filename, document_id)
    total_size = 0

    try:
        with storage_path.open("wb") as out_file:
            await _copy_upload_stream(
                upload_file.file,
                out_file,
                max_size_bytes=max_size_bytes,
                max_size_mb=max_size_mb,
            )
            total_size = out_file.tell()
    except Exception:
        storage_path.unlink(missing_ok=True)
        raise
    finally:
        await upload_file.seek(0)

    return str(storage_path), total_size


async def _copy_upload_stream(
    source: BinaryIO,
    destination: BinaryIO,
    *,
    max_size_bytes: int,
    max_size_mb: int,
) -> None:
    """Copy a SpooledTemporaryFile to disk while enforcing max upload size."""
    total_size = 0
    while True:
        chunk = source.read(_CHUNK_SIZE)
        if not chunk:
            break
        total_size += len(chunk)
        if total_size > max_size_bytes:
            raise FileTooLargeError(max_size_mb)
        destination.write(chunk)
