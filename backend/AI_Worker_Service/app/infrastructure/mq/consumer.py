"""
RabbitMQ consumer for processing AI generation tasks.
- Consumes from ai_generation_queue
- Retries up to RABBITMQ_MAX_RETRIES times
- Sends to DLQ after max retries
- ACKs on success, NACKs (requeue=False → DLQ) on permanent failure
"""

import asyncio
import json
import uuid
from typing import Any, Dict

from aio_pika.abc import AbstractIncomingMessage

from app.application.use_cases.process_ai_task import ProcessAITaskUseCase
from app.core.config import get_settings
from app.core.logging import get_logger, set_request_id, set_task_id, set_trace_id
from app.infrastructure.db.session import get_db_session
from app.infrastructure.mq.rabbitmq import get_rabbitmq_connection, setup_queues

logger = get_logger(__name__)


async def _process_message(message_body: Dict[str, Any]) -> None:
    """Run the AI task pipeline for one message."""
    request_id = uuid.UUID(message_body["request_id"])
    task_id = uuid.UUID(message_body["task_id"])
    trace_id = message_body.get("trace_id", "")

    set_request_id(str(request_id))
    set_task_id(str(task_id))
    set_trace_id(trace_id)

    logger.info(
        "Processing message | request=%s task=%s trace=%s",
        request_id,
        task_id,
        trace_id,
    )

    async with get_db_session() as db:
        use_case = ProcessAITaskUseCase(db)
        await use_case.execute(
            request_id,
            task_id,
            trace_id,
            message_payload=message_body,
        )


async def _on_message(message: AbstractIncomingMessage) -> None:
    """
    Message handler with retry logic.
    - x-death header tracks delivery count for DLQ routing
    """
    settings = get_settings()
    max_retries = settings.rabbitmq_max_retries

    # Check retry count from x-death header
    x_death = message.headers.get("x-death", [])
    retry_count = 0
    if x_death:
        retry_count = (
            int(x_death[0].get("count", 0)) if isinstance(x_death, list) else 0
        )

    try:
        body = json.loads(message.body.decode())
        await _process_message(body)
        await message.ack()
        logger.info("Message ACKed | message_id=%s", message.message_id)

    except Exception as e:
        logger.error(
            "Message processing failed (attempt %d/%d): %s",
            retry_count + 1,
            max_retries,
            str(e),
        )

        if retry_count >= max_retries - 1:
            # Max retries reached → send to DLQ (nack without requeue)
            logger.error(
                "Max retries reached. Sending to DLQ | message_id=%s",
                message.message_id,
            )
            await message.nack(requeue=False)
        else:
            # Temporary failure → requeue for retry
            wait = 2 ** (retry_count + 1)
            logger.info(
                "Requeueing after %ds | message_id=%s", wait, message.message_id
            )
            await asyncio.sleep(wait)
            await message.nack(requeue=True)


async def start_consumer() -> None:
    """Start the RabbitMQ consumer loop."""
    settings = get_settings()
    logger.info("Starting RabbitMQ consumer | queue=%s", settings.rabbitmq_queue)

    connection = await get_rabbitmq_connection()
    channel = await connection.channel()
    await channel.set_qos(prefetch_count=1)

    main_queue, _ = await setup_queues(channel)

    await main_queue.consume(_on_message)

    logger.info("Consumer ready. Waiting for messages...")
    # Keep running until cancelled
    try:
        await asyncio.Future()
    except asyncio.CancelledError:
        logger.info("Consumer cancelled, shutting down.")
