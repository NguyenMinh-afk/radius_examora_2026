"""
Health check endpoint.
"""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    """
    Simple health check to verify service is running.
    """
    return {
        "status": "ok",
        "service": "ai-service"
    }
