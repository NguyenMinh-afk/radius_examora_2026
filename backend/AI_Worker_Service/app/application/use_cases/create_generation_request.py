"""
Use Case: Create a new generation request + task and publish to queue.
"""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.application.services.course_subject_resolver import CourseSubjectResolver
from app.core.config import get_settings
from app.core.exceptions import InsufficientContextError, ValidationError
from app.core.logging import get_logger, get_trace_id, set_request_id, set_task_id
from app.domain.enums import InputType, RequestStatus, TaskStatus
from app.infrastructure.db.repositories import (
    CourseRepository,
    GenerationRequestRepository,
    GenerationTaskRepository,
    SubjectRepository,
)

logger = get_logger(__name__)


class CreateGenerationRequestUseCase:
    """
    Orchestrates creating a generation request + task record,
    then dispatches the task to RabbitMQ (or background fallback).
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.req_repo = GenerationRequestRepository(db)
        self.task_repo = GenerationTaskRepository(db)
        self.course_repo = CourseRepository(db)
        self.subject_repo = SubjectRepository(db)
        self.resolver = CourseSubjectResolver(self.course_repo, self.subject_repo)
        self.settings = get_settings()

    async def execute(
        self,
        user_id: uuid.UUID,
        course_id: int | None,
        subject_id: int | None,
        topic: str,
        difficulty: str,
        question_type: str,
        quantity: int,
        context: str | None,
        course_name: str | None = None,
        subject_name: str | None = None,
        chapter_id: int | None = None,
        knowledge_unit_id: int | None = None,
        input_type: InputType = InputType.TEXT,
        input_reference: str | None = None,
    ) -> dict:
        """
        Create DB records and publish to queue.

        Returns:
            dict with request_id, task_id, status, message
        """
        trace_id = get_trace_id()

        context_value = context.strip() if context else None
        is_text_request = input_type == InputType.TEXT
        has_document_reference = bool(input_reference)
        if is_text_request and (not context_value or len(context_value) < 50):
            raise InsufficientContextError()
        if not is_text_request and not context_value and not has_document_reference:
            raise InsufficientContextError()

        # Quantity limits (do not split into multiple Gemini calls)
        max_allowed = self.settings.max_questions_per_task
        if quantity < 1 or quantity > max_allowed:
            raise ValidationError(f"quantity must be between 1 and {max_allowed}")

        # Resolve course_id and subject_id if missing
        resolved = await self.resolver.resolve(
            topic=topic,
            course_id=course_id,
            subject_id=subject_id,
            course_name=course_name,
            subject_name=subject_name,
        )

        # 1. Create generation request
        request_data = {
            "id": uuid.uuid4(),
            "user_id": user_id,
            "course_id": resolved.course_id,
            "chapter_id": chapter_id,
            "knowledge_unit_id": knowledge_unit_id,
            "difficulty": difficulty,
            "question_type": question_type,
            "quantity": quantity,
            "context": context_value,
            "status": RequestStatus.PENDING.value,
            "progress": 0,
            "trace_id": trace_id,
        }
        request_obj = await self.req_repo.create(request_data)
        set_request_id(str(request_obj.id))
        logger.info("Created generation request id=%s", request_obj.id)

        # 2. Create generation task
        task_data = {
            "id": uuid.uuid4(),
            "request_id": request_obj.id,
            "subject_id": resolved.subject_id,
            "topic": topic,
            "input_type": input_type.value,
            "input_reference": input_reference,
            "number_of_questions": quantity,
            "difficulty": difficulty,
            "status": TaskStatus.PENDING.value,
            "created_by": user_id,
        }
        task_obj = await self.task_repo.create(task_data)
        set_task_id(str(task_obj.id))
        logger.info("Created generation task id=%s", task_obj.id)

        # 3. Commit both records
        await self.db.commit()

        # 4. Publish to queue (or return for background processing)
        message = {
            "request_id": str(request_obj.id),
            "task_id": str(task_obj.id),
            "trace_id": trace_id,
        }

        return {
            "request_id": request_obj.id,
            "task_id": task_obj.id,
            "status": RequestStatus.PENDING.value,
            "message": "Generation task created successfully",
            "mq_message": message,  # caller decides how to dispatch
        }
