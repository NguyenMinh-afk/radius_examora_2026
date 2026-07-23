"""Tests for AI Worker RabbitMQ cold-start recovery."""

import asyncio
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.infrastructure.mq import rabbitmq
from app.workers import worker


class RabbitMQConnectionTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        rabbitmq._connection = None
        rabbitmq._channel = None
        rabbitmq._queues_setup_for_channel_id = None

    async def asyncTearDown(self) -> None:
        rabbitmq._connection = None
        rabbitmq._channel = None
        rabbitmq._queues_setup_for_channel_id = None

    async def test_initial_connection_waits_instead_of_failing_fast(self) -> None:
        connection = SimpleNamespace(is_closed=False)
        settings = SimpleNamespace(
            rabbitmq_url="amqp://test:test@rabbitmq:5672/",
            rabbitmq_reconnect_interval_seconds=0.25,
        )

        with (
            patch.object(rabbitmq, "get_settings", return_value=settings),
            patch.object(
                rabbitmq.aio_pika,
                "connect_robust",
                new=AsyncMock(return_value=connection),
            ) as connect_robust,
        ):
            result = await rabbitmq.get_rabbitmq_connection()

        self.assertIs(result, connection)
        connect_robust.assert_awaited_once_with(
            settings.rabbitmq_url,
            reconnect_interval=0.25,
            fail_fast=False,
        )


class ConsumerSupervisorTests(unittest.IsolatedAsyncioTestCase):
    async def test_restarts_consumer_after_unexpected_failure(self) -> None:
        stop_event = asyncio.Event()
        start_consumer = AsyncMock()
        attempts = 0

        async def start_side_effect() -> None:
            nonlocal attempts
            attempts += 1
            if attempts == 1:
                raise RuntimeError("broker unavailable")
            await stop_event.wait()

        start_consumer.side_effect = start_side_effect

        async def stop_after_second_start() -> None:
            while start_consumer.await_count < 2:
                await asyncio.sleep(0)
            stop_event.set()

        with (
            patch.object(worker, "start_consumer", start_consumer),
            patch.object(worker, "close_rabbitmq", new=AsyncMock()) as close,
        ):
            stop_task = asyncio.create_task(stop_after_second_start())
            await worker.supervise_consumer(
                stop_event,
                base_delay_seconds=0.001,
                max_delay_seconds=0.001,
            )
            await stop_task

        self.assertEqual(start_consumer.await_count, 2)
        close.assert_awaited_once()

    async def test_stops_during_backoff_without_another_connection_attempt(self) -> None:
        stop_event = asyncio.Event()
        start_consumer = AsyncMock(side_effect=RuntimeError("broker unavailable"))

        with (
            patch.object(worker, "start_consumer", start_consumer),
            patch.object(worker, "close_rabbitmq", new=AsyncMock()),
        ):
            supervisor = asyncio.create_task(
                worker.supervise_consumer(
                    stop_event,
                    base_delay_seconds=60,
                    max_delay_seconds=60,
                )
            )
            while start_consumer.await_count < 1:
                await asyncio.sleep(0)
            stop_event.set()
            await asyncio.wait_for(supervisor, timeout=1)

        self.assertEqual(start_consumer.await_count, 1)
