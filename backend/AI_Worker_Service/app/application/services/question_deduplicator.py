"""
Question deduplication service.
Removes duplicate questions within the same task using exact and near-exact matching.
"""
import re
from typing import Dict, List

from app.core.logging import get_logger

logger = get_logger(__name__)


def _normalize_for_comparison(text: str) -> str:
    """Lowercase, strip punctuation and whitespace for fuzzy comparison."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", "", text)  # remove punctuation
    text = re.sub(r"\s+", " ", text)
    return text


class QuestionDeduplicator:
    """
    Removes duplicate questions from a batch.

    Deduplication strategies (in order):
    1. Exact match on normalized question_content
    2. Near-duplicate: if 80%+ of words overlap (simple Jaccard similarity)
    """

    SIMILARITY_THRESHOLD = 0.80

    def deduplicate(self, questions: List[Dict]) -> List[Dict]:
        """
        Return only unique questions.

        Args:
            questions: List of validated question dicts

        Returns:
            Deduplicated list — preserves first occurrence
        """
        if not questions:
            return []

        seen_normalized: set[str] = set()
        seen_word_sets: List[set] = []
        unique: List[Dict] = []
        removed = 0

        for q in questions:
            content = q.get("question_content", "")
            normalized = _normalize_for_comparison(content)
            words = set(normalized.split())

            # 1. Exact match check
            if normalized in seen_normalized:
                logger.debug("Duplicate (exact): '%s'", content[:60])
                removed += 1
                continue

            # 2. Jaccard similarity check
            if self._is_near_duplicate(words, seen_word_sets):
                logger.debug("Duplicate (near): '%s'", content[:60])
                removed += 1
                continue

            seen_normalized.add(normalized)
            seen_word_sets.append(words)
            unique.append(q)

        if removed:
            logger.info("Deduplication: removed %d duplicates, kept %d", removed, len(unique))

        return unique

    def _is_near_duplicate(self, words: set, seen: List[set]) -> bool:
        """Check if word set is near-duplicate of any seen set via Jaccard."""
        if not words:
            return False
        for existing in seen:
            if not existing:
                continue
            intersection = len(words & existing)
            union = len(words | existing)
            if union == 0:
                continue
            if intersection / union >= self.SIMILARITY_THRESHOLD:
                return True
        return False
