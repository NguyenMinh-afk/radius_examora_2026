"""
Điểm khởi động worker RabbitMQ.

File này chỉ cấu hình event loop cần thiết rồi gọi hàm main của worker.
"""
import asyncio
import sys

from app.workers.worker import main

if __name__ == "__main__":
    if sys.platform == "win32":
        # Windows cần policy này để aio-pika chạy ổn định.
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nWorker stopped by user.")
