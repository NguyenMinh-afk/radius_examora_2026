"""
Điểm khởi động worker RabbitMQ.

File này chỉ cấu hình event loop cần thiết rồi gọi hàm main của worker.
"""

import asyncio
import signal
import sys

from app.workers.worker import main

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        def handle_signal(sig, frame):
            print(f"\nReceived signal {sig}, shutting down...")
            for task in asyncio.all_tasks(loop):
                task.cancel()

        signal.signal(signal.SIGINT, handle_signal)
        signal.signal(signal.SIGTERM, handle_signal)

        try:
            loop.run_until_complete(main())
        except (KeyboardInterrupt, asyncio.CancelledError) as e:
            print(f"\nWorker stopped by user: {e}")
        finally:
            loop.run_until_complete(loop.shutdown_asyncgens())
            loop.close()
            print("Event loop closed.")
    else:
        try:
            asyncio.run(main())
        except KeyboardInterrupt:
            print("\nWorker stopped by user.")
