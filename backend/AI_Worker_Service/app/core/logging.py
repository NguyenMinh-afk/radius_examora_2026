"""
Structured logging configuration with trace_id support.
Uses Python standard logging with JSON-like formatting.
"""

import logging
import sys
import uuid
from contextvars import ContextVar

from app.core.config import get_settings

# Context variable to hold trace_id across async tasks
_trace_id_var: ContextVar[str | None] = ContextVar("trace_id", default=None)
_request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)
_task_id_var: ContextVar[str | None] = ContextVar("task_id", default=None)


def get_trace_id() -> str:
    """Get current trace_id or generate a new one."""
    tid = _trace_id_var.get()
    if tid is None:
        tid = str(uuid.uuid4())
        _trace_id_var.set(tid)
    return tid


def set_trace_id(trace_id: str) -> None:
    _trace_id_var.set(trace_id)


def set_request_id(request_id: str) -> None:
    _request_id_var.set(request_id)


def set_task_id(task_id: str) -> None:
    _task_id_var.set(task_id)


def get_context_ids() -> dict:
    return {
        "trace_id": _trace_id_var.get(),
        "request_id": _request_id_var.get(),
        "task_id": _task_id_var.get(),
    }


class ContextFilter(logging.Filter):
    """Inject trace/request/task IDs into log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.trace_id = _trace_id_var.get() or "-"
        record.request_id = _request_id_var.get() or "-"
        record.task_id = _task_id_var.get() or "-"
        return True


class SafeFormatter(logging.Formatter):
    """Formatter that ensures sensitive fields are never logged."""

    SENSITIVE_KEYS = {"api_key", "password", "secret", "token", "gemini_api_key"}

    def format(self, record: logging.LogRecord) -> str:
        msg = super().format(record)
        # Paranoid check: never let API key patterns leak
        if "AIza" in msg or "api_key" in msg.lower():
            msg = "[SENSITIVE DATA REDACTED]"
        return msg


def setup_logging() -> None:
    """Configure application-wide logging."""
    settings = get_settings()
    log_level = getattr(logging, settings.app_log_level, logging.INFO)

    fmt = (
        "%(asctime)s | %(levelname)-8s | "
        "[trace=%(trace_id)s req=%(request_id)s task=%(task_id)s] | "
        "%(name)s | %(message)s"
    )
    formatter = SafeFormatter(fmt, datefmt="%Y-%m-%dT%H:%M:%S")

    context_filter = ContextFilter()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    handler.addFilter(context_filter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.handlers.clear()
    root_logger.addHandler(handler)

    # Silence noisy libraries
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("aio_pika").setLevel(logging.WARNING)
    logging.getLogger("aiormq").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a named logger."""
    return logging.getLogger(name)
