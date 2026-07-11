"""
Text chunking service.
Splits preprocessed text into overlapping chunks suitable for Gemini input.
Prefers heading-based splits, falls back to sentence-aware length splitting.
"""
import re
from dataclasses import dataclass
from typing import List

from app.core.logging import get_logger

logger = get_logger(__name__)

# Heading patterns: numbered sections, Markdown headings, or ALL-CAPS titles
_HEADING_PATTERN = re.compile(
    r"^(?:"
    r"\d+[\.\d]*\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂĐƠƯẠẶẦẨẪẬẮẰẲẴẶ]"  # "1. Title" or "1.2 Title"
    r"|#{1,3}\s+"                                              # Markdown ## heading
    r"|[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂĐƠƯẠẶẦẨẪẬẮẰẲẴẶ\s]{8,}$"        # ALL-CAPS line
    r")",
    re.MULTILINE,
)


@dataclass
class TextChunk:
    index: int
    text: str
    char_start: int
    char_end: int
    is_heading_based: bool = False


class TextChunker:
    """
    Splits text into overlapping chunks for LLM processing.

    Strategy:
    1. Try heading-based splitting first.
    2. If no headings found or chunks are too large, fall back to
       sentence-aware fixed-size splitting.
    """

    def __init__(
        self,
        chunk_size: int = 6000,
        overlap: int = 500,
    ) -> None:
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(self, text: str) -> List[TextChunk]:
        """
        Split text into chunks.

        Returns:
            List of TextChunk objects, may be empty if text is empty.
        """
        if not text or not text.strip():
            return []

        # Try heading-based split
        heading_chunks = self._split_by_headings(text)
        if heading_chunks:
            logger.debug("Used heading-based chunking: %d chunks", len(heading_chunks))
            return heading_chunks

        # Fallback: fixed-size with overlap
        fixed_chunks = self._split_by_size(text)
        logger.debug("Used size-based chunking: %d chunks", len(fixed_chunks))
        return fixed_chunks

    # ------------------------------------------------------------------

    def _split_by_headings(self, text: str) -> List[TextChunk]:
        """Split at detected headings; sub-split large sections."""
        matches = list(_HEADING_PATTERN.finditer(text))
        if len(matches) < 2:
            return []

        sections: List[str] = []
        for i, match in enumerate(matches):
            start = match.start()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            section = text[start:end].strip()
            if section:
                sections.append(section)

        chunks: List[TextChunk] = []
        char_cursor = 0
        for i, section in enumerate(sections):
            if len(section) <= self.chunk_size:
                char_end = char_cursor + len(section)
                chunks.append(
                    TextChunk(
                        index=len(chunks),
                        text=section,
                        char_start=char_cursor,
                        char_end=char_end,
                        is_heading_based=True,
                    )
                )
                char_cursor = char_end
            else:
                # Section too large — sub-split
                sub_chunks = self._split_by_size(section, base_index=len(chunks), char_offset=char_cursor)
                chunks.extend(sub_chunks)
                char_cursor += len(section)

        return chunks

    def _split_by_size(
        self,
        text: str,
        base_index: int = 0,
        char_offset: int = 0,
    ) -> List[TextChunk]:
        """
        Fixed-size chunking with overlap.
        Tries to split at sentence boundaries (. ? !) to avoid mid-sentence cuts.
        """
        chunks: List[TextChunk] = []
        start = 0
        idx = base_index

        while start < len(text):
            end = start + self.chunk_size

            if end >= len(text):
                chunk_text = text[start:].strip()
                if chunk_text:
                    chunks.append(
                        TextChunk(
                            index=idx,
                            text=chunk_text,
                            char_start=char_offset + start,
                            char_end=char_offset + len(text),
                        )
                    )
                break

            # Try to find a sentence boundary near the end
            boundary = self._find_sentence_boundary(text, end)
            chunk_text = text[start:boundary].strip()

            if chunk_text:
                chunks.append(
                    TextChunk(
                        index=idx,
                        text=chunk_text,
                        char_start=char_offset + start,
                        char_end=char_offset + boundary,
                    )
                )
                idx += 1

            # Next chunk starts with overlap
            start = max(boundary - self.overlap, start + 1)

        return chunks

    def _find_sentence_boundary(self, text: str, pos: int) -> int:
        """
        Search backwards from pos for the nearest sentence-ending punctuation.
        Returns pos unchanged if no boundary found within 300 chars.
        """
        search_start = max(0, pos - 300)
        segment = text[search_start:pos]

        # Find last sentence-ending character
        for char in reversed(range(len(segment))):
            if segment[char] in ".?!\n":
                return search_start + char + 1

        return pos  # No boundary found, cut at pos
