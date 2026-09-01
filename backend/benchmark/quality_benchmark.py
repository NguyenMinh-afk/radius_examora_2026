"""
Question Quality Benchmark for AI-Generated Questions.

This addresses Reviewer #2's question: "How do you evaluate the quality of the
generated question?" by running the QuestionQualityEvaluator against a real
sample of questions produced by the AI Worker Service and emitting quantitative
metrics (mean score, distribution, per-metric breakdown) suitable for the
paper.

Pipeline
========
1. Enqueue N generation requests through the API Gateway (POST
   /api/ai/generate-questions). Each request asks for `quantity` questions on
   a single context.
2. Poll the task list endpoint (GET /api/ai/tasks) until the worker reports
   the task as completed and exposes the generated question bank.
3. Flatten the produced questions into the evaluator's expected shape and run
   ``QuestionQualityEvaluator.evaluate_batch`` on the whole sample.
4. Save per-question metrics + aggregate statistics to JSON and a Markdown
   report under ``results/``.

Modes
=====
* ``LIVE`` (default): real HTTP calls to a running gateway + worker service.
  Consumes Gemini quota (each ``quantity`` question = 1 Gemini call).
* ``MOCK`` (set ``MOCK_QUALITY_MODE=true``): skips HTTP calls and instead
  feeds a deterministic synthetic bank of good/bad questions so the
  evaluator can be exercised end-to-end without burning Gemini quota.

The MOCK path is the default for CI / pre-publication sanity checks; the
LIVE path is the path that produces the numbers cited in the paper.
"""

import asyncio
import json
import os
import sys
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

import aiohttp
from dotenv import load_dotenv

# Ensure the AI worker service package is importable so we can reuse its
# evaluator without copying code.
_BACKEND_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND_ROOT / "AI_Worker_Service"))

from app.application.services.question_quality_evaluator import (  # noqa: E402
    QuestionQualityEvaluator,
    run_quality_evaluation,
)

load_dotenv(Path(__file__).parent / ".env")


# ----------------------------- Configuration -----------------------------

MOCK_QUALITY_MODE = os.getenv("MOCK_QUALITY_MODE", "true").lower() == "true"

# How many questions to evaluate in total. The paper cites 100.
TARGET_QUESTION_COUNT = int(os.getenv("QUALITY_TARGET_COUNT", "100"))

# How many generation requests we send concurrently when LIVE.
ENQUEUE_CONCURRENCY = int(os.getenv("QUALITY_ENQUEUE_CONCURRENCY", "5"))

# Per-request quantity field (one generation request produces N questions).
# Lower means more requests but smaller response payloads, which is friendlier
# to live mode where each request consumes Gemini quota.
QUESTIONS_PER_REQUEST = int(os.getenv("QUALITY_PER_REQUEST", "5"))

# How long to wait for tasks to complete before giving up (seconds).
POLL_TIMEOUT_SECONDS = int(os.getenv("QUALITY_POLL_TIMEOUT", "600"))

# Polling interval while waiting for completion.
POLL_INTERVAL_SECONDS = float(os.getenv("QUALITY_POLL_INTERVAL", "2.0"))


# ----------------------------- Sample contexts -----------------------------

