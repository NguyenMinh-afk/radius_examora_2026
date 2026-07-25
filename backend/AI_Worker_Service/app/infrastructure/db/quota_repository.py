"""
Repository for daily API quota tracking.
Stores and retrieves usage counts in ai_db.ai_api_usage.
"""

import uuid
from datetime import date

from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DatabaseError
from app.core.logging import get_logger
from app.infrastructure.db.models import AIApiUsage

logger = get_logger(__name__)


def _today() -> str:
    """Return today's ISO date string (UTC)."""
    return date.today().isoformat()


class QuotaRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_today_usage(self, provider: str, model: str) -> AIApiUsage | None:
        """Fetch today's usage record, or None if no calls made yet today."""
        try:
            result = await self.db.execute(
                select(AIApiUsage).where(
                    AIApiUsage.provider == provider,
                    AIApiUsage.model == model,
                    AIApiUsage.usage_date == _today(),
                )
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise DatabaseError(f"Failed to fetch quota usage: {e}") from e

    async def increment_usage(
        self,
        provider: str,
        model: str,
        token_estimate: int | None = None,
    ) -> int:
        """
        Increment request_count by 1 for today.
        Creates the row if it doesn't exist (upsert).
        Returns the new request_count.
        """
        try:
            today = _today()
            # PostgreSQL UPSERT: insert or update on conflict
            stmt = (
                pg_insert(AIApiUsage)
                .values(
                    id=uuid.uuid4(),
                    provider=provider,
                    model=model,
                    usage_date=today,
                    request_count=1,
                    token_estimate=token_estimate,
                )
                .on_conflict_do_update(
                    index_elements=["provider", "model", "usage_date"],
                    set_={
                        "request_count": AIApiUsage.request_count + 1,
                        "token_estimate": token_estimate,
                    },
                )
                .returning(AIApiUsage.request_count)
            )

            result = await self.db.execute(stmt)
            await self.db.commit()
            new_count = result.scalar_one()
            logger.info(
                "Quota incremented | provider=%s | model=%s | date=%s | count=%d",
                provider,
                model,
                today,
                new_count,
            )
            return new_count
        except Exception as e:
            raise DatabaseError(f"Failed to increment quota usage: {e}") from e

    async def reset_usage(self, provider: str, model: str) -> None:
        """Reset today's count to 0. DEV USE ONLY."""
        try:
            today = _today()
            await self.db.execute(
                update(AIApiUsage)
                .where(
                    AIApiUsage.provider == provider,
                    AIApiUsage.model == model,
                    AIApiUsage.usage_date == today,
                )
                .values(request_count=0, token_estimate=None)
            )
            await self.db.commit()
            logger.info(
                "Quota reset | provider=%s | model=%s | date=%s", provider, model, today
            )
        except Exception as e:
            raise DatabaseError(f"Failed to reset quota: {e}") from e

    async def set_usage(self, provider: str, model: str, count: int) -> None:
        """Set today's count to a specific value. DEV USE ONLY."""
        try:
            today = _today()
            stmt = (
                pg_insert(AIApiUsage)
                .values(
                    id=uuid.uuid4(),
                    provider=provider,
                    model=model,
                    usage_date=today,
                    request_count=count,
                )
                .on_conflict_do_update(
                    index_elements=["provider", "model", "usage_date"],
                    set_={"request_count": count},
                )
            )
            await self.db.execute(stmt)
            await self.db.commit()
            logger.info(
                "Quota set | provider=%s | model=%s | date=%s | count=%d",
                provider,
                model,
                today,
                count,
            )
        except Exception as e:
            raise DatabaseError(f"Failed to set quota: {e}") from e
