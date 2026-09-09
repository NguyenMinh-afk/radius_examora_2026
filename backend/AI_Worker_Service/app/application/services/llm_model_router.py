"""
LLM Model Router — Gemini-only router with Mock support for benchmarking.

Strategy:
1. If enable_mock_llm=True: use MockLLMProvider (for benchmark)
2. Gemini with model fallback list.
3. Final fallback to local question generator (CPU-only).

Provider Priority:
- Mock: MockLLMProvider (benchmark mode)
- Primary: Gemini with model fallback chain
- Final: Local CPU-based generator
"""

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.application.services.local_question_generator import LocalQuestionGenerator
from app.application.services.quota_service import ApiQuotaService
from app.core.config import get_settings
from app.core.exceptions import (
    GeminiError,
    GeminiInvalidArgumentError,
    GeminiModelNotFoundError,
    GeminiPermissionError,
    GeminiRateLimitError,
)
from app.core.logging import get_logger
from app.infrastructure.llm.gemini_client import GeminiClient
from app.infrastructure.llm.mock_llm_provider import MockLLMProvider

logger = get_logger(__name__)

# Gemini errors that mean config/permission is broken — skip model
_GEMINI_SKIP_ERRORS = (
    GeminiModelNotFoundError,
    GeminiPermissionError,
    GeminiInvalidArgumentError,
)

# Gemini errors that mean rate/quota exhausted
_GEMINI_QUOTA_ERRORS = (GeminiRateLimitError,)


def _is_gemini_quota_error(exc: Exception) -> bool:
    if isinstance(exc, _GEMINI_QUOTA_ERRORS):
        return True
    message = str(exc).lower()
    return any(
        m in message
        for m in ("429", "resource_exhausted", "quota exceeded", "rate limit exceeded")
    )


class LLMModelRouter:
    """
    Model router supporting Mock (benchmark) and Gemini (production).

    Usage:
        router = LLMModelRouter(db, request_id="xxx")
        result, provider, model = await router.generate_with_fallback(prompt)

    Args:
        db: Async DB session for quota tracking.
        request_id: Trace ID for logging.
    """

    def __init__(self, db: AsyncSession, request_id: str | None = None) -> None:
        self.db = db
        self.request_id = request_id
        self.settings = get_settings()
        self.quota_svc = ApiQuotaService(db)

        # Initialize providers based on config
        if self.settings.enable_mock_llm:
            self._mock_provider = MockLLMProvider()
            logger.info(
                "LLMModelRouter initialized in MOCK mode | latency_ms=%d | request_id=%s",
                self.settings.mock_llm_latency_ms,
                request_id,
            )
        else:
            self._mock_provider = None
            self.gemini_client = GeminiClient()

        self._local_generator = LocalQuestionGenerator()

    @property
    def _gemini_candidates(self) -> list[str]:
        """Ordered list of Gemini models to try."""
        return self.settings.gemini_model_candidates

    async def generate_with_fallback(
        self,
        prompt: str,
        context: str | None = None,
        topic: str | None = None,
        quantity: int = 5,
        difficulty: str = "medium",
    ) -> tuple[dict[str, Any], str, str]:
        """
        Attempt generation with provider priority.

        Priority:
        1. Mock LLM (if enable_mock_llm=True) - for benchmark mode
        2. Gemini with model fallback chain
        3. Local CPU generator (final fallback)

        Returns:
            Tuple of (parsed_response_dict, provider_name, model_name)

        Raises:
            Exception: When all providers fail.
        """
        # ── Step 0: Mock LLM (benchmark mode) ───────────────────────────────
        if self.settings.enable_mock_llm and self._mock_provider:
            logger.info(
                "Using MockLLMProvider | latency=%dms | request_id=%s",
                self.settings.mock_llm_latency_ms,
                self.request_id,
            )
            try:
                result, q_count = await self._mock_provider.generate_questions(
                    prompt=prompt,
                    request_id=self.request_id,
                    quantity=quantity,
                    difficulty=difficulty,
                )
                if q_count > 0:
                    logger.info(
                        "MockLLM succeeded | questions=%d | request_id=%s",
                        q_count,
                        self.request_id,
                    )
                    return result, "mock", "mock_llm"
            except Exception as exc:
                logger.warning(
                    "MockLLM failed: %s | falling back to Gemini | request_id=%s",
                    str(exc)[:200],
                    self.request_id,
                )

        # ── Step 1: Try Gemini with model fallback ──────────────────────────
        if self.settings.gemini_api_key:
            tried_models: list[str] = []
            for model_name in self._gemini_candidates:
                tried_models.append(model_name)

                has_quota = await self.quota_svc.can_call_model(model_name)
                if not has_quota:
                    logger.warning(
                        "Gemini model quota exhausted: %s | trying next | request_id=%s",
                        model_name,
                        self.request_id,
                    )
                    continue

                try:
                    result, q_count = await self.gemini_client.generate_questions(
                        prompt=prompt,
                        request_id=self.request_id,
                        model_name=model_name,
                    )
                    if q_count > 0:
                        await self.quota_svc.record_call_model(model_name)
                        logger.info(
                            "Gemini generation succeeded | model=%s | questions=%d | request_id=%s",
                            model_name,
                            q_count,
                            self.request_id,
                        )
                        return result, "gemini", model_name

                    # Empty response
                    await self.quota_svc.record_call_model(model_name)
                    logger.warning(
                        "Gemini model returned 0 questions: %s | trying next | request_id=%s",
                        model_name,
                        self.request_id,
                    )
                    continue

                except _GEMINI_SKIP_ERRORS as exc:
                    logger.warning(
                        "Skipping Gemini model %s due to config error: %s | request_id=%s",
                        model_name,
                        str(exc)[:200],
                        self.request_id,
                    )
                    continue

                except GeminiRateLimitError:
                    await self.quota_svc.record_call_model(model_name)
                    logger.warning(
                        "Gemini rate limited: %s | trying next model | request_id=%s",
                        model_name,
                        self.request_id,
                    )
                    continue

                except GeminiError as exc:
                    if _is_gemini_quota_error(exc):
                        await self.quota_svc.record_call_model(model_name)
                        logger.warning(
                            "Gemini quota exhausted: %s | trying next model | request_id=%s",
                            str(exc)[:200],
                            self.request_id,
                        )
                        continue
                    await self.quota_svc.record_call_model(model_name)
                    logger.error(
                        "Gemini error (not quota): %s | not trying more models | request_id=%s",
                        str(exc)[:200],
                        self.request_id,
                    )
                    raise

            logger.error(
                "All Gemini models exhausted | tried=%s | request_id=%s",
                tried_models,
                self.request_id,
            )

        # ── Step 2: Local CPU fallback (final) ─────────────────────────────
        logger.info(
            "Using local CPU fallback for question generation | request_id=%s",
            self.request_id,
        )
        if context and topic:
            questions = self._local_generator.generate(
                context=context,
                quantity=quantity,
                topic=topic,
                difficulty=difficulty,
            )
            if questions:
                result = {"questions": questions}
                logger.info(
                    "Local generator produced %d questions | request_id=%s",
                    len(questions),
                    self.request_id,
                )
                return result, "local", "local_fallback"

        # All providers failed
        raise Exception(f"All LLM providers failed for request_id={self.request_id}")

    async def close(self) -> None:
        """Clean up resources."""
        pass