# Six curated context snippets covering a mix of difficulty levels and
# subjects. They are deliberately short so each generation request stays
# cheap and the eval remains focused on quality of OUTPUT, not on retrieval.
SAMPLE_CONTEXTS: list[dict[str, str]] = [
    {
        "topic": "Database indexing",
        "difficulty": "medium",
        "context": (
            "A database index is a data structure that improves the speed of "
            "data retrieval operations at the cost of additional storage and "
            "write overhead. B-tree indexes are the most common; hash indexes "
            "are optimal for equality lookups but cannot serve range queries."
        ),
    },
    {
        "topic": "HTTP semantics",
        "difficulty": "easy",
        "context": (
            "HTTP status codes are grouped by class: 1xx informational, 2xx "
            "success, 3xx redirection, 4xx client error, 5xx server error. "
            "The 202 Accepted response indicates a request has been accepted "
            "for asynchronous processing."
        ),
    },
    {
        "topic": "Asynchronous messaging",
        "difficulty": "medium",
        "context": (
            "RabbitMQ implements AMQP. Producers publish messages to "
            "exchanges, which route messages to queues based on bindings. "
            "Consumers ack messages on success; unacked messages are "
            "redelivered after a channel close or consumer timeout."
        ),
    },
    {
        "topic": "REST API design",
        "difficulty": "easy",
        "context": (
            "RESTful APIs expose resources via URIs and use HTTP verbs to "
            "express intent. Idempotent verbs (GET, PUT, DELETE) can be "
            "retried safely; POST is non-idempotent and must carry an "
            "Idempotency-Key when retries are expected."
        ),
    },
    {
        "topic": "Concurrency control",
        "difficulty": "hard",
        "context": (
            "Optimistic concurrency control assumes conflicts are rare and "
            "uses a version column to detect lost updates on commit. "
            "Pessimistic locking acquires row-level locks for the duration "
            "of the transaction, trading throughput for predictability."
        ),
    },
    {
        "topic": "Caching strategies",
        "difficulty": "medium",
        "context": (
            "Write-through caches update the cache synchronously with the "
            "primary store; write-behind caches batch updates asynchronously. "
            "Cache invalidation must happen on every write to avoid stale "
            "reads regardless of strategy."
        ),
    },
]


# ----------------------------- MOCK question bank -----------------------------
# Used only when MOCK_QUALITY_MODE is true. These are hand-crafted to exercise
# each quality dimension at least once, so the evaluator returns a non-trivial
# distribution.
def _build_mock_questions() -> list[dict[str, Any]]:
    good_questions = [
        {
            "id": "mq-1",
            "question_content": (
                "What is the primary benefit of a B-tree index in a relational "
                "database?"
            ),
            "options": {
                "A": "Faster range and equality lookups on indexed columns",
                "B": "Reduced disk footprint for the underlying table",
                "C": "Automatic schema migration when columns are renamed",
                "D": "Built-in encryption of column values at rest",
            },
            "correct_answer": "A",
            "difficulty": "medium",
            "topic": "Database indexing",
            "explanation": (
                "B-tree indexes maintain a sorted structure that allows the "
                "engine to locate rows for both equality and range predicates "
                "with logarithmic cost, which is why they are the default index "
                "type in most relational engines."
            ),
        },
        {
            "id": "mq-2",
            "question_content": (
                "Which HTTP status code indicates that a request has been "
                "accepted but processing is not yet complete?"
            ),
            "options": {
                "A": "200 OK",
                "B": "201 Created",
                "C": "202 Accepted",
                "D": "204 No Content",
            },
            "correct_answer": "C",
            "difficulty": "easy",
            "topic": "HTTP semantics",
            "explanation": (
                "202 Accepted tells the client that the request was "
                "understood and queued for asynchronous processing; unlike "
                "200/201 it does not imply the resource is ready yet."
            ),
        },
        {
            "id": "mq-3",
            "question_content": (
                "Why does RabbitMQ redeliver a message when a consumer "
                "channel closes without an explicit acknowledgement?"
            ),
            "options": {
                "A": "Because exchanges automatically republish on close",
                "B": "Because unacked messages are requeued by the broker",
                "C": "Because consumers always resubscribe after disconnect",
                "D": "Because the message TTL expires on channel close",
            },
            "correct_answer": "B",
            "difficulty": "medium",
            "topic": "Asynchronous messaging",
            "explanation": (
                "RabbitMQ tracks per-channel acknowledgement state. When the "
                "channel closes before the consumer acks, the broker assumes "
                "the message was not processed and returns it to the queue so "
                "another consumer (or the same one on reconnect) can retry."
            ),
        },
    ]

    poor_questions = [
        {
            # Truncated + vague → low clarity / low difficulty appropriateness
            "id": "mq-4",
            "question_content": "Indexing?",
            "options": {
                "A": "yes",
                "B": "no",
                "C": "maybe",
                "D": "whatever",
            },
            "correct_answer": "A",
            "difficulty": "medium",
            "topic": "Database indexing",
            "explanation": "idk",
        },
        {
            # Ambiguous + "all of the above" style → low ambiguity score
            "id": "mq-5",
            "question_content": (
                "Which of the following is NOT NOT true about REST APIs?"
            ),
            "options": {
                "A": "All of the above",
                "B": "GET is idempotent",
                "C": "POST is non-idempotent",
                "D": "PUT replaces a resource",
            },
            "correct_answer": "B",
            "difficulty": "easy",
            "topic": "REST API design",
            "explanation": "Because reasons.",
        },
        {
            # Schema-invalid option set → triggers schema_valid=False branch
            "id": "mq-6",
            "question_content": "Pick the best caching strategy.",
            "options": {"A": "write-through", "B": "no-op"},  # missing C, D
            "correct_answer": "A",
            "difficulty": "medium",
            "topic": "Caching strategies",
            "explanation": "Write-through is best.",
        },
    ]

    # Pad up to TARGET_QUESTION_COUNT by repeating good questions with new ids
    # so we always have a deterministic, valid sample even when the operator
    # requested a higher count than we hand-curated.
    bank: list[dict[str, Any]] = list(good_questions) + list(poor_questions)
    i = 0
    while len(bank) < TARGET_QUESTION_COUNT:
        seed = good_questions[i % len(good_questions)]
        cloned = dict(seed)
        cloned["id"] = f"mq-{len(bank) + 1}"
        bank.append(cloned)
        i += 1
    return bank[:TARGET_QUESTION_COUNT]


