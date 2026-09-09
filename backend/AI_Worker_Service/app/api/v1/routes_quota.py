"""
API theo dõi quota Gemini và OCR.Space.

Mục tiêu chính là cho vận hành/dev nhìn nhanh trạng thái usage hiện tại của các
provider mà không phải đọc trực tiếp từ DB.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.services.quota_service import ApiQuotaService
from app.core.config import get_settings
from app.infrastructure.db.session import get_db

router = APIRouter(prefix="/ai/quota", tags=["Quota"])


class ProviderQuotaStatus(BaseModel):
    """Current daily quota status for a provider/model pair."""

    provider: str
    model: str
    daily_limit: int
    used_today: int
    remaining_today: int
    usage_date: str
    reset_hint: str
    hourly_limit: int | None = None
    monthly_limit: int | None = None
    configured: bool | None = None
    enforced_limits: list[str] | None = None


class QuotaOverviewResponse(ProviderQuotaStatus):
    """Gemini quota plus optional OCR.Space visibility."""

    ocr_space: ProviderQuotaStatus | None = None


class SetDevRequest(BaseModel):
    """POST /ai/quota/set-dev - Set used_today to a specific value."""

    used_today: int = Field(
        ..., ge=0, description="Number of requests to simulate as already used today."
    )


@router.get(
    "",
    response_model=QuotaOverviewResponse,
    summary="View today's Gemini API quota usage",
)
async def get_quota(
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Return Gemini quota as before, plus OCR.Space status when available."""
    quota_svc = ApiQuotaService(db)
    return await quota_svc.get_overview()


@router.post(
    "/reset-dev",
    summary="[DEV ONLY] Reset today's quota usage to 0",
    responses={
        200: {"description": "Quota reset to 0."},
        403: {"description": "Only available in development environment."},
    },
)
async def reset_quota_dev(
    db: AsyncSession = Depends(get_db),
) -> Any:
    settings = get_settings()
    if settings.app_env != "development":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only available in development environment.",
        )
    quota_svc = ApiQuotaService(db)
    await quota_svc.reset_dev()
    return {
        "message": "Quota reset to 0.",
        "usage_date": (await quota_svc.get_status())["usage_date"],
    }


@router.post(
    "/set-dev",
    summary="[DEV ONLY] Set today's quota usage to a specific count",
    responses={
        200: {"description": "Quota set successfully."},
        403: {"description": "Only available in development environment."},
    },
)
async def set_quota_dev(
    req: SetDevRequest,
    db: AsyncSession = Depends(get_db),
) -> Any:
    settings = get_settings()
    if settings.app_env != "development":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only available in development environment.",
        )
    quota_svc = ApiQuotaService(db)
    await quota_svc.set_dev(req.used_today)
    status_info = await quota_svc.get_overview()
    return {
        "message": f"Quota set to {req.used_today}.",
        **status_info,
    }
