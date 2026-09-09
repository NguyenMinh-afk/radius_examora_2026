"""
Pydantic v2 schemas for question review, question bank, and results endpoints.
"""

import uuid
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.domain.enums import DifficultyLevel

# ---------------------------------------------------------------------------
# Shared sub-schemas
# ---------------------------------------------------------------------------


class QuestionOptions(BaseModel):
    A: str = Field(..., min_length=1)
    B: str = Field(..., min_length=1)
    C: str = Field(..., min_length=1)
    D: str = Field(..., min_length=1)


class QuestionResultItem(BaseModel):
    id: uuid.UUID
    question_number: int
    question_label: str
    question_content: str
    options: QuestionOptions
    correct_answer: str
    difficulty: str
    topic: str
    explanation: str
    status: str
    generation_source: str | None = "gemini"

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Task Results
# ---------------------------------------------------------------------------


class TaskResultsResponse(BaseModel):
    """
    GET /api/v1/ai/tasks/{task_id}/results

    status values:
    - pending: waiting for a worker
    - processing: worker is generating questions
    - completed: generation succeeded (inspect generation_source for provenance)
    - failed: unrecoverable error
    """

    task_id: uuid.UUID
    status: str
    warning: str | None = None
    error_message: str | None = Field(
        default=None,
        description="Error message when task status is failed; null for completed/pending tasks.",
    )
    questions: list[QuestionResultItem]

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "task_id": "11111111-1111-4111-8111-111111111111",
                    "status": "completed",
                    "warning": None,
                    "error_message": None,
                    "questions": [
                        {
                            "id": "22222222-2222-4222-8222-222222222222",
                            "question_content": "Äáº¡i há»™i VI xÃ¡c Ä‘á»‹nh Ä‘á»•i má»›i kinh táº¿ theo hÆ°á»›ng nÃ o?",
                            "options": {
                                "A": "PhÃ¡t triá»ƒn ná»n kinh táº¿ hÃ ng hÃ³a nhiá»u thÃ nh pháº§n.",
                                "B": "XÃ³a bá» ngay má»i thÃ nh pháº§n kinh táº¿ ngoÃ i quá»‘c doanh.",
                                "C": "Chá»‰ táº­p trung phÃ¡t triá»ƒn cÃ´ng nghiá»‡p náº·ng.",
                                "D": "Táº¡m dá»«ng cáº£i cÃ¡ch cÆ¡ cháº¿ quáº£n lÃ½ kinh táº¿.",
                            },
                            "correct_answer": "A",
                            "difficulty": "medium",
                            "topic": "Lá»‹ch sá»­ Äáº£ng",
                            "explanation": "ÄÃ¡p Ã¡n A phÃ¹ há»£p vá»›i ná»™i dung Ä‘á»•i má»›i kinh táº¿ Ä‘Æ°á»£c nÃªu.",
                            "status": "pending_review",
                            "generation_source": "gemini",
                        }
                    ],
                },
                {
                    "task_id": "33333333-3333-4333-8333-333333333333",
                    "status": "failed",
                    "warning": None,
                    "error_message": "PDF scan/image-only, OCR is required but not enabled.",
                    "questions": [],
                },
            ]
        }
    }


# ---------------------------------------------------------------------------
# Approve
# ---------------------------------------------------------------------------


class ApproveQuestionResponse(BaseModel):
    """
    POST /api/v1/ai/questions/{question_id}/approve

    Approves a pending_review question and moves it to the official question bank.
    - status: "approved"
    - question_bank_id: UUID of the entry in question_db.questions
    - If already approved, returns existing question_bank_id with message "Question already approved."
    """

    question_id: uuid.UUID
    status: str
    message: str
    question_bank_id: uuid.UUID | None = None


# ---------------------------------------------------------------------------
# Reject
# ---------------------------------------------------------------------------


class RejectQuestionRequest(BaseModel):
    """POST /api/v1/ai/questions/{question_id}/reject"""

    reason: str = Field(
        default="",
        max_length=1000,
        description="Optional reason for rejection.",
    )


