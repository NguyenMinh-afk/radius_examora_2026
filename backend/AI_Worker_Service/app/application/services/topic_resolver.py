"""
Nhận diện môn học/chủ đề theo rule local.

TopicResolver không gọi Gemini; nó ghép tín hiệu từ input người dùng, tên file,
tiêu đề tài liệu và catalog cục bộ để suy ra topic ổn định, dễ kiểm soát.
"""

from __future__ import annotations

import json
import re
import unicodedata
from collections.abc import Iterable
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from app.core.logging import get_logger

logger = get_logger(__name__)

UNKNOWN_TOPIC = "Chưa xác định"

_PLACEHOLDER_TOPICS = {
    "",
    "string",
    "topic",
    "subject",
    "mon hoc",
    "chu de",
    "unknown",
    "default",
    "none",
    "null",
    "test",
    "untitled",
    "chua xac dinh",
}

_TITLE_HINTS = (
    "môn học",
    "ten mon hoc",
    "tên môn học",
    "bài giảng",
    "bai giang",
    "giáo trình",
    "giao trinh",
    "chương",
    "chuong",
    "bài",
    "bai",
    "course",
    "lecture",
    "chapter",
    "introduction",
    "overview",
    "tổng quan",
    "tong quan",
    "giới thiệu",
    "gioi thieu",
)

_GENERIC_TITLE_NORMALIZED = {
    "chuong",
    "chuong 1",
    "chuong 2",
    "chuong 3",
    "bai",
    "bai 1",
    "bai 2",
    "gioi thieu",
    "tong quan",
    "gioi thieu tong quan",
    "introduction",
    "overview",
    "chapter",
    "chapter 1",
    "lecture",
    "course",
    "syllabus",
}

_COVER_PAGE_NOISE = (
    "truong dai hoc",
    "dai hoc",
    "khoa ",
    "bo mon",
    "giang vien",
    "sinh vien",
    "nam hoc",
    "hoc ky",
    "slide",
    "page",
    "copyright",
)

_SOURCE_PRIORITY = {
    "user": 100,
    "document_title": 90,
    "filename": 80,
    "catalog_alias": 70,
    "catalog_keywords": 60,
    "extracted_candidate": 50,
    "fallback": 0,
}

_AUTO_SOURCES = {
    "document_title",
    "filename",
    "catalog_alias",
    "catalog_keywords",
    "extracted_candidate",
}


@dataclass(frozen=True)
class TitleCandidate:
    text: str
    source: str
    position: int
    score: float


@dataclass(frozen=True)
class TopicCandidate:
    topic: str
    source: str
    confidence: float
    matched_keywords: list[str] = field(default_factory=list)
    evidence: list[str] = field(default_factory=list)
    score: float = 0.0
    reason: str = ""


@dataclass(frozen=True)
class TopicResolveResult:
    topic: str
    source: str
    confidence: float
    matched_keywords: list[str]
    title_candidates: list[str]
    evidence: list[str]
    reason: str


@dataclass(frozen=True)
class TopicCatalogEntry:
    canonical: str
    aliases: list[str]
    strong_keywords: list[str]
    weak_keywords: list[str]
    negative_keywords: list[str]


def normalize_text(value: str) -> str:
    """
    Normalize text for matching only.

    The original document text is never modified for Gemini; this normalized
    representation is used solely by title extraction and scoring.
    """
    text = unicodedata.normalize("NFKC", value or "")
    text = text.replace("\ufeff", " ").replace("\u00ad", "")
    text = re.sub(r"[\u200b\u200c\u200d]", "", text)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", text)
    text = re.sub(r"[‐‑‒–—−]", "-", text)
    text = text.lower().replace("đ", "d")
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^\S\r\n]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _compact_original(value: str) -> str:
    text = unicodedata.normalize("NFKC", value or "")
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", text)
    text = re.sub(r"[‐‑‒–—−]", "-", text)
    text = re.sub(r"\s+", " ", text).strip(" -:\t\r\n")
    return text


