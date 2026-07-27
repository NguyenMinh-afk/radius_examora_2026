"""
EXAMORA Benchmark - Main Runner
Executes all benchmark tests with warm-up, multiple runs, and statistics.

Features:
- Exponential backoff for rate limiting
- Comprehensive timing metrics (queue waiting, worker processing)
- Scaling efficiency analysis
- CSV export for statistical analysis
"""

import asyncio
import csv
import json
import os
import random
import sys
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

import aiohttp
import requests
from dotenv import load_dotenv

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from metrics_collector import MetricsCollector, calculate_statistics
from system_monitor import SystemMonitor

load_dotenv()

# Rate limit configuration
MAX_RETRIES = 5
BASE_BACKOFF_SECONDS = 2
MAX_BACKOFF_SECONDS = 60


class BenchmarkRunner:
    """Main benchmark orchestrator."""

    def __init__(self, config: dict[str, Any] | None = None):
        self.config = config or self._load_config()
        self.run_id = str(uuid.uuid4())[:8]
        self.results_dir = Path(__file__).parent / "results"
        self.results_dir.mkdir(exist_ok=True)

        # Results storage
        self.all_results: dict[str, list] = {}
        self.raw_metrics: list[dict[str, Any]] = []
        self.environment_info: dict[str, Any] = {}

        # Metrics collector
        self.collector = MetricsCollector(self.config)
        self.monitor = SystemMonitor(self.config)

        # API settings
        self.api_base_url = self.config.get("api_base_url", "http://localhost:3000")
        self.api_token = self.config.get("api_token", "")

    def _load_config(self) -> dict[str, Any]:
        """Load configuration from environment variables."""
        # Load from .env file in the benchmark directory
        load_dotenv(Path(__file__).parent / ".env")

        return {
            # API settings
            "api_base_url": os.getenv("API_BASE_URL", "http://localhost:3000"),
            "api_token": os.getenv("API_TOKEN", ""),

            # RabbitMQ settings
            "rabbitmq_url": os.getenv("RABBITMQ_MANAGEMENT_URL", "http://localhost:15672"),
            "rabbitmq_user": os.getenv("RABBITMQ_USER", "admin"),
            "rabbitmq_password": os.getenv("RABBITMQ_PASSWORD", "StrongPassword123"),
            "queue_name": os.getenv("RABBITMQ_QUEUE", "ai.generation"),

            # Database settings - use postgres defaults from .env
            "db_host": os.getenv("DB_HOST", "localhost"),
            "db_port": int(os.getenv("DB_PORT", "5432")),
            "db_name": os.getenv("DB_NAME", "Exam_Bank"),
            "db_user": os.getenv("DB_USER", "postgres"),
            "db_password": os.getenv("DB_PASSWORD", "123456"),

            # Benchmark settings
            "warmup_requests": int(os.getenv("WARMUP_REQUESTS", "10")),
            "benchmark_requests": int(os.getenv("BENCHMARK_REQUESTS", "100")),
            "num_runs": int(os.getenv("NUM_RUNS", "5")),
            "concurrency": int(os.getenv("CONCURRENCY", "5")),
        }

    def _get_auth_headers(self) -> dict[str, str]:
        """Get authorization headers for API calls."""
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

    # ==================== Rate Limit Handling ====================

    async def _send_with_backoff(
        self,
        session: aiohttp.ClientSession,
        request_num: int,
        retries: int = 0
    ) -> dict[str, Any]:
        """
        Send request with exponential backoff on rate limiting.

        Args:
            session: aiohttp session
            request_num: Request number for context
            retries: Current retry count

        Returns:
            Request result dict
        """
        result = await self._send_generation_request(session, request_num)

        # Check if rate limited
        if result.get("status_code") == 429:
            if retries < MAX_RETRIES:
                # Calculate backoff with exponential increase
                backoff = min(
                    BASE_BACKOFF_SECONDS * (2 ** retries) + random.uniform(0, 1),
                    MAX_BACKOFF_SECONDS
                )
                print(f"  [WARN] Rate limited, retrying in {backoff:.1f}s (attempt {retries + 1}/{MAX_RETRIES})")
                await asyncio.sleep(backoff)
                return await self._send_with_backoff(session, request_num, retries + 1)
            else:
                print(f"  [ERROR] Max retries exceeded for rate limiting")
                result["rate_limited"] = True

        return result

    # ==================== Core Request Function ====================

    async def _send_generation_request(self, session: aiohttp.ClientSession, request_num: int) -> dict[str, Any]:
        """
        Send a single AI generation request and measure timing.
        Uses shared session for connection pooling.

        Returns:
            Dict with timing information
        """
        request_id = str(uuid.uuid4())
        request_start_time = time.perf_counter()

        try:
            # Send request to API
            # Longer context for AI question generation
            context_text = f"""
            Benchmark test request number {request_num}. This is a comprehensive test of the AI question generation system.
            The system should be able to process this request and generate relevant questions based on the provided context.
            Topics include software engineering, database design, API development, and system architecture.
            Questions should cover various difficulty levels including easy, medium, and hard.
            This helps benchmark the performance and reliability of the AI generation pipeline.
            """.strip()

            payload = {
                "courseId": 1,
                "quantity": 3,
                "difficulty": "medium",
                "context": context_text
            }

            url = f"{self.api_base_url}/api/ai/generate-questions"
            # url = f"{self.api_base_url}/api/v1/ai/generate-questions"

            async with session.post(
                url,
                json=payload,
                headers=self._get_auth_headers(),
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                client_response_time = time.perf_counter() - request_start_time

                # Parse response
                try:
                    data = await response.json()
                except:
                    data = {}

                if response.status in [200, 201, 202]:
                    # API returns requestId (not api_request_id)
                    api_request_id = data.get("requestId") or data.get("id")
                    
                    # DEBUG: Log if requestId is missing
                    if not api_request_id:
                        print(f"  [DEBUG] Missing requestId in response: status={response.status}, data={data}")

                    # Get timestamps from response for accurate timing
                    enqueued_at = data.get("enqueuedAt") or data.get("createdAt")
                    enqueued_time_ms = None
                    if enqueued_at:
                        enqueued_time_ms = round(client_response_time * 1000, 2)

                    return {
                        "success": True,
                        "request_id": request_id,
                        "api_request_id": api_request_id,
                        "trace_id": data.get("traceId"),
                        "client_response_ms": round(client_response_time * 1000, 2),
                        "enqueued_at": enqueued_at,
                        "enqueued_time_ms": enqueued_time_ms,
                        "status_code": response.status,
                        "request_start_time": request_start_time,  # For completion time calculation
                    }
                else:
                    error_msg = data.get("error", f"API returned {response.status}")
                    error_detail = data.get("detail", "")
                    full_error = f"{error_msg} ({error_detail})" if error_detail else error_msg
                    
                    # Only print non-rate-limit errors, suppress repeated 429s
                    if response.status == 429:
                        if not getattr(self, '_rate_limit_warned', False):
                            print(f"  [WARN] Rate limited (429) - requests may fail until cooldown")
                            self._rate_limit_warned = True
                    else:
                        print(f"  [DEBUG] Request failed: status={response.status}, error={full_error}")
                    return {
                        "success": False,
                        "request_id": request_id,
                        "client_response_ms": round(client_response_time * 1000, 2),
                        "status_code": response.status,
                        "error": full_error,
                        "response_data": data,
                    }

        except Exception as e:
            if not getattr(self, '_exception_warned', False):
                print(f"  [ERROR] Connection error: {type(e).__name__}")
                self._exception_warned = True
            return {
                "success": False,
                "request_id": request_id,
                "client_response_ms": round((time.perf_counter() - request_start_time) * 1000, 2),
                "error": str(e),
            }

    async def _wait_for_completion(
        self,
        session: aiohttp.ClientSession,
        request_ids: list[str],
        request_start_times: dict[str, float],
        timeout_seconds: int = 300
    ) -> dict[str, Any]:
        """
        Poll API until all requests complete.
        Uses shared session for connection pooling.
        Measures completion time from request start (end-to-end).

        Returns:
            Completion times for each request (calculated from request creation)
        """
        results = {}
        start_time = time.perf_counter()

        while time.perf_counter() - start_time < timeout_seconds:
            pending = [req_id for req_id in request_ids if req_id not in results]

            if not pending:
                break

            # Poll ALL pending requests (not just 10)
            tasks = []
            for req_id in pending:
                tasks.append(self._poll_single_request(session, req_id, request_start_times.get(req_id, start_time)))

            poll_results = await asyncio.gather(*tasks)

            for req_id, result in poll_results:
                if result:
                    results[req_id] = result

            await asyncio.sleep(0.5)

        return results

    async def _poll_single_request(
        self,
        session: aiohttp.ClientSession,
        req_id: str,
        request_start_time: float
    ) -> tuple[str, dict | None]:
        """Poll a single request status."""
        try:
            url = f"{self.api_base_url}/api/ai/requests/{req_id}"
            # url = f"{self.api_base_url}/api/v1/ai/requests/{req_id}"
            async with session.get(
                url,
                headers=self._get_auth_headers(),
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    status = data.get("status")

                    if status in ["completed", "failed"]:
                        completion_time = time.perf_counter()
                        end_to_end_ms = round((completion_time - request_start_time) * 1000, 2)
                        
                        return req_id, {
                            "status": status,
                            "progress": data.get("progress", 0),
                            "completion_ms": end_to_end_ms,
                            "enqueued_at": data.get("enqueuedAt"),
                            "started_at": data.get("startedAt"),
                            "completed_at": data.get("completedAt"),
                            "worker_id": data.get("workerId"),
                        }
        except Exception:
            pass
        return req_id, None

    # ==================== Warm-up ====================

    async def _warmup(self, session: aiohttp.ClientSession, num_requests: int) -> None:
        """Execute warm-up requests to eliminate initialization overhead."""
        print(f"\n[WARMUP] Running {num_requests} warm-up requests...")

        for i in range(num_requests):
            result = await self._send_generation_request(session, i)
            if i % 5 == 0:
                print(f"  Warm-up progress: {i+1}/{num_requests}")
            await asyncio.sleep(0.5)

        print("[WARMUP] Completed.")

    # ==================== Benchmark Tests ====================

    async def test_client_response_time(
        self,
        num_requests: int = 100,
        concurrency: int = 5
    ) -> dict[str, Any]:
        """
        Fig. 6: Measure client response times.

        Tests:
        - Client Response Time (time to receive HTTP response)
        - Queue Waiting Time (started_at - created_at from server timestamps)
        - Worker Processing Time (completed_at - started_at from server timestamps)
        - End-to-End Completion Time (completed_at - created_at)
        """
        print(f"\n[BENCHMARK] Client Response Time Test")
        print(f"  Requests: {num_requests}, Concurrency: {concurrency}")

        # Wait longer before test if previously rate limited
        if getattr(self, '_was_rate_limited', False):
            print("  [INFO] Waiting 30s after rate limiting...")
            await asyncio.sleep(30)
            self._was_rate_limited = False

        # Purge queue before test
        async with MetricsCollector(self.config) as collector:
            await collector.purge_queue(self.config.get("queue_name", "ai.generation"))

        # Use shared session for all requests
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=50)
        async with aiohttp.ClientSession(connector=connector) as session:
            # Run warm-up
            await self._warmup(session, self.config.get("warmup_requests", 10))

            results = []
            request_start_times = {}
            batch_start = time.perf_counter()

            # Send requests in batches using shared session
            # Add delay between batches to avoid rate limiting
            for batch_start_i in range(0, num_requests, concurrency):
                batch_size = min(concurrency, num_requests - batch_start_i)
                tasks = [
                    self._send_with_backoff(session, batch_start_i + i)
                    for i in range(batch_size)
                ]
                batch_results = await asyncio.gather(*tasks)

                # Track start times for end-to-end calculation
                for r in batch_results:
                    if r.get("success") and r.get("api_request_id"):
                        request_start_times[r["api_request_id"]] = r.get("request_start_time", batch_start)
                        if r.get("status_code") == 429:
                            self._was_rate_limited = True

                results.extend(batch_results)

                # Delay between batches to avoid rate limiting
                # Gemini API: ~15 req/min, so 8s delay = ~7.5 req/min (very safe)
                if batch_start_i + batch_size < num_requests:
                    await asyncio.sleep(8)

            total_time = time.perf_counter() - batch_start

            # Wait for completion to measure end-to-end time
            successful_ids = [
                r.get("api_request_id") for r in results
                if r.get("success") and r.get("api_request_id")
            ]

            if successful_ids:
                print(f"  Waiting for {len(successful_ids)} requests to complete...")
                completion_results = await self._wait_for_completion(session, successful_ids, request_start_times)

                # Update results with completion times
                for r in results:
                    if r.get("api_request_id") in completion_results:
                        r.update(completion_results[r["api_request_id"]])

        # Calculate comprehensive statistics
        client_times = [r["client_response_ms"] for r in results if r.get("client_response_ms")]
        completion_times = [r["completion_ms"] for r in results if r.get("completion_ms")]

        # Calculate queue waiting and worker processing times from server timestamps
        queue_waiting_times = []
        worker_processing_times = []

        for r in results:
            if r.get("started_at") and r.get("completed_at"):
                try:
                    from datetime import datetime
                    started = datetime.fromisoformat(r["started_at"].replace("Z", "+00:00"))
                    completed = datetime.fromisoformat(r["completed_at"].replace("Z", "+00:00"))

                    # Worker processing time
                    processing_ms = (completed - started).total_seconds() * 1000
                    worker_processing_times.append(processing_ms)

                    # Queue waiting time (approximated from completion time - processing time)
                    if r.get("completion_ms"):
                        queue_ms = r["completion_ms"] - processing_ms
                        if queue_ms > 0:
                            queue_waiting_times.append(queue_ms)
                except Exception:
                    pass

        stats = {
            "test_name": "client_response_time",
            "num_requests": num_requests,
            "concurrency": concurrency,
            "total_time_seconds": round(total_time, 2),
            "success_count": sum(1 for r in results if r.get("success")),
            "client_response": calculate_statistics(client_times),
            "completion_time": calculate_statistics(completion_times),
            "queue_waiting_time": calculate_statistics(queue_waiting_times) if queue_waiting_times else None,
            "worker_processing_time": calculate_statistics(worker_processing_times) if worker_processing_times else None,
            "individual_results": results,
        }

        self.all_results["client_response_time"] = results
        return stats

    async def test_queue_metrics(
        self,
        duration_seconds: int = 60,
        num_requests: int = 50
    ) -> dict[str, Any]:
        """
        Fig. 7: Monitor queue length under concurrent load.

        Monitors:
        - Queue length over time
        - Consumer utilization
        - Message statistics (publish, deliver, ack rates)
        """
        print(f"\n[BENCHMARK] Queue Metrics Test")
        print(f"  Duration: {duration_seconds}s, Requests: {num_requests}")

        # Check if previously rate limited
        if getattr(self, '_was_rate_limited', False):
            print("  [INFO] Waiting 30s after rate limiting...")
            await asyncio.sleep(30)

        async with MetricsCollector(self.config) as collector:
            # Purge queue
            await collector.purge_queue(self.config.get("queue_name", "ai.generation"))
            await asyncio.sleep(2)  # Wait for queue to stabilize

            # Use shared session for connection pooling
            connector = aiohttp.TCPConnector(limit=100)
            async with aiohttp.ClientSession(connector=connector) as session:
                # Start queue monitoring
                snapshots = []
                start_time = time.perf_counter()
                requests_sent = 0
                rate_limited_count = 0

                # Background: send requests while monitoring
                async def monitor_loop():
                    while time.time() - start_time < duration_seconds:
                        metrics = await collector.get_queue_metrics(
                            self.config.get("queue_name", "ai.generation")
                        )
                        metrics["elapsed_seconds"] = time.time() - start_time
                        snapshots.append(metrics)
                        await asyncio.sleep(0.5)

                # Start monitoring
                monitor_task = asyncio.create_task(monitor_loop())

                # Send requests in batches with backoff
                for i in range(0, num_requests, 10):
                    batch_size = min(10, num_requests - i)
                    batch_results = await asyncio.gather(*[
                        self._send_with_backoff(session, i + j)
                        for j in range(batch_size)
                    ])
                    requests_sent += sum(1 for r in batch_results if r.get("success"))
                    rate_limited_count += sum(1 for r in batch_results if r.get("status_code") == 429)
                    if rate_limited_count > 0:
                        self._was_rate_limited = True
                    await asyncio.sleep(1)

                # Wait for monitoring to finish
                await asyncio.wait_for(monitor_task, timeout=5)

            # Calculate statistics
            queue_lengths = [s["messages"] for s in snapshots]
            ready_messages = [s["messages_ready"] for s in snapshots]
            unacked_messages = [s["messages_unacked"] for s in snapshots]
            consumers = [s["consumers"] for s in snapshots]
            consumer_utilisations = [s["consumer_utilisation"] for s in snapshots if s.get("consumer_utilisation")]
            publish_rates = [s.get("messages_published", 0) for s in snapshots]
            ack_rates = [s.get("messages_acked", 0) for s in snapshots]

            stats = {
                "test_name": "queue_metrics",
                "duration_seconds": duration_seconds,
                "num_requests_sent": num_requests,
                "successful_requests": requests_sent,
                "rate_limited_count": rate_limited_count,
                "snapshots_count": len(snapshots),
                "queue_length": calculate_statistics(queue_lengths),
                "ready_messages": calculate_statistics(ready_messages),
                "unacked_messages": calculate_statistics(unacked_messages),
                "consumers": {
                    "max": max(consumers) if consumers else 0,
                    "min": min(consumers) if consumers else 0,
                    "avg": sum(consumers) / len(consumers) if consumers else 0,
                },
                "consumer_utilisation": {
                    "max": max(consumer_utilisations) if consumer_utilisations else 0,
                    "avg": sum(consumer_utilisations) / len(consumer_utilisations) if consumer_utilisations else 0,
                },
                "total_published": sum(publish_rates) if publish_rates else 0,
                "total_acked": sum(ack_rates) if ack_rates else 0,
                "snapshots": snapshots,
            }

            self.all_results["queue_metrics"] = snapshots
            return stats

    async def test_worker_scaling(
        self,
        worker_counts: list[int] = [1, 2, 4],
        requests_per_config: int = 20
    ) -> dict[str, Any]:
        """
        Fig. 8: Measure performance with different worker counts.
        Uses real Docker commands to scale workers.
        Calculates scaling efficiency for each worker configuration.
        """
        import subprocess

        print(f"\n[BENCHMARK] Worker Scaling Test")
        print(f"  Worker counts: {worker_counts}, Requests per config: {requests_per_config}")

        # Check if previously rate limited
        if getattr(self, '_was_rate_limited', False):
            print("  [INFO] Waiting 30s after rate limiting...")
            await asyncio.sleep(30)
            self._was_rate_limited = False

        results = []
        original_worker_count = 1
        baseline_throughput = None

        async with MetricsCollector(self.config) as collector:
            # Get original worker count
            try:
                result = subprocess.run(
                    ["docker", "ps", "-q", "-f", "name=examora-ai-worker-service"],
                    capture_output=True, text=True
                )
                original_worker_count = len([l for l in result.stdout.strip().split("\n") if l])
            except Exception:
                pass

        for worker_count in worker_counts:
            print(f"\n  Testing with {worker_count} worker(s)...")

            # Scale workers via Docker
            try:
                subprocess.run(
                    ["docker", "compose", "-f", "docker-compose.yml", "up", "-d", "--scale", f"ai-worker-service={worker_count}"],
                    capture_output=True, timeout=30
                )
                print(f"    Scaled to {worker_count} worker(s)")
                await asyncio.sleep(10)  # Wait longer for workers to be ready
            except Exception as e:
                print(f"    Warning: Could not scale workers: {e}")

            # Purge queue
            async with MetricsCollector(self.config) as collector:
                await collector.purge_queue(self.config.get("queue_name", "ai.generation"))

            # Wait for queue to clear
            await asyncio.sleep(3)

            # Use shared session
            connector = aiohttp.TCPConnector(limit=100)
            async with aiohttp.ClientSession(connector=connector) as session:
                # Start system monitoring
                await self.monitor.start_monitoring(interval_seconds=1.0)

                # Send requests with shared session
                batch_start = time.perf_counter()
                request_results = []
                start_times = {}
                rate_limited_count = 0

                # Send all requests with backoff
                for i in range(requests_per_config):
                    result = await self._send_with_backoff(session, i)
                    request_results.append(result)
                    if result.get("success") and result.get("api_request_id"):
                        start_times[result["api_request_id"]] = result.get("request_start_time", batch_start)
                    if result.get("status_code") == 429:
                        rate_limited_count += 1
                        self._was_rate_limited = True

                if rate_limited_count > 0:
                    print(f"    [WARN] {rate_limited_count} requests rate limited")

                # Wait for completion to measure true worker throughput
                print(f"    Waiting for {len(start_times)} requests to complete...")
                completion_results = await self._wait_for_completion(
                    session, list(start_times.keys()), start_times, timeout_seconds=300
                )

                total_time = time.perf_counter() - batch_start

                # Stop monitoring
                monitor_samples = await self.monitor.stop_monitoring()

            # Calculate worker-specific stats
            client_times = [r["client_response_ms"] for r in request_results]
            completed_count = sum(1 for r in completion_results.values() if r.get("status") == "completed")
            success_count = sum(1 for r in request_results if r.get("success"))
            throughput = completed_count / total_time if total_time > 0 else 0

            # Calculate scaling efficiency
            scaling_efficiency = None
            if baseline_throughput is None:
                baseline_throughput = throughput
                scaling_efficiency = 1.0  # 100% for baseline
            elif baseline_throughput > 0:
                ideal_throughput = baseline_throughput * worker_count
                scaling_efficiency = throughput / ideal_throughput if ideal_throughput > 0 else 0

            # Get resource usage from monitoring
            resource_stats = self._calculate_resource_stats(monitor_samples)

            worker_result = {
                "worker_count": worker_count,
                "requests_sent": success_count,
                "requests_completed": completed_count,
                "total_time_seconds": round(total_time, 2),
                "throughput_req_per_sec": round(throughput, 2),
                "avg_client_response_ms": round(sum(client_times) / len(client_times), 2) if client_times else 0,
                "scaling_efficiency": round(scaling_efficiency, 4) if scaling_efficiency is not None else None,
                "resource_usage": resource_stats,
            }

            results.append(worker_result)
            print(f"    Sent: {success_count}, Completed: {completed_count}/{requests_per_config}, "
                  f"Throughput: {worker_result['throughput_req_per_sec']} req/s, "
                  f"Efficiency: {worker_result['scaling_efficiency']*100 if worker_result['scaling_efficiency'] else 0:.1f}%")

            # Wait before next config
            await asyncio.sleep(5)

        # Restore original worker count
        try:
            subprocess.run(
                ["docker", "compose", "-f", "docker-compose.yml", "up", "-d", "--scale", f"ai-worker-service={original_worker_count}"],
                capture_output=True, timeout=30
            )
        except Exception:
            pass

        stats = {
            "test_name": "worker_scaling",
            "worker_counts_tested": worker_counts,
            "requests_per_config": requests_per_config,
            "results": results,
        }

        self.all_results["worker_scaling"] = results
        return stats

    def _calculate_resource_stats(self, samples: list[dict[str, Any]]) -> dict[str, Any]:
        """Calculate resource statistics from monitoring samples."""
        import numpy as np

        cpu_values = [s.get("cpu_percent", 0) for s in samples if s.get("cpu_percent")]
        mem_values = [s.get("memory", {}).get("percent", 0) for s in samples if s.get("memory")]

        return {
            "cpu": {
                "mean": round(float(np.mean(cpu_values)), 2) if cpu_values else 0,
                "max": round(float(np.max(cpu_values)), 2) if cpu_values else 0,
            },
            "memory": {
                "mean": round(float(np.mean(mem_values)), 2) if mem_values else 0,
                "max": round(float(np.max(mem_values)), 2) if mem_values else 0,
            },
        }

    async def test_message_processing(
        self,
        num_requests: int = 100
    ) -> dict[str, Any]:
        """
        Fig. 9: Measure message processing success/failure rates.
        Actually sends requests and waits for completion.
        """
        print(f"\n[BENCHMARK] Message Processing Test")
        print(f"  Requests: {num_requests}")

        # Check if previously rate limited
        if getattr(self, '_was_rate_limited', False):
            print("  [INFO] Waiting 30s after rate limiting...")
            await asyncio.sleep(30)
            self._was_rate_limited = False

        # Purge queue
        async with MetricsCollector(self.config) as collector:
            await collector.purge_queue(self.config.get("queue_name", "ai.generation"))

        # Wait for queue to clear
        await asyncio.sleep(2)

        # Use shared session
        connector = aiohttp.TCPConnector(limit=100)
        async with aiohttp.ClientSession(connector=connector) as session:
            # Send actual requests with backoff
            print(f"  Sending {num_requests} requests...")
            request_start_time = time.perf_counter()
            start_times = {}
            rate_limited_count = 0

            # Send in batches with backoff
            batch_size = 10
            successful_ids = []
            for batch_start_i in range(0, num_requests, batch_size):
                actual_batch_size = min(batch_size, num_requests - batch_start_i)
                tasks = [
                    self._send_with_backoff(session, batch_start_i + i)
                    for i in range(actual_batch_size)
                ]
                batch_results = await asyncio.gather(*tasks)

                for r in batch_results:
                    if r.get("success") and r.get("api_request_id"):
                        successful_ids.append(r["api_request_id"])
                        start_times[r["api_request_id"]] = r.get("request_start_time", request_start_time)
                    if r.get("status_code") == 429:
                        rate_limited_count += 1
                        self._was_rate_limited = True

                if rate_limited_count > 0:
                    print(f"    [WARN] {rate_limited_count} requests rate limited")

            print(f"  Sent {len(successful_ids)} requests, waiting for completion...")

            # Wait for completion
            completion_results = await self._wait_for_completion(
                session, successful_ids, start_times, timeout_seconds=300
            )

            # Calculate stats
            completed = sum(1 for r in completion_results.values() if r.get("status") == "completed")
            failed = sum(1 for r in completion_results.values() if r.get("status") == "failed")
            pending = len(successful_ids) - completed - failed

            completion_times = [r.get("completion_ms", 0) for r in completion_results.values() if r.get("completion_ms")]

        result = {
            "test_name": "message_processing",
            "total_requests": len(successful_ids),
            "completed": completed,
            "failed": failed,
            "pending": pending,
            "rate_limited_count": rate_limited_count,
            "success_rate": round((completed / len(successful_ids) * 100) if successful_ids else 0, 2),
            "failure_rate": round((failed / len(successful_ids) * 100) if successful_ids else 0, 2),
            "avg_completion_time_ms": round(sum(completion_times) / len(completion_times), 2) if completion_times else 0,
            "min_completion_time_ms": round(min(completion_times), 2) if completion_times else 0,
            "max_completion_time_ms": round(max(completion_times), 2) if completion_times else 0,
            "completion_time_stats": calculate_statistics(completion_times) if completion_times else None,
        }

        self.all_results["message_processing"] = [result]
        return result

    async def test_failure_recovery(
        self,
        num_requests: int = 10
    ) -> dict[str, Any]:
        """
        Fig. 10: Test failure recovery after worker restart.
        Actually stops workers, sends requests, then restarts to measure recovery time.
        """
        import subprocess

        print(f"\n[BENCHMARK] Failure Recovery Test")
        print(f"  Testing worker restart recovery...")

        # Check if previously rate limited
        if getattr(self, '_was_rate_limited', False):
            print("  [INFO] Waiting 30s after rate limiting...")
            await asyncio.sleep(30)
            self._was_rate_limited = False

        # Step 1: Stop worker
        print("  Step 1: Stopping worker...")
        try:
            subprocess.run(
                ["docker", "stop", "examora-ai-worker-service"],
                capture_output=True, timeout=10
            )
            stopped = True
        except Exception as e:
            print(f"    Warning: Could not stop worker: {e}")
            stopped = False

        # Step 2: Send requests while worker is down
        print(f"  Step 2: Sending {num_requests} requests while worker is down...")
        async with MetricsCollector(self.config) as collector:
            await collector.purge_queue(self.config.get("queue_name", "ai.generation"))

        connector = aiohttp.TCPConnector(limit=100)
        async with aiohttp.ClientSession(connector=connector) as session:
            send_start = time.perf_counter()
            tasks = [self._send_generation_request(session, i) for i in range(num_requests)]
            send_results = await asyncio.gather(*tasks)
            send_time = time.perf_counter() - send_start

            failed_while_down = sum(1 for r in send_results if not r.get("success"))

        # Step 3: Restart worker
        print("  Step 3: Restarting worker...")
        recovery_start = time.perf_counter()
        try:
            subprocess.run(
                ["docker", "start", "examora-ai-worker-service"],
                capture_output=True, timeout=10
            )
            restarted = True
            await asyncio.sleep(10)  # Wait longer for worker to reconnect
        except Exception as e:
            print(f"    Warning: Could not restart worker: {e}")
            restarted = False

        # Step 4: Wait for queued requests to be processed
        print("  Step 4: Waiting for queued requests to complete...")

        # Get successful request IDs
        successful_ids = [
            r.get("api_request_id") for r in send_results
            if r.get("success") and r.get("api_request_id")
        ]

        recovery_results = {}
        if successful_ids and restarted:
            recovery_results = await self._wait_for_completion(
                session, successful_ids, {}, timeout_seconds=300
            )

        recovery_time = time.perf_counter() - recovery_start
        completed_after_recovery = sum(1 for r in recovery_results.values() if r.get("status") == "completed")
        failed_after_recovery = sum(1 for r in recovery_results.values() if r.get("status") == "failed")

        # Get queue metrics after recovery
        queue_after_recovery = None
        async with MetricsCollector(self.config) as collector:
            queue_after_recovery = await collector.get_queue_metrics(
                self.config.get("queue_name", "ai.generation")
            )

        results = {
            "test_name": "failure_recovery",
            "requests_tested": num_requests,
            "worker_stopped": stopped,
            "worker_restarted": restarted,
            "failed_while_down": failed_while_down,
            "completed_after_recovery": completed_after_recovery,
            "failed_after_recovery": failed_after_recovery,
            "recovery_time_seconds": round(recovery_time, 2),
            "send_time_seconds": round(send_time, 2),
            "queue_after_recovery": queue_after_recovery,
        }

        self.all_results["failure_recovery"] = [results]
        return results

    async def test_concurrent_users(
        self,
        user_counts: list[int] = [1, 5, 10],
        requests_per_user: int = 10
    ) -> dict[str, Any]:
        """
        Test with concurrent simulated users.
        Each user sends requests sequentially with think time between requests.
        """
        print(f"\n[BENCHMARK] Concurrent Users Test")
        print(f"  User counts: {user_counts}, Requests per user: {requests_per_user}")

        # Check if previously rate limited
        if getattr(self, '_was_rate_limited', False):
            print("  [INFO] Waiting 30s after rate limiting...")
            await asyncio.sleep(30)
            self._was_rate_limited = False

        results = []

        # Use shared session
        connector = aiohttp.TCPConnector(limit=100)
        async with aiohttp.ClientSession(connector=connector) as session:
            for num_users in user_counts:
                print(f"\n  Testing with {num_users} concurrent user(s)...")

                # Purge queue
                async with MetricsCollector(self.config) as collector:
                    await collector.purge_queue(self.config.get("queue_name", "ai.generation"))

                # Wait for queue to clear
                await asyncio.sleep(3)

                # Simulate concurrent users: each user sends requests sequentially with think time
                start_time = time.perf_counter()
                user_results = []
                rate_limited_count = 0

                # Launch users in parallel
                user_tasks = []
                for user in range(num_users):
                    user_tasks.append(self._simulate_user_session(
                        session, user, requests_per_user
                    ))

                user_results = await asyncio.gather(*user_tasks)

                # Flatten results
                flat_results = [r for sublist in user_results for r in sublist]

                # Count rate limited
                rate_limited_count = sum(1 for r in flat_results if r.get("status_code") == 429)
                if rate_limited_count > 0:
                    print(f"    [WARN] {rate_limited_count} requests rate limited")
                    self._was_rate_limited = True

                # Track successful requests and wait for completion
                successful_ids = []
                start_times = {}
                batch_start = time.perf_counter()
                for r in flat_results:
                    if r.get("success") and r.get("api_request_id"):
                        successful_ids.append(r["api_request_id"])
                        start_times[r["api_request_id"]] = r.get("request_start_time", batch_start)

                # Wait for all requests to complete
                print(f"    Waiting for {len(successful_ids)} requests to complete...")
                completion_results = await self._wait_for_completion(
                    session, successful_ids, start_times, timeout_seconds=300
                )

                total_time = time.perf_counter() - start_time

                # Calculate stats based on actual completion
                completed_count = sum(1 for r in completion_results.values() if r.get("status") == "completed")

                client_times = [r["client_response_ms"] for r in flat_results if r.get("client_response_ms")]
                success_count = sum(1 for r in flat_results if r.get("success"))

                user_result = {
                    "num_users": num_users,
                    "total_requests": num_users * requests_per_user,
                    "requests_sent": success_count,
                    "requests_completed": completed_count,
                    "total_time_seconds": round(total_time, 2),
                    "throughput_req_per_sec": round(completed_count / total_time, 2) if total_time > 0 else 0,
                    "avg_response_ms": round(sum(client_times) / len(client_times), 2) if client_times else 0,
                    "rate_limited_count": rate_limited_count,
                }

                results.append(user_result)
                print(f"    Sent: {success_count}, Completed: {completed_count}, "
                      f"Throughput: {user_result['throughput_req_per_sec']} req/s")

                # Wait between user counts to let system recover
                await asyncio.sleep(10)

        stats = {
            "test_name": "concurrent_users",
            "user_counts_tested": user_counts,
            "requests_per_user": requests_per_user,
            "results": results,
        }

        self.all_results["concurrent_users"] = {
            "user_counts_tested": user_counts,
            "requests_per_user": requests_per_user,
            "results": results,
        }
        return stats

    async def _simulate_user_session(
        self,
        session: aiohttp.ClientSession,
        user_id: int,
        num_requests: int
    ) -> list[dict]:
        """Simulate a single user session with think time between requests."""
        import random
        results = []
        for req in range(num_requests):
            result = await self._send_with_backoff(
                session, user_id * 1000 + req
            )
            results.append(result)
            # Think time between requests (0.5-1.5 seconds)
            if req < num_requests - 1:
                await asyncio.sleep(0.5 + random.uniform(0, 1.0))
        return results

    async def test_queue_saturation(
        self,
        num_requests: int = 100
    ) -> dict[str, Any]:
        """
        Test queue saturation with burst of requests.
        Waits for queue to drain completely.
        """
        print(f"\n[BENCHMARK] Queue Saturation Test")
        print(f"  Sending {num_requests} requests in burst...")

        # Check if previously rate limited
        if getattr(self, '_was_rate_limited', False):
            print("  [INFO] Waiting 30s after rate limiting...")
            await asyncio.sleep(30)
            self._was_rate_limited = False

        async with MetricsCollector(self.config) as collector:
            # Purge queue
            await collector.purge_queue(self.config.get("queue_name", "ai.generation"))

            # Wait for queue to clear
            await asyncio.sleep(2)

            # Use shared session
            connector = aiohttp.TCPConnector(limit=100)
            async with aiohttp.ClientSession(connector=connector) as session:
                # Start monitoring
                snapshots = []
                start_time = time.perf_counter()

                async def monitor_loop():
                    while time.time() - start_time < 180:  # Monitor for 3 minutes max
                        metrics = await collector.get_queue_metrics(
                            self.config.get("queue_name", "ai.generation")
                        )
                        metrics["elapsed_seconds"] = time.time() - start_time
                        snapshots.append(metrics)
                        await asyncio.sleep(0.5)
                        # Stop if queue is empty
                        if metrics.get("messages", 0) == 0 and metrics.get("messages_ready", 0) == 0:
                            break

                # Start monitoring in background
                monitor_task = asyncio.create_task(monitor_loop())

                # Send burst of requests with rate limiting
                print("  Sending request burst in batches...")
                burst_start = time.perf_counter()
                rate_limited_count = 0
                successful_sent = 0

                batch_size = 10
                for batch_start_i in range(0, num_requests, batch_size):
                    actual_batch_size = min(batch_size, num_requests - batch_start_i)
                    tasks = [self._send_with_backoff(session, batch_start_i + i) for i in range(actual_batch_size)]
                    batch_results = await asyncio.gather(*tasks)

                    successful_sent += sum(1 for r in batch_results if r.get("success"))
                    rate_limited_count += sum(1 for r in batch_results if r.get("status_code") == 429)

                    if rate_limited_count > 0:
                        self._was_rate_limited = True

                    await asyncio.sleep(0.5)

                burst_time = time.perf_counter() - burst_start

                # Wait for queue to drain (poll until empty)
                print("  Waiting for queue to drain...")
                drain_timeout = 180  # 3 minutes max
                drain_start = time.perf_counter()
                while time.time() - drain_start < drain_timeout:
                    metrics = await collector.get_queue_metrics(
                        self.config.get("queue_name", "ai.generation")
                    )
                    if metrics.get("messages", 0) == 0 and metrics.get("messages_ready", 0) == 0:
                        print(f"  Queue drained after {round(time.time() - drain_start, 1)}s")
                        break
                    await asyncio.sleep(1)

                # Stop monitoring
                await asyncio.wait_for(monitor_task, timeout=5)

            # Analyze saturation
            peak_queue_length = max((s["messages"] for s in snapshots), default=0)
            queue_drained_at = [s["elapsed_seconds"] for s in snapshots if s["messages"] == 0 and s["messages_ready"] == 0]
            time_to_drain = min(queue_drained_at) if queue_drained_at else 0

            # Calculate queue growth rate
            queue_growth_rates = []
            for i in range(1, len(snapshots)):
                if snapshots[i]["messages"] > snapshots[i-1]["messages"]:
                    growth = snapshots[i]["messages"] - snapshots[i-1]["messages"]
                    queue_growth_rates.append(growth)
            avg_growth_rate = sum(queue_growth_rates) / len(queue_growth_rates) if queue_growth_rates else 0

            result = {
                "test_name": "queue_saturation",
                "requests_sent": num_requests,
                "successful_requests": successful_sent,
                "rate_limited_count": rate_limited_count,
                "burst_time_seconds": round(burst_time, 2),
                "peak_queue_length": peak_queue_length,
                "time_to_drain_seconds": round(time_to_drain, 2),
                "avg_queue_growth_rate": round(avg_growth_rate, 2),
                "snapshots": snapshots,
            }

            self.all_results["queue_saturation"] = snapshots
            return result

    # ==================== Main Execution ====================

    async def run_full_benchmark(
        self,
        skip_optional: bool = False
    ) -> dict[str, Any]:
        """
        Run complete benchmark suite.

        Args:
            skip_optional: Skip concurrent_users and queue_saturation tests
        """
        print("=" * 60)
        print(f"EXAMORA BENCHMARK - Run ID: {self.run_id}")
        print("=" * 60)
        print(f"Configuration:")
        print(f"  Warm-up requests: {self.config.get('warmup_requests')}")
        print(f"  Benchmark requests: {self.config.get('benchmark_requests')}")
        print(f"  Number of runs: {self.config.get('num_runs')}")
        print(f"  Concurrency: {self.config.get('concurrency')}")

        # Collect environment info
        print("\n[SETUP] Collecting environment information...")
        collector = MetricsCollector(self.config)

        try:
            # Test database connection
            conn = collector.get_db_connection()
            conn.close()
            self.environment_info = collector.get_environment_info()
        except Exception as e:
            print(f"  Warning: Could not collect full environment info: {e}")
            self.environment_info = {
                "timestamp": datetime.now().isoformat(),
                "note": "Environment info collection failed - some metrics may use sample data",
            }

        benchmark_start = time.perf_counter()
        all_results = {}

        # Run mandatory tests
        print("\n" + "=" * 60)
        print("MANDATORY TESTS")
        print("=" * 60)

        # Test 1: Client Response Time
        for run in range(self.config.get("num_runs", 5)):
            print(f"\n--- Run {run + 1}/{self.config.get('num_runs', 5)} ---")
            result = await self.test_client_response_time(
                num_requests=self.config.get("benchmark_requests", 100),
                concurrency=self.config.get("concurrency", 5)
            )
            all_results[f"client_response_run_{run + 1}"] = result

            # Aggregate raw metrics
            for r in result.get("individual_results", []):
                r["run_id"] = self.run_id
                r["run_number"] = run + 1
                r["test_type"] = "client_response_time"
                self.raw_metrics.append(r)

            # Wait between runs to let system recover
            if run < self.config.get("num_runs", 5) - 1:
                print("  Waiting 10 seconds for system recovery...")
                await asyncio.sleep(10)

        # Test 2: Queue Metrics - wait 15s cooldown
        print("\n[SETUP] Waiting 15 seconds before Queue Metrics test...")
        await asyncio.sleep(15)
        result = await self.test_queue_metrics(duration_seconds=60, num_requests=50)
        all_results["queue_metrics"] = result

        # Test 3: Worker Scaling - wait 15s cooldown
        print("\n[SETUP] Waiting 15 seconds before Worker Scaling test...")
        await asyncio.sleep(15)
        result = await self.test_worker_scaling(
            worker_counts=[1, 2, 4],
            requests_per_config=20
        )
        all_results["worker_scaling"] = result

        # Test 4: Message Processing - wait 15s cooldown
        print("\n[SETUP] Waiting 15 seconds before Message Processing test...")
        await asyncio.sleep(15)
        result = await self.test_message_processing(num_requests=100)
        all_results["message_processing"] = result

        # Test 5: Failure Recovery - wait 15s cooldown
        print("\n[SETUP] Waiting 15 seconds before Failure Recovery test...")
        await asyncio.sleep(15)
        result = await self.test_failure_recovery(num_requests=10)
        all_results["failure_recovery"] = result

        # Run optional tests if not skipped
        if not skip_optional:
            print("\n" + "=" * 60)
            print("OPTIONAL TESTS")
            print("=" * 60)

            # Test 6: Concurrent Users
            result = await self.test_concurrent_users(
                user_counts=[1, 5, 10],
                requests_per_user=10
            )
            all_results["concurrent_users"] = result

            # Test 7: Queue Saturation
            result = await self.test_queue_saturation(num_requests=100)
            all_results["queue_saturation"] = result

        total_time = time.perf_counter() - benchmark_start

        # Compile final results
        final_results = {
            "run_id": self.run_id,
            "benchmark_start": datetime.now().isoformat(),
            "total_time_seconds": round(total_time, 2),
            "environment": self.environment_info,
            "configuration": self.config,
            "results": all_results,
            "raw_metrics": self.raw_metrics,
        }

        # Save raw metrics
        self._save_raw_metrics()

        # Export to CSV for statistical analysis
        self._export_csv()
        self._export_worker_scaling_csv()
        self._export_concurrent_users_csv()

        print("\n" + "=" * 60)
        print("BENCHMARK COMPLETED")
        print(f"Total time: {total_time:.2f} seconds")
        print(f"Results saved to: {self.results_dir}")
        print("=" * 60)

        return final_results

    def _save_raw_metrics(self) -> None:
        """Save raw metrics to JSON file."""
        raw_file = self.results_dir / "raw_metrics.json"
        with open(raw_file, "w") as f:
            json.dump(self.raw_metrics, f, indent=2)
        print(f"\n[Saved] Raw metrics: {raw_file}")

    def _export_csv(self) -> None:
        """Export raw metrics to CSV for statistical analysis."""
        if not self.raw_metrics:
            print("\n[SKIP] No raw metrics to export")
            return

        csv_file = self.results_dir / "raw_metrics.csv"

        # Get all unique keys from raw metrics
        all_keys = set()
        for record in self.raw_metrics:
            all_keys.update(record.keys())

        # Define column order for better readability
        preferred_order = [
            "run_id", "run_number", "test_type", "request_id", "api_request_id",
            "success", "status_code", "client_response_ms", "completion_ms",
            "started_at", "completed_at", "worker_id", "trace_id",
            "enqueued_at", "enqueued_time_ms", "progress"
        ]

        # Sort columns with preferred order first
        columns = preferred_order + sorted(all_keys - set(preferred_order))

        try:
            with open(csv_file, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
                writer.writeheader()
                writer.writerows(self.raw_metrics)
            print(f"[Saved] CSV metrics: {csv_file}")
        except Exception as e:
            print(f"[ERROR] Failed to export CSV: {e}")

    def _export_worker_scaling_csv(self) -> None:
        """Export worker scaling results to CSV."""
        worker_results = self.all_results.get("worker_scaling", [])

        if not worker_results:
            print("\n[SKIP] No worker scaling data to export")
            return

        csv_file = self.results_dir / "worker_scaling.csv"

        try:
            with open(csv_file, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow([
                    "worker_count", "requests_sent", "requests_completed",
                    "total_time_seconds", "throughput_req_per_sec",
                    "avg_client_response_ms", "scaling_efficiency",
                    "cpu_mean", "cpu_max", "memory_mean", "memory_max"
                ])

                for r in worker_results:
                    resource = r.get("resource_usage", {})
                    writer.writerow([
                        r.get("worker_count"),
                        r.get("requests_sent"),
                        r.get("requests_completed"),
                        r.get("total_time_seconds"),
                        r.get("throughput_req_per_sec"),
                        r.get("avg_client_response_ms"),
                        r.get("scaling_efficiency"),
                        resource.get("cpu", {}).get("mean"),
                        resource.get("cpu", {}).get("max"),
                        resource.get("memory", {}).get("mean"),
                        resource.get("memory", {}).get("max"),
                    ])
            print(f"[Saved] Worker scaling CSV: {csv_file}")
        except Exception as e:
            print(f"[ERROR] Failed to export worker scaling CSV: {e}")

    def _export_concurrent_users_csv(self) -> None:
        """Export concurrent users results to CSV."""
        concurrent_results = self.all_results.get("concurrent_users", {}).get("results", [])

        if not concurrent_results:
            print("\n[SKIP] No concurrent users data to export")
            return

        csv_file = self.results_dir / "concurrent_users.csv"

        try:
            with open(csv_file, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow([
                    "num_users", "total_requests", "requests_sent",
                    "requests_completed", "total_time_seconds",
                    "throughput_req_per_sec", "avg_response_ms",
                    "rate_limited_count"
                ])

                for r in concurrent_results:
                    writer.writerow([
                        r.get("num_users"),
                        r.get("total_requests"),
                        r.get("requests_sent"),
                        r.get("requests_completed"),
                        r.get("total_time_seconds"),
                        r.get("throughput_req_per_sec"),
                        r.get("avg_response_ms"),
                        r.get("rate_limited_count", 0),
                    ])
            print(f"[Saved] Concurrent users CSV: {csv_file}")
        except Exception as e:
            print(f"[ERROR] Failed to export concurrent users CSV: {e}")

    def save_results(self, results: dict[str, Any], filename: str = "benchmark_results.json") -> Path:
        """Save benchmark results to JSON file."""
        output_file = self.results_dir / filename
        with open(output_file, "w") as f:
            json.dump(results, f, indent=2, default=str)
        print(f"[Saved] Results: {output_file}")
        return output_file


# ==================== Entry Point ====================

async def run_demo_mode():
    """Generate sample data and charts without requiring services."""
    print("=" * 60)
    print("EXAMORA BENCHMARK - DEMO MODE")
    print("Generating sample data and charts...")
    print("=" * 60)

    # Generate sample results
    sample_results = {
        "run_id": "demo-run",
        "benchmark_start": datetime.now().isoformat(),
        "total_time_seconds": 3600,
        "environment": {
            "platform": "Windows 10/11",
            "python_version": "3.13",
            "node_version": "24.x",
            "rabbitmq_version": "4.x",
            "postgresql_version": "PostgreSQL 17",
            "docker_version": "Docker 28.x",
        },
        "configuration": {
            "warmup_requests": 10,
            "benchmark_requests": 100,
            "num_runs": 5,
            "concurrency": 5,
        },
        "results": {},
        "raw_metrics": [],
    }

    runner = BenchmarkRunner()
    runner.environment_info = sample_results["environment"]

    # Save sample results
    runner.save_results(sample_results, "benchmark_results.json")

    print("\n[Saved] Sample results to results/benchmark_results.json")


async def main():
    """Main entry point."""
    import sys

    # Check for demo mode flag
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        await run_demo_mode()
        print("\nNow run: py charts_generator.py")
        print("Then run: py report_generator.py")
        return

    runner = BenchmarkRunner()

    # Run benchmark
    results = await runner.run_full_benchmark(skip_optional=False)

    # Save results
    runner.save_results(results)

    print("\nNext steps:")
    print("1. Run: py charts_generator.py")
    print("2. Run: py report_generator.py")
    print("3. Check results/ directory for outputs")


if __name__ == "__main__":
    asyncio.run(main())
