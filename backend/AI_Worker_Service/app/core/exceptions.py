"""
Custom exception classes and FastAPI exception handlers.
All errors return structured JSON, no stack traces exposed to clients.
"""

from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Base Exception
# ---------------------------------------------------------------------------


class AIServiceError(Exception):
    """Base exception for all AI Service errors."""

    def __init__(
        self,
        message: str,
        error_code: str = "INTERNAL_ERROR",
        status_code: int = 500,
        details: Any | None = None,
    ) -> None:
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details
        super().__init__(message)


# ---------------------------------------------------------------------------
# Domain Exceptions
# ---------------------------------------------------------------------------


class ConfigurationError(AIServiceError):
    """Missing or invalid configuration (e.g., no API key)."""

    def __init__(self, message: str) -> None:
        super().__init__(message, error_code="CONFIGURATION_ERROR", status_code=503)


class NotFoundError(AIServiceError):
    def __init__(self, resource: str, resource_id: str) -> None:
        super().__init__(
            message=f"{resource} with id '{resource_id}' not found.",
            error_code="NOT_FOUND",
            status_code=404,
        )


class ValidationError(AIServiceError):
    def __init__(self, message: str, details: Any | None = None) -> None:
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            status_code=422,
            details=details,
        )


class DocumentError(AIServiceError):
    """File parsing or unsupported format errors."""

    def __init__(self, message: str) -> None:
        super().__init__(message, error_code="DOCUMENT_ERROR", status_code=400)


class FileTooLargeError(AIServiceError):
    def __init__(self, max_mb: int) -> None:
        super().__init__(
            message=f"File exceeds maximum allowed size of {max_mb} MB.",
            error_code="FILE_TOO_LARGE",
            status_code=413,
        )


class UnsupportedFileTypeError(AIServiceError):
    def __init__(self, filename: str) -> None:
        super().__init__(
            message=(
                f"Unsupported file type for '{filename}'. Allowed: "
                "PDF, DOCX, TXT, PNG, JPG, JPEG, WEBP."
            ),
            error_code="UNSUPPORTED_FILE_TYPE",
            status_code=400,
        )


class GeminiError(AIServiceError):
    """Errors from Gemini API calls."""

    def __init__(self, message: str, error_code: str = "GEMINI_ERROR") -> None:
        super().__init__(message, error_code=error_code, status_code=502)


class GeminiTimeoutError(GeminiError):
    def __init__(self) -> None:
        super().__init__("Gemini API request timed out.", error_code="GEMINI_TIMEOUT")


class GeminiRateLimitError(GeminiError):
    def __init__(self) -> None:
        super().__init__(
            "Gemini API rate limit exceeded (HTTP 429). Please try again later.",
            error_code="GEMINI_RATE_LIMIT",
        )


class GeminiModelNotFoundError(GeminiError):
    def __init__(self, model: str) -> None:
        super().__init__(
            f"Gemini model '{model}' not found or not available for this API key (HTTP 404). "
            "Check GEMINI_MODEL in your .env file.",
            error_code="GEMINI_MODEL_NOT_FOUND",
        )


class GeminiPermissionError(GeminiError):
    def __init__(self, detail: str = "") -> None:
        super().__init__(
            f"Gemini API key is invalid or lacks permission (HTTP 403). {detail}".strip(),
            error_code="GEMINI_PERMISSION_DENIED",
        )


class GeminiInvalidArgumentError(GeminiError):
    def __init__(self, detail: str = "") -> None:
        super().__init__(
            f"Gemini request has invalid arguments (HTTP 400). {detail}".strip(),
            error_code="GEMINI_INVALID_ARGUMENT",
        )


class GeminiInvalidResponseError(GeminiError):
    def __init__(
        self, message: str = "Gemini returned invalid or unparseable JSON."
    ) -> None:
        super().__init__(message, error_code="GEMINI_INVALID_RESPONSE")


class GeminiAllModelsExhaustedError(GeminiError):
    """
    Raised when every model in the candidate list (primary + all fallbacks)
    has either exhausted its daily quota or returned a rate-limit error.
    The caller should then activate the local fallback or queue the task.
    """

    def __init__(self, tried_models: list) -> None:
        models_str = ", ".join(tried_models) if tried_models else "none"
        super().__init__(
            f"All Gemini models exhausted quota/rate limit. Tried: {models_str}.",
            error_code="GEMINI_ALL_MODELS_EXHAUSTED",
        )
        self.tried_models = tried_models



class DatabaseError(AIServiceError):
    def __init__(self, message: str = "A database error occurred.") -> None:
        super().__init__(message, error_code="DATABASE_ERROR", status_code=500)


class MessageQueueError(AIServiceError):
    def __init__(self, message: str = "Message queue error.") -> None:
        super().__init__(message, error_code="MQ_ERROR", status_code=503)


class InvalidStateTransitionError(AIServiceError):
    """E.g., approving an already-rejected question."""

    def __init__(self, message: str) -> None:
        super().__init__(
            message, error_code="INVALID_STATE_TRANSITION", status_code=409
        )


class TaskRequestMismatchError(AIServiceError):
    """The task exists but does not belong to the request in the message."""

    def __init__(self, request_id: str, task_id: str) -> None:
        super().__init__(
            message=f"Task '{task_id}' does not belong to request '{request_id}'.",
            error_code="TASK_REQUEST_MISMATCH",
            status_code=422,
        )


class InsufficientContextError(AIServiceError):
    def __init__(self) -> None:
        super().__init__(
            message="Context is too short or empty to generate questions.",
            error_code="INSUFFICIENT_CONTEXT",
            status_code=400,
        )


# ---------------------------------------------------------------------------
# FastAPI Exception Handlers
# ---------------------------------------------------------------------------


def _error_response(
    status_code: int,
    error_code: str,
    message: str,
    details: Any | None = None,
) -> JSONResponse:
    content: dict = {"error_code": error_code, "message": message}
    if details is not None:
        content["details"] = details
    return JSONResponse(status_code=status_code, content=content)


async def ai_service_exception_handler(
    request: Request, exc: AIServiceError
) -> JSONResponse:
    logger.warning(
        "AIServiceError: [%s] %s | path=%s",
        exc.error_code,
        exc.message,
        request.url.path,
    )
    return _error_response(exc.status_code, exc.error_code, exc.message, exc.details)


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(
        "Unhandled exception on %s: %s",
        request.url.path,
        str(exc),
        exc_info=True,
    )
    return _error_response(
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        "INTERNAL_ERROR",
        "An unexpected internal error occurred. Please try again later.",
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all exception handlers on the FastAPI app."""
    app.add_exception_handler(AIServiceError, ai_service_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, generic_exception_handler)
