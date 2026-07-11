"""
Backward-compatible facade for the catalog-backed TopicResolver.

New code should import TopicResolver from topic_resolver.py. This module keeps
legacy imports/tests working while preserving the no-LLM detection guarantee.
"""
from __future__ import annotations

from pathlib import Path
from typing import Optional

from app.application.services.topic_resolver import (
    UNKNOWN_TOPIC,
    TopicResolveResult,
    TopicResolver,
    normalize_text,
)

TopicDetectionResult = TopicResolveResult


class TopicDetector:
    """Compatibility wrapper around TopicResolver."""

    def __init__(
        self,
        *,
        min_confidence: float = 0.75,
        mismatch_override: bool = True,
        max_chars: int = 8000,
        catalog_path: str | Path | None = None,
    ) -> None:
        self._resolver = TopicResolver(
            catalog_path=catalog_path,
            min_confidence=min_confidence,
            mismatch_override=mismatch_override,
            max_chars=max_chars,
        )

    @property
    def min_confidence(self) -> float:
        return self._resolver.min_confidence

    @min_confidence.setter
    def min_confidence(self, value: float) -> None:
        self._resolver.min_confidence = value

    @property
    def mismatch_override(self) -> bool:
        return self._resolver.mismatch_override

    @mismatch_override.setter
    def mismatch_override(self, value: bool) -> None:
        self._resolver.mismatch_override = value

    @property
    def max_chars(self) -> int:
        return self._resolver.max_chars

    @max_chars.setter
    def max_chars(self, value: int) -> None:
        self._resolver.max_chars = value

    def detect_topic(
        self,
        text: str,
        user_topic: Optional[str] = None,
        filename: Optional[str] = None,
    ) -> TopicDetectionResult:
        return self._resolver.resolve(text, user_topic=user_topic, filename=filename)

    def extract_title_candidates(self, text: str, filename: Optional[str] = None):
        return self._resolver.extract_title_candidates(text, filename)

    def _is_placeholder_topic(self, topic: str) -> bool:
        return self._resolver.is_placeholder_topic(topic)

    def _classify_user_topic(self, topic: str) -> Optional[str]:
        return self._resolver.classify_topic(topic)


__all__ = [
    "UNKNOWN_TOPIC",
    "TopicDetectionResult",
    "TopicDetector",
    "TopicResolveResult",
    "TopicResolver",
    "normalize_text",
]
