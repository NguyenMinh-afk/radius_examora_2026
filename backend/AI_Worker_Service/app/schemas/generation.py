"""
Pydantic v2 schemas for question generation API endpoints.
"""

import uuid

from pydantic import BaseModel, Field, field_validator

from app.core.config import get_settings
from app.domain.enums import DifficultyLevel, QuestionType

# Swagger placeholder values that should be treated as "not provided"
_DUMMY_TEXT_VALUES = frozenset({"string", "null", "none", "undefined", "na", "n/a"})
_DUMMY_TOPIC_VALUES = _DUMMY_TEXT_VALUES | frozenset(
    {
        "topic",
        "default",
        "untitled",
        "unknown",
        "test",
        "subject",
        "môn học",
        "chủ đề",
        "chưa xác định",
    }
)
_UNKNOWN_TOPIC = "Chưa xác định"


class GenerateQuestionsRequest(BaseModel):
    """POST /api/v1/ai/generate-questions"""

    user_id: uuid.UUID

    # --- Course/Subject (all optional; auto-resolved from topic) ---
    course_id: int | None = Field(
        default=None,
        ge=1,
        description="Course ID ≥ 1. Leave null for auto-resolve from topic.",
    )
    course_name: str | None = Field(
        default=None,
        description="Course name. Leave null for auto-resolve. Do NOT send 'string'.",
    )
    chapter_id: int | None = Field(
        default=None,
        ge=1,
        description="Chapter ID ≥ 1. Leave null or omit. Do NOT send 0.",
    )
    knowledge_unit_id: int | None = Field(
        default=None,
        ge=1,
        description="Knowledge unit ID ≥ 1. Leave null or omit. Do NOT send 0.",
    )
    subject_id: int | None = Field(
        default=None,
        ge=1,
        description="Subject ID ≥ 1. Leave null for auto-resolve from topic.",
    )
    subject_name: str | None = Field(
        default=None,
        description="Subject name. Leave null — defaults to topic value. Do NOT send 'string'.",
    )

    # --- Required fields ---
    topic: str | None = Field(
        default=None,
        max_length=500,
        description="Topic of the questions. Leave null/blank for worker-side auto-detect.",
        examples=["Lịch Sử Đảng", "Nguyên lý hệ điều hành"],
    )
    difficulty: DifficultyLevel = Field(
        default=DifficultyLevel.MEDIUM,
        description="easy | medium | hard | very_hard",
    )
    question_type: QuestionType = Field(
        default=QuestionType.MULTIPLE_CHOICE,
        description="Type of question.",
    )
    quantity: int = Field(
        ...,
        ge=1,
        description="Number of questions to generate (1 to MAX_QUESTIONS_PER_TASK).",
        examples=[10, 20, 30, 50],
    )
    context: str = Field(
        ...,
        min_length=50,
        description="Text content to generate questions from (at least 50 chars).",
    )

    # -----------------------------------------------------------------------
    # Validators
    # -----------------------------------------------------------------------

    @field_validator("topic", mode="before")
    @classmethod
    def validate_topic(cls, v: str | None) -> str:
        """Convert empty or Swagger-placeholder topic values to unknown."""
        if v is None:
            return _UNKNOWN_TOPIC
        stripped = str(v).strip()
        if not stripped:
            return _UNKNOWN_TOPIC
        if stripped.lower() in _DUMMY_TOPIC_VALUES:
            return _UNKNOWN_TOPIC
            raise ValueError(
                f"topic value '{stripped}' looks like a Swagger placeholder. "
                "Please provide a real topic (e.g., 'Lịch Sử Đảng')."
            )
        return stripped

    @field_validator("course_name", "subject_name", mode="before")
    @classmethod
    def sanitize_text_fields(cls, v: str | None) -> str | None:
        """Convert Swagger placeholder text ('string', 'null', etc.) to None."""
        if v is None:
            return None
        stripped = str(v).strip()
        if not stripped or stripped.lower() in _DUMMY_TEXT_VALUES:
            return None
        return stripped

    @field_validator("quantity", mode="before")
    @classmethod
    def validate_quantity(cls, v: int) -> int:
        """Reject quantity outside [1, max_questions_per_task]."""
        settings = get_settings()
        max_qty = settings.max_questions_per_task
        try:
            quantity = int(v)
        except (TypeError, ValueError):
            raise ValueError(f"quantity must be between 1 and {max_qty}.")
        if quantity < 1 or quantity > max_qty:
            raise ValueError(f"quantity must be between 1 and {max_qty}.")
        return quantity

    @field_validator("context", mode="before")
    @classmethod
    def context_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 50:
            raise ValueError("Context must be at least 50 characters long.")
        return stripped


class GenerateQuestionsResponse(BaseModel):
    """Response after creating a generation task."""

    request_id: uuid.UUID
    task_id: uuid.UUID
    status: str
    message: str


class RequestStatusResponse(BaseModel):
    """GET /api/v1/ai/requests/{request_id}"""

    request_id: uuid.UUID
    status: str
    progress: int
    error_message: str | None = None


class RetryTaskResponse(BaseModel):
    """POST /api/v1/ai/tasks/{task_id}/retry"""

    task_id: uuid.UUID
    request_id: uuid.UUID
    status: str
    message: str
