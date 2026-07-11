"""
GeminiModelRouter — Orchestrates Gemini model selection with automatic fallback.

Strategy:
1. Build a candidate list: [primary_model] + [fallback_models from settings].
2. For each candidate:
   a. Check internal quota (per-model counter in ai_api_usage).
   b. If quota exhausted → log and skip (do not consume quota for skipped model).
   c. Call GeminiClient.generate_questions(model_name=candidate).
   d. On success  → log success, record quota usage, return result.
   e. On 429 / rate-limit from Gemini API → log, record usage, try next model.
   f. On config errors (404/403/400) → log warning, skip model (no quota spent).
3. If all candidates fail → raise GeminiAllModelsExhaustedError.

Design decisions:
- Each model's quota counter is completely independent. Model A being exhausted
  does NOT affect model B's remaining calls.
- ENABLE_MODEL_FALLBACK=false → only the primary model is tried (list of 1).
- Always logs: "Trying model", "Skipped model (quota)", "Rate-limited, next model",
  "Succeeded with model".
"""
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.application.services.quota_service import ApiQuotaService
from app.core.config import get_settings
from app.core.exceptions import (
    GeminiAllModelsExhaustedError,
    GeminiError,
    GeminiInvalidArgumentError,
    GeminiModelNotFoundError,
    GeminiPermissionError,
    GeminiRateLimitError,
)
from app.core.logging import get_logger
from app.infrastructure.llm.gemini_client import GeminiClient

logger = get_logger(__name__)

# Errors that mean the API key or model config is broken — skip the model but
# do NOT treat it as quota exhaustion. We still want fallback behaviour.
_SKIP_ERRORS = (GeminiModelNotFoundError, GeminiPermissionError, GeminiInvalidArgumentError)

# Errors that mean the model's rate/quota is temporarily exhausted.
_QUOTA_ERRORS = (GeminiRateLimitError,)

_QUOTA_ERROR_MARKERS = (
    "429",
    "resource_exhausted",
    "quota exceeded",
    "rate limit exceeded",
    "rpd exceeded",
    "rpm exceeded",
)


def _is_quota_or_rate_limit_error(exc: Exception) -> bool:
    """Return True when an exception represents Gemini quota/rate exhaustion."""
    if isinstance(exc, _QUOTA_ERRORS):
        return True
    message = str(exc).lower()
    return any(marker in message for marker in _QUOTA_ERROR_MARKERS)


class GeminiModelRouter:
    """
    Selects a Gemini model automatically, falling back through the candidate
    list when one model is quota-exhausted or rate-limited.

    Args:
        db: Async DB session used for per-model quota tracking.
        request_id: Trace ID for log correlation.
    """

    def __init__(self, db: AsyncSession, request_id: Optional[str] = None) -> None:
        self.db = db
        self.request_id = request_id
        self.settings = get_settings()
        self.quota_svc = ApiQuotaService(db)
        self.gemini_client = GeminiClient()

    @property
    def _model_candidates(self) -> List[str]:
        """Ordered, deduplicated list of Gemini model names to try."""
        return self.settings.gemini_model_candidates

    async def generate_with_fallback(
        self,
        prompt: str,
    ) -> Tuple[Dict[str, Any], str]:
        """
        Attempt Gemini generation, trying each candidate model in order.

        Returns:
            Tuple of (parsed_response_dict, model_name_that_succeeded).

        Raises:
            GeminiAllModelsExhaustedError: When every model is either quota-
                exhausted or rate-limited.
        """
        candidates = self._model_candidates
        tried_models: List[str] = []

        logger.info(
            "GeminiModelRouter | candidates=%s | request_id=%s",
            candidates,
            self.request_id,
        )

        for model_name in candidates:
            tried_models.append(model_name)

            # ── Step 1: Check internal quota for this model ────────────────
            has_quota = await self.quota_svc.can_call_model(model_name)
            if not has_quota:
                logger.warning(
                    "Model quota exhausted: %s, trying next model | request_id=%s",
                    model_name,
                    self.request_id,
                )
                continue

            # ── Step 2: Call Gemini with this model ────────────────────────
            logger.info(
                "Trying Gemini model: %s | request_id=%s",
                model_name,
                self.request_id,
            )

            try:
                result = await self.gemini_client.generate_questions(
                    prompt=prompt,
                    request_id=self.request_id,
                    model_name=model_name,
                )
                # ── Success ────────────────────────────────────────────────
                await self.quota_svc.record_call_model(model_name)
                logger.info(
                    "Gemini generation succeeded with model: %s | request_id=%s",
                    model_name,
                    self.request_id,
                )
                return result, model_name

            except _SKIP_ERRORS as exc:
                # Config/permission error — log, do NOT count against quota,
                # skip this model and try the next one.
                logger.warning(
                    "Skipping model %s due to config error (%s): %s | request_id=%s",
                    model_name,
                    type(exc).__name__,
                    str(exc)[:200],
                    self.request_id,
                )
                continue

            except _QUOTA_ERRORS:
                # Gemini's own rate-limit header — the actual call was consumed,
                # so we record it and move to the next model.
                await self.quota_svc.record_call_model(model_name)
                logger.warning(
                    "Model rate limited (429): %s, trying next model | request_id=%s",
                    model_name,
                    self.request_id,
                )
                continue

            except GeminiError as exc:
                if _is_quota_or_rate_limit_error(exc):
                    await self.quota_svc.record_call_model(model_name)
                    logger.warning(
                        "Model quota/rate exhausted: %s, trying next model | error=%s | request_id=%s",
                        model_name,
                        str(exc)[:200],
                        self.request_id,
                    )
                    continue

                # Other errors mean the request was already spent, but they
                # are not quota/model-selection problems. Do not fan out across
                # more models; preserve single-call behaviour and let the task
                # fail clearly.
                await self.quota_svc.record_call_model(model_name)
                logger.error(
                    "Gemini error on model %s: %s | not trying more models | request_id=%s",
                    model_name,
                    str(exc)[:200],
                    self.request_id,
                )
                raise

        # All models exhausted
        logger.error(
            "All Gemini models exhausted | tried=%s | request_id=%s",
            tried_models,
            self.request_id,
        )
        raise GeminiAllModelsExhaustedError(tried_models=tried_models)
