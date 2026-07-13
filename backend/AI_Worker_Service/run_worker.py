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
        
        main_task = None
        
        def handle_signal(sig, frame):
            print(f"\nReceived signal {sig}, shutting down...")
            if main_task and not main_task.done():
                main_task.cancel()
        
        signal.signal(signal.SIGINT, handle_signal)
        signal.signal(signal.SIGTERM, handle_signal)
        
        try:
            main_task = loop.create_task(main())
            loop.run_until_complete(main_task)
        except (KeyboardInterrupt, asyncio.CancelledError):
            print("\nWorker stopped by user.")
        finally:
            loop.close()
    else:
        try:
            asyncio.run(main())
        except KeyboardInterrupt:
            print("\nWorker stopped by user.")
