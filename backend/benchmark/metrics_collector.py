"""
EXAMORA Benchmark - Metrics Collector
Collects metrics from RabbitMQ Management API and PostgreSQL database.
"""

import asyncio
import json
import time
from datetime import datetime
from typing import Any
import logging

import aiohttp
import psycopg2
import pandas as pd
from psycopg2.extras import RealDictCursor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MetricsCollector:
    """Collects metrics from RabbitMQ and PostgreSQL."""

    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.rabbitmq_url = config.get("rabbitmq_url", "http://localhost:15672")
        self.rabbitmq_user = config.get("rabbitmq_user", "admin")
        self.rabbitmq_password = config.get("rabbitmq_password", "StrongPassword123")

        self.db_config = {
            "host": config.get("db_host", "localhost"),
            "port": config.get("db_port", 5432),
            "database": config.get("db_name", "Exam_Bank"),
            "user": config.get("db_user", "postgres"),
            "password": config.get("db_password", "123456"),
            "options": f"-c search_path=ai_db,public",
        }

        self.session: aiohttp.ClientSession | None = None

    async def __aenter__(self):
        """Async context manager entry."""
        auth = aiohttp.BasicAuth(self.rabbitmq_user, self.rabbitmq_password)
        self.session = aiohttp.ClientSession(auth=auth)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()

    # ==================== RabbitMQ Metrics ====================

    async def get_queue_metrics(self, queue_name: str = "ai.generation") -> dict[str, Any]:
        """
        Get metrics for a specific queue from RabbitMQ Management API.

        Returns:
            dict with: messages, messages_ready, messages_unacked, consumers, etc.
        """
        if not self.session:
            auth = aiohttp.BasicAuth(self.rabbitmq_user, self.rabbitmq_password)
            self.session = aiohttp.ClientSession(auth=auth)

        try:
            url = f"{self.rabbitmq_url}/api/queues/%2F/{queue_name}"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "queue_name": queue_name,
                        "messages": data.get("messages", 0),
                        "messages_ready": data.get("messages_ready", 0),
                        "messages_unacked": data.get("messages_unacked", 0),
                        "consumers": data.get("consumers", 0),
                        "consumer_utilisation": data.get("consumer_utilisation", 0),
                        "memory": data.get("memory", 0),
                        "messages_published": data.get("message_stats", {}).get("publish", 0),
                        "messages_delivered": data.get("message_stats", {}).get("deliver", 0),
                        "messages_acked": data.get("message_stats", {}).get("ack", 0),
                        "messages_failed": data.get("message_stats", {}).get("reject", 0),
                        "timestamp": datetime.now().isoformat(),
                    }
                else:
                    logger.warning(f"Failed to get queue metrics: {response.status}")
                    return self._empty_queue_metrics(queue_name)

        except Exception as e:
            logger.error(f"Error getting queue metrics: {e}")
            return self._empty_queue_metrics(queue_name)

    def _empty_queue_metrics(self, queue_name: str) -> dict[str, Any]:
        """Return empty metrics structure."""
        return {
            "queue_name": queue_name,
            "messages": 0,
            "messages_ready": 0,
            "messages_unacked": 0,
            "consumers": 0,
            "consumer_utilisation": 0,
            "memory": 0,
            "messages_published": 0,
            "messages_delivered": 0,
            "messages_acked": 0,
            "messages_failed": 0,
            "timestamp": datetime.now().isoformat(),
        }

    async def get_all_queues_metrics(self) -> list[dict[str, Any]]:
        """Get metrics for all queues."""
        if not self.session:
            auth = aiohttp.BasicAuth(self.rabbitmq_user, self.rabbitmq_password)
            self.session = aiohttp.ClientSession(auth=auth)

        try:
            async with self.session.get(f"{self.rabbitmq_url}/api/queues") as response:
                if response.status == 200:
                    queues = await response.json()
                    metrics = []
                    for q in queues:
                        if q.get("vhost") == "/":
                            metrics.append({
                                "queue_name": q.get("name"),
                                "messages": q.get("messages", 0),
                                "messages_ready": q.get("messages_ready", 0),
                                "messages_unacked": q.get("messages_unacked", 0),
                                "consumers": q.get("consumers", 0),
                                "timestamp": datetime.now().isoformat(),
                            })
                    return metrics
                return []
        except Exception as e:
            logger.error(f"Error getting all queues: {e}")
            return []

    async def get_broker_overview(self) -> dict[str, Any]:
        """Get RabbitMQ broker overview."""
        if not self.session:
            auth = aiohttp.BasicAuth(self.rabbitmq_user, self.rabbitmq_password)
            self.session = aiohttp.ClientSession(auth=auth)

        try:
            async with self.session.get(f"{self.rabbitmq_url}/api/overview") as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "rabbitmq_version": data.get("rabbitmq_version"),
                        "erlang_version": data.get("erlang_version"),
                        "cluster_name": data.get("cluster_name"),
                        "queue_totals": data.get("queue_totals", {}),
                        "message_stats": data.get("message_stats", {}),
                        "timestamp": datetime.now().isoformat(),
                    }
                return {}
        except Exception as e:
            logger.error(f"Error getting broker overview: {e}")
            return {}

    async def purge_queue(self, queue_name: str) -> bool:
        """Purge all messages from a queue."""
        if not self.session:
            auth = aiohttp.BasicAuth(self.rabbitmq_user, self.rabbitmq_password)
            self.session = aiohttp.ClientSession(auth=auth)

        try:
            url = f"{self.rabbitmq_url}/api/queues/%2F/{queue_name}/contents"
            async with self.session.delete(url) as response:
                return response.status in [200, 204]
        except Exception as e:
            logger.error(f"Error purging queue: {e}")
            return False

    # ==================== Database Metrics ====================

    def get_db_connection(self):
        """Create a new database connection."""
        return psycopg2.connect(**self.db_config, cursor_factory=RealDictCursor)

    def get_generation_requests(
        self,
        since: datetime | None = None,
        limit: int = 1000
    ) -> list[dict[str, Any]]:
        """
        Get AI generation requests from database.

        Args:
            since: Filter requests created after this time
            limit: Maximum number of records to return

        Returns:
            List of request records with timing information
        """
        query = """
            SELECT
                id,
                user_id,
                status,
                progress,
                quantity,
                difficulty,
                error_message,
                trace_id,
                created_at,
                started_at,
                updated_at,
                completed_at
            FROM ai_db.ai_generation_requests
            WHERE (%s IS NULL OR created_at >= %s)
            ORDER BY created_at DESC
            LIMIT %s
        """

        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(query, (since, since, limit))
                    results = cur.fetchall()
                    return [dict(row) for row in results]
        except Exception as e:
            logger.error(f"Error getting generation requests: {e}")
            return []

    def get_generation_tasks(
        self,
        request_ids: list[str] | None = None,
        limit: int = 1000
    ) -> list[dict[str, Any]]:
        """Get AI generation tasks from database."""
        if request_ids:
            placeholders = ",".join(["%s"] * len(request_ids))
            query = f"""
                SELECT
                    id,
                    request_id,
                    subject_id,
                    topic,
                    status,
                    number_of_questions,
                    difficulty,
                    created_at,
                    started_at,
                    completed_at,
                    error_message
                FROM ai_db.ai_generation_tasks
                WHERE request_id IN ({placeholders})
                ORDER BY created_at
                LIMIT %s
            """
            params = request_ids + [limit]
        else:
            query = """
                SELECT
                    id,
                    request_id,
                    subject_id,
                    topic,
                    status,
                    number_of_questions,
                    difficulty,
                    created_at,
                    started_at,
                    completed_at,
                    error_message
                FROM ai_db.ai_generation_tasks
                ORDER BY created_at DESC
                LIMIT %s
            """
            params = [limit]

        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(query, params)
                    results = cur.fetchall()
                    return [dict(row) for row in results]
        except Exception as e:
            logger.error(f"Error getting generation tasks: {e}")
            return []

    def get_completion_time_stats(self, since: datetime | None = None) -> dict[str, Any]:
        """Calculate completion time statistics from database."""
        query = """
            SELECT
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
                AVG(
                    CASE
                        WHEN completed_at IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000
                    END
                ) as avg_completion_time_ms,
                MIN(
                    CASE
                        WHEN completed_at IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000
                    END
                ) as min_completion_time_ms,
                MAX(
                    CASE
                        WHEN completed_at IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000
                    END
                ) as max_completion_time_ms
            FROM ai_db.ai_generation_requests
            WHERE (%s IS NULL OR created_at >= %s)
        """

        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(query, (since, since))
                    row = cur.fetchone()
                    return dict(row) if row else {}
        except Exception as e:
            logger.error(f"Error getting completion stats: {e}")
            return {}

    def get_recent_benchmark_results(self, run_id: str) -> list[dict[str, Any]]:
        """Get benchmark results for a specific run."""
        query = """
            SELECT
                request_id,
                client_response_ms,
                queue_time_ms,
                worker_start_ms,
                worker_end_ms,
                completed_time_ms,
                status,
                created_at
            FROM ai_db.benchmark_results
            WHERE run_id = %s
            ORDER BY created_at
        """

        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(query, (run_id,))
                    results = cur.fetchall()
                    return [dict(row) for row in results]
        except Exception as e:
            # Table might not exist yet
            logger.debug(f"Benchmark results table query: {e}")
            return []

    # ==================== System Info ====================

    def get_environment_info(self) -> dict[str, Any]:
        """Collect system and software version information."""
        import platform
        import subprocess
        import shutil

        info = {
            "timestamp": datetime.now().isoformat(),
            "platform": platform.platform(),
            "python_version": platform.python_version(),
            "architecture": platform.machine(),
        }

        # Get Node.js version
        try:
            result = subprocess.run(
                ["node", "-v"],
                capture_output=True,
                text=True,
                timeout=5
            )
            info["node_version"] = result.stdout.strip()
        except Exception:
            info["node_version"] = "N/A"

        # Get npm version
        try:
            result = subprocess.run(
                ["npm", "-v"],
                capture_output=True,
                text=True,
                timeout=5
            )
            info["npm_version"] = result.stdout.strip()
        except Exception:
            info["npm_version"] = "N/A"

        # Get RabbitMQ version from CLI
        try:
            result = subprocess.run(
                ["rabbitmqctl", "status"],
                capture_output=True,
                text=True,
                timeout=10
            )
            for line in result.stdout.split("\n"):
                if "RabbitMQ version" in line:
                    info["rabbitmq_version"] = line.split(":")[1].strip()
                    break
            else:
                info["rabbitmq_version"] = "N/A"
        except Exception:
            info["rabbitmq_version"] = "N/A"

        # Get PostgreSQL version
        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT version();")
                    version = cur.fetchone()[0]
                    info["postgresql_version"] = version
        except Exception:
            info["postgresql_version"] = "N/A"

        # Get Docker version
        try:
            result = subprocess.run(
                ["docker", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            info["docker_version"] = result.stdout.strip()
        except Exception:
            info["docker_version"] = "N/A"

        # Get Gemini API status
        info["gemini_api_configured"] = bool(self.config.get("gemini_api_key"))

        return info


# ==================== Helper Functions ====================

def calculate_statistics(values: list[float]) -> dict[str, float]:
    """
    Calculate comprehensive statistics including percentiles.
    Suitable for scientific papers.
    """
    if not values:
        return {
            "mean": 0, "std": 0, "min": 0, "max": 0,
            "median": 0, "p50": 0, "p75": 0, "p90": 0,
            "p95": 0, "p99": 0, "count": 0
        }

    import numpy as np
    arr = np.array(values)

    return {
        "mean": round(float(np.mean(arr)), 2),
        "std": round(float(np.std(arr)), 2),
        "min": round(float(np.min(arr)), 2),
        "max": round(float(np.max(arr)), 2),
        "median": round(float(np.median(arr)), 2),
        "p50": round(float(np.percentile(arr, 50)), 2),
        "p75": round(float(np.percentile(arr, 75)), 2),
        "p90": round(float(np.percentile(arr, 90)), 2),
        "p95": round(float(np.percentile(arr, 95)), 2),
        "p99": round(float(np.percentile(arr, 99)), 2),
        "count": len(values),
    }


async def collect_queue_snapshot(
    collector: MetricsCollector,
    duration_seconds: int = 60,
    interval_seconds: float = 0.5
) -> list[dict[str, Any]]:
    """
    Collect queue metrics snapshots over a period of time.

    Args:
        collector: MetricsCollector instance
        duration_seconds: How long to collect
        interval_seconds: Interval between collections

    Returns:
        List of queue snapshots
    """
    snapshots = []
    start_time = time.time()
    queue_name = collector.config.get("queue_name", "ai.generation")

    while time.time() - start_time < duration_seconds:
        metrics = await collector.get_queue_metrics(queue_name)
        metrics["elapsed_seconds"] = time.time() - start_time
        snapshots.append(metrics)
        await asyncio.sleep(interval_seconds)

    return snapshots
