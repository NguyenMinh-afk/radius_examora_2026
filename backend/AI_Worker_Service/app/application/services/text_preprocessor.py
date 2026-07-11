"""
Text preprocessing service.
Normalizes unicode, removes noise while preserving academic content.
"""
import re
import unicodedata

from app.core.logging import get_logger

logger = get_logger(__name__)


class TextPreprocessor:
    """
    Cleans raw text extracted from documents.

    Operations (in order):
    1. Unicode normalization (NFC)
    2. Remove null bytes and control characters
    3. Normalize line endings
    4. Remove standalone page numbers
    5. Remove repeated header/footer patterns
    6. Collapse multiple blank lines
    7. Strip leading/trailing whitespace per line
    8. Normalize spaces within lines
    """

    # Patterns for noise removal
    _PAGE_NUM_PATTERN = re.compile(r"^\s*-?\s*\d{1,4}\s*-?\s*$", re.MULTILINE)
    _CTRL_CHARS_PATTERN = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
    _MULTI_BLANK_PATTERN = re.compile(r"\n{3,}")
    _MULTI_SPACE_PATTERN = re.compile(r"[ \t]{2,}")
    # Simple repeated header/footer: a line appearing 3+ times verbatim
    _MIN_REPEATED = 3

    def preprocess(self, text: str) -> str:
        """
        Full preprocessing pipeline.

        Args:
            text: Raw extracted text

        Returns:
            Cleaned text ready for chunking
        """
        if not text or not text.strip():
            return ""

        text = self._normalize_unicode(text)
        text = self._remove_control_chars(text)
        text = self._normalize_line_endings(text)
        text = self._remove_page_numbers(text)
        text = self._remove_repeated_lines(text)
        text = self._normalize_whitespace(text)

        result = text.strip()
        logger.debug("Preprocessed text: %d → %d chars", len(text), len(result))
        return result

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _normalize_unicode(self, text: str) -> str:
        """Normalize to NFC form for consistent Vietnamese character handling."""
        return unicodedata.normalize("NFC", text)

    def _remove_control_chars(self, text: str) -> str:
        """Remove non-printable control characters, keep newlines and tabs."""
        return self._CTRL_CHARS_PATTERN.sub("", text)

    def _normalize_line_endings(self, text: str) -> str:
        """Convert Windows (\\r\\n) and old Mac (\\r) line endings to \\n."""
        text = text.replace("\r\n", "\n")
        text = text.replace("\r", "\n")
        return text

    def _remove_page_numbers(self, text: str) -> str:
        """Remove lines that contain only a page number."""
        return self._PAGE_NUM_PATTERN.sub("", text)

    def _remove_repeated_lines(self, text: str) -> str:
        """
        Remove lines that appear 3+ times verbatim.
        These are likely headers/footers repeated across pages.
        Preserve content lines that happen to repeat legitimately.
        """
        lines = text.split("\n")
        # Count occurrences of stripped non-empty lines
        from collections import Counter
        stripped_lines = [l.strip() for l in lines]
        counts = Counter(s for s in stripped_lines if len(s) > 3)

        # Only remove lines that appear many times AND are short (likely headers)
        to_remove = {
            line
            for line, count in counts.items()
            if count >= self._MIN_REPEATED and len(line) < 120
        }

        filtered = []
        for line in lines:
            stripped = line.strip()
            if stripped in to_remove:
                continue  # skip repeated header/footer
            filtered.append(line)

        return "\n".join(filtered)

    def _normalize_whitespace(self, text: str) -> str:
        """
        - Strip trailing whitespace from each line
        - Collapse multiple spaces within lines
        - Collapse 3+ blank lines to 2
        """
        lines = text.split("\n")
        normalized = []
        for line in lines:
            line = line.rstrip()
            line = self._MULTI_SPACE_PATTERN.sub(" ", line)
            normalized.append(line)
        text = "\n".join(normalized)
        text = self._MULTI_BLANK_PATTERN.sub("\n\n", text)
        return text