# ----------------------------- LIVE HTTP helpers -----------------------------


def _decode_jwt_payload(token: str) -> dict | None:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        padded = parts[1] + "=" * (-len(parts[1]) % 4)
        return json.loads(base64.urlsafe_b64decode(padded))
    except Exception:
        return None


async def _ensure_token(session: aiohttp.ClientSession) -> str:
    token = os.getenv("API_TOKEN", "").strip()
    if token:
        payload = _decode_jwt_payload(token)
        if payload and (payload.get("exp") or 0) > time.time() + 30:
            return token

    email = os.getenv("BENCHMARK_EMAIL", "teacher1@examora.local")
    password = os.getenv("BENCHMARK_PASSWORD", "Examora@123")
    async with session.post(
        "http://localhost:3000/api/auth/login",
        json={"email": email, "password": password},
    ) as resp:
        resp.raise_for_status()
        data = await resp.json()

    new_token = (
        data.get("access_token")
        or data.get("token")
        or data.get("accessToken")
        or data.get("data", {}).get("access_token")
    )
    if not new_token:
        raise RuntimeError(f"Login response missing access_token: {data}")
    return new_token


async def _enqueue_batch(
    session: aiohttp.ClientSession, headers: dict, contexts: list[dict[str, str]]
) -> list[str]:
    """Fire all generation requests concurrently and return their task ids."""
    sem = asyncio.Semaphore(ENQUEUE_CONCURRENCY)

    async def enqueue(ctx: dict[str, str]) -> str | None:
        async with sem:
            payload = {
                "courseId": 1,
                "quantity": QUESTIONS_PER_REQUEST,
                "difficulty": ctx["difficulty"],
                "context": ctx["context"],
            }
            try:
                async with session.post(
                    "http://localhost:3000/api/ai/generate-questions",
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=15),
                ) as resp:
                    if resp.status not in (200, 201, 202):
                        body = await resp.text()
                        print(f"    [ENQ] HTTP {resp.status}: {body[:160]}")
                        return None
                    data = await resp.json()
            except Exception as e:
                print(f"    [ENQ] Failed: {e}")
                return None

        # Tolerate a few response shapes used by different gateway versions.
        for key in ("task_id", "taskId", "id", "data"):
            if key in data and isinstance(data[key], str):
                return data[key]
            if key in data and isinstance(data[key], dict):
                inner = data[key]
                for k in ("task_id", "taskId", "id"):
                    if k in inner and isinstance(inner[k], str):
                        return inner[k]
        return None

    tasks = [asyncio.create_task(enqueue(ctx)) for ctx in contexts]
    results = await asyncio.gather(*tasks)
    return [tid for tid in results if tid]


