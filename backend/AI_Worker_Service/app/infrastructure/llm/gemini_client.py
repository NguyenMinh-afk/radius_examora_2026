"""
Gemini API client with rate limiting, exponential backoff, and correct error mapping.
Uses google-genai SDK. Never logs API key.

Error mapping:
  HTTP 404 -> GeminiModelNotFoundError  (fail immediately, no retry)
  HTTP 429 -> GeminiRateLimitError      (retry with exponential backoff)
  HTTP 403 -> GeminiPermissionError     (fail immediately, no retry)
  HTTP 400 -> GeminiInvalidArgumentError (fail immediately, no retry)
  HTTP 5xx -> GeminiError               (retry)
  Timeout  -> GeminiTimeoutError        (retry)
"""
import asyncio
import json
import re
import time
from typing import Any, Dict, Optional

from google import genai
from google.genai import types

from app.core.config import get_settings
from app.core.exceptions import (
    GeminiError,
    GeminiInvalidArgumentError,
    GeminiInvalidResponseError,
    GeminiModelNotFoundError,
    GeminiPermissionError,
    GeminiRateLimitError,
    GeminiTimeoutError,
)
from app.core.logging import get_logger

logger = get_logger(__name__)

# Global async lock + last-call timestamp for rate limiting
_rate_lock = asyncio.Lock()
_last_call_time: float = 0.0


def _extract_http_status(error_msg: str) -> Optional[int]:
    """Extract HTTP status code from error message string."""
    # Patterns: "404", "HTTP 404", "status 404", "code: 404", "ClientError 404"
    match = re.search(r"\b(4\d{2}|5\d{2})\b", str(error_msg))
    if match:
        return int(match.group(1))
    return None


def _classify_gemini_error(exc: Exception, model_name: str) -> GeminiError:
    """
    Map a raw SDK exception to the correct GeminiError subclass.
    NEVER maps 404 to rate limit.
    """
    error_msg = str(exc)
    status = _extract_http_status(error_msg)

    logger.error(
        "Gemini SDK error | http_status=%s | model=%s | raw=%s",
        status or "unknown",
        model_name,
        error_msg[:300],
    )

    if status == 404:
        return GeminiModelNotFoundError(model_name)
    elif (
        status == 429
        or "RESOURCE_EXHAUSTED" in error_msg.upper()
        or "quota exceeded" in error_msg.lower()
        or "rate limit exceeded" in error_msg.lower()
        or "rpd exceeded" in error_msg.lower()
        or "rpm exceeded" in error_msg.lower()
    ):
        return GeminiRateLimitError()
    elif status == 403 or "PERMISSION_DENIED" in error_msg.upper():
        return GeminiPermissionError(error_msg[:200])
    elif status == 400 or "INVALID_ARGUMENT" in error_msg.upper():
        return GeminiInvalidArgumentError(error_msg[:200])
    elif status and status >= 500:
        return GeminiError(f"Gemini server error (HTTP {status}): {error_msg[:200]}")
    else:
        return GeminiError(f"Gemini API error: {error_msg[:200]}")


# Errors that should NOT be retried
_NO_RETRY_ERRORS = (
    GeminiModelNotFoundError,
    GeminiPermissionError,
    GeminiInvalidArgumentError,
    GeminiInvalidResponseError,
)