class RejectQuestionResponse(BaseModel):
    """
    POST /api/v1/ai/questions/{question_id}/reject

    Marks a pending_review question as rejected.
    - Cannot reject an already-approved question.
    - status: "rejected"
    """

    question_id: uuid.UUID
    status: str
    message: str


# ---------------------------------------------------------------------------
# Edit question before approve
# ---------------------------------------------------------------------------


class UpdateQuestionRequest(BaseModel):
    """PUT /api/v1/ai/questions/{question_id} â€” Edit a pending_review question."""

    question_content: str | None = Field(
        default=None,
        min_length=1,
        description="Updated question text.",
    )
    option_a: str | None = Field(default=None, min_length=1)
    option_b: str | None = Field(default=None, min_length=1)
    option_c: str | None = Field(default=None, min_length=1)
    option_d: str | None = Field(default=None, min_length=1)
    correct_answer: str | None = Field(
        default=None,
        description="Must be A, B, C, or D.",
    )
    difficulty: DifficultyLevel | None = None
    topic: str | None = Field(default=None, min_length=1, max_length=500)
    explanation: str | None = Field(default=None, min_length=1)

    @field_validator("correct_answer")
    @classmethod
    def valid_answer(cls, v: str | None) -> str | None:
        if v is not None and v.upper() not in {"A", "B", "C", "D"}:
            raise ValueError("correct_answer must be one of: A, B, C, D")
        return v.upper() if v else v


class UpdateQuestionResponse(BaseModel):
    """Response after editing a pending_review question."""

    question_id: uuid.UUID
    status: str
    message: str


# ---------------------------------------------------------------------------
# Regenerate
# ---------------------------------------------------------------------------


class RegenerateQuestionRequest(BaseModel):
    """POST /api/v1/ai/questions/regenerate"""

    question_id: uuid.UUID
    reason: str = Field(..., min_length=1, max_length=1000)


class RegenerateQuestionResponse(BaseModel):
    new_question_id: uuid.UUID
    task_id: uuid.UUID
    status: str
    message: str


# ---------------------------------------------------------------------------
# List pending review
# ---------------------------------------------------------------------------


class PendingReviewItem(BaseModel):
    """A single generated question awaiting review."""

    id: uuid.UUID
    task_id: uuid.UUID
    question_content: str
    options: QuestionOptions
    correct_answer: str
    difficulty: str
    topic: str
    explanation: str
    status: str

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_question(cls, q: Any) -> "PendingReviewItem":
        return cls(
            id=q.id,
            task_id=q.task_id,
            question_content=q.question_content,
            options=QuestionOptions(
                A=q.option_a, B=q.option_b, C=q.option_c, D=q.option_d
            ),
            correct_answer=q.correct_answer,
            difficulty=q.difficulty,
            topic=q.topic,
            explanation=q.explanation,
            status=q.status,
        )


class PendingReviewListResponse(BaseModel):
    """GET /api/v1/ai/questions/pending-review"""

    items: list[PendingReviewItem]
    total: int
    page: int
    page_size: int


# ---------------------------------------------------------------------------
# Question bank
# ---------------------------------------------------------------------------


class QuestionBankItem(BaseModel):
    """A single approved question in the question bank."""

    id: uuid.UUID
    source_generated_question_id: uuid.UUID | None = None
    course_id: int
    subject_id: int | None = None
    chapter_id: int | None = None
    knowledge_unit_id: int | None = None
    question_type: str
    difficulty: str
    content: str
    options: dict[str, str] | None = None
    correct_answer: str
    explanation: str | None = None
    is_ai_generated: bool
    ai_model: str | None = None

    model_config = {"from_attributes": True}


class QuestionBankListResponse(BaseModel):
    """GET /api/v1/question-bank"""

    items: list[QuestionBankItem]
    total: int
    page: int
    page_size: int
