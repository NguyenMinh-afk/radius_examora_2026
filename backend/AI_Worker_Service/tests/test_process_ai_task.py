"""Focused idempotency tests for ProcessAITaskUseCase."""

import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock

from app.application.use_cases.process_ai_task import ProcessAITaskUseCase


class ProcessAITaskIdempotencyTests(unittest.IsolatedAsyncioTestCase):
    async def test_completed_task_is_not_processed_again(self) -> None:
        request_id = uuid.UUID("11111111-1111-4111-8111-111111111111")
        task_id = uuid.UUID("22222222-2222-4222-8222-222222222222")
        request = SimpleNamespace(id=request_id)
        task = SimpleNamespace(
            id=task_id,
            request_id=request_id,
            status="completed",
        )

        use_case = ProcessAITaskUseCase.__new__(ProcessAITaskUseCase)
        use_case.settings = SimpleNamespace(gemini_model_candidates=["test-model"])
        use_case.req_repo = SimpleNamespace(
            get_by_id=AsyncMock(return_value=request),
            update_status=AsyncMock(),
        )
        use_case.task_repo = SimpleNamespace(
            get_by_id=AsyncMock(return_value=task),
            update_status=AsyncMock(),
        )
        use_case.db = SimpleNamespace(
            commit=AsyncMock(),
            rollback=AsyncMock(),
        )

        await use_case.execute(
            request_id=request_id,
            task_id=task_id,
            trace_id="duplicate-delivery",
            defer_failure_status=True,
        )

        use_case.req_repo.update_status.assert_not_awaited()
        use_case.task_repo.update_status.assert_not_awaited()
        use_case.db.commit.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()
