"""
API routes for reviewing AI-generated questions and browsing the question bank.

Endpoints:
  POST   /ai/questions/{question_id}/approve        — Approve → moves to question bank
  POST   /ai/questions/{question_id}/reject         — Reject question
  PUT    /ai/questions/{question_id}                — Edit pending_review question
  POST   /ai/questions/regenerate                   — Regenerate via Gemini
  GET    /ai/questions/pending-review               — List questions awaiting review
  GET    /question-bank                             — List approved questions in question bank
"""

import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.review_generated_question import (
    ReviewGeneratedQuestionUseCase,
)
from app.infrastructure.db.repositories import QuestionBankRepository
from app.infrastructure.db.repositories import GeneratedQuestionRepository
from app.infrastructure.db.session import get_db
from app.schemas.question import (
    ApproveQuestionResponse,
    PendingReviewItem,
    PendingReviewListResponse,
    QuestionBankItem,
    QuestionBankListResponse,
    RegenerateQuestionRequest,
    RegenerateQuestionResponse,
    RejectQuestionRequest,
    RejectQuestionResponse,
    UpdateQuestionRequest,
    UpdateQuestionResponse,
)

# Two routers — review actions under /ai/questions, question bank under /question-bank
review_router = APIRouter(prefix="/ai/questions", tags=["Review"])
bank_router = APIRouter(prefix="/question-bank", tags=["Question Bank"])


# ---------------------------------------------------------------------------
# APPROVE
# ---------------------------------------------------------------------------


