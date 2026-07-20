"""
Theo dõi quota cho Gemini và OCR.Space.

Service này đọc/ghi usage theo ngày để worker biết còn được gọi provider nào và
API có thể trả về trạng thái quota hiện tại.
"""

from datetime import date
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.logging import get_logger
from app.infrastructure.db.quota_repository import QuotaRepository

logger = get_logger(__name__)

_GEMINI_PROVIDER = "gemini"
_OCR_SPACE_PROVIDER = "ocr_space"


class ApiQuotaService:
    """Manages simple daily quota tracking per provider/model."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = QuotaRepository(db)
        self.settings = get_settings()

    @property
    def _gemini_model(self) -> str:
        return self.settings.gemini_model

    @property
    def _gemini_limit(self) -> int:
        return self.settings.gemini_daily_request_limit

    @property
    def _ocr_space_model(self) -> str:
        return self.settings.ocr_space_model_name

    @property
    def _ocr_space_limit(self) -> int:
        return self.settings.ocr_space_daily_request_limit

    async def can_call_provider(
        self, provider: str, model_name: str, daily_limit: int
    ) -> bool:
        """Return True if the provider/model still has daily quota today."""
        status = await self.get_provider_status(provider, model_name, daily_limit)
        logger.info(
            "Quota check | provider=%s | model=%s | used_today=%d | limit=%d | remaining=%d | date=%s",
            provider,
            model_name,
            status["used_today"],
            status["daily_limit"],
            status["remaining_today"],
            date.today().isoformat(),
        )
        if status["used_today"] >= status["daily_limit"]:
            logger.warning(
                "Daily quota exhausted | provider=%s | model=%s | used=%d | limit=%d",
                provider,
                model_name,
                status["used_today"],
                status["daily_limit"],
            )
            return False
        return True

    async def record_call_provider(
        self,
        provider: str,
        model_name: str,
        token_estimate: Optional[int] = None,
    ) -> int:
        """Record one provider call after a real upstream request was made."""
        return await self.repo.increment_usage(provider, model_name, token_estimate)

    async def get_provider_status(
        self, provider: str, model_name: str, daily_limit: int
    ) -> dict:
        """Return current daily status for any provider/model pair."""
        usage = await self.repo.get_today_usage(provider, model_name)
        used_today = usage.request_count if usage else 0
        remaining = max(0, daily_limit - used_today)
        return {
            "provider": provider,
            "model": model_name,
            "daily_limit": daily_limit,
            "used_today": used_today,
            "remaining_today": remaining,
            "usage_date": date.today().isoformat(),
            "reset_hint": "Resets at midnight (server UTC time)",
        }

    async def can_call_model(self, model_name: str) -> bool:
        return await self.can_call_provider(
            _GEMINI_PROVIDER, model_name, self._gemini_limit
        )

    async def record_call_model(
        self, model_name: str, token_estimate: Optional[int] = None
    ) -> int:
        return await self.record_call_provider(
            _GEMINI_PROVIDER, model_name, token_estimate
        )

    async def can_call(self) -> bool:
        return await self.can_call_model(self._gemini_model)

    async def record_call(self, token_estimate: Optional[int] = None) -> int:
        return await self.record_call_model(self._gemini_model, token_estimate)

    async def get_status(self) -> dict:
        return await self.get_provider_status(
            _GEMINI_PROVIDER,
            self._gemini_model,
            self._gemini_limit,
        )

    async def get_ocr_space_status(self) -> dict:
        status = await self.get_provider_status(
            _OCR_SPACE_PROVIDER,
            self._ocr_space_model,
            self._ocr_space_limit,
        )
        status["hourly_limit"] = self.settings.ocr_space_hourly_request_limit
        status["monthly_limit"] = self.settings.ocr_space_monthly_request_limit
        status["configured"] = self.settings.has_ocr_space_key
        status["enforced_limits"] = ["daily"]
        return status

    async def can_call_ocr_space(self) -> bool:
        return await self.can_call_provider(
            _OCR_SPACE_PROVIDER,
            self._ocr_space_model,
            self._ocr_space_limit,
        )

    async def record_ocr_space_call(self) -> int:
        return await self.record_call_provider(
            _OCR_SPACE_PROVIDER,
            self._ocr_space_model,
        )

    async def get_overview(self) -> dict:
        gemini_status = await self.get_status()
        gemini_status["ocr_space"] = await self.get_ocr_space_status()
        return gemini_status

    async def reset_dev(self) -> None:
        await self.repo.reset_usage(_GEMINI_PROVIDER, self._gemini_model)

    async def set_dev(self, count: int) -> None:
        await self.repo.set_usage(_GEMINI_PROVIDER, self._gemini_model, count)