class GeminiClient:
    """
    Async wrapper around the google-genai SDK.

    Features:
    - Global rate limiter: ensures >= min_interval_seconds between calls
    - Correct error classification: never confuses 404 with rate limit
    - Retry with exponential backoff only for 429 and 5xx
    - Fail-fast for 404, 403, 400
    - JSON extraction and repair
    - Never logs the API key
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self.settings.validate_gemini_key()
        self.client = genai.Client(api_key=self.settings.gemini_api_key)
        self.model_name = self.settings.gemini_model  # default model
        self.max_retries = self.settings.gemini_max_retries
        self.timeout = self.settings.gemini_timeout_seconds
        self.min_interval = self.settings.gemini_min_interval_seconds
        self._config = types.GenerateContentConfig(
            temperature=0.7,
            top_p=0.95,
            top_k=40,
            response_mime_type="application/json",
            max_output_tokens=self.settings.max_output_tokens,
        )
        logger.info(
            "GeminiClient initialized | model=%s | max_retries=%d | min_interval=%.1fs | max_output_tokens=%d",
            self.model_name,
            self.max_retries,
            self.min_interval,
            self.settings.max_output_tokens,
        )

    async def _enforce_rate_limit(self) -> None:
        """Ensure at least min_interval seconds between consecutive Gemini calls."""
        global _last_call_time
        async with _rate_lock:
            now = time.monotonic()
            elapsed = now - _last_call_time
            if elapsed < self.min_interval:
                wait = self.min_interval - elapsed
                logger.debug("Rate limiter: waiting %.2fs before Gemini call", wait)
                await asyncio.sleep(wait)
            _last_call_time = time.monotonic()

    async def generate_questions(
        self,
        prompt: str,
        request_id: Optional[str] = None,
        model_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Call Gemini and return parsed JSON dict.

        Args:
            prompt: The full prompt text to send.
            request_id: Used only for logging/tracing.
            model_name: Override the model for this call. If None, uses
                        self.model_name (from settings.gemini_model).

        Retries only for transient errors (429, 5xx, timeout).
        Fails immediately for 404, 403, 400.
        """
        effective_model = model_name or self.model_name
        last_error: Optional[Exception] = None

        for attempt in range(1, self.max_retries + 1):
            try:
                await self._enforce_rate_limit()

                logger.info(
                    "Gemini call attempt %d/%d | model=%s | request_id=%s",
                    attempt,
                    self.max_retries,
                    effective_model,
                    request_id,
                )
                start = time.monotonic()
                raw_response = await self._call_api(prompt, effective_model)
                elapsed = time.monotonic() - start
                logger.info(
                    "Gemini responded in %.2fs | request_id=%s",
                    elapsed,
                    request_id,
                )

                # First parse attempt
                parsed = self._parse_json(raw_response)
                if parsed is not None:
                    q_count = len(parsed.get("questions", []))
                    logger.info(
                        "Gemini returned %d question(s) | request_id=%s",
                        q_count,
                        request_id,
                    )
                    return parsed

                raise GeminiInvalidResponseError(
                    "Gemini returned invalid JSON. No repair call was made to preserve single-call mode."
                )

            except _NO_RETRY_ERRORS as e:
                # These errors must not be retried
                logger.error(
                    "Gemini non-retryable error on attempt %d | error_code=%s | %s",
                    attempt,
                    getattr(e, "error_code", "UNKNOWN"),
                    str(e),
                )
                raise

            except GeminiRateLimitError as e:
                last_error = e
                logger.warning(
                    "Gemini rate limit (429) on attempt %d/%d | switching model via router | request_id=%s",
                    attempt,
                    self.max_retries,
                    request_id,
                )
                raise

            except GeminiTimeoutError as e:
                last_error = e
                logger.warning(
                    "Gemini timeout on attempt %d/%d | request_id=%s",
                    attempt,
                    self.max_retries,
                    request_id,
                )
                if attempt < self.max_retries:
                    await asyncio.sleep(2 ** attempt)

            except GeminiError as e:
                # Other GeminiErrors (5xx etc.) — retry
                last_error = e
                logger.warning(
                    "Gemini error on attempt %d/%d | %s | request_id=%s",
                    attempt,
                    self.max_retries,
                    str(e),
                    request_id,
                )
                if attempt < self.max_retries:
                    await asyncio.sleep(2 ** attempt)

            except Exception as e:
                # Classify unknown SDK errors
                classified = _classify_gemini_error(e, effective_model)
                if isinstance(classified, _NO_RETRY_ERRORS):
                    raise classified
                last_error = classified
                if attempt < self.max_retries:
                    wait = 10 * (2 ** (attempt - 1)) if isinstance(classified, GeminiRateLimitError) else 2 ** attempt
                    await asyncio.sleep(wait)

        raise GeminiError(
            f"Gemini failed after {self.max_retries} attempts with model '{effective_model}'. "
            f"Last error: {last_error}"
        )

    async def _call_api(self, prompt: str, model_name: Optional[str] = None) -> str:
        """Run Gemini generation in a thread pool to keep async non-blocking."""
        effective_model = model_name or self.model_name
        loop = asyncio.get_running_loop()
        try:
            response = await asyncio.wait_for(
                loop.run_in_executor(None, self._sync_generate, prompt, effective_model),
                timeout=self.timeout,
            )
            return response
        except asyncio.TimeoutError:
            raise GeminiTimeoutError()
        except Exception as e:
            raise _classify_gemini_error(e, effective_model) from e

    def _sync_generate(self, prompt: str, model_name: Optional[str] = None) -> str:
        """Synchronous Gemini call (runs in executor)."""
        effective_model = model_name or self.model_name
        response = self.client.models.generate_content(
            model=effective_model,
            contents=prompt,
            config=self._config,
        )
        return response.text

    def _parse_json(self, raw: str) -> Optional[Dict[str, Any]]:
        """
        Try to extract and parse JSON from raw text.
        Handles markdown code blocks: ```json ... ```
        """
        if not raw or not raw.strip():
            return None
        text = raw.strip()

        # Strip markdown code fences if present
        fence_match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
        if fence_match:
            text = fence_match.group(1).strip()

        # Find first { ... } block
        brace_match = re.search(r"\{[\s\S]+\}", text)
        if brace_match:
            text = brace_match.group(0)

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return None

    async def _repair_json(self, broken_json: str) -> str:
        """Ask Gemini to fix its own broken JSON output."""
        repair_prompt = (
            "The following text is supposed to be valid JSON matching this schema:\n"
            '{"questions": [{"question_content": "...", "options": {"A":"...","B":"...","C":"...","D":"..."}, '
            '"correct_answer": "A|B|C|D", "difficulty": "easy|medium|hard|very_hard", '
            '"topic": "...", "explanation": "..."}]}\n\n'
            "Please fix any syntax errors and return ONLY the corrected JSON. "
            "Do not add any explanation or markdown.\n\n"
            f"BROKEN JSON:\n{broken_json[:3000]}"
        )
        loop = asyncio.get_running_loop()
        try:
            await self._enforce_rate_limit()
            return await asyncio.wait_for(
                loop.run_in_executor(None, self._sync_generate, repair_prompt),
                timeout=30,
            )
        except Exception:
            return broken_json  # Return original if repair itself fails
