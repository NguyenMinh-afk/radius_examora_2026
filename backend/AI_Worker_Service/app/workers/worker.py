"""
Worker process — runs the RabbitMQ consumer loop.
Also handles graceful shutdown on SIGINT/SIGTERM.
"""

import asyncio
import signal

from app.core.config import get_settings
from app.core.logging import get_logger, setup_logging
from app.infrastructure.mq.consumer import start_consumer
from app.infrastructure.mq.rabbitmq import close_rabbitmq

logger = get_logger(__name__)


async def supervise_consumer(
    stop_event: asyncio.Event,
    *,
    base_delay_seconds: float,
    max_delay_seconds: float,
) -> None:
    """Keep the RabbitMQ consumer alive, including during cold-start failures."""
    consecutive_failures = 0

    while not stop_event.is_set():
        try:
            await start_consumer()
            if stop_event.is_set():
                return
            raise RuntimeError("RabbitMQ consumer exited unexpectedly")
        except asyncio.CancelledError:
            raise
        except Exception:
            consecutive_failures += 1
            retry_delay = min(
                base_delay_seconds * (2 ** (consecutive_failures - 1)),
                max_delay_seconds,
            )
            logger.exception(
                "RabbitMQ consumer stopped; restarting in %.1fs | failure=%d",
                retry_delay,
                consecutive_failures,
            )

            try:
                await close_rabbitmq()
            except Exception:
                logger.exception("RabbitMQ cleanup failed before consumer restart")

            try:
                await asyncio.wait_for(stop_event.wait(), timeout=retry_delay)
                return
            except asyncio.TimeoutError:
                continue


async def main() -> None:
    setup_logging()
    logger.info("AI Generation Worker starting...")
    settings = get_settings()

    loop = asyncio.get_running_loop()

    # Graceful shutdown handler
    stop_event = asyncio.Event()

    def _handle_signal() -> None:
        logger.info("Shutdown signal received.")
        stop_event.set()

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, _handle_signal)
        except NotImplementedError:
            # Windows doesn't support add_signal_handler for all signals
            pass

    consumer_task = asyncio.create_task(
        supervise_consumer(
            stop_event,
            base_delay_seconds=settings.rabbitmq_consumer_restart_base_delay_seconds,
            max_delay_seconds=settings.rabbitmq_consumer_restart_max_delay_seconds,
        )
    )

    try:
        await stop_event.wait()
    finally:
        logger.info("Stopping consumer...")
        consumer_task.cancel()
        try:
            await consumer_task
        except asyncio.CancelledError:
            pass
        await close_rabbitmq()
        logger.info("Worker stopped.")


if __name__ == "__main__":
    asyncio.run(main())
