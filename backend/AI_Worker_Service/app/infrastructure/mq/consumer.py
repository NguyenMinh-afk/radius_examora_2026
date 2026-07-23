"""
RabbitMQ consumer for AI generation tasks.

The consumer validates the message contract, delegates business processing to
ProcessAITaskUseCase, retries transient failures with bounded backoff, and
dead-letters permanent or exhausted messages.
"""

import asyncio
import json
import uuid
from typing import Any

from aio_pika import DeliveryMode, Message
from aio_pika.abc import AbstractIncomingMessage
from pydantic import BaseModel, ConfigDict, Field
from pydantic import ValidationError as PydanticValidationError

from app.application.use_cases.process_ai_task import ProcessAITaskUseCase
from app.core.config import get_settings
from app.core.exceptions import (
    DocumentError,
    FileTooLargeError,
    GeminiInvalidArgumentError,
    GeminiModelNotFoundError,
    GeminiPermissionError,
    InsufficientContextError,
    InvalidStateTransitionError,
    NotFoundError,
    TaskRequestMismatchError,
    UnsupportedFileTypeError,
    ValidationError,
)
from app.core.logging import get_logger, set_request_id, set_task_id, set_trace_id
from app.infrastructure.db.session import get_db_session
from app.infrastructure.mq.rabbitmq import (
    ensure_queues_setup,
    get_rabbitmq_channel,
    get_rabbitmq_connection,
    setup_queues,
)

logger = get_logger(__name__)


class InvalidMessageError(ValueError):
    """The RabbitMQ message does not match the agreed worker contract."""


class AITaskMessage(BaseModel):
    """Minimal RabbitMQ contract shared by the Node producer and Python worker."""

    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    request_id: uuid.UUID
    task_id: uuid.UUID
    trace_id: str = Field(min_length=1, max_length=100)


PERMANENT_PROCESSING_ERRORS = (
    DocumentError,
    FileTooLargeError,
    GeminiInvalidArgumentError,
    GeminiModelNotFoundError,
    GeminiPermissionError,
    InsufficientContextError,
    InvalidStateTransitionError,
    NotFoundError,
    TaskRequestMismatchError,
    UnsupportedFileTypeError,
    ValidationError,
)


def _parse_message(message: AbstractIncomingMessage) -> AITaskMessage:
    """Decode and validate one incoming RabbitMQ message."""
    try:
        raw_payload: Any = json.loads(message.body.decode("utf-8"))
        if not isinstance(raw_payload, dict):
            raise InvalidMessageError("Message body must be a JSON object.")
        return AITaskMessage.model_validate(raw_payload)
    except (UnicodeDecodeError, json.JSONDecodeError, PydanticValidationError) as exc:
        raise InvalidMessageError(f"Invalid AI task message: {exc}") from exc


def _retry_count(message: AbstractIncomingMessage) -> int:
    """Read the retry counter added when the worker republishes a message."""
    raw_value = (message.headers or {}).get("x-retry-count", 0)
    try:
        return max(0, int(raw_value))
    except (TypeError, ValueError):
        return 0


def _is_permanent_error(error: Exception) -> bool:
    return isinstance(error, (InvalidMessageError, *PERMANENT_PROCESSING_ERRORS))


def _should_mark_failed(error: Exception) -> bool:
    """Avoid changing unrelated/missing records for invalid message references."""
    return not isinstance(
        error,
        (InvalidMessageError, NotFoundError, TaskRequestMismatchError),
    )


async def _process_message(payload: AITaskMessage) -> None:
    """Run the AI task pipeline for one validated message."""
    request_id = payload.request_id
    task_id = payload.task_id
    trace_id = payload.trace_id

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
            message_payload=payload.model_dump(mode="json"),
            defer_failure_status=True,
        )


async def _mark_failed(payload: AITaskMessage, error: Exception) -> None:
    """Persist the terminal failed state after a permanent/exhausted error."""
    async with get_db_session() as db:
        use_case = ProcessAITaskUseCase(db)
        await use_case.mark_failed(
            request_id=payload.request_id,
            task_id=payload.task_id,
            error=error,
            trace_id=payload.trace_id,
        )


async def _republish_for_retry(
    message: AbstractIncomingMessage,
    retry_count: int,
) -> None:
    """Republish with an incremented retry header after exponential backoff."""
    settings = get_settings()
    delay_seconds = min(2 ** (retry_count + 1), 30)
    next_retry_count = retry_count + 1

    logger.warning(
        "Transient failure; retrying in %ds | attempt=%d/%d message_id=%s",
        delay_seconds,
        next_retry_count + 1,
        settings.rabbitmq_max_retries,
        message.message_id,
    )
    await asyncio.sleep(delay_seconds)

    channel = await get_rabbitmq_channel()
    await ensure_queues_setup(channel)
    exchange = await channel.get_exchange(settings.rabbitmq_exchange)

    headers = dict(message.headers or {})
    headers["x-retry-count"] = next_retry_count
    retry_message = Message(
        body=message.body,
        delivery_mode=DeliveryMode.PERSISTENT,
        content_type=message.content_type or "application/json",
        content_encoding=message.content_encoding or "utf-8",
        message_id=message.message_id or str(uuid.uuid4()),
        correlation_id=message.correlation_id,
        type=message.type,
        headers=headers,
    )
    await exchange.publish(
        retry_message,
        routing_key=settings.rabbitmq_routing_key,
    )
    await message.ack()


async def _dead_letter(
    message: AbstractIncomingMessage,
    payload: AITaskMessage | None,
    error: Exception,
) -> None:
    """Mark a valid task failed when appropriate, then route it to the DLQ."""
    if payload is not None and _should_mark_failed(error):
        try:
            await _mark_failed(payload, error)
        except Exception:
            logger.exception(
                "Could not persist terminal failed status | request=%s task=%s",
                payload.request_id,
                payload.task_id,
            )

    await message.reject(requeue=False)
    logger.error(
        "Message sent to DLQ | message_id=%s error=%s",
        message.message_id,
        str(error),
    )


async def _on_message(message: AbstractIncomingMessage) -> None:
    """Process one delivery with bounded retry and DLQ routing."""
    settings = get_settings()
    max_attempts = max(1, settings.rabbitmq_max_retries)
    retry_count = _retry_count(message)
    attempt = retry_count + 1
    payload: AITaskMessage | None = None

    try:
        payload = _parse_message(message)
        await _process_message(payload)
        await message.ack()
        logger.info(
            "Message ACKed | message_id=%s attempt=%d/%d",
            message.message_id,
            attempt,
            max_attempts,
        )
    except Exception as error:
        permanent = _is_permanent_error(error)
        exhausted = attempt >= max_attempts
        logger.error(
            "Message processing failed | attempt=%d/%d permanent=%s error=%s",
            attempt,
            max_attempts,
            permanent,
            str(error),
        )

        if permanent or exhausted:
            await _dead_letter(message, payload, error)
            return

        try:
            await _republish_for_retry(message, retry_count)
        except Exception:
            logger.exception(
                "Retry publish failed; returning original delivery to queue | "
                "message_id=%s",
                message.message_id,
            )
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
    try:
        await asyncio.Future()
    except asyncio.CancelledError:
        logger.info("Consumer cancelled, shutting down.")
