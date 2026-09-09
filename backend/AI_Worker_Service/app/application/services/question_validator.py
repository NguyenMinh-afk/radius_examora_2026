"""
Kiểm tra đầu ra câu hỏi từ Gemini.

Chỉ các câu hợp lệ theo schema và quy tắc nội bộ mới được giữ lại; câu lỗi sẽ
bị ghi log và loại khỏi kết quả lưu DB.
"""

from dataclasses import dataclass
from typing import Any

from app.core.logging import get_logger

logger = get_logger(__name__)

VALID_ANSWERS = {"A", "B", "C", "D"}
VALID_DIFFICULTIES = {"easy", "medium", "hard", "very_hard"}
REQUIRED_OPTIONS = {"A", "B", "C", "D"}
MIN_CONTENT_LENGTH = 5
MIN_OPTION_LENGTH = 1
MIN_EXPLANATION_LENGTH = 5


@dataclass
class ValidationResult:
    valid_questions: list[dict]
    invalid_count: int
    error_reasons: list[str]

    @property
    def has_valid(self) -> bool:
        return len(self.valid_questions) > 0

    @property
    def total_processed(self) -> int:
        return len(self.valid_questions) + self.invalid_count


class QuestionValidator:
    """
    Validates a list of question dicts from Gemini output.

    Rules:
    - question_content: non-empty string
    - options: dict with keys A, B, C, D, each non-empty string
    - correct_answer: one of A, B, C, D
    - difficulty: one of easy, medium, hard, very_hard
    - topic: non-empty string
    - explanation: non-empty string
    """

    def validate_batch(self, raw_data: Any) -> ValidationResult:
        """
        Validate raw parsed JSON from Gemini.

        Args:
            raw_data: Parsed JSON object (should be a dict with "questions" key)

        Returns:
            ValidationResult with valid questions and error info
        """
        errors: list[str] = []

        # Top-level structure check
        if not isinstance(raw_data, dict):
            return ValidationResult(
                valid_questions=[],
                invalid_count=0,
                error_reasons=["Response is not a JSON object."],
            )

        questions_raw = raw_data.get("questions")
        if questions_raw is None:
            return ValidationResult(
                valid_questions=[],
                invalid_count=0,
                error_reasons=["Missing 'questions' key in response."],
            )

        if not isinstance(questions_raw, list):
            return ValidationResult(
                valid_questions=[],
                invalid_count=0,
                error_reasons=["'questions' is not a list."],
            )

        if len(questions_raw) == 0:
            return ValidationResult(
                valid_questions=[],
                invalid_count=0,
                error_reasons=["'questions' list is empty."],
            )

        valid: list[dict] = []
        invalid_count = 0

        for i, q in enumerate(questions_raw):
            is_valid, reason = self._validate_single(q, index=i)
            if is_valid:
                valid.append(q)
            else:
                invalid_count += 1
                errors.append(f"Question #{i + 1}: {reason}")
                logger.warning(
                    "Invalid question #%d: %s | content_preview='%s'",
                    i + 1,
                    reason,
                    str(q.get("question_content", ""))[:50],
                )

        logger.info(
            "Validation complete: %d valid, %d invalid out of %d",
            len(valid),
            invalid_count,
            len(questions_raw),
        )
        return ValidationResult(
            valid_questions=valid,
            invalid_count=invalid_count,
            error_reasons=errors,
        )

    def _validate_single(self, q: Any, index: int) -> tuple[bool, str]:
        """Validate a single question dict. Returns (is_valid, error_reason)."""
        if not isinstance(q, dict):
            return False, "Question is not a dict."

        # question_content
        content = q.get("question_content", "")
        if not isinstance(content, str) or len(content.strip()) < MIN_CONTENT_LENGTH:
            return (
                False,
                f"'question_content' is empty or too short (min {MIN_CONTENT_LENGTH} chars).",
            )

        # options
        options = q.get("options")
        if not isinstance(options, dict):
            return False, "'options' is not a dict."
        missing_opts = REQUIRED_OPTIONS - set(options.keys())
        if missing_opts:
            return False, f"Missing options: {missing_opts}"
        for key in REQUIRED_OPTIONS:
            val = options.get(key, "")
            if not isinstance(val, str) or len(val.strip()) < MIN_OPTION_LENGTH:
                return False, f"Option '{key}' is empty."

        # correct_answer
        answer = q.get("correct_answer", "")
        if not isinstance(answer, str) or answer.strip().upper() not in VALID_ANSWERS:
            return (
                False,
                f"'correct_answer' must be one of {VALID_ANSWERS}, got '{answer}'.",
            )
        # Normalize to uppercase
        q["correct_answer"] = answer.strip().upper()

        # difficulty
        difficulty = q.get("difficulty", "")
        if (
            not isinstance(difficulty, str)
            or difficulty.strip().lower() not in VALID_DIFFICULTIES
        ):
            return (
                False,
                f"'difficulty' must be one of {VALID_DIFFICULTIES}, got '{difficulty}'.",
            )
        q["difficulty"] = difficulty.strip().lower()

        # topic
        topic = q.get("topic", "")
        if not isinstance(topic, str) or not topic.strip():
            return False, "'topic' is empty."

        # explanation
        explanation = q.get("explanation", "")
        if (
            not isinstance(explanation, str)
            or len(explanation.strip()) < MIN_EXPLANATION_LENGTH
        ):
            return (
                False,
                f"'explanation' is too short (min {MIN_EXPLANATION_LENGTH} chars).",
            )

        return True, ""
