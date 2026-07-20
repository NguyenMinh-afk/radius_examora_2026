"""
Use Case: Approve / Reject / Edit / Regenerate generated questions.

Business rules:
- approve: pending_review → approved + insert to question_bank (idempotent: returns existing if already approved)
- reject:  pending_review → rejected (cannot reject an approved question)
- edit:    only allowed when status = pending_review
- regenerate: call Gemini to produce a replacement question (new record, pending_review)
"""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.application.services.prompt_builder import PromptBuilder
from app.application.services.question_validator import QuestionValidator
from app.core.config import get_settings
from app.core.exceptions import (
    InvalidStateTransitionError,
    NotFoundError,
    ValidationError,
)
from app.core.logging import get_logger
from app.domain.enums import LogStatus, QuestionStatus
from app.infrastructure.db.repositories import (
    GeneratedQuestionRepository,
    GenerationLogRepository,
    GenerationRequestRepository,
    GenerationTaskRepository,
    QuestionBankRepository,
)
from app.infrastructure.llm.gemini_client import GeminiClient

logger = get_logger(__name__)


class ReviewGeneratedQuestionUseCase:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.q_repo = GeneratedQuestionRepository(db)
        self.task_repo = GenerationTaskRepository(db)
        self.req_repo = GenerationRequestRepository(db)
        self.qbank_repo = QuestionBankRepository(db)
        self.log_repo = GenerationLogRepository(db)
        self.settings = get_settings()

    # ---------------------------------------------------------------
    # APPROVE (idempotent)
    # ---------------------------------------------------------------

    async def approve(self, question_id: uuid.UUID) -> dict:
        """
        Approve a pending_review question:
        1. Validate current status
        2. Check if already approved → return existing question_bank_id (idempotent)
        3. Update to approved
        4. Copy to question_db.questions with is_ai_generated=True

        Raises:
            NotFoundError: question_id does not exist
            InvalidStateTransitionError: question is rejected (cannot approve)
        """
        q = await self.q_repo.get_by_id(question_id)
        if not q:
            raise NotFoundError("GeneratedQuestion", str(question_id))

        # Idempotent: already approved → return existing bank entry
        if q.status == QuestionStatus.APPROVED.value:
            existing = await self.qbank_repo.get_by_source_generated_id(question_id)
            return {
                "question_id": question_id,
                "status": QuestionStatus.APPROVED.value,
                "message": "Question already approved.",
                "question_bank_id": existing.id if existing else None,
            }

        if q.status == QuestionStatus.REJECTED.value:
            raise InvalidStateTransitionError(
                f"Cannot approve a rejected question ({question_id}). "
                "Please regenerate it first."
            )

        # Fetch parent task + request for metadata
        task = await self.task_repo.get_by_id(q.task_id)
        if not task:
            raise NotFoundError("Task", str(q.task_id))
        request = await self.req_repo.get_by_id(task.request_id)
        if not request:
            raise NotFoundError("Request", str(task.request_id))

        # Update status → approved
        await self.q_repo.update_status(question_id, QuestionStatus.APPROVED.value)

        # Copy to question bank (unique constraint on source_generated_question_id prevents duplicates)
        bank_question = await self.qbank_repo.create_from_generated(
            generated=q,
            task=task,
            request=request,
            ai_model=self.settings.gemini_model,
        )

        await self.db.commit()
        logger.info(
            "Question approved | q_id=%s | bank_id=%s", question_id, bank_question.id
        )

        return {
            "question_id": question_id,
            "status": QuestionStatus.APPROVED.value,
            "message": "Question approved and added to question bank.",
            "question_bank_id": bank_question.id,
        }

    # ---------------------------------------------------------------
    # REJECT
    # ---------------------------------------------------------------

    async def reject(self, question_id: uuid.UUID, reason: str = "") -> dict:
        """
        Mark a question as rejected.

        Raises:
            NotFoundError: question does not exist
            InvalidStateTransitionError: question already rejected or approved
        """
        q = await self.q_repo.get_by_id(question_id)
        if not q:
            raise NotFoundError("GeneratedQuestion", str(question_id))

        if q.status == QuestionStatus.REJECTED.value:
            raise InvalidStateTransitionError(
                f"Question {question_id} is already rejected."
            )
        if q.status == QuestionStatus.APPROVED.value:
            raise InvalidStateTransitionError(
                f"Cannot reject an already approved question ({question_id}). "
                "It has been added to the question bank."
            )

        await self.q_repo.update_status(question_id, QuestionStatus.REJECTED.value)
        await self.db.commit()

        logger.info(
            "Question rejected | q_id=%s | reason=%s", question_id, reason or "(none)"
        )
        return {
            "question_id": question_id,
            "status": QuestionStatus.REJECTED.value,
            "message": "Question rejected.",
        }

    # ---------------------------------------------------------------
    # EDIT (update content before approve)
    # ---------------------------------------------------------------

    async def update(self, question_id: uuid.UUID, update_data: dict) -> dict:
        """
        Edit a question that is still pending_review.

        Raises:
            NotFoundError: question does not exist
            InvalidStateTransitionError: question already approved or rejected
            ValidationError: invalid field values
        """
        q = await self.q_repo.get_by_id(question_id)
        if not q:
            raise NotFoundError("GeneratedQuestion", str(question_id))

        if q.status != QuestionStatus.PENDING_REVIEW.value:
            raise InvalidStateTransitionError(
                f"Cannot edit question with status '{q.status}'. "
                "Only pending_review questions can be edited."
            )

        # Build update dict with only provided fields
        fields_to_update: dict = {}
        field_map = {
            "question_content": "question_content",
            "option_a": "option_a",
            "option_b": "option_b",
            "option_c": "option_c",
            "option_d": "option_d",
            "correct_answer": "correct_answer",
            "difficulty": "difficulty",
            "topic": "topic",
            "explanation": "explanation",
        }
        for schema_field, model_field in field_map.items():
            val = update_data.get(schema_field)
            if val is not None:
                if isinstance(val, str):
                    val = val.strip()
                    if not val:
                        raise ValidationError(
                            f"Field '{schema_field}' cannot be empty."
                        )
                fields_to_update[model_field] = val

        if not fields_to_update:
            raise ValidationError("No fields provided to update.")

        await self.q_repo.update_content(question_id, fields_to_update)
        await self.db.commit()

        logger.info(
            "Question updated | q_id=%s | fields=%s",
            question_id,
            list(fields_to_update.keys()),
        )
        return {
            "question_id": question_id,
            "status": q.status,
            "message": "Question updated successfully.",
        }

    # ---------------------------------------------------------------
    # REGENERATE
    # ---------------------------------------------------------------

    async def regenerate(self, question_id: uuid.UUID, reason: str) -> dict:
        """
        Regenerate a replacement question via Gemini.
        1. Fetch original question + task + request
        2. Build regeneration prompt
        3. Call Gemini for 1 question
        4. Validate and save as new pending_review question
        """
        old_q = await self.q_repo.get_by_id(question_id)
        if not old_q:
            raise NotFoundError("GeneratedQuestion", str(question_id))

        task = await self.task_repo.get_by_id(old_q.task_id)
        if not task:
            raise NotFoundError("Task", str(old_q.task_id))

        request = await self.req_repo.get_by_id(task.request_id)
        if not request:
            raise NotFoundError("Request", str(task.request_id))

        # Build prompt
        prompt_builder = PromptBuilder()
        context = request.context or ""
        prompt = prompt_builder.build_regenerate_prompt(
            context=context,
            topic=task.topic,
            difficulty=task.difficulty,
            old_question_content=old_q.question_content,
            reason=reason,
        )

        # Call Gemini
        gemini = GeminiClient()
        raw = await gemini.generate_questions(prompt, request_id=str(request.id))

        # Validate
        validator = QuestionValidator()
        result = validator.validate_batch(raw)

        if not result.has_valid:
            raise Exception(
                f"Gemini returned no valid question for regeneration. "
                f"Errors: {result.error_reasons}"
            )

        new_q_data = result.valid_questions[0]
        opts = new_q_data.get("options", {})

        new_q_records = await self.q_repo.bulk_create(
            [
                {
                    "id": uuid.uuid4(),
                    "task_id": task.id,
                    "question_content": new_q_data["question_content"],
                    "option_a": opts.get("A", ""),
                    "option_b": opts.get("B", ""),
                    "option_c": opts.get("C", ""),
                    "option_d": opts.get("D", ""),
                    "correct_answer": new_q_data["correct_answer"],
                    "difficulty": new_q_data["difficulty"],
                    "topic": new_q_data.get("topic", task.topic),
                    "explanation": new_q_data.get("explanation", ""),
                    "status": QuestionStatus.PENDING_REVIEW.value,
                }
            ]
        )

        # Log it
        await self.log_repo.create(
            {
                "id": uuid.uuid4(),
                "request_id": request.id,
                "question_id": new_q_records[0].id,
                "ai_model": self.settings.gemini_model,
                "prompt": prompt[:5000],
                "response": str(raw)[:5000],
                "status": LogStatus.SUCCESS.value,
            }
        )

        await self.db.commit()

        logger.info(
            "Regenerated question | old_q=%s | new_q=%s",
            question_id,
            new_q_records[0].id,
        )

        return {
            "new_question_id": new_q_records[0].id,
            "task_id": task.id,
            "status": QuestionStatus.PENDING_REVIEW.value,
            "message": "New question generated and pending review.",
        }
