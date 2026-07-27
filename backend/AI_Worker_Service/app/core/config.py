"""
Application configuration using Pydantic v2 Settings.
Loads from .env file automatically.
"""

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _running_in_docker() -> bool:
    import os

    if os.path.exists("/.dockerenv"):
        return True
    try:
        if "docker" in open("/proc/1/cgroup").read():
            return True
    except Exception:
        pass
    return False


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ---
    app_env: str = Field(default="development")
    app_host: str = Field(default="0.0.0.0")
    app_port: int = Field(default=8000)
    app_debug: bool = Field(default=False)
    app_log_level: str = Field(default="INFO")

    # --- Database ---
    database_url: str = Field(
        default="postgresql+asyncpg://ai_user:ai_password@localhost:5432/ai_service_db"
    )
    # Database connection pool tuning
    db_pool_size: int = Field(default=20, ge=5, le=100)
    db_max_overflow: int = Field(default=30, ge=0, le=50)
    db_pool_timeout: int = Field(default=30, ge=5)
    db_pool_recycle: int = Field(default=3600, ge=300)

    # --- Gemini API ---
    gemini_api_key: str | None = Field(default=None)
    gemini_model: str = Field(default="gemini-3.1-flash-lite")
    gemini_timeout_seconds: int = Field(default=120)
    gemini_max_retries: int = Field(default=3)
    gemini_min_interval_seconds: float = Field(default=6.0)

    # --- RabbitMQ ---
    use_rabbitmq: bool = Field(default=False)
    rabbitmq_url: str = Field(default="amqp://guest:guest@localhost:5672/")
    rabbitmq_exchange: str = Field(default="examora.topic")
    rabbitmq_routing_key: str = Field(default="ai.generate")
    rabbitmq_queue: str = Field(default="ai.generation")
    rabbitmq_dlx: str = Field(default="examora.dlx")
    rabbitmq_dlq: str = Field(default="ai.generation.dlq")
    rabbitmq_max_retries: int = Field(default=3)
    rabbitmq_reconnect_interval_seconds: float = Field(default=5.0, gt=0)
    rabbitmq_consumer_restart_base_delay_seconds: float = Field(default=1.0, gt=0)
    rabbitmq_consumer_restart_max_delay_seconds: float = Field(default=30.0, gt=0)
    # Performance tuning
    rabbitmq_prefetch_count: int = Field(default=5, ge=1, le=50)
    rabbitmq_queue_max_length: int = Field(default=1000, ge=100)
    rabbitmq_overflow_policy: str = Field(default="reject-publish")

    # --- Text Processing ---
    chunk_size: int = Field(default=6000)
    chunk_overlap: int = Field(default=500)

    # --- Gemini Quota (Free Tier safety) ---
    gemini_daily_request_limit: int = Field(default=18)
    enable_local_fallback: bool = Field(default=True)
    local_fallback_when_quota_exceeded: bool = Field(default=True)
    max_questions_per_task: int = Field(default=50)

    # --- Gemini Model Fallback ---
    gemini_fallback_models: str = Field(
        default="gemini-2.5-flash,gemini-3.5-flash,gemini-3-flash,gemini-2.5-flash-lite"
    )
    enable_model_fallback: bool = Field(default=True)

    # --- Single-call Strategy ---
    max_single_call_context_chars: int = Field(default=120000)
    max_merged_context_chars: int = Field(default=120000)
    max_output_tokens: int = Field(default=32768)

    # --- Topic Detection ---
    auto_detect_topic: bool = Field(default=True)
    topic_catalog_path: str = Field(
        default="app/application/resources/topic_catalog.json"
    )
    topic_mismatch_override: bool = Field(default=True)
    min_topic_confidence: float = Field(default=0.75)
    topic_detection_max_chars: int = Field(default=8000)

    # --- Course/Subject Auto-Resolve ---
    auto_resolve_course_subject_from_topic: bool = Field(default=True)
    default_course_name: str = Field(default="Khóa học mặc định")
    default_subject_name: str | None = Field(default=None)
    use_topic_as_subject_name: bool = Field(default=True)
    use_topic_as_course_name: bool = Field(default=False)

    # --- File Upload ---
    max_file_size_mb: int = Field(default=20)
    raw_upload_dir: str = Field(default="./data/raw")

    # --- OCR ---
    enable_ocr: bool = Field(default=True)
    ocr_provider: str = Field(default="auto")
    ocr_language: str = Field(default="vie+eng")
    ocr_dpi: int = Field(default=150)
    ocr_max_pages: int = Field(default=20)
    ocr_min_text_length: int = Field(default=100)
    tesseract_cmd: str = Field(default="")
    poppler_path: str = Field(default="")
    ocr_space_api_key: str | None = Field(default=None)
    ocr_space_endpoint: str = Field(default="https://api.ocr.space/parse/image")
    ocr_space_language: str = Field(default="eng")
    ocr_space_engine: int = Field(default=2)
    ocr_space_detect_orientation: bool = Field(default=True)
    ocr_space_scale: bool = Field(default=True)
    ocr_space_is_table: bool = Field(default=True)
    ocr_space_timeout_seconds: int = Field(default=60)
    ocr_space_max_file_mb: int = Field(default=1)
    ocr_space_max_pdf_pages: int = Field(default=3)
    ocr_space_daily_request_limit: int = Field(default=500)
    ocr_space_hourly_request_limit: int = Field(default=180)
    ocr_space_monthly_request_limit: int = Field(default=25000)

    @field_validator("app_log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        upper = v.upper()
        if upper not in allowed:
            raise ValueError(f"log_level must be one of {allowed}")
        return upper

    def __init__(self, **kwargs):
        import os

        env_file = os.environ.get("ENV_FILE")
        if not env_file:
            base_dir = os.path.dirname(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            )
            if (
                os.path.exists(os.path.join(base_dir, ".env.docker"))
                and _running_in_docker()
            ):
                env_file = os.path.join(base_dir, ".env.docker")
            else:
                env_file = os.path.join(base_dir, ".env")
        super().__init__(_env_file=env_file, **kwargs)

    @field_validator("ocr_provider")
    @classmethod
    def validate_ocr_provider(cls, v: str) -> str:
        normalized = (v or "auto").strip().lower()
        allowed = {"local", "ocr_space", "auto"}
        if normalized not in allowed:
            raise ValueError(f"ocr_provider must be one of {allowed}")
        return normalized

    @field_validator(
        "ocr_dpi",
        "ocr_max_pages",
        "ocr_min_text_length",
        "ocr_space_timeout_seconds",
        "ocr_space_max_file_mb",
        "ocr_space_max_pdf_pages",
        "ocr_space_daily_request_limit",
        "ocr_space_hourly_request_limit",
        "ocr_space_monthly_request_limit",
    )
    @classmethod
    def validate_positive_ocr_numbers(cls, v: int) -> int:
        if v < 1:
            raise ValueError("OCR numeric settings must be positive integers")
        return v

    @field_validator("ocr_space_engine")
    @classmethod
    def validate_ocr_space_engine(cls, v: int) -> int:
        if v not in {1, 2, 3}:
            raise ValueError("OCR_SPACE_ENGINE must be 1, 2, or 3")
        return v

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def has_ocr_space_key(self) -> bool:
        return bool((self.ocr_space_api_key or "").strip())

    @property
    def ocr_space_model_name(self) -> str:
        return f"engine_{self.ocr_space_engine}"

    @property
    def gemini_model_candidates(self) -> list[str]:
        """
        Return an ordered, deduplicated list of Gemini model names to try.

        The primary model (gemini_model) is always first. Fallback models
        follow in the order specified by gemini_fallback_models. Duplicates
        are removed while preserving order.
        """
        candidates: list[str] = [self.gemini_model]
        if self.enable_model_fallback and self.gemini_fallback_models:
            for model in self.gemini_fallback_models.split(","):
                name = model.strip()
                if name and name not in candidates:
                    candidates.append(name)
        return candidates

    def validate_gemini_key(self) -> None:
        """Raise ValueError if Gemini API key is missing."""
        if (
            not self.gemini_api_key
            or self.gemini_api_key == "PASTE_YOUR_GEMINI_API_KEY_HERE"
        ):
            raise ValueError(
                "GEMINI_API_KEY is not configured. "
                "Please set it in your .env file. "
                "Get your key at: https://aistudio.google.com/app/apikey"
            )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
