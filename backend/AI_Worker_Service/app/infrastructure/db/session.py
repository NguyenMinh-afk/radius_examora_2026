"""
Async SQLAlchemy session factory and dependency injection helpers.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_engine: AsyncEngine | None = None
_async_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    """Return the singleton async engine, creating it if needed."""
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.database_url,
            echo=settings.app_debug,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
        )
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Return the singleton session factory."""
    global _async_session_factory
    if _async_session_factory is None:
        engine = get_engine()
        _async_session_factory = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    return _async_session_factory


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Async context manager for database sessions.
    Commits on success, rolls back on exception.
    """
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for injecting a database session.
    Usage: db: AsyncSession = Depends(get_db)
    """
    async with get_db_session() as session:
        yield session


async def close_engine() -> None:
    """Dispose the engine on shutdown."""
    global _engine
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        logger.info("Database engine disposed.")