def _dedupe_preserve_order(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    output: list[str] = []
    for value in values:
        key = normalize_text(value)
        if key and key not in seen:
            seen.add(key)
            output.append(value)
    return output


def _contains_phrase(normalized_text: str, normalized_phrase: str) -> bool:
    if not normalized_text or not normalized_phrase:
        return False
    escaped = re.escape(normalized_phrase)
    if re.fullmatch(r"[a-z0-9]+", normalized_phrase):
        return bool(re.search(rf"(?<![a-z0-9]){escaped}(?![a-z0-9])", normalized_text))
    if len(normalized_phrase) <= 4 and re.fullmatch(
        r"[a-z0-9/+#.-]+", normalized_phrase
    ):
        return bool(re.search(rf"(?<![a-z0-9]){escaped}(?![a-z0-9])", normalized_text))
    return normalized_phrase in normalized_text


def _contains_original_phrase(text: str, phrase: str) -> bool:
    clean_text = _compact_original(text).casefold()
    clean_phrase = _compact_original(phrase).casefold()
    if not clean_text or not clean_phrase:
        return False
    if re.fullmatch(r"[a-z0-9]+", clean_phrase):
        return bool(
            re.search(
                rf"(?<![a-z0-9]){re.escape(clean_phrase)}(?![a-z0-9])", clean_text
            )
        )
    return clean_phrase in clean_text


def _word_count(text: str) -> int:
    return len(re.findall(r"[\wÀ-ỹ]+", text, flags=re.UNICODE))


def _is_mostly_upper(text: str) -> bool:
    letters = [ch for ch in text if ch.isalpha()]
    if len(letters) < 5:
        return False
    return sum(1 for ch in letters if ch.isupper()) / len(letters) >= 0.75


def _format_topic_title(text: str) -> str:
    clean = _compact_original(text)
    clean = re.sub(
        r"^(môn học|tên môn học|bài giảng|giáo trình)\s*[:\-]?\s*",
        "",
        clean,
        flags=re.IGNORECASE,
    )
    clean = clean.strip(" -:")
    if not clean:
        return clean

    lowered = clean.lower()
    topic = lowered[:1].upper() + lowered[1:]
    for acronym in ("AI", "I/O", "TCP/IP", "SQL", "CPU"):
        topic = re.sub(
            rf"\b{re.escape(acronym.lower())}\b", acronym, topic, flags=re.IGNORECASE
        )
    return topic


def _strip_chapter_prefix(text: str) -> str:
    clean = _compact_original(text)
    patterns = (
        r"^(?:chương|chuong|chapter)\s+\d+[a-zA-Z]?\s*[:\-]\s*(.+)$",
        r"^(?:bài|bai|lecture)\s+\d+[a-zA-Z]?\s*[:\-]\s*(.+)$",
    )
    for pattern in patterns:
        match = re.match(pattern, clean, flags=re.IGNORECASE)
        if match:
            return _compact_original(match.group(1))
    return clean


def _looks_like_noise_line(text: str) -> bool:
    clean = _compact_original(text)
    normalized = normalize_text(clean)
    if not clean or len(clean) < 3:
        return True
    if len(clean) > 140:
        return True
    if re.fullmatch(r"[\d\s./-]+", clean):
        return True
    if normalized.startswith(_COVER_PAGE_NOISE):
        return True
    if re.search(r"https?://|www\.|@", normalized):
        return True
    letters = sum(1 for ch in clean if ch.isalpha())
    punctuation = sum(1 for ch in clean if not ch.isalnum() and not ch.isspace())
    return letters < 3 or (punctuation > letters and letters < 20)


def _is_generic_heading(text: str) -> bool:
    normalized = normalize_text(_strip_chapter_prefix(text))
    if normalized in _GENERIC_TITLE_NORMALIZED:
        return True
    return bool(re.fullmatch(r"(chuong|chapter|bai|lecture)\s*\d+[a-z]?", normalized))


def _has_title_shape(text: str) -> bool:
    clean = _compact_original(text)
    normalized = normalize_text(clean)
    if not clean or clean.endswith((".", "?", "!", ";")):
        return False
    if _is_mostly_upper(clean):
        return True
    if re.match(
        r"^(mon hoc|ten mon hoc|giao trinh|bai giang|course|lecture|chapter|chuong|bai)\b",
        normalized,
    ):
        return True
    words = re.findall(r"[\wÀ-ỹ]+", clean, flags=re.UNICODE)
    if not (2 <= len(words) <= 6):
        return False
    capitalized = sum(1 for word in words if word[:1].isupper())
    return capitalized >= max(2, len(words) // 2 + 1)


def _is_clear_topic_title(text: str) -> bool:
    clean = _compact_original(text)
    normalized = normalize_text(clean)
    words = _word_count(clean)
    if _looks_like_noise_line(clean):
        return False
    if words < 2 or words > 12:
        return False
    if _is_generic_heading(clean):
        return False
    if normalized.startswith(_COVER_PAGE_NOISE):
        return False
    if (
        re.search(
            r"\b(là|la|được|duoc|gồm|gom|nhằm|nham|because|where|when)\b", normalized
        )
        and words > 5
    ):
        return False
    return True


def _is_generic_filename(filename: str) -> bool:
    stem = Path(filename or "").stem
    normalized = normalize_text(re.sub(r"[_-]+", " ", stem))
    if not normalized:
        return True
    generic_tokens = {
        "chuong",
        "chapter",
        "bai",
        "lecture",
        "slide",
        "slides",
        "gioi",
        "thieu",
        "tong",
        "quan",
        "de",
        "cuong",
        "tailieu",
        "tai",
        "lieu",
        "document",
        "scan",
        "file",
    }
    tokens = re.findall(r"[a-z0-9]+", normalized)
    if not tokens:
        return True
    if len(tokens) <= 2 and any(token.isdigit() for token in tokens):
        return True
    meaningful = [
        token for token in tokens if token not in generic_tokens and not token.isdigit()
    ]
    return len(meaningful) < 2


def _filename_to_title(filename: str) -> str:
    stem = Path(filename or "").stem
    stem = re.sub(r"[_\-]+", " ", stem)
    stem = re.sub(r"\b\d{4,}\b", " ", stem)
    return _compact_original(stem)


class TopicCatalogLoader:
    """Load topic catalog entries from JSON."""

    def __init__(self, catalog_path: str | Path | None = None) -> None:
        self.catalog_path = Path(catalog_path) if catalog_path else self.default_path()

    @staticmethod
    def default_path() -> Path:
        return Path(__file__).resolve().parents[1] / "resources" / "topic_catalog.json"

    def _candidate_paths(self) -> list[Path]:
        path = self.catalog_path
        if path.is_absolute():
            return [path]
        project_root = Path(__file__).resolve().parents[3]
        return [
            Path.cwd() / path,
            project_root / path,
            self.default_path(),
        ]

    def load(self) -> list[TopicCatalogEntry]:
        for path in self._candidate_paths():
            if path.exists():
                return self._load_path(path)
        logger.warning("Topic catalog not found | path=%s", self.catalog_path)
        return []

    def _load_path(self, path: Path) -> list[TopicCatalogEntry]:
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            logger.warning(
                "Topic catalog load failed | path=%s | error=%s", path, str(exc)[:200]
            )
            return []

        items = raw.get("topics", raw) if isinstance(raw, dict) else raw
        if not isinstance(items, list):
            logger.warning(
                "Topic catalog must be a list or {'topics': [...]} | path=%s", path
            )
            return []

        entries: list[TopicCatalogEntry] = []
        for item in items:
            if not isinstance(item, dict) or not item.get("canonical"):
                continue
            entries.append(
                TopicCatalogEntry(
                    canonical=str(item["canonical"]).strip(),
                    aliases=[
                        str(v).strip()
                        for v in item.get("aliases", [])
                        if str(v).strip()
                    ],
                    strong_keywords=[
                        str(v).strip()
                        for v in item.get("strong_keywords", [])
                        if str(v).strip()
                    ],
                    weak_keywords=[
                        str(v).strip()
                        for v in item.get("weak_keywords", [])
                        if str(v).strip()
                    ],
                    negative_keywords=[
                        str(v).strip()
                        for v in item.get("negative_keywords", [])
                        if str(v).strip()
                    ],
                )
            )
        return entries


class TopicResolver:
    """Resolve a stable task topic without LLM calls."""

    def __init__(
        self,
        *,
        catalog_path: str | Path | None = None,
        min_confidence: float = 0.75,
        mismatch_override: bool = True,
        max_chars: int = 8000,
        catalog_entries: list[TopicCatalogEntry] | None = None,
    ) -> None:
        self.min_confidence = min_confidence
        self.mismatch_override = mismatch_override
        self.max_chars = max_chars
        self.catalog_entries = (
            catalog_entries
            if catalog_entries is not None
            else TopicCatalogLoader(catalog_path).load()
        )

    def resolve(
        self,
        text: str,
        *,
        user_topic: str | None = None,
        filename: str | None = None,
    ) -> TopicResolveResult:
        """Resolve the best topic from user input and document evidence."""
        clean_user_topic = _compact_original(user_topic or "")
        user_valid = not self.is_placeholder_topic(clean_user_topic)

        logger.info(
            "Topic resolving started | filename=%s | user_topic=%s",
            filename or "",
            clean_user_topic,
        )

        auto_result, candidates, catalog_scores = self._resolve_from_document(
            text=text,
            filename=filename,
        )

        if user_valid:
            result = self._resolve_with_user_topic(
                user_topic=clean_user_topic,
                auto_result=auto_result,
            )
        else:
            result = auto_result

        self._log_resolution(
            result=result,
            filename=filename,
            user_topic=clean_user_topic,
            candidates=candidates,
            catalog_scores=catalog_scores,
        )
        return result

    def is_placeholder_topic(self, topic: str) -> bool:
        return normalize_text(topic) in _PLACEHOLDER_TOPICS

    def classify_topic(self, topic: str) -> str | None:
        normalized_topic = normalize_text(topic)
        if not normalized_topic or self.is_placeholder_topic(topic):
            return None
        for entry in self.catalog_entries:
            if normalized_topic == normalize_text(entry.canonical):
                return entry.canonical
            aliases = [entry.canonical, *entry.aliases]
            if any(
                _contains_phrase(normalized_topic, normalize_text(alias))
                for alias in aliases
            ):
                return entry.canonical
        return None

    def extract_title_candidates(
        self,
        text: str,
        filename: str | None = None,
    ) -> list[TitleCandidate]:
        return extract_title_candidates(text, filename, max_chars=self.max_chars)

    def _resolve_with_user_topic(
        self,
        *,
        user_topic: str,
        auto_result: TopicResolveResult,
    ) -> TopicResolveResult:
        if (
            auto_result.source == "fallback"
            or auto_result.confidence < self.min_confidence
        ):
            return TopicResolveResult(
                topic=user_topic,
                source="user",
                confidence=1.0,
                matched_keywords=auto_result.matched_keywords,
                title_candidates=auto_result.title_candidates,
                evidence=auto_result.evidence,
                reason="Valid user topic kept; no stronger document topic was found.",
            )

        user_family = self.classify_topic(user_topic) or normalize_text(user_topic)
        auto_family = self.classify_topic(auto_result.topic) or normalize_text(
            auto_result.topic
        )
        if user_family == auto_family:
            return TopicResolveResult(
                topic=user_topic,
                source="user",
                confidence=1.0,
                matched_keywords=auto_result.matched_keywords,
                title_candidates=auto_result.title_candidates,
                evidence=auto_result.evidence,
                reason="Valid user topic kept; document evidence is consistent.",
            )

        can_override = (
            self.mismatch_override
            and auto_result.source in _AUTO_SOURCES
            and auto_result.confidence >= max(self.min_confidence, 0.80)
        )
        if can_override:
            return TopicResolveResult(
                topic=auto_result.topic,
                source=auto_result.source,
                confidence=auto_result.confidence,
                matched_keywords=auto_result.matched_keywords,
                title_candidates=auto_result.title_candidates,
                evidence=auto_result.evidence,
                reason=(
                    f"Topic overridden from '{user_topic}' to '{auto_result.topic}' "
                    "based on strong document evidence."
                ),
            )

        return TopicResolveResult(
            topic=user_topic,
            source="user",
            confidence=1.0,
            matched_keywords=auto_result.matched_keywords,
            title_candidates=auto_result.title_candidates,
            evidence=auto_result.evidence,
            reason=(
                "User topic may not match document content. "
                f"Detected topic: {auto_result.topic}; kept user topic because override is disabled or evidence is not strong enough."
            ),
        )

    def _resolve_from_document(
        self,
        *,
        text: str,
        filename: str | None,
    ) -> tuple[TopicResolveResult, list[TopicCandidate], dict[str, dict[str, Any]]]:
        title_candidates = self.extract_title_candidates(text, filename)
        candidates: list[TopicCandidate] = []

        title_matches = self._match_catalog_aliases_in_titles(title_candidates)
        candidates.extend(title_matches)

        extracted_candidates = self._extract_generic_topic_candidates(
            title_candidates, text
        )
        candidates.extend(extracted_candidates)

        keyword_candidates, catalog_scores = self._score_catalog_keywords(text)
        candidates.extend(keyword_candidates)

        result = self._choose_best_candidate(candidates, title_candidates)
        return result, candidates, catalog_scores

    def _match_catalog_aliases_in_titles(
        self,
        title_candidates: list[TitleCandidate],
    ) -> list[TopicCandidate]:
        candidates: list[TopicCandidate] = []
        for title in title_candidates:
            if title.source == "filename" and _is_generic_filename(title.text):
                continue
            if title.source != "filename" and not _has_title_shape(title.text):
                continue
            for entry in self.catalog_entries:
                matched_alias = self._best_alias_match(title.text, entry)
                if not matched_alias:
                    continue
                source = "filename" if title.source == "filename" else "document_title"
                confidence = 0.84 if source == "filename" else 0.95
                if source == "filename" and title.score < 0.45:
                    confidence = 0.78
                candidates.append(
                    TopicCandidate(
                        topic=entry.canonical,
                        source=source,
                        confidence=confidence,
                        matched_keywords=[matched_alias],
                        evidence=[title.text],
                        score=title.score + confidence,
                        reason=f"Exact catalog alias/canonical match in {source}.",
                    )
                )
        return candidates

    def _best_alias_match(self, text: str, entry: TopicCatalogEntry) -> str | None:
        aliases = _dedupe_preserve_order([entry.canonical, *entry.aliases])
        # Prefer original-text matches first so diacritics can distinguish pairs
        # like "Kinh tế vi mô" and "Kinh tế vĩ mô".
        for alias in aliases:
            if _contains_original_phrase(text, alias):
                return alias
        normalized_text = normalize_text(text)
        for alias in aliases:
            normalized_alias = normalize_text(alias)
            if _contains_phrase(normalized_text, normalized_alias):
                return alias
        return None

    def _extract_generic_topic_candidates(
        self,
        title_candidates: list[TitleCandidate],
        text: str,
    ) -> list[TopicCandidate]:
        raw_candidates: list[tuple[str, TitleCandidate, str]] = []
        for title in title_candidates:
            pattern_candidates = self._pattern_extract_from_line(title.text)
            source_texts = pattern_candidates[:]
            if _has_title_shape(title.text) or (
                title.source == "filename" and not _is_generic_filename(title.text)
            ):
                source_texts.extend([title.text, _strip_chapter_prefix(title.text)])
            for candidate in source_texts:
                if _is_clear_topic_title(candidate):
                    raw_candidates.append(
                        (candidate, title, "clear title-like candidate")
                    )

        excerpt = (text or "")[: self.max_chars]
        for line_no, line in enumerate(excerpt.splitlines()[:80]):
            for candidate in self._pattern_extract_from_line(line):
                if _is_clear_topic_title(candidate):
                    raw_candidates.append(
                        (
                            candidate,
                            TitleCandidate(
                                text=_compact_original(line),
                                source="document_title",
                                position=line_no,
                                score=max(0.45, 0.8 - line_no * 0.01),
                            ),
                            "pattern extracted from early document line",
                        )
                    )

        candidates: list[TopicCandidate] = []
        seen: set[str] = set()
        for raw_topic, title, reason in raw_candidates:
            normalized = normalize_text(raw_topic)
            if normalized in seen:
                continue
            seen.add(normalized)

            if self.classify_topic(raw_topic):
                # Catalog alias/title candidate will handle this with stronger
                # canonical naming; skip the generic duplicate.
                continue
            topic = _format_topic_title(raw_topic)
            confidence = min(0.86, 0.64 + title.score * 0.22)
            source = "filename" if title.source == "filename" else "document_title"
            if source == "filename" and _is_generic_filename(title.text):
                continue
            candidates.append(
                TopicCandidate(
                    topic=topic,
                    source=source,
                    confidence=confidence,
                    matched_keywords=[],
                    evidence=[title.text],
                    score=confidence + title.score,
                    reason=reason,
                )
            )
        return candidates

    def _pattern_extract_from_line(self, line: str) -> list[str]:
        clean = _compact_original(line)
        patterns = (
            r"^(?:môn học|tên môn học|course)\s*[:\-]\s*(.+)$",
            r"^(?:giáo trình|giao trinh|bài giảng|bai giang|lecture)\s+(.+)$",
            r"^(?:chương|chuong|chapter)\s+\d+[a-zA-Z]?\s*[:\-]\s*(.+)$",
            r"^(?:bài|bai)\s+\d+[a-zA-Z]?\s*[:\-]\s*(.+)$",
            r"^introduction to\s+(.+)$",
            r"^(.+?)\s+(?:lecture|course|syllabus)$",
        )
        results: list[str] = []
        for pattern in patterns:
            match = re.match(pattern, clean, flags=re.IGNORECASE)
            if match:
                results.append(_compact_original(match.group(1)))
        return results

    def _score_catalog_keywords(
        self,
        text: str,
    ) -> tuple[list[TopicCandidate], dict[str, dict[str, Any]]]:
        excerpt = (text or "")[: self.max_chars]
        normalized_excerpt = normalize_text(excerpt)
        candidates: list[TopicCandidate] = []
        scores: dict[str, dict[str, Any]] = {}

        for entry in self.catalog_entries:
            strong_matches = self._matched_terms(
                normalized_excerpt, entry.strong_keywords
            )
            weak_matches = self._matched_terms(normalized_excerpt, entry.weak_keywords)
            negative_matches = self._matched_terms(
                normalized_excerpt, entry.negative_keywords
            )
            alias_matches = self._matched_alias_terms(excerpt, entry)

            strong_count = len(strong_matches)
            weak_count = len(weak_matches)
            negative_count = len(negative_matches)
            raw_score = (
                strong_count * 3.0
                + weak_count * 0.5
                + len(alias_matches) * 4.0
                - negative_count * 2.0
            )
            scores[entry.canonical] = {
                "strong": strong_matches[:8],
                "weak": weak_matches[:8],
                "negative": negative_matches[:5],
                "aliases": alias_matches[:5],
                "score": round(raw_score, 3),
            }

            alias_has_subject_shape = any(
                _word_count(alias) >= 2 for alias in alias_matches
            )
            if alias_matches and (alias_has_subject_shape or strong_count >= 2):
                confidence = 0.79 + min(0.1, strong_count * 0.02)
                candidates.append(
                    TopicCandidate(
                        topic=entry.canonical,
                        source="catalog_alias",
                        confidence=round(confidence, 3),
                        matched_keywords=alias_matches + strong_matches[:5],
                        evidence=alias_matches[:2],
                        score=raw_score + confidence,
                        reason="Catalog alias/canonical appeared in the document excerpt.",
                    )
                )

            if strong_count < 3:
                continue

            confidence = (
                0.72 + min(0.18, strong_count * 0.03) + min(0.04, weak_count * 0.01)
            )
            confidence -= min(0.12, negative_count * 0.04)
            confidence = max(0.0, min(0.88, confidence))
            if confidence < 0.45:
                continue
            candidates.append(
                TopicCandidate(
                    topic=entry.canonical,
                    source="catalog_keywords",
                    confidence=round(confidence, 3),
                    matched_keywords=strong_matches + weak_matches[:3],
                    evidence=strong_matches[:5],
                    score=raw_score + confidence,
                    reason="At least three distinct strong catalog keywords matched.",
                )
            )

        return candidates, scores

    def _matched_terms(self, normalized_text: str, terms: list[str]) -> list[str]:
        matches: list[str] = []
        seen: set[str] = set()
        for term in terms:
            normalized = normalize_text(term)
            if normalized in seen:
                continue
            if _contains_phrase(normalized_text, normalized):
                seen.add(normalized)
                matches.append(term)
        return matches

    def _matched_alias_terms(self, text: str, entry: TopicCatalogEntry) -> list[str]:
        aliases = _dedupe_preserve_order([entry.canonical, *entry.aliases])
        normalized_text = normalize_text(text)
        matches: list[str] = []
        for alias in aliases:
            normalized_alias = normalize_text(alias)
            if len(normalized_alias) <= 3:
                continue
            if _contains_original_phrase(text, alias) or _contains_phrase(
                normalized_text, normalized_alias
            ):
                matches.append(alias)
        return matches

    def _choose_best_candidate(
        self,
        candidates: list[TopicCandidate],
        title_candidates: list[TitleCandidate],
    ) -> TopicResolveResult:
        title_texts = [candidate.text for candidate in title_candidates[:5]]
        if not candidates:
            return TopicResolveResult(
                topic=UNKNOWN_TOPIC,
                source="fallback",
                confidence=0.0,
                matched_keywords=[],
                title_candidates=title_texts,
                evidence=[],
                reason="No title match, alias match, or sufficient strong keywords found.",
            )

        candidates = sorted(
            candidates,
            key=lambda item: (
                item.confidence,
                _SOURCE_PRIORITY.get(item.source, 0),
                item.score,
            ),
            reverse=True,
        )
        best = candidates[0]
        second = candidates[1] if len(candidates) > 1 else None

        if best.confidence < self.min_confidence:
            return TopicResolveResult(
                topic=UNKNOWN_TOPIC,
                source="fallback",
                confidence=best.confidence,
                matched_keywords=best.matched_keywords,
                title_candidates=title_texts,
                evidence=best.evidence,
                reason="Best candidate was below MIN_TOPIC_CONFIDENCE.",
            )

        if (
            second
            and best.source not in {"document_title", "filename"}
            and second.topic != best.topic
            and abs(best.confidence - second.confidence) <= 0.05
        ):
            return TopicResolveResult(
                topic=UNKNOWN_TOPIC,
                source="fallback",
                confidence=best.confidence,
                matched_keywords=best.matched_keywords,
                title_candidates=title_texts,
                evidence=best.evidence + second.evidence,
                reason=(
                    "Conflicting candidates with similar confidence: "
                    f"{best.topic} vs {second.topic}."
                ),
            )

        return TopicResolveResult(
            topic=best.topic,
            source=best.source,
            confidence=best.confidence,
            matched_keywords=best.matched_keywords,
            title_candidates=title_texts,
            evidence=best.evidence,
            reason=best.reason or "Best-scoring topic candidate accepted.",
        )

    def _log_resolution(
        self,
        *,
        result: TopicResolveResult,
        filename: str | None,
        user_topic: str,
        candidates: list[TopicCandidate],
        catalog_scores: dict[str, dict[str, Any]],
    ) -> None:
        top_candidates = [
            {
                "topic": candidate.topic,
                "source": candidate.source,
                "confidence": candidate.confidence,
                "evidence": candidate.evidence[:2],
            }
            for candidate in sorted(
                candidates, key=lambda c: c.confidence, reverse=True
            )[:5]
        ]
        top_scores = dict(
            sorted(
                catalog_scores.items(),
                key=lambda item: item[1].get("score", 0),
                reverse=True,
            )[:5]
        )
        logger.info(
            "Topic resolving finished | filename=%s | user_topic=%s | title_candidates=%s | "
            "topic_candidates=%s | catalog_scores=%s | final_topic=%s | topic_source=%s | "
            "confidence=%.3f | matched_keywords=%s | evidence=%s | reason=%s",
            filename or "",
            user_topic,
            result.title_candidates[:5],
            top_candidates,
            top_scores,
            result.topic,
            result.source,
            result.confidence,
            result.matched_keywords[:8],
            result.evidence[:5],
            result.reason,
        )


def extract_title_candidates(
    text: str,
    filename: str | None = None,
    *,
    max_chars: int = 8000,
) -> list[TitleCandidate]:
    candidates: list[TitleCandidate] = []

    if filename:
        filename_title = _filename_to_title(filename)
        if filename_title:
            score = 0.30 if _is_generic_filename(filename) else 0.62
            candidates.append(
                TitleCandidate(
                    text=filename_title,
                    source="filename",
                    position=-1,
                    score=score,
                )
            )

    excerpt = (text or "")[:max_chars].replace("\r\n", "\n").replace("\r", "\n")
    lines = [_compact_original(line) for line in excerpt.split("\n")]
    non_empty_lines = [(index, line) for index, line in enumerate(lines) if line]

    for index, line in non_empty_lines[:80]:
        if _looks_like_noise_line(line):
            continue
        score = max(0.0, 0.78 - index * 0.012)
        words = _word_count(line)
        normalized = normalize_text(line)

        if index <= 12:
            score += 0.14
        if 2 <= words <= 8:
            score += 0.12
        elif words > 14:
            score -= 0.20
        if _is_mostly_upper(line):
            score += 0.18
        if any(
            hint in normalized for hint in [normalize_text(h) for h in _TITLE_HINTS]
        ):
            score += 0.10
        if _is_generic_heading(line):
            score -= 0.25

        source = (
            "heading"
            if any(h in normalized for h in ("chuong", "chapter", "bai ", "lecture"))
            else "document_title"
        )
        candidates.append(
            TitleCandidate(
                text=line,
                source=source,
                position=index,
                score=round(max(0.05, min(1.0, score)), 3),
            )
        )

    # Bilingual title pairs near the front often carry the clearest subject.
    for offset, (index, line) in enumerate(non_empty_lines[:20]):
        if offset + 1 >= len(non_empty_lines[:20]):
            break
        _, next_line = non_empty_lines[offset + 1]
        if _looks_like_noise_line(line) or _looks_like_noise_line(next_line):
            continue
        if _is_clear_topic_title(line) and _is_clear_topic_title(next_line):
            candidates.append(
                TitleCandidate(
                    text=f"{line} / {next_line}",
                    source="document_title",
                    position=index,
                    score=0.96,
                )
            )

    unique: dict[str, TitleCandidate] = {}
    for candidate in candidates:
        key = normalize_text(candidate.text)
        current = unique.get(key)
        if current is None or candidate.score > current.score:
            unique[key] = candidate

    return sorted(unique.values(), key=lambda item: item.score, reverse=True)[:12]
