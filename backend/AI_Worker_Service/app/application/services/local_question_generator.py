"""
Local question generator — CPU-only, no LLM, no GPU.

Purpose:
    Emergency fallback when Gemini quota is exhausted.
    Generates basic multiple-choice questions directly from document text
    using sentence extraction + keyword scoring.

IMPORTANT:
    - Questions go to pending_review, never auto-approved.
    - generation_source = "local_fallback" always.
    - Quality is significantly lower than Gemini output.
    - Intended for demo/research continuity, not production accuracy.

Algorithm:
    1. Clean + split text into candidate sentences
    2. Score sentences by educational keywords (Vietnamese)
    3. Pick top-N sentences as question bases
    4. Build MCQ from each:
       - question_content: "Theo tài liệu, nội dung nào sau đây phản ánh đúng?"
       - option A: the source sentence (correct answer)
       - option B/C/D: other sentences from the doc (distractors)
    5. explanation = source sentence
"""

import hashlib
import random
import re
from dataclasses import dataclass
from typing import List, Optional

from app.core.logging import get_logger
from app.domain.enums import DifficultyLevel, GenerationSource, QuestionStatus

logger = get_logger(__name__)

# Raw exam tokens often found in Vietnamese multiple-choice documents.
# Examples: [<$>] (option marker), [<TB>] [<DE>] [<KH>] [<NB>] (difficulty/section tags)
_RAW_EXAM_TOKENS = ["TB", "DE", "KH", "NB"]

# Matches tokens like: [<TB>], [<DE>], [<KH>], [<NB>]
_TAG_TOKEN_RE = re.compile(r"\[\s*<\s*([A-Z]{2})\s*>\s*\]", re.IGNORECASE)

# Matches option marker: [<$>]
_OPTION_MARKER_RE = re.compile(r"\[\s*<\s*\$\s*>\s*\]")

# Local fallback is intentionally conservative: these bounds prevent tiny
# fragments or pasted paragraphs from becoming answer options.
_MIN_OPTION_CHARS = 12
_MAX_OPTION_CHARS = 240

_BULLET_PREFIX_RE = re.compile(r"^\s*(?:->|=>|[+\-•●▪‣–—])\s*")
_DANGLING_END_RE = re.compile(
    r"(?:[,;:–—-]|\b(?:và|hoặc|của|trong|với|là|các|những|một|được|theo))$",
    re.IGNORECASE,
)
_JOINED_WORD_FIXES = {
    "nhữngchặng": "những chặng",
    "Qúa": "Quá",
    "qúa": "quá",
    "thiệt bị": "thiết bị",
    "Thiệt bị": "Thiết bị",
    "nhập phẩu": "nhập khẩu",
    "Nhập phẩu": "Nhập khẩu",
}
_ANSWER_LABELS = ("A", "B", "C", "D")

# Matches a question header line, e.g.:
#   Câu 1 [<DE>]: Nội dung
#   Câu số 181 [<TB>]: Nội dung
_QUESTION_HEADER_RE = re.compile(
    r"^\s*Câu\s*(?:số\s*)?(\d+)\s*(?:\[\s*<[^>]+>\s*\])?\s*:\s*(.+?)\s*$",
    re.IGNORECASE,
)


