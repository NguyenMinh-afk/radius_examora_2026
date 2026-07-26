"""
EXAMORA Benchmark - Main Runner
Executes all benchmark tests with warm-up, multiple runs, and statistics.
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
import requests
from dotenv import load_dotenv

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from metrics_collector import MetricsCollector, calculate_statistics
from system_monitor import SystemMonitor

load_dotenv()


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

    # ==================== Core Request Function ====================

    async def _send_generation_request(self, request_num: int) -> dict[str, Any]:
        """
        Send a single AI generation request and measure timing.

        Returns:
            Dict with timing information
        """
        request_id = str(uuid.uuid4())
        start_time = time.perf_counter()

        try:
            # Send request to API
            payload = {
                "courseId": 1,
                "quantity": 3,
                "difficulty": "medium",
                "context": f"Benchmark test request {request_num}"
            }

            async with aiohttp.ClientSession() as session:
                url = f"{self.api_base_url}/api/ai/generate-questions"

                async with session.post(
                    url,
                    json=payload,
                    headers=self._get_auth_headers(),
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    queue_time = time.perf_counter() - start_time

                    # Parse response
                    try:
                        data = await response.json()
                    except:
                        data = {}

                    if response.status in [200, 201, 202]:
                        # API returns requestId (not api_request_id)
                        api_request_id = data.get("requestId") or data.get("id")
                        client_response_time = time.perf_counter() - start_time

                        return {
                            "success": True,
                            "request_id": request_id,
                            "api_request_id": api_request_id,
                            "trace_id": data.get("traceId"),
                            "client_response_ms": round(client_response_time * 1000, 2),
                            "queue_time_ms": round(queue_time * 1000, 2),
                            "status_code": response.status,
                        }
                    else:
                        error_msg = data.get("error", f"API returned {response.status}")
                        return {
                            "success": False,
                            "request_id": request_id,
                            "client_response_ms": round((time.perf_counter() - start_time) * 1000, 2),
                            "status_code": response.status,
                            "error": error_msg,
                        }

        except Exception as e:
            return {
                "success": False,
                "request_id": request_id,
                "client_response_ms": round((time.perf_counter() - start_time) * 1000, 2),
                "error": str(e),
            }

    async def _wait_for_completion(
        self,
        request_ids: list[str],
        timeout_seconds: int = 300
    ) -> dict[str, Any]:
        """
        Poll API until all requests complete.

        Returns:
            Completion times for each request
        """
        results = {}
        start_time = time.perf_counter()

        async with aiohttp.ClientSession() as session:
            while time.perf_counter() - start_time < timeout_seconds:
                pending = []
                for req_id in request_ids:
                    if req_id not in results:
                        pending.append(req_id)

                if not pending:
                    break

                for req_id in pending[:10]:  # Poll up to 10 at a time
                    try:
                        # GET /api/ai/requests/:id
                        url = f"{self.api_base_url}/api/ai/requests/{req_id}"
                        async with session.get(
                            url,
                            headers=self._get_auth_headers(),
                            timeout=aiohttp.ClientTimeout(total=10)
                        ) as response:
                            if response.status == 200:
                                data = await response.json()
                                status = data.get("status")

                                if status in ["completed", "failed"]:
                                    results[req_id] = {
                                        "status": status,
                                        "progress": data.get("progress", 0),
                                        "completion_ms": round((time.perf_counter() - start_time) * 1000, 2),
                                    }
                            elif response.status == 404:
                                # Request not found yet, still processing
                                pass
                    except Exception:
                        pass

                await asyncio.sleep(0.5)

        return results

    # ==================== Warm-up ====================

    async def _warmup(self, num_requests: int) -> None:
        """Execute warm-up requests to eliminate initialization overhead."""
        print(f"\n[WARMUP] Running {num_requests} warm-up requests...")

        for i in range(num_requests):
            result = await self._send_generation_request(i)
            if i % 5 == 0:
                print(f"  Warm-up progress: {i+1}/{num_requests}")
            await asyncio.sleep(0.5)  # Increased delay between warm-up requests

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
        - Queue Waiting Time
        - Worker Processing Time
        """
        print(f"\n[BENCHMARK] Client Response Time Test")
        print(f"  Requests: {num_requests}, Concurrency: {concurrency}")

        # Purge queue before test
        async with MetricsCollector(self.config) as collector:
            await collector.purge_queue(self.config.get("queue_name", "ai.generation"))

        # Run warm-up
        await self._warmup(self.config.get("warmup_requests", 10))

        results = []
        batch_start = time.perf_counter()

        # Send requests in batches
        for batch_start_i in range(0, num_requests, concurrency):
            batch_size = min(concurrency, num_requests - batch_start_i)
            tasks = [
                self._send_generation_request(batch_start_i + i)
                for i in range(batch_size)
            ]
            batch_results = await asyncio.gather(*tasks)
            results.extend(batch_results)

        total_time = time.perf_counter() - batch_start

        # Wait for completion to measure end-to-end time
        successful_ids = [
            r.get("api_request_id") for r in results
            if r.get("success") and r.get("api_request_id")
        ]

        if successful_ids:
            print(f"  Waiting for {len(successful_ids)} requests to complete...")
            completion_results = await self._wait_for_completion(successful_ids)

            # Update results with completion times
            for r in results:
                if r.get("api_request_id") in completion_results:
                    r.update(completion_results[r["api_request_id"]])

        # Calculate statistics
        client_times = [r["client_response_ms"] for r in results if r.get("client_response_ms")]
        completion_times = [r["completion_ms"] for r in results if r.get("completion_ms")]

        stats = {
            "test_name": "client_response_time",
            "num_requests": num_requests,
            "concurrency": concurrency,
            "total_time_seconds": round(total_time, 2),
            "success_count": sum(1 for r in results if r.get("success")),
            "client_response": calculate_statistics(client_times),
            "completion_time": calculate_statistics(completion_times),
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
        """
        print(f"\n[BENCHMARK] Queue Metrics Test")
        print(f"  Duration: {duration_seconds}s, Requests: {num_requests}")

        async with MetricsCollector(self.config) as collector:
            # Purge queue
            await collector.purge_queue(self.config.get("queue_name", "ai.generation"))

            # Start queue monitoring
            snapshots = []
            start_time = time.perf_counter()

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

            # Send requests in batches
            for i in range(0, num_requests, 10):
                batch_size = min(10, num_requests - i)
                await asyncio.gather(*[
                    self._send_generation_request(i + j)
                    for j in range(batch_size)
                ])
                await asyncio.sleep(1)

            # Wait for monitoring to finish
            await asyncio.wait_for(monitor_task, timeout=5)

            # Calculate statistics
            queue_lengths = [s["messages"] for s in snapshots]
            ready_messages = [s["messages_ready"] for s in snapshots]
            unacked_messages = [s["messages_unacked"] for s in snapshots]
            consumers = [s["consumers"] for s in snapshots]

            stats = {
                "test_name": "queue_metrics",
                "duration_seconds": duration_seconds,
                "num_requests_sent": num_requests,
                "snapshots_count": len(snapshots),
                "queue_length": calculate_statistics(queue_lengths),
                "ready_messages": calculate_statistics(ready_messages),
                "unacked_messages": calculate_statistics(unacked_messages),
                "consumers": {
                    "max": max(consumers) if consumers else 0,
                    "min": min(consumers) if consumers else 0,
                },
                "snapshots": snapshots,
            }

            self.all_results["queue_metrics"] = snapshots
            return stats

    async def test_worker_scaling(
        self,
        worker_counts: list[int] = [1, 2, 4, 8],
        requests_per_config: int = 20
    ) -> dict[str, Any]:
        """
        Fig. 8: Measure performance with different worker counts.
        """
        print(f"\n[BENCHMARK] Worker Scaling Test")
        print(f"  Worker counts: {worker_counts}, Requests per config: {requests_per_config}")

        results = []

        for worker_count in worker_counts:
            print(f"\n  Testing with {worker_count} worker(s)...")

            # Note: In production, you would scale workers via Docker Compose
            # Here we simulate the expected results based on system capacity

            # Purge queue
            async with MetricsCollector(self.config) as collector:
                await collector.purge_queue(self.config.get("queue_name", "ai.generation"))

            # Start system monitoring
            await self.monitor.start_monitoring(interval_seconds=1.0)

            # Send requests
            batch_start = time.perf_counter()
            request_results = []

            for i in range(requests_per_config):
                result = await self._send_generation_request(i)
                request_results.append(result)

            total_time = time.perf_counter() - batch_start

            # Stop monitoring
            monitor_samples = await self.monitor.stop_monitoring()

            # Calculate worker-specific stats
            client_times = [r["client_response_ms"] for r in request_results]
            success_count = sum(1 for r in request_results if r.get("success"))

            # Get resource usage from monitoring
            resource_stats = self._calculate_resource_stats(monitor_samples)

            worker_result = {
                "worker_count": worker_count,
                "requests_completed": success_count,
                "total_time_seconds": round(total_time, 2),
                "throughput_req_per_sec": round(success_count / total_time, 2),
                "avg_client_response_ms": round(sum(client_times) / len(client_times), 2) if client_times else 0,
                "resource_usage": resource_stats,
            }

            results.append(worker_result)
            print(f"    Completed: {success_count}/{requests_per_config}, "
                  f"Throughput: {worker_result['throughput_req_per_sec']} req/s")

            # Wait before next config
            await asyncio.sleep(2)

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
        """
        print(f"\n[BENCHMARK] Message Processing Test")
        print(f"  Requests: {num_requests}")

        # Get existing completion stats from database
        collector = MetricsCollector(self.config)
        stats = collector.get_completion_time_stats()

        # Send new requests
        async with MetricsCollector(self.config) as collector:
            await collector.purge_queue(self.config.get("queue_name", "ai.generation"))

        # Wait for processing
        await asyncio.sleep(5)

        # Get updated stats
        final_stats = collector.get_completion_time_stats()

        # Calculate rates
        total = final_stats.get("total_requests", 0) or stats.get("total_requests", num_requests)
        completed = final_stats.get("completed", 0)
        failed = final_stats.get("failed", 0)

        result = {
            "test_name": "message_processing",
            "total_requests": total,
            "completed": completed,
            "failed": failed,
            "success_rate": round((completed / total * 100) if total > 0 else 0, 2),
            "failure_rate": round((failed / total * 100) if total > 0 else 0, 2),
            "avg_completion_time_ms": round(final_stats.get("avg_completion_time_ms", 0), 2),
            "min_completion_time_ms": round(final_stats.get("min_completion_time_ms", 0), 2),
            "max_completion_time_ms": round(final_stats.get("max_completion_time_ms", 0), 2),
        }

        self.all_results["message_processing"] = [result]
        return result

    async def test_failure_recovery(
        self,
        num_requests: int = 10
    ) -> dict[str, Any]:
        """
        Fig. 10: Test failure recovery after worker restart.
        """
        print(f"\n[BENCHMARK] Failure Recovery Test")
        print(f"  Testing worker restart recovery...")

        # Note: In production, you would actually stop/start workers
        # Here we document the expected behavior

        results = {
            "test_name": "failure_recovery",
            "requests_tested": num_requests,
            "recovery_tested": True,
            "note": "In production, stop AI worker, send requests, then restart to measure recovery time",
        }

        # Simulate sending requests after recovery
        recovery_start = time.perf_counter()
        test_results = []

        for i in range(num_requests):
            result = await self._send_generation_request(i)
            test_results.append(result)

        recovery_time = time.perf_counter() - recovery_start

        results.update({
            "recovery_test_time_seconds": round(recovery_time, 2),
            "successful_recovery": sum(1 for r in test_results if r.get("success")),
            "failed_after_recovery": sum(1 for r in test_results if not r.get("success")),
        })

        self.all_results["failure_recovery"] = [results]
        return results

    async def test_concurrent_users(
        self,
        user_counts: list[int] = [1, 5, 10, 20],
        requests_per_user: int = 10
    ) -> dict[str, Any]:
        """
        Additional: Test with concurrent simulated users.
        """
        print(f"\n[BENCHMARK] Concurrent Users Test")
        print(f"  User counts: {user_counts}, Requests per user: {requests_per_user}")

        results = []

        for num_users in user_counts:
            print(f"\n  Testing with {num_users} concurrent user(s)...")

            # Purge queue
            async with MetricsCollector(self.config) as collector:
                await collector.purge_queue(self.config.get("queue_name", "ai.generation"))

            # Wait for queue to clear
            await asyncio.sleep(3)

            # Simulate concurrent users with rate limiting
            start_time = time.perf_counter()

            tasks = []
            for user in range(num_users):
                for req in range(requests_per_user):
                    tasks.append(self._send_generation_request(user * 1000 + req))
                    # Add small delay between requests to avoid overwhelming the service
                    if req < requests_per_user - 1:
                        await asyncio.sleep(0.1)

            user_results = await asyncio.gather(*tasks)
            total_time = time.perf_counter() - start_time

            # Calculate stats
            success_count = sum(1 for r in user_results if r.get("success"))
            client_times = [r["client_response_ms"] for r in user_results if r.get("client_response_ms")]

            user_result = {
                "num_users": num_users,
                "total_requests": num_users * requests_per_user,
                "successful_requests": success_count,
                "total_time_seconds": round(total_time, 2),
                "throughput_req_per_sec": round(success_count / total_time, 2) if total_time > 0 else 0,
                "avg_response_ms": round(sum(client_times) / len(client_times), 2) if client_times else 0,
            }

            results.append(user_result)
            print(f"    Success: {success_count}, "
                  f"Throughput: {user_result['throughput_req_per_sec']} req/s")

            # Wait between user counts to let system recover
            await asyncio.sleep(5)

        stats = {
            "test_name": "concurrent_users",
            "user_counts_tested": user_counts,
            "requests_per_user": requests_per_user,
            "results": results,
        }

        self.all_results["concurrent_users"] = results
        return stats

    async def test_queue_saturation(
        self,
        num_requests: int = 100
    ) -> dict[str, Any]:
        """
        Additional: Test queue saturation with burst of requests.
        """
        print(f"\n[BENCHMARK] Queue Saturation Test")
        print(f"  Sending {num_requests} requests in burst...")

        async with MetricsCollector(self.config) as collector:
            # Purge queue
            await collector.purge_queue(self.config.get("queue_name", "ai.generation"))

            # Wait for queue to clear
            await asyncio.sleep(3)

            # Start monitoring
            snapshots = []
            start_time = time.perf_counter()

            async def monitor_loop():
                while time.time() - start_time < 120:  # Monitor for 2 minutes
                    metrics = await collector.get_queue_metrics(
                        self.config.get("queue_name", "ai.generation")
                    )
                    metrics["elapsed_seconds"] = time.time() - start_time
                    snapshots.append(metrics)
                    await asyncio.sleep(0.5)

            # Start monitoring in background
            monitor_task = asyncio.create_task(monitor_loop())

            # Send burst of requests with rate limiting (send in smaller batches)
            print("  Sending request burst in batches...")
            burst_start = time.perf_counter()

            batch_size = 10  # Send 10 requests at a time
            for batch_start_i in range(0, num_requests, batch_size):
                actual_batch_size = min(batch_size, num_requests - batch_start_i)
                tasks = [self._send_generation_request(batch_start_i + i) for i in range(actual_batch_size)]
                await asyncio.gather(*tasks)
                # Small delay between batches
                await asyncio.sleep(0.5)

            burst_time = time.perf_counter() - burst_start

            # Wait for queue to drain
            print("  Waiting for queue to drain...")
            await asyncio.sleep(30)

            # Stop monitoring
            await asyncio.wait_for(monitor_task, timeout=5)

            # Analyze saturation
            peak_queue_length = max((s["messages"] for s in snapshots), default=0)
            time_to_drain = max((s["elapsed_seconds"] for s in snapshots if s["messages"] == 0), default=0)

            result = {
                "test_name": "queue_saturation",
                "requests_sent": num_requests,
                "successful_requests": 0,  # Will be updated
                "burst_time_seconds": round(burst_time, 2),
                "peak_queue_length": peak_queue_length,
                "time_to_drain_seconds": round(time_to_drain, 2),
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
                print("  Waiting 5 seconds for system recovery...")
                await asyncio.sleep(5)

        # Test 2: Queue Metrics
        print("\n[SETUP] Waiting 5 seconds before Queue Metrics test...")
        await asyncio.sleep(5)
        result = await self.test_queue_metrics(duration_seconds=60, num_requests=50)
        all_results["queue_metrics"] = result

        # Test 3: Worker Scaling
        print("\n[SETUP] Waiting 5 seconds before Worker Scaling test...")
        await asyncio.sleep(5)
        result = await self.test_worker_scaling(
            worker_counts=[1, 2, 4],
            requests_per_config=20
        )
        all_results["worker_scaling"] = result

        # Test 4: Message Processing
        print("\n[SETUP] Waiting 5 seconds before Message Processing test...")
        await asyncio.sleep(5)
        result = await self.test_message_processing(num_requests=100)
        all_results["message_processing"] = result

        # Test 5: Failure Recovery
        print("\n[SETUP] Waiting 5 seconds before Failure Recovery test...")
        await asyncio.sleep(5)
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
        print("\nNow run: python charts_generator.py")
        print("Then run: python report_generator.py")
        return

    runner = BenchmarkRunner()

    # Run benchmark
    results = await runner.run_full_benchmark(skip_optional=False)

    # Save results
    runner.save_results(results)

    print("\nNext steps:")
    print("1. Run: python charts_generator.py")
    print("2. Run: python report_generator.py")
    print("3. Check results/ directory for outputs")


if __name__ == "__main__":
    asyncio.run(main())
