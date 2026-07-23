"""Unit tests for the RabbitMQ AI task consumer."""

import json
import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.core.exceptions import DatabaseError, InsufficientContextError
from app.infrastructure.mq import consumer


REQUEST_ID = uuid.UUID("11111111-1111-4111-8111-111111111111")
TASK_ID = uuid.UUID("22222222-2222-4222-8222-222222222222")


def _message(payload: object, headers: dict | None = None) -> SimpleNamespace:
    return SimpleNamespace(
        body=json.dumps(payload).encode("utf-8"),
        headers=headers or {},
        message_id="message-1",
        correlation_id="trace-1",
        content_type="application/json",
        content_encoding="utf-8",
        type="ai.generate",
        ack=AsyncMock(),
        nack=AsyncMock(),
        reject=AsyncMock(),
    )


def _valid_payload() -> dict:
    return {
        "request_id": str(REQUEST_ID),
        "task_id": str(TASK_ID),
        "trace_id": "trace-1",
    }


class ConsumerTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.settings_patch = patch.object(
            consumer,
            "get_settings",
            return_value=SimpleNamespace(rabbitmq_max_retries=3),
        )
        self.settings_patch.start()

    def tearDown(self) -> None:
        self.settings_patch.stop()

    async def test_success_acknowledges_message(self) -> None:
        message = _message(_valid_payload())

        with patch.object(
            consumer,
            "_process_message",
            new=AsyncMock(),
        ):
            await consumer._on_message(message)

        message.ack.assert_awaited_once()
        message.reject.assert_not_awaited()
        message.nack.assert_not_awaited()

    async def test_invalid_payload_goes_directly_to_dlq(self) -> None:
        message = _message({"request_id": "not-a-uuid"})

        await consumer._on_message(message)

        message.reject.assert_awaited_once_with(requeue=False)
        message.ack.assert_not_awaited()
        message.nack.assert_not_awaited()

    async def test_transient_error_is_republished_for_retry(self) -> None:
        message = _message(_valid_payload())
        republish = AsyncMock()

        with (
            patch.object(
                consumer,
                "_process_message",
                new=AsyncMock(side_effect=DatabaseError("temporary")),
            ),
            patch.object(
                consumer,
                "_republish_for_retry",
                new=republish,
            ),
        ):
            await consumer._on_message(message)

        republish.assert_awaited_once_with(message, 0)
        message.reject.assert_not_awaited()
        message.nack.assert_not_awaited()

    async def test_retry_republish_increments_header_and_acks_original(self) -> None:
        message = _message(_valid_payload())
        exchange = SimpleNamespace(publish=AsyncMock())
        channel = SimpleNamespace(
            get_exchange=AsyncMock(return_value=exchange),
        )

        with (
            patch.object(
                consumer,
                "get_settings",
                return_value=SimpleNamespace(
                    rabbitmq_max_retries=3,
                    rabbitmq_exchange="examora.topic",
                    rabbitmq_routing_key="ai.generate",
                ),
            ),
            patch.object(
                consumer.asyncio,
                "sleep",
                new=AsyncMock(),
            ),
            patch.object(
                consumer,
                "get_rabbitmq_channel",
                new=AsyncMock(return_value=channel),
            ),
            patch.object(
                consumer,
                "ensure_queues_setup",
                new=AsyncMock(),
            ),
        ):
            await consumer._republish_for_retry(message, retry_count=0)

        retry_message = exchange.publish.await_args.args[0]
        self.assertEqual(retry_message.headers["x-retry-count"], 1)
        self.assertEqual(
            exchange.publish.await_args.kwargs["routing_key"],
            "ai.generate",
        )
        message.ack.assert_awaited_once()

    async def test_third_transient_failure_is_marked_failed_and_dead_lettered(
        self,
    ) -> None:
        message = _message(_valid_payload(), headers={"x-retry-count": 2})
        mark_failed = AsyncMock()

        with (
            patch.object(
                consumer,
                "_process_message",
                new=AsyncMock(side_effect=DatabaseError("database unavailable")),
            ),
            patch.object(consumer, "_mark_failed", new=mark_failed),
        ):
            await consumer._on_message(message)

        mark_failed.assert_awaited_once()
        message.reject.assert_awaited_once_with(requeue=False)
        message.ack.assert_not_awaited()

    async def test_permanent_error_is_not_retried(self) -> None:
        message = _message(_valid_payload())
        mark_failed = AsyncMock()
        republish = AsyncMock()

        with (
            patch.object(
                consumer,
                "_process_message",
                new=AsyncMock(side_effect=InsufficientContextError()),
            ),
            patch.object(consumer, "_mark_failed", new=mark_failed),
            patch.object(consumer, "_republish_for_retry", new=republish),
        ):
            await consumer._on_message(message)

        mark_failed.assert_awaited_once()
        republish.assert_not_awaited()
        message.reject.assert_awaited_once_with(requeue=False)


if __name__ == "__main__":
    unittest.main()