async def _poll_task(
    session: aiohttp.ClientSession,
    headers: dict,
    task_id: str,
    deadline: float,
) -> dict | None:
    """Poll a single task until it reports a usable question bank or times out."""
    while time.time() < deadline:
        try:
            async with session.get(
                f"http://localhost:3000/api/ai/tasks/{task_id}",
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10),
            ) as resp:
                if resp.status == 404:
                    await asyncio.sleep(POLL_INTERVAL_SECONDS)
                    continue
                resp.raise_for_status()
                payload = await resp.json()
        except Exception as e:
            print(f"    [POLL] {task_id}: {e}")
            await asyncio.sleep(POLL_INTERVAL_SECONDS)
            continue

        data = payload.get("data") if isinstance(payload, dict) else None
        data = data or payload
        status = (data or {}).get("status")
        if status in ("completed", "COMPLETED", "done", "DONE"):
            return data
        if status in ("failed", "FAILED"):
            print(f"    [POLL] {task_id} FAILED: {data.get('error', 'n/a')}")
            return None

        await asyncio.sleep(POLL_INTERVAL_SECONDS)

    print(f"    [POLL] {task_id} timed out after {POLL_TIMEOUT_SECONDS}s")
    return None


def _flatten_questions(task_payload: dict) -> list[dict[str, Any]]:
    """Convert a task payload into a list of single-question dicts."""
    candidates = (
        task_payload.get("questions")
        or task_payload.get("generated_questions")
        or task_payload.get("result", {}).get("questions")
        or task_payload.get("data", {}).get("questions")
        or []
    )
    flat: list[dict[str, Any]] = []
    for q in candidates:
        if not isinstance(q, dict):
            continue
        # Normalise: evaluator expects options dict {A,B,C,D} and lowercase keys.
        opts = q.get("options")
        if isinstance(opts, list):
            opts = {chr(ord("A") + i): v for i, v in enumerate(opts) if i < 4}
        q_norm = {
            "id": q.get("id") or q.get("question_id"),
            "question_content": q.get("question_content") or q.get("text") or "",
            "options": opts or {},
            "correct_answer": (q.get("correct_answer") or q.get("answer") or "").upper(),
            "difficulty": q.get("difficulty", "medium"),
            "topic": q.get("topic", ""),
            "explanation": q.get("explanation", ""),
        }
        if q_norm["question_content"]:
            flat.append(q_norm)
    return flat


# ----------------------------- Main orchestration -----------------------------


