"""
Mock LLM Provider for architecture benchmarking.

This provider simulates AI generation WITHOUT calling real Gemini API.
Used to benchmark RabbitMQ + Worker + DB architecture performance.

Key behaviors:
- Simulates configurable latency (mock_llm_latency_ms)
- Returns properly formatted question data matching the real API format
- Does NOT affect Gemini quota
"""

import asyncio
import random
from typing import Any

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class MockLLMProvider:
    """
    Mock LLM provider that simulates AI question generation.

    Features:
    - Configurable latency (50-500ms recommended for realistic benchmarks)
    - Returns properly formatted JSON matching Gemini response format
    - Generates quantity questions as requested
    - Tracks mock calls in log for debugging

    Usage:
        provider = MockLLMProvider()
        result, count = await provider.generate_questions(
            prompt="...",
            request_id="xxx",
            model_name="mock"
        )
    """

    def __init__(self, latency_ms: int | None = None) -> None:
        settings = get_settings()
        self.latency_ms = latency_ms or settings.mock_llm_latency_ms
        logger.info(
            "MockLLMProvider initialized | latency_ms=%d",
            self.latency_ms,
        )

    async def generate_questions(
        self,
        prompt: str,
        request_id: str | None = None,
        model_name: str | None = None,
        quantity: int = 3,
        difficulty: str = "medium",
    ) -> tuple[dict[str, Any], int]:
        """
        Generate mock questions with simulated latency.

        Args:
            prompt: The prompt text (ignored in mock, used for interface compatibility)
            request_id: Trace ID for logging
            model_name: Model name (ignored in mock)
            quantity: Number of questions to generate
            difficulty: Difficulty level (easy/medium/hard/very_hard)

        Returns:
            Tuple of (parsed dict matching Gemini response format, question count)
        """
        logger.info(
            "MockLLM generating %d questions | latency=%dms | request_id=%s",
            quantity,
            self.latency_ms,
            request_id,
        )

        # Simulate processing latency
        await asyncio.sleep(self.latency_ms / 1000)

        # Generate mock questions with varied content
        questions = []
        difficulties = ["easy", "medium", "hard", "very_hard"]
        difficulties_for_questions = [
            difficulty,
            random.choice(difficulties),
            random.choice(difficulties),
        ]

        for i in range(quantity):
            q_difficulty = difficulties_for_questions[i % len(difficulties_for_questions)]
            questions.append({
                "question_content": f"Mock question {i + 1}: Sample question based on prompt topic?",
                "options": {
                    "A": "First option (correct answer)",
                    "B": "Second option",
                    "C": "Third option",
                    "D": "Fourth option",
                },
                "correct_answer": random.choice(["A", "B", "C", "D"]),
                "difficulty": q_difficulty,
                "topic": "Mock Topic",
                "explanation": f"This is a mock explanation for question {i + 1}. In production, Gemini would generate a real explanation.",
            })

        result = {"questions": questions}

        logger.info(
            "MockLLM completed | generated=%d questions | latency=%dms | request_id=%s",
            quantity,
            self.latency_ms,
            request_id,
        )

        return result, quantity
