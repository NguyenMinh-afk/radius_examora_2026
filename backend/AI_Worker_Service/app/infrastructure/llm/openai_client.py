"""
OpenAI API client with rate limiting, exponential backoff, and error mapping.
Uses openai SDK. Never logs API key.

Error mapping:
  HTTP 401 -> OpenAIInvalidKeyError      (fail immediately, no retry)
  HTTP 429 -> OpenAIRateLimitError       (retry with exponential backoff)
  HTTP 403 -> OpenAIPermissionError      (fail immediately, no retry)
  HTTP 400 -> OpenAIInvalidRequestError  (fail immediately, no retry)
  HTTP 404 -> OpenAIModelNotFoundError   (fail immediately, no retry)
  HTTP 5xx -> OpenAIError               (retry)
  Timeout  -> OpenAITimeoutError         (retry)
"""

import asyncio
import json
import re
import time
from typing import Any

from openai import APIStatusError, AsyncOpenAI, AuthenticationError, RateLimitError
from openai import Timeout as OpenAISDKTimeout

from app.core.config import get_settings
from app.core.exceptions import (
    OpenAIError,
    OpenAIInvalidKeyError,
    OpenAIInvalidRequestError,
    OpenAIModelNotFoundError,
    OpenAIPermissionError,
    OpenAIRateLimitError,
    OpenAITimeoutError,
)
from app.core.logging import get_logger

logger = get_logger(__name__)

# Global async lock + last-call timestamp for rate limiting
_rate_lock = asyncio.Lock()
_last_call_time: float = 0.0


def _extract_http_status(error_msg: str) -> int | None:
    """Extract HTTP status code from error message string."""
    match = re.search(r"\b(4\d{2}|5\d{2})\b", str(error_msg))
    if match:
        return int(match.group(1))
    return None


def _classify_openai_error(exc: Exception, model_name: str) -> OpenAIError:
    """
    Map a raw SDK exception to the correct OpenAIError subclass.
    """
    error_msg = str(exc)
    status = _extract_http_status(error_msg)

    logger.error(
        "OpenAI SDK error | http_status=%s | model=%s | raw=%s",
        status or "unknown",
        model_name,
        error_msg[:300],
    )

    if isinstance(exc, AuthenticationError) or status == 401:
        return OpenAIInvalidKeyError()
    elif isinstance(exc, RateLimitError) or status == 429:
        return OpenAIRateLimitError()
    elif status == 404:
        return OpenAIModelNotFoundError(model_name)
    elif isinstance(exc, AuthenticationError) or status == 403:
        return OpenAIPermissionError(error_msg[:200])
    elif isinstance(exc, (APIStatusError, ValueError)) or status == 400:
        return OpenAIInvalidRequestError(error_msg[:200])
    elif isinstance(exc, OpenAISDKTimeout):
        return OpenAITimeoutError()
    elif status and status >= 500:
        return OpenAIError(f"OpenAI server error (HTTP {status}): {error_msg[:200]}")
    else:
        return OpenAIError(f"OpenAI API error: {error_msg[:200]}")


# Errors that should NOT be retried
_NO_RETRY_ERRORS = (
    OpenAIInvalidKeyError,
    OpenAIPermissionError,
    OpenAIInvalidRequestError,
    OpenAIModelNotFoundError,
)