@review_router.post(
    "/{question_id}/approve",
    response_model=ApproveQuestionResponse,
    summary="Approve a generated question and add to question bank",
    responses={
        200: {"description": "Question approved successfully."},
        404: {"description": "Question not found."},
        409: {"description": "Question is already rejected (cannot approve)."},
    },
)
async def approve_question(
    question_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Approve an AI-generated question.

    - Moves the question from **pending_review** → **approved**.
    - Copies it into the official question bank (`question_db.questions`).
    - **Idempotent**: calling again on an already-approved question returns
      the existing `question_bank_id` without creating a duplicate.
    - Returns **409** if the question was previously **rejected**.
    """
    use_case = ReviewGeneratedQuestionUseCase(db)
    return await use_case.approve(question_id)


# ---------------------------------------------------------------------------
# REJECT
# ---------------------------------------------------------------------------


@review_router.post(
    "/{question_id}/reject",
    response_model=RejectQuestionResponse,
    summary="Reject a generated question",
    responses={
        200: {"description": "Question rejected."},
        404: {"description": "Question not found."},
        409: {"description": "Question already rejected or already approved."},
    },
)
async def reject_question(
    question_id: uuid.UUID,
    req: RejectQuestionRequest = RejectQuestionRequest(),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Reject an AI-generated question.

    - Moves the question from **pending_review** → **rejected**.
    - The question is **not** inserted into the question bank.
    - Returns **409** if the question is already **approved** or **rejected**.
    - `reason` is optional.
    """
    use_case = ReviewGeneratedQuestionUseCase(db)
    return await use_case.reject(question_id, req.reason)


# ---------------------------------------------------------------------------
# EDIT
# ---------------------------------------------------------------------------


@review_router.put(
    "/{question_id}",
    response_model=UpdateQuestionResponse,
    summary="Edit a pending_review question before approving",
    responses={
        200: {"description": "Question updated."},
        404: {"description": "Question not found."},
        409: {"description": "Question is not in pending_review status."},
        422: {"description": "Invalid field values."},
    },
)
async def update_question(
    question_id: uuid.UUID,
    req: UpdateQuestionRequest,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Edit the content of an AI-generated question before approving it.

    - Only allowed when the question status is **pending_review**.
    - All fields are optional — only provided fields are updated.
    - `correct_answer` must be one of **A, B, C, D**.
    - No field can be set to an empty string.
    """
    use_case = ReviewGeneratedQuestionUseCase(db)
    return await use_case.update(
        question_id,
        req.model_dump(exclude_none=True),
    )


# ---------------------------------------------------------------------------
# REGENERATE
# ---------------------------------------------------------------------------


@review_router.post(
    "/regenerate",
    response_model=RegenerateQuestionResponse,
    summary="Regenerate a question via Gemini",
    responses={
        200: {"description": "New question generated, status=pending_review."},
        404: {"description": "Original question not found."},
    },
)
async def regenerate_question(
    req: RegenerateQuestionRequest,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Ask Gemini to generate a brand-new replacement question.

    - Creates a **new** `generated_questions` record with status `pending_review`.
    - The original question is **not** modified (you can reject it separately).
    - `reason` explains what was wrong with the original question.
    """
    use_case = ReviewGeneratedQuestionUseCase(db)
    return await use_case.regenerate(req.question_id, req.reason)


# ---------------------------------------------------------------------------
# LIST PENDING REVIEW
# ---------------------------------------------------------------------------


@review_router.get(
    "/pending-review",
    response_model=PendingReviewListResponse,
    summary="List questions awaiting review",
)
async def list_pending_review(
    task_id: Optional[uuid.UUID] = Query(default=None, description="Filter by task ID"),
    difficulty: Optional[str] = Query(
        default=None, description="Filter by difficulty: easy|medium|hard|very_hard"
    ),
    topic: Optional[str] = Query(default=None, description="Partial match on topic"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    List all AI-generated questions currently in **pending_review** status.

    Supports filtering by `task_id`, `difficulty`, and `topic` (partial match).
    Results are paginated.
    """
    repo = GeneratedQuestionRepository(db)
    items, total = await repo.list_pending_review(
        task_id=task_id,
        difficulty=difficulty,
        topic=topic,
        page=page,
        page_size=page_size,
    )
    return PendingReviewListResponse(
        items=[PendingReviewItem.from_orm_question(q) for q in items],
        total=total,
        page=page,
        page_size=page_size,
    )


# ---------------------------------------------------------------------------
# QUESTION BANK
# ---------------------------------------------------------------------------


@bank_router.get(
    "",
    response_model=QuestionBankListResponse,
    summary="List approved questions in the question bank",
)
async def list_question_bank(
    course_id: Optional[int] = Query(default=None, description="Filter by course ID"),
    subject_id: Optional[int] = Query(default=None, description="Filter by subject ID"),
    chapter_id: Optional[int] = Query(default=None, description="Filter by chapter ID"),
    knowledge_unit_id: Optional[int] = Query(
        default=None, description="Filter by knowledge unit ID"
    ),
    difficulty: Optional[str] = Query(
        default=None, description="Filter by difficulty: easy|medium|hard|very_hard"
    ),
    topic: Optional[str] = Query(
        default=None, description="Partial match search on question content"
    ),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Browse the official question bank — all approved questions.

    Supports filtering by course, subject, chapter, knowledge unit, difficulty, and topic.
    Results are paginated.

    **Note:** `chapter_id` and `knowledge_unit_id` are `null` when the original
    request did not specify them (or passed `0`). Filter by `null` is not supported;
    omit the filter to see all records.
    """
    repo = QuestionBankRepository(db)
    items, total = await repo.list_questions(
        course_id=course_id,
        subject_id=subject_id,
        chapter_id=chapter_id,
        knowledge_unit_id=knowledge_unit_id,
        difficulty=difficulty,
        topic=topic,
        page=page,
        page_size=page_size,
    )
    return QuestionBankListResponse(
        items=[
            QuestionBankItem(
                id=q.id,
                source_generated_question_id=q.source_generated_question_id,
                course_id=q.course_id,
                subject_id=q.subject_id,
                chapter_id=q.chapter_id,
                knowledge_unit_id=q.knowledge_unit_id,
                question_type=q.question_type,
                difficulty=q.difficulty,
                content=q.content,
                options=q.options,
                correct_answer=q.correct_answer,
                explanation=q.explanation,
                is_ai_generated=q.is_ai_generated,
                ai_model=q.ai_model,
            )
            for q in items
        ],
        total=total,
        page=page,
        page_size=page_size,
    )
