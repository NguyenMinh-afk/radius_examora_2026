"""
Khởi tạo schema và bảng cho môi trường Docker/local.

Script này tạo các schema cần thiết, dựng bảng từ SQLAlchemy metadata và bổ sung
những cột nhỏ đang được project dùng nhưng cần đảm bảo tồn tại khi khởi động mới.
"""

import asyncio
import sys
from pathlib import Path

# Thêm root project để script chạy độc lập vẫn import được app.
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import get_settings
from app.infrastructure.db.models import Base


async def init_db() -> None:
    settings = get_settings()
    print(f"Connecting to database: {settings.database_url.split('@')[-1]}")

    # Cần AUTOCOMMIT để chạy CREATE SCHEMA an toàn.
    engine = create_async_engine(settings.database_url, isolation_level="AUTOCOMMIT")

    try:
        async with engine.connect() as conn:
            print("Creating schemas (ai_db, question_db)...")
            await conn.execute(text("CREATE SCHEMA IF NOT EXISTS ai_db;"))
            await conn.execute(text("CREATE SCHEMA IF NOT EXISTS question_db;"))
            print("Schemas verified.")

        # Sau khi có schema thì tạo bảng từ metadata như luồng bình thường.
        async with engine.begin() as conn:
            print("Creating tables...")
            # Tạo toàn bộ bảng đã khai báo trong models.
            # (which includes models.py since it was imported)
            await conn.run_sync(Base.metadata.create_all)
            await conn.execute(
                text(
                    "ALTER TABLE ai_db.generated_questions "
                    "ADD COLUMN IF NOT EXISTS display_order INTEGER"
                )
            )
            print("Tables created successfully.")

    except Exception as e:
        print(f"Failed to initialize database: {e}")
        raise
    finally:
        await engine.dispose()
        print("Database initialization complete.")


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(init_db())