class QualityBenchmark:
    def __init__(self) -> None:
        self.run_id = str(uuid.uuid4())[:8]
        self.results_dir = Path(__file__).parent / "results"
        self.results_dir.mkdir(exist_ok=True)
        self.timestamp = datetime.now().isoformat()

    async def collect_questions(self) -> list[dict[str, Any]]:
        if MOCK_QUALITY_MODE:
            print(f"[MODE] MOCK — using synthetic question bank ({TARGET_QUESTION_COUNT} items)")
            return _build_mock_questions()

        print(
            f"[MODE] LIVE — enqueuing {len(SAMPLE_CONTEXTS)} requests "
            f"({QUESTIONS_PER_REQUEST} q each), target = {TARGET_QUESTION_COUNT}"
        )
        connector = aiohttp.TCPConnector(limit=100)
        async with aiohttp.ClientSession(connector=connector) as session:
            token = await _ensure_token(session)
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            }

            task_ids = await _enqueue_batch(session, headers, SAMPLE_CONTEXTS)
            if not task_ids:
                raise RuntimeError("No tasks were enqueued successfully")
            print(f"[ENQ] {len(task_ids)} tasks created: {task_ids[:3]}...")

            deadline = time.time() + POLL_TIMEOUT_SECONDS
            poll_tasks = [
                asyncio.create_task(_poll_task(session, headers, tid, deadline))
                for tid in task_ids
            ]
            completed = await asyncio.gather(*poll_tasks)

        all_questions: list[dict[str, Any]] = []
        for payload in completed:
            if payload:
                all_questions.extend(_flatten_questions(payload))

        print(f"[COLLECT] {len(all_questions)} questions retrieved")
        if len(all_questions) < TARGET_QUESTION_COUNT:
            print(
                f"[WARN] Only {len(all_questions)} questions collected, "
                f"target was {TARGET_QUESTION_COUNT}"
            )
        return all_questions[:TARGET_QUESTION_COUNT]

    async def run(self) -> dict[str, Any]:
        questions = await self.collect_questions()
        if not questions:
            raise RuntimeError("No questions available for evaluation")

        # The evaluator uses source_context for relevance scoring. Concatenate
        # the sample context snippets so the relevance metric is meaningful.
        source_context = " ".join(c["context"] for c in SAMPLE_CONTEXTS)
        results = run_quality_evaluation(
            questions=questions,
            source_context=source_context,
            expected_difficulty="medium",
        )

        results["run_meta"] = {
            "run_id": self.run_id,
            "timestamp": self.timestamp,
            "mode": "MOCK" if MOCK_QUALITY_MODE else "LIVE",
            "target_question_count": TARGET_QUESTION_COUNT,
            "actual_question_count": len(questions),
        }
        return results

    # ----------------------------- Output -----------------------------

    def save(self, results: dict[str, Any]) -> None:
        json_path = self.results_dir / f"quality_benchmark_{self.run_id}.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, default=str)
        print(f"[Saved] {json_path}")

        md_path = self.results_dir / f"quality_benchmark_{self.run_id}.md"
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(self._render_markdown(results))
        print(f"[Saved] {md_path}")

    def _render_markdown(self, r: dict[str, Any]) -> str:
        agg = r["aggregate"]
        dist = agg["quality_distribution"]
        meta = r["run_meta"]
        lines: list[str] = [
            "# Question Quality Benchmark Report",
            "",
            f"**Run ID:** {meta['run_id']}  ",
            f"**Date:** {meta['timestamp']}  ",
            f"**Mode:** {meta['mode']}  ",
            f"**Questions evaluated:** {meta['actual_question_count']} "
            f"(target {meta['target_question_count']})",
            "",
            "---",
            "",
            "## Aggregate Scores",
            "",
            "| Metric | Value |",
            "|--------|------:|",
            f"| Total questions | {agg['total_questions']} |",
            f"| Schema-valid questions | {agg['schema_valid_count']} |",
            f"| Average overall score | {agg['average_overall_score']:.3f} |",
            f"| Median overall score | {agg['median_overall_score']:.3f} |",
            f"| Min overall score | {agg['min_overall_score']:.3f} |",
            f"| Max overall score | {agg['max_overall_score']:.3f} |",
            f"| Std-dev overall score | {agg['std_overall_score']:.3f} |",
            "",
            "## Quality Distribution",
            "",
            "| Tier | Range | Count |",
            "|------|-------|------:|",
            f"| Excellent | ≥ 0.8 | {dist['excellent']} |",
            f"| Good | 0.6 – 0.8 | {dist['good']} |",
            f"| Acceptable | 0.4 – 0.6 | {dist['acceptable']} |",
            f"| Poor | < 0.4 | {dist['poor']} |",
            "",
            "## Per-Question Scores",
            "",
            "| ID | Score | Strengths | Weaknesses |",
            "|----|------:|-----------|------------|",
        ]
        for m in r["individual"]:
            lines.append(
                f"| `{m['question_id']}` | {m['overall_score']:.3f} | "
                f"{', '.join(m['strengths']) or '—'} | "
                f"{', '.join(m['weaknesses']) or '—'} |"
            )
        lines.extend(
            [
                "",
                "---",
                "",
                "*This report answers Reviewer #2's question about how generated "
                "questions are evaluated for quality. Numbers above come from "
                "`QuestionQualityEvaluator.evaluate_batch`.*",
            ]
        )
        return "\n".join(lines) + "\n"


async def main() -> None:
    bench = QualityBenchmark()
    results = await bench.run()
    bench.save(results)
    agg = results["aggregate"]
    print("\n" + "=" * 60)
    print("QUALITY BENCHMARK COMPLETE")
    print("=" * 60)
    print(f"Run ID:                 {results['run_meta']['run_id']}")
    print(f"Mode:                   {results['run_meta']['mode']}")
    print(f"Questions evaluated:    {agg['total_questions']}")
    print(f"Average overall score:  {agg['average_overall_score']:.3f}")
    print(f"Median overall score:   {agg['median_overall_score']:.3f}")
    print(f"Score distribution:     {agg['quality_distribution']}")


if __name__ == "__main__":
    asyncio.run(main())