"""
Normalize generated question text before validation and persistence.

This service removes boilerplate opening phrases that make MCQs feel like they
refer to an external prompt instead of asking directly about the subject.
"""
import re

_QUESTION_PREFIXES = (
    "Theo nội dung được cung cấp",
    "Theo nội dung tài liệu",
    "Theo nội dung bài học",
    "Theo tài liệu",
    "Theo đoạn văn",
    "Theo văn bản",
    "Dựa trên nội dung được cung cấp",
    "Dựa vào nội dung được cung cấp",
    "Dựa trên tài liệu",
    "Dựa vào tài liệu",
    "Trong nội dung được cung cấp",
)

_PREFIX_RE = re.compile(
    r"^\s*(?:" + "|".join(re.escape(prefix) for prefix in _QUESTION_PREFIXES) + r")\s*[,:\-–—]?\s*",
    re.IGNORECASE,
)

_SOFT_SOURCE_PREFIX_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    (
        re.compile(
            r"^\s*Theo\s+nội\s+dung\s+(?P<source>[^,]{3,120}),\s*(?P<body>.+)$",
            re.IGNORECASE,
        ),
        "content",
    ),
    (
        re.compile(
            r"^\s*Theo\s+đánh\s+giá\s+của\s+(?P<source>[^,]{3,120}),\s*(?P<body>.+)$",
            re.IGNORECASE,
        ),
        "assessment",
    ),
    (
        re.compile(
            r"^\s*Theo\s+(?P<source>Nghị\s+quyết[^,]{0,120}),\s*(?P<body>.+)$",
            re.IGNORECASE,
        ),
        "resolution",
    ),
)

_DAU_LA_RE = re.compile(
    r"^đâu\s+là\s+(?:một\s+trong\s+những\s+)?(?P<rest>.+)$",
    re.IGNORECASE,
)
_DUOC_DE_RA_TRAIL_RE = re.compile(r"\s+được\s+đề\s+ra(\?)?$", re.IGNORECASE)

_COMMON_TEXT_NOISE = {
    "qyền": "quyền",
    "Qyền": "Quyền",
    "Baix Sậy": "Bãi Sậy",
}


def _capitalize_first_letter(text: str) -> str:
    """Uppercase the first alphabetic character without changing the rest."""
    for index, char in enumerate(text):
        if char.isalpha():
            return text[:index] + char.upper() + text[index + 1 :]
    return text


def normalize_common_text_noise(text: str) -> str:
    """Fix only a tiny set of obvious OCR/extraction typos."""
    normalized = text
    for wrong, right in _COMMON_TEXT_NOISE.items():
        normalized = normalized.replace(wrong, right)
    return normalized


def _cleanup_source(source: str) -> str:
    """Trim source phrase while keeping important labels like Đại hội IV."""
    return source.strip(" ,:-–—")


def _rewrite_dau_la_question(source: str, body: str, *, verb: str) -> str:
    """Rewrite 'đâu là...' bodies into a natural source-led question."""
    match = _DAU_LA_RE.match(body.strip())
    if not match:
        return ""

    rest = match.group("rest").strip()
    rest = _DUOC_DE_RA_TRAIL_RE.sub(r"\1", rest).strip()
    if re.match(r"^mục\s+tiêu\b", rest, flags=re.IGNORECASE):
        rest = re.sub(r"^mục\s+tiêu\b", "mục tiêu nào", rest, count=1, flags=re.IGNORECASE)
    elif not re.search(r"\b(nào|gì|vì sao|như thế nào)\b", rest, flags=re.IGNORECASE):
        rest = f"nội dung nào về {rest}"
    return f"{source} {verb} {rest}"


def _normalize_soft_source_prefix(text: str) -> str:
    """
    Rewrite source-bearing prefixes without losing the source phrase.

    Examples:
    - Theo nội dung Đại hội IV..., đâu là... -> Đại hội IV... đã đề ra...
    - Theo đánh giá của Đại hội VI..., sai lầm... -> Đại hội VI... đánh giá sai lầm...
    """
    for pattern, kind in _SOFT_SOURCE_PREFIX_PATTERNS:
        match = pattern.match(text)
        if not match:
            continue

        source = _cleanup_source(match.group("source"))
        body = match.group("body").strip()
        if not source or not body:
            return text

        source_lower = source.lower()
        body_lower = body.lower()
        if kind == "assessment":
            return f"{source} đánh giá {body}"

        if kind == "resolution":
            rewritten = _rewrite_dau_la_question(source, body, verb="xác định")
            return rewritten or f"{source} xác định {body}"

        verb = "đã đề ra" if ("đề ra" in body_lower or "đại hội" in source_lower) else "nêu"
        rewritten = _rewrite_dau_la_question(source, body, verb=verb)
        return rewritten or f"{source} {body}"

    return text


def normalize_question_content(text: str) -> str:
    """
    Remove generic source-reference prefixes at the start of a question.

    Prefixes in the middle of a sentence are intentionally preserved.
    """
    if not text:
        return text

    normalized = normalize_common_text_noise(text).strip()
    without_prefix = _PREFIX_RE.sub("", normalized, count=1).strip()
    rewritten = _normalize_soft_source_prefix(without_prefix)
    return _capitalize_first_letter(rewritten.strip())


def normalize_question_payload(raw_data: object) -> object:
    """
    Normalize question_content fields in a Gemini-style response object.

    The object is mutated in place when it matches the expected structure and
    returned for convenient use before validation.
    """
    if not isinstance(raw_data, dict):
        return raw_data

    questions = raw_data.get("questions")
    if not isinstance(questions, list):
        return raw_data

    for question in questions:
        if not isinstance(question, dict):
            continue
        content = question.get("question_content")
        if isinstance(content, str):
            question["question_content"] = normalize_question_content(content)
    return raw_data
