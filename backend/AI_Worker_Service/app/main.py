"""
Main FastAPI application entry point.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import (
    routes_courses,
    routes_documents,
    routes_generation,
    routes_health,
    routes_quota,
    routes_review,
)
from app.api.v1.routes_review import bank_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import get_logger, setup_logging
from app.infrastructure.db.session import close_engine, get_engine
from app.infrastructure.mq.rabbitmq import close_rabbitmq

# Initialize structured logging early
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan events (startup/shutdown)."""
    settings = get_settings()
    logger.info("Starting AI Service | env=%s", settings.app_env)

    # Pre-flight checks
    try:
        settings.validate_gemini_key()
    except ValueError as e:
        logger.warning("Configuration Warning: %s", e)

    # Initialize DB engine
    get_engine()

    yield

    logger.info("Shutting down AI Service...")
    await close_engine()
    if settings.use_rabbitmq:
        await close_rabbitmq()
    logger.info("Shutdown complete.")


def create_app() -> FastAPI:
    """Application factory."""
    settings = get_settings()

    app = FastAPI(
        title="AI Generation Service",
        description="Service for generating multiple-choice questions using Gemini and RabbitMQ",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
        debug=settings.app_debug,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, restrict this
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception Handlers
    register_exception_handlers(app)

    # Routers
    api_prefix = "/api/v1"
    app.include_router(routes_health.router, prefix=api_prefix)
    app.include_router(routes_generation.router, prefix=api_prefix)
    app.include_router(routes_documents.router, prefix=api_prefix)
    app.include_router(routes_courses.router, prefix=api_prefix)
    app.include_router(routes_quota.router, prefix=api_prefix)
    app.include_router(routes_review.review_router, prefix=api_prefix)
    app.include_router(bank_router, prefix=api_prefix)

    original_openapi = app.openapi

    def custom_openapi() -> dict:
        """Patch examples that FastAPI drops null fields from during generation."""
        schema = original_openapi()
        try:
            examples = schema["paths"]["/api/v1/ai/tasks/{task_id}/results"]["get"][
                "responses"
            ]["200"]["content"]["application/json"]["examples"]
            examples["completed"]["value"]["warning"] = None
            examples["completed"]["value"]["error_message"] = None
            examples["failed"]["value"]["warning"] = None
        except KeyError:
            pass
        return schema

    app.openapi = custom_openapi  # type: ignore[method-assign]

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.app_debug,
    )
