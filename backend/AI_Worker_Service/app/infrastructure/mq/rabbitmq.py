"""
RabbitMQ connection manager and message publisher.
Uses aio-pika for async AMQP communication.
Supports dead-letter queue (DLQ) for failed messages.
"""
import asyncio
import json
import uuid
from typing import Any, Dict, Optional

import aio_pika
from aio_pika import DeliveryMode, ExchangeType, Message
from aio_pika.abc import AbstractChannel, AbstractConnection, AbstractQueue

from app.core.config import get_settings
from app.core.exceptions import MessageQueueError
from app.core.logging import get_logger

logger = get_logger(__name__)

_connection: Optional[AbstractConnection] = None
_channel: Optional[AbstractChannel] = None
_queues_setup_for_channel_id: Optional[int] = None
_queues_setup_lock = asyncio.Lock()


async def get_rabbitmq_connection() -> AbstractConnection:
    """Return a singleton RabbitMQ connection."""
    global _connection
    if _connection is None or _connection.is_closed:
        settings = get_settings()
        try:
            _connection = await aio_pika.connect_robust(
                settings.rabbitmq_url,
                reconnect_interval=5,
            )
            logger.info("RabbitMQ connected: %s", settings.rabbitmq_url.split("@")[-1])
        except Exception as e:
            raise MessageQueueError(f"Cannot connect to RabbitMQ: {e}") from e
    return _connection


async def get_rabbitmq_channel() -> AbstractChannel:
    """Return a channel from the singleton connection."""
    global _channel
    conn = await get_rabbitmq_connection()
    if _channel is None or _channel.is_closed:
        _channel = await conn.channel()
        await _channel.set_qos(prefetch_count=1)
    return _channel


async def setup_queues(channel: AbstractChannel) -> tuple[AbstractQueue, AbstractQueue]:
    """
    Declare main queue and DLQ with durability and dead-letter routing.

    Returns:
        (main_queue, dlq)
    """
    settings = get_settings()

    # Declare DLQ first (no dead-letter routing on DLQ itself)
    dlq = await channel.declare_queue(
        settings.rabbitmq_dlq,
        durable=True,
        arguments={},
    )

    # Declare dead-letter exchange pointing to DLQ
    dlx_name = f"{settings.rabbitmq_dlq}.exchange"
    dlx = await channel.declare_exchange(dlx_name, ExchangeType.DIRECT, durable=True)
    await dlq.bind(dlx, routing_key=settings.rabbitmq_dlq)

    # Declare main queue with DLX configuration
    main_queue = await channel.declare_queue(
        settings.rabbitmq_queue,
        durable=True,
        arguments={
            "x-dead-letter-exchange": dlx_name,
            "x-dead-letter-routing-key": settings.rabbitmq_dlq,
            "x-message-ttl": 3_600_000,  # 1 hour TTL
        },
    )

    logger.info(
        "Queues declared: main=%s dlq=%s",
        settings.rabbitmq_queue,
        settings.rabbitmq_dlq,
    )
    return main_queue, dlq


async def ensure_queues_setup(channel: AbstractChannel) -> None:
    """Ensure queues/exchanges are declared once per channel lifecycle."""
    global _queues_setup_for_channel_id
    channel_id = id(channel)

    if _queues_setup_for_channel_id == channel_id:
        return

    async with _queues_setup_lock:
        if _queues_setup_for_channel_id == channel_id:
            return
        try:
            await setup_queues(channel)
        except Exception as e:
            if "PRECONDITION" in str(e).upper():
                logger.warning(
                    "Queue already exists with different config, skipping setup: %s", e
                )
            else:
                raise
        _queues_setup_for_channel_id = channel_id


async def publish_task_message(
    request_id: str,
    task_id: str,
    trace_id: str,
    extra_payload: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Publish a generation task message to the main queue.
    Message is persistent (survives broker restart).
    """
    global _channel, _queues_setup_for_channel_id
    settings = get_settings()
    try:
        channel = await get_rabbitmq_channel()
        try:
            await ensure_queues_setup(channel)
        except Exception as e:
            if "PRECONDITION" in str(e).upper():
                logger.warning(
                    "Queue config mismatch, refreshing channel: %s", e
                )
                # Channel is dead after PRECONDITION_FAILED, get a new one
                _channel = None
                channel = await get_rabbitmq_channel()
                _queues_setup_for_channel_id = id(channel)
            else:
                raise

        payload: Dict[str, Any] = {
            "request_id": request_id,
            "task_id": task_id,
            "trace_id": trace_id,
        }
        if extra_payload:
            payload.update(extra_payload)

        message = Message(
            body=json.dumps(payload).encode(),
            delivery_mode=DeliveryMode.PERSISTENT,
            message_id=str(uuid.uuid4()),
            content_type="application/json",
        )

        await channel.default_exchange.publish(
            message,
            routing_key=settings.rabbitmq_queue,
        )
        logger.info(
            "Published task message | request=%s task=%s", request_id, task_id
        )
    except MessageQueueError:
        raise
    except Exception as e:
        raise MessageQueueError(f"Failed to publish message: {e}") from e


async def close_rabbitmq() -> None:
    """Gracefully close RabbitMQ connection."""
    global _connection, _channel
    if _channel and not _channel.is_closed:
        await _channel.close()
        _channel = None
    if _connection and not _connection.is_closed:
        await _connection.close()
        _connection = None
    logger.info("RabbitMQ connection closed.")
