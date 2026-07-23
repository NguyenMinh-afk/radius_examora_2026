"""Use Case: Retry a failed generation task."""

import uuid
from typing import Any, Dict

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DatabaseError, NotFoundError
from app.domain.enums import RequestStatus, TaskStatus
from app.infrastructure.db.models import AIGenerationRequest, AIGenerationTask
from app.infrastructure.db.repositories import (
    GenerationRequestRepository,
    GenerationTaskRepository,
)


class RetryGenerationTaskUseCase:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.task_repo = GenerationTaskRepository(db)
        self.req_repo = GenerationRequestRepository(db)

    async def execute(self, task_id: uuid.UUID) -> Dict[str, Any]:
        """
        Retry a failed task by resetting its status to pending.
        """
        task = await self.task_repo.get_by_id(task_id)
        if not task:
            raise NotFoundError("Task", str(task_id))

        if task.status != TaskStatus.FAILED.value:
            raise ValueError(
                f"Cannot retry task in status '{task.status}'. "
                f"Only '{TaskStatus.FAILED.value}' is allowed."
            )

        request_id = task.request_id

        # Reset task
        try:
            await self.db.execute(
                update(AIGenerationTask)
                .where(AIGenerationTask.id == task_id)
                .values(
                    status=TaskStatus.PENDING.value,
                    error_message=None,
                    completed_at=None,
                )
            )

            # Reset request
            await self.db.execute(
                update(AIGenerationRequest)
                .where(AIGenerationRequest.id == request_id)
                .values(
                    status=RequestStatus.PENDING.value,
                    progress=0,
                    error_message=None,
                    completed_at=None,
                )
            )

            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise DatabaseError(f"Failed to reset task status: {e}") from e

        # We don't have trace_id directly in task easily unless we fetch it from request or log.
        # But we can just generate a new one for the retry or use the request_id.
        # Let's generate a new trace_id.
        trace_id = f"retry-{uuid.uuid4().hex[:8]}"

        return {
            "request_id": request_id,
            "task_id": task_id,
            "trace_id": trace_id,
            "status": TaskStatus.PENDING.value,
            "message": "Task reset to pending and will be retried.",
        }