def _normalize_spaces(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def _clean_candidate_text(s: str) -> str:
    """Clean a sentence/option candidate without changing its meaning."""
    if not s:
        return ""

    s = _normalize_spaces(s)

    # Remove repeated bullet/arrow prefixes only at the beginning.
    while True:
        cleaned = _BULLET_PREFIX_RE.sub("", s)
        cleaned = _normalize_spaces(cleaned)
        if cleaned == s:
            break
        s = cleaned

    for wrong, right in _JOINED_WORD_FIXES.items():
        s = s.replace(wrong, right)

    # Fix simple ASCII camelCase paste artifacts without splitting Vietnamese
    # accented words, whose Unicode ranges are not contiguous by case.
    s = re.sub(r"([a-z])([A-Z])", r"\1 \2", s)
    return _normalize_spaces(s.strip(" \t-–—•"))


def _is_truncated_fragment(s: str) -> bool:
    if not s:
        return True
    return bool(_DANGLING_END_RE.search(s.strip()))


def _is_quality_option(s: str) -> bool:
    """Return True when text is safe enough to use as an answer option."""
    if not s:
        return False
    if _looks_like_exam_artifact(s):
        return False
    if _BULLET_PREFIX_RE.match(s):
        return False
    if not (_MIN_OPTION_CHARS <= len(s) <= _MAX_OPTION_CHARS):
        return False
    if len(s.split()) < 3:
        return False
    if _is_truncated_fragment(s):
        return False
    if re.fullmatch(r"[A-Z0-9\s\-_/]+", s):
        return False
    return True


def _shuffle_options(
    correct: str, distractors: List[str]
) -> tuple[dict[str, str], str]:
    """Place the correct answer in a varied deterministic position."""
    items = [(correct, True)] + [(d, False) for d in distractors[:3]]
    digest = hashlib.sha1(correct.encode("utf-8")).hexdigest()
    offset = int(digest[:2], 16) % len(items)
    items = items[offset:] + items[:offset]

    options: dict[str, str] = {}
    correct_answer = "A"
    for label, (text, is_correct) in zip(_ANSWER_LABELS, items):
        options[label] = text
        if is_correct:
            correct_answer = label

    return options, correct_answer


def _strip_exam_tokens_keep_text(s: str) -> str:
    """Remove bracket tokens like [<TB>] [<DE>] [<KH>] [<NB>] and normalize spaces."""
    if not s:
        return ""

    def _replace_tag(m: re.Match) -> str:
        tag = (m.group(1) or "").upper()
        return " " if tag in _RAW_EXAM_TOKENS else " "

    s = _TAG_TOKEN_RE.sub(_replace_tag, s)
    # Remove option marker if present
    s = _OPTION_MARKER_RE.sub(" ", s)
    return _clean_candidate_text(s)


def _strip_exam_tokens_preserve_newlines(s: str) -> str:
    """Remove bracket tokens while preserving newlines for downstream splitting."""
    if not s:
        return ""

    def _replace_tag(m: re.Match) -> str:
        tag = (m.group(1) or "").upper()
        return " " if tag in _RAW_EXAM_TOKENS else " "

    # Remove tags and option markers but keep line structure
    s = _TAG_TOKEN_RE.sub(_replace_tag, s)
    s = _OPTION_MARKER_RE.sub(" ", s)
    # Normalize spaces within each line only
    lines = [
        _clean_candidate_text(re.sub(r"[ \t]{2,}", " ", ln).strip())
        for ln in s.split("\n")
    ]
    return "\n".join(lines)


def _looks_like_exam_artifact(s: str) -> bool:
    """Heuristics to avoid picking noisy exam-format lines as rule-based sources."""
    if not s:
        return True
    if _OPTION_MARKER_RE.search(s):
        return True
    if _TAG_TOKEN_RE.search(s):
        return True
    if re.search(r"\bCâu\s*(?:số\s*)?\d+\b", s, re.IGNORECASE):
        return True
    # Lines dominated by brackets/symbols tend to be headers
    if re.search(r"\[[^\]]+\]", s):
        return True
    return False


@dataclass
class _ParsedMcq:
    question_content: str
    options: List[str]


def _parse_existing_mcq(text: str, max_items: int) -> tuple[List[_ParsedMcq], int, int]:
    """Parse existing MCQ blocks in the specific format using [<$>] markers."""
    if not text:
        return [], 0, 0
    lines = [
        ln.strip() for ln in text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    ]
    lines = [ln for ln in lines if ln]

    parsed: List[_ParsedMcq] = []
    raw_headers = 0
    skipped_invalid = 0
    i = 0
    while i < len(lines):
        m = _QUESTION_HEADER_RE.match(lines[i])
        if not m:
            i += 1
            continue

        raw_headers += 1

        question_part = _strip_exam_tokens_keep_text(m.group(2) or "")
        if not question_part:
            i += 1
            continue

        # Collect option lines until next question header
        options: List[str] = []
        j = i + 1
        while j < len(lines) and not _QUESTION_HEADER_RE.match(lines[j]):
            opt_match = _OPTION_MARKER_RE.search(lines[j])
            if opt_match:
                opt_text = _strip_exam_tokens_keep_text(lines[j])
                if opt_text:
                    options.append(opt_text)
            j += 1

        # Require at least 4 options
        if len(options) >= 4:
            parsed.append(
                _ParsedMcq(question_content=question_part, options=options[:4])
            )
            if len(parsed) >= max_items:
                break
        else:
            skipped_invalid += 1

        i = j

    return parsed, raw_headers, skipped_invalid


def _clean_and_split_with_stats(text: str) -> tuple[List[str], int, int]:
    """Return (sentences, raw_count, skipped_count)."""
    if not text:
        return [], 0, 0

    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Put a hard boundary before each question header to avoid glued items
    text = re.sub(r"(?=\n\s*Câu\s*(?:số\s*)?\d+\b)", "\n", text, flags=re.IGNORECASE)
    text = _strip_exam_tokens_preserve_newlines(text)

    raw = re.split(r"[.!?\n;]+", text)
    raw_count = 0
    skipped = 0
    sentences: List[str] = []

    for s in raw:
        s = _clean_candidate_text(s)
        if not s:
            continue
        raw_count += 1

        if not _is_quality_option(s):
            skipped += 1
            continue

        sentences.append(s)

    return sentences, raw_count, skipped


# Keyword patterns that suggest educational sentences (Vietnamese)
_EDUCATIONAL_KEYWORDS = [
    r"\blà\b",
    r"\bgồm\b",
    r"\bbao gồm\b",
    r"\bđược gọi là\b",
    r"\bcó vai trò\b",
    r"\bnguyên nhân\b",
    r"\bmục tiêu\b",
    r"\bnhiệm vụ\b",
    r"\bđặc điểm\b",
    r"\bý nghĩa\b",
    r"\bchức năng\b",
    r"\bphân loại\b",
    r"\bkhái niệm\b",
    r"\bđịnh nghĩa\b",
    r"\bnguyên tắc\b",
    r"\bquy trình\b",
    r"\bphương pháp\b",
]
_KW_PATTERNS = [re.compile(p, re.IGNORECASE) for p in _EDUCATIONAL_KEYWORDS]

# Neutral distractors to use when we don't have enough distinct sentences
_SAFE_DISTRACTORS = [
    "Nội dung không được đề cập trực tiếp trong tài liệu.",
    "Một nhận định không phù hợp với đoạn trích được cung cấp.",
    "Một nội dung khác không có trong phạm vi tài liệu này.",
    "Thông tin thuộc về chủ đề khác, không liên quan đến nội dung trên.",
]


def _score_sentence(sentence: str) -> int:
    """Score 0–N based on how many educational keywords appear."""
    return sum(1 for p in _KW_PATTERNS if p.search(sentence))


_ANCHOR_PATTERNS = [
    re.compile(r"\b(Đại hội\s+[IVXLC]+(?:\s+của\s+Đảng)?)", re.IGNORECASE),
    re.compile(
        r"\b(Nghị quyết\s+(?:TW|Trung ương)?\s*\d+[A-Z/a-zÀ-ỹ\s-]{0,60})", re.IGNORECASE
    ),
]
_CATEGORY_PATTERNS = {
    "resolution": re.compile(
        r"\b(Đại hội|Nghị quyết|Hội nghị|Hiệp định)\b", re.IGNORECASE
    ),
    "goal": re.compile(
        r"\b(mục tiêu|nhiệm vụ|chủ trương|đường lối|quan điểm)\b", re.IGNORECASE
    ),
    "concept": re.compile(
        r"\b(khái niệm|định nghĩa|là|được gọi là|bao gồm|gồm)\b", re.IGNORECASE
    ),
    "impact": re.compile(
        r"\b(ý nghĩa|kết quả|tác động|vai trò|nguyên nhân)\b", re.IGNORECASE
    ),
}


def _anchor_text(sentence: str) -> str:
    for pattern in _ANCHOR_PATTERNS:
        match = pattern.search(sentence)
        if match:
            return _clean_candidate_text(match.group(1)).rstrip(" ,.;:")
    return ""


def _sentence_category(sentence: str) -> str:
    for category, pattern in _CATEGORY_PATTERNS.items():
        if pattern.search(sentence):
            return category
    return "general"


def _question_content_from_source(source_sentence: str, topic: str) -> str:
    anchor = _anchor_text(source_sentence)
    lower = source_sentence.lower()

    if anchor:
        if "đánh giá" in lower:
            return f"{anchor} đánh giá nội dung nào?"
        if "mục tiêu" in lower:
            return f"{anchor} đã đề ra mục tiêu nào?"
        if "nhiệm vụ" in lower:
            return f"{anchor} xác định nhiệm vụ nào?"
        if "chủ trương" in lower or "đường lối" in lower:
            return f"{anchor} xác định chủ trương nào?"
        return f"{anchor} xác định nội dung nào?"

    if "mục tiêu" in lower:
        return "Mục tiêu nào được nêu trong nội dung học?"
    if "nhiệm vụ" in lower:
        return "Nhiệm vụ nào được xác định trong nội dung học?"
    if "chủ trương" in lower or "đường lối" in lower:
        return "Chủ trương nào được xác định trong nội dung học?"
    if "khái niệm" in lower or "định nghĩa" in lower:
        return "Khái niệm nào được nêu trong nội dung học?"
    if "nguyên nhân" in lower:
        return "Nguyên nhân nào được nêu trong nội dung học?"
    if "ý nghĩa" in lower:
        return "Ý nghĩa nào được nêu trực tiếp trong nội dung học?"

    clean_topic = _clean_candidate_text(topic).strip('"')
    if clean_topic:
        return f"Nội dung nào được nêu về {clean_topic}?"
    return "Nội dung nào được nêu trực tiếp trong phần học này?"


def _pick_distractors(source_sentence: str, sentences: List[str]) -> List[str]:
    source_category = _sentence_category(source_sentence)
    seen = {source_sentence}
    pool: List[str] = []
    for candidate in sentences:
        candidate = _clean_candidate_text(candidate)
        if candidate in seen:
            continue
        seen.add(candidate)
        if not _is_quality_option(candidate):
            continue
        pool.append(candidate)

    def sort_key(candidate: str) -> tuple[int, int, int]:
        category_penalty = 0 if _sentence_category(candidate) == source_category else 1
        length_penalty = abs(len(candidate) - len(source_sentence))
        score_penalty = -_score_sentence(candidate)
        return (category_penalty, length_penalty, score_penalty)

    return sorted(pool, key=sort_key)[:3]


def _clean_and_split(text: str) -> List[str]:
    """Split text into clean candidate sentences."""
    sentences, _, _ = _clean_and_split_with_stats(text)
    return sentences


def _build_question(
    source_sentence: str,
    distractors: List[str],
    topic: str,
    difficulty: str,
    question_templates: Optional[List[str]] = None,
) -> Optional[dict]:
    """Build one MCQ from a source sentence and 3 distractors."""
    source_sentence = _clean_candidate_text(source_sentence)
    d = [_clean_candidate_text(item) for item in distractors]
    d = [item for item in d if _is_quality_option(item)]

    if not _is_quality_option(source_sentence) or len(d) < 3:
        return None

    if question_templates:
        question_content = random.choice(question_templates)
    else:
        question_content = _question_content_from_source(source_sentence, topic)

    options, correct_answer = _shuffle_options(source_sentence, d[:3])

    return {
        "question_content": question_content,
        "options": options,
        "correct_answer": correct_answer,
        "difficulty": difficulty,
        "topic": topic,
        "explanation": f"Theo nội dung học: {source_sentence}",
        "status": QuestionStatus.PENDING_REVIEW.value,
        "generation_source": GenerationSource.LOCAL_FALLBACK.value,
    }


class LocalQuestionGenerator:
    """
    CPU-based question generator for when Gemini quota is exhausted.

    Generates readable but lower-quality MCQs from document text
    using sentence extraction and keyword scoring — no LLM involved.
    """

    def generate(
        self,
        context: str,
        quantity: int,
        topic: str,
        difficulty: str = DifficultyLevel.MEDIUM.value,
    ) -> List[dict]:
        """
        Generate `quantity` MCQ questions from `context`.

        Returns list of question dicts (same format as Gemini output),
        each with generation_source = "local_fallback".

        Args:
            context: Document text (cleaned/preprocessed)
            quantity: Number of questions to generate
            topic: Topic label for the questions
            difficulty: easy|medium|hard|very_hard

        Returns:
            List of question dicts (may be fewer than `quantity` if context is thin)
        """
        # Hard limit for quality in local fallback
        effective_quantity = min(int(quantity), 10)

        # 1) First try: parse existing MCQ format (best-effort extraction)
        parsed_mcq, raw_mcq_count, skipped_mcq = _parse_existing_mcq(
            context, max_items=effective_quantity
        )
        if parsed_mcq:
            questions: List[dict] = []
            for item in parsed_mcq[:effective_quantity]:
                clean_question = _clean_candidate_text(item.question_content)
                clean_options = [
                    _clean_candidate_text(option) for option in item.options
                ]
                clean_options = [
                    option for option in clean_options if _is_quality_option(option)
                ]
                if not clean_question or len(clean_options) < 4:
                    skipped_mcq += 1
                    continue

                options, correct_answer = _shuffle_options(
                    clean_options[0], clean_options[1:4]
                )
                questions.append(
                    {
                        "question_content": clean_question,
                        "options": options,
                        # Unknown correct answer → keep pending_review, set placeholder
                        "correct_answer": correct_answer,
                        "difficulty": difficulty,
                        "topic": topic,
                        "explanation": (
                            "Câu hỏi được trích xuất từ tài liệu, cần người dùng kiểm tra đáp án."
                        ),
                        "status": QuestionStatus.PENDING_REVIEW.value,
                        "generation_source": GenerationSource.LOCAL_FALLBACK.value,
                    }
                )

            if questions:
                logger.info(
                    "LocalQuestionGenerator: mode=parsed_existing_mcq raw=%d valid=%d skipped=%d | topic=%s | requested=%d effective=%d",
                    raw_mcq_count,
                    len(questions),
                    skipped_mcq,
                    topic,
                    quantity,
                    effective_quantity,
                )
                return questions
            logger.warning(
                "LocalQuestionGenerator: parsed MCQ blocks existed but no quality options survived filtering | raw=%d skipped=%d topic=%s",
                raw_mcq_count,
                skipped_mcq,
                topic,
            )

        # 2) Second try: rule-based generation from clean sentences
        sentences, raw_sent_count, skipped_sent = _clean_and_split_with_stats(context)

        if len(sentences) < 4:
            logger.warning(
                "LocalQuestionGenerator: too few sentences (%d) in context for topic=%s",
                len(sentences),
                topic,
            )
            return []

        # Score and rank sentences
        scored = sorted(sentences, key=_score_sentence, reverse=True)

        questions: List[dict] = []
        used_sources = set()

        for source in scored:
            if len(questions) >= effective_quantity:
                break
            if source in used_sources:
                continue

            # Pick 3 quality distractors from other clean sentences. If there
            # are not enough, skip instead of filling with generic text.
            distractors = _pick_distractors(source, sentences)
            if len(distractors) < 3:
                used_sources.add(source)
                continue

            q = _build_question(source, distractors, topic, difficulty)
            if q is None:
                used_sources.add(source)
                continue
            questions.append(q)
            used_sources.add(source)

        logger.info(
            "LocalQuestionGenerator: mode=generated_rule_based raw=%d valid=%d skipped=%d | topic=%s | difficulty=%s | requested=%d effective=%d",
            raw_sent_count,
            len(questions),
            skipped_sent,
            topic,
            difficulty,
            quantity,
            effective_quantity,
        )
        return questions
