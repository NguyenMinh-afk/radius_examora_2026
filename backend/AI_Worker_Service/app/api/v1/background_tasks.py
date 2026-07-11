"""
Shared background task helpers used by multiple route modules.
Kept separate to avoid circular imports between route files.
"""
import uuid
from typing import Any

from fastapi import BackgroundTasks

from app.core.logging import get_logger
from app.infrastructure.mq.rabbitmq import publish_task_message

logger = get_logger(__name__)


async def dispatch_generation_task(
    *,
    use_rabbitmq: bool,
    background_tasks: BackgroundTasks,
    request_id: uuid.UUID,
    task_id: uuid.UUID,
    trace_id: str,
    extra_payload: dict[str, Any] | None = None,
) -> None:
    """Dispatch a generation task through RabbitMQ or FastAPI BackgroundTasks."""
    if use_rabbitmq:
        await publish_task_message(
            request_id=str(request_id),
            task_id=str(task_id),
            trace_id=trace_id,
            extra_payload=extra_payload,
        )
        return

    background_tasks.add_task(
        process_task_in_background,
        request_id=request_id,
        task_id=task_id,
        trace_id=trace_id,
        message_payload=extra_payload,
    )


async def process_task_in_background(
    request_id: uuid.UUID,
    task_id: uuid.UUID,
    trace_id: str,
    message_payload: dict[str, Any] | None = None,
) -> None:
    """
    Run the AI processing use case with a fresh DB session.
    Used by FastAPI BackgroundTasks when USE_RABBITMQ=false.
    """
    from app.application.use_cases.process_ai_task import ProcessAITaskUseCase
    from app.infrastructure.db.session import get_db_session

    logger.info(
        "BackgroundTask started | request=%s task=%s trace=%s",
        request_id, task_id, trace_id,
    )
    try:
        async with get_db_session() as session:
            use_case = ProcessAITaskUseCase(session)
            await use_case.execute(
                request_id,
                task_id,
                trace_id,
                message_payload=message_payload,
            )
    except Exception as e:
        logger.error(
            "BackgroundTask failed | request=%s task=%s error=%s",
            request_id, task_id, str(e),
        )
