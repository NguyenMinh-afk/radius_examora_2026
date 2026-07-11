"""
Worker process — runs the RabbitMQ consumer loop.
Also handles graceful shutdown on SIGINT/SIGTERM.
"""
import asyncio
import signal

from app.core.logging import get_logger, setup_logging
from app.infrastructure.mq.consumer import start_consumer
from app.infrastructure.mq.rabbitmq import close_rabbitmq

logger = get_logger(__name__)


async def main() -> None:
    setup_logging()
    logger.info("AI Generation Worker starting...")

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

    consumer_task = asyncio.create_task(start_consumer())

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
