"""
RabbitMQ connection manager and message publisher.
Uses aio-pika for async AMQP communication.
Supports dead-letter queue (DLQ) for failed messages.
"""

import asyncio
import json
import uuid
from typing import Any

import aio_pika
from aio_pika import DeliveryMode, ExchangeType, Message
from aio_pika.abc import AbstractChannel, AbstractConnection, AbstractQueue

from app.core.config import get_settings
from app.core.exceptions import MessageQueueError
from app.core.logging import get_logger

logger = get_logger(__name__)

_connection: AbstractConnection | None = None
_channel: AbstractChannel | None = None
_queues_setup_for_channel_id: int | None = None
_queues_setup_lock = asyncio.Lock()


async def get_rabbitmq_connection() -> AbstractConnection:
    """Return a singleton RabbitMQ connection."""
    global _connection
    if _connection is None or _connection.is_closed:
        settings = get_settings()
        try:
            _connection = await aio_pika.connect_robust(
                settings.rabbitmq_url,
                reconnect_interval=settings.rabbitmq_reconnect_interval_seconds,
                fail_fast=False,
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
        settings = get_settings()
        _channel = await conn.channel()
        await _channel.set_qos(prefetch_count=settings.rabbitmq_prefetch_count)
    return _channel


async def setup_queues(channel: AbstractChannel) -> tuple[AbstractQueue, AbstractQueue]:
    """
    Declare the AI topic exchange, main queue, DLX, DLQ, and bindings.

    Returns:
        (main_queue, dlq)
    """
    settings = get_settings()

    main_exchange = await channel.declare_exchange(
        settings.rabbitmq_exchange,
        ExchangeType.TOPIC,
        durable=True,
    )
    dlx = await channel.declare_exchange(
        settings.rabbitmq_dlx,
        ExchangeType.DIRECT,
        durable=True,
    )

    # The DLQ has no dead-letter routing of its own.
    dlq = await channel.declare_queue(
        settings.rabbitmq_dlq,
        durable=True,
        arguments={},
    )
    await dlq.bind(dlx, routing_key=settings.rabbitmq_dlq)

    # Failed messages are routed through the DLX into the DLQ.
    # x-max-length protects RabbitMQ from unbounded memory growth.
    # x-overflow=reject-publish rejects new messages when max is reached.
    main_queue = await channel.declare_queue(
        settings.rabbitmq_queue,
        durable=True,
        arguments={
            "x-dead-letter-exchange": settings.rabbitmq_dlx,
            "x-dead-letter-routing-key": settings.rabbitmq_dlq,
            "x-max-length": settings.rabbitmq_queue_max_length,
            "x-overflow": settings.rabbitmq_overflow_policy,
        },
    )
    await main_queue.bind(
        main_exchange,
        routing_key=settings.rabbitmq_routing_key,
    )

    logger.info(
        "RabbitMQ topology ready | exchange=%s routing_key=%s queue=%s "
        "dlx=%s dlq=%s",
        settings.rabbitmq_exchange,
        settings.rabbitmq_routing_key,
        settings.rabbitmq_queue,
        settings.rabbitmq_dlx,
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
        await setup_queues(channel)
        _queues_setup_for_channel_id = channel_id


async def publish_task_message(
    request_id: str,
    task_id: str,
    trace_id: str,
    extra_payload: dict[str, Any] | None = None,
) -> None:
    """
    Publish a generation task message to the main queue.
    Message is persistent (survives broker restart).
    """
    settings = get_settings()
    try:
        channel = await get_rabbitmq_channel()
        await ensure_queues_setup(channel)

        payload: dict[str, Any] = {
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

        exchange = await channel.get_exchange(settings.rabbitmq_exchange)
        await exchange.publish(
            message,
            routing_key=settings.rabbitmq_routing_key,
        )
        logger.info(
            "Published task message | exchange=%s routing_key=%s request=%s task=%s",
            settings.rabbitmq_exchange,
            settings.rabbitmq_routing_key,
            request_id,
            task_id,
        )
    except MessageQueueError:
        raise
    except Exception as e:
        raise MessageQueueError(f"Failed to publish message: {e}") from e


async def close_rabbitmq() -> None:
    """Gracefully close RabbitMQ connection."""
    global _connection, _channel, _queues_setup_for_channel_id
    if _channel and not _channel.is_closed:
        await _channel.close()
        _channel = None
    if _connection and not _connection.is_closed:
        await _connection.close()
        _connection = None
    _queues_setup_for_channel_id = None
    logger.info("RabbitMQ connection closed.")