class OpenAIClient:
    """
    Async wrapper around the OpenAI SDK.

    Features:
    - Global rate limiter: ensures >= min_interval_seconds between calls
    - Correct error classification
    - Retry with exponential backoff only for 429 and 5xx
    - Fail-fast for 401, 403, 404, 400
    - JSON extraction and repair
    - Never logs the API key
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self.settings.validate_openai_key()
        self.client = AsyncOpenAI(
            api_key=self.settings.openai_api_key,
            base_url=self.settings.openai_api_base,
        )
        self.model_name = self.settings.openai_model
        self.max_retries = self.settings.gemini_max_retries
        self.timeout = self.settings.gemini_timeout_seconds
        self.min_interval = self.settings.gemini_min_interval_seconds
        self.max_output_tokens = self.settings.max_output_tokens
        logger.info(
            "OpenAIClient initialized | model=%s | base_url=%s | max_retries=%d | min_interval=%.1fs | max_output_tokens=%d",
            self.model_name,
            self.settings.openai_api_base,
            self.max_retries,
            self.min_interval,
            self.max_output_tokens,
        )

    async def _enforce_rate_limit(self) -> None:
        """Ensure at least min_interval seconds between consecutive OpenAI calls."""
        global _last_call_time
        async with _rate_lock:
            now = time.monotonic()
            elapsed = now - _last_call_time
            if elapsed < self.min_interval:
                wait = self.min_interval - elapsed
                logger.debug("Rate limiter: waiting %.2fs before OpenAI call", wait)
                await asyncio.sleep(wait)
            _last_call_time = time.monotonic()

    async def generate_questions(
        self,
        prompt: str,
        request_id: str | None = None,
        model_name: str | None = None,
    ) -> tuple[dict[str, Any], int]:
        """
        Call OpenAI and return (parsed JSON dict, question count).

        Args:
            prompt: The full prompt text to send.
            request_id: Used only for logging/tracing.
            model_name: Override the model for this call. If None, uses
                        self.model_name (from settings.openai_model).

        Retries only for transient errors (429, 5xx, timeout).
        Fails immediately for 401, 403, 404, 400.
        Returns:
            Tuple of (parsed dict, number of questions in response).
            q_count=0 means the model returned an empty/invalid response.
        """
        effective_model = model_name or self.model_name
        last_error: Exception | None = None

        for attempt in range(1, self.max_retries + 1):
            try:
                await self._enforce_rate_limit()

                logger.info(
                    "OpenAI call attempt %d/%d | model=%s | request_id=%s",
                    attempt,
                    self.max_retries,
                    effective_model,
                    request_id,
                )
                start = time.monotonic()
                raw_response = await self._call_api(prompt, effective_model)
                elapsed = time.monotonic() - start
                logger.info(
                    "OpenAI responded in %.2fs | request_id=%s",
                    elapsed,
                    request_id,
                )

                parsed = self._parse_json(raw_response)
                logger.info(
                    "OpenAI raw response | length=%d | preview='%s'",
                    len(raw_response) if raw_response else 0,
                    (raw_response[:500] if raw_response else "EMPTY"),
                )
                if parsed is not None:
                    try:
                        import json as _json
                        logger.info(
                            "OpenAI parsed content | json='%s'",
                            _json.dumps(parsed, ensure_ascii=False)[:1000],
                        )
                    except Exception:
                        logger.info("OpenAI parsed content | type=%s", type(parsed))
                    q_count = len(parsed.get("questions", []))
                    logger.info(
                        "OpenAI returned %d question(s) | request_id=%s",
                        q_count,
                        request_id,
                    )
                    return parsed, q_count

                raise OpenAIError(
                    "OpenAI returned invalid JSON."
                ) from None

            except _NO_RETRY_ERRORS as e:
                logger.error(
                    "OpenAI non-retryable error on attempt %d | error_code=%s | %s",
                    attempt,
                    getattr(e, "error_code", "UNKNOWN"),
                    str(e),
                )
                raise

            except OpenAIRateLimitError as e:
                last_error = e
                logger.warning(
                    "OpenAI rate limit (429) on attempt %d/%d | request_id=%s",
                    attempt,
                    self.max_retries,
                    request_id,
                )
                if attempt < self.max_retries:
                    await asyncio.sleep(2**attempt)

            except OpenAITimeoutError as e:
                last_error = e
                logger.warning(
                    "OpenAI timeout on attempt %d/%d | request_id=%s",
                    attempt,
                    self.max_retries,
                    request_id,
                )
                if attempt < self.max_retries:
                    await asyncio.sleep(2**attempt)

            except OpenAIError as e:
                last_error = e
                logger.warning(
                    "OpenAI error on attempt %d/%d | %s | request_id=%s",
                    attempt,
                    self.max_retries,
                    str(e),
                    request_id,
                )
                if attempt < self.max_retries:
                    await asyncio.sleep(2**attempt)

            except Exception as e:
                classified = _classify_openai_error(e, effective_model)
                if isinstance(classified, _NO_RETRY_ERRORS):
                    raise classified
                last_error = classified
                if attempt < self.max_retries:
                    wait = (
                        10 * (2 ** (attempt - 1))
                        if isinstance(classified, OpenAIRateLimitError)
                        else 2**attempt
                    )
                    await asyncio.sleep(wait)

        raise OpenAIError(
            f"OpenAI failed after {self.max_retries} attempts with model '{effective_model}'. "
            f"Last error: {last_error}"
        )

    async def _call_api(self, prompt: str, model_name: str | None = None) -> str:
        """Run OpenAI generation."""
        effective_model = model_name or self.model_name
        try:
            response = await self.client.chat.completions.create(
                model=effective_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert Vietnamese education question generator. Always respond with valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                max_tokens=self.max_output_tokens,
                temperature=0.7,
            )
            content = response.choices[0].message.content
            return content if content else ""
        except Exception as e:
            raise _classify_openai_error(e, effective_model) from e

    def _parse_json(self, raw: str) -> dict[str, Any] | None:
        """
        Try to extract and parse JSON from raw text.
        Handles markdown code blocks: ```json ... ```
        """
        if not raw or not raw.strip():
            return None
        text = raw.strip()

        fence_match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
        if fence_match:
            text = fence_match.group(1).strip()

        brace_match = re.search(r"\{[\s\S]+\}", text)
        if brace_match:
            text = brace_match.group(0)

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return None

    async def close(self) -> None:
        """Close the async client."""
        await self.client.close()
