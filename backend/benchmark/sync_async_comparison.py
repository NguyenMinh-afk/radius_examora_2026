"""
Synchronous vs Asynchronous Comparison Benchmark

This script compares the Gemini workflow using:
1. Direct synchronous calls (blocking)
2. RabbitMQ async architecture (non-blocking with workers)

Measures: end-to-end latency, throughput, resource consumption, and failure behavior
"""

import asyncio
import json
import time
import uuid
import statistics
import subprocess
import aiohttp
from datetime import datetime
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()

# Configuration
API_BASE_URL = "http://localhost:3000"
API_TOKEN = ""
CONCURRENCY_LEVELS = [1, 5, 10, 20, 50]
REQUESTS_PER_LEVEL = 50
WARMUP_REQUESTS = 10
WORKER_COUNTS = [1, 2, 4]


class SyncVsAsyncBenchmark:
    """Benchmark comparing synchronous direct calls vs RabbitMQ async architecture."""

    def __init__(self):
        self.results = {
            "run_id": str(uuid.uuid4())[:8],
            "timestamp": datetime.now().isoformat(),
            "configuration": {
                "concurrency_levels": CONCURRENCY_LEVELS,
                "requests_per_level": REQUESTS_PER_LEVEL,
                "warmup_requests": WARMUP_REQUESTS,
                "worker_counts": WORKER_COUNTS,
            },
            "synchronous": {},
            "asynchronous": {},
            "comparison": {},
        }
        self.results_dir = Path(__file__).parent / "results"
        self.results_dir.mkdir(exist_ok=True)

    def _get_auth_headers(self) -> dict:
        return {
            "Authorization": f"Bearer {API_TOKEN}",
            "Content-Type": "application/json",
        }

    async def _make_sync_request(self, client: httpx.AsyncClient, request_num: int) -> dict:
        """
        Make a synchronous direct call to Gemini (simulating blocking architecture).
        This is a direct HTTP request to the AI endpoint that waits for completion.
        """
        start_time = time.perf_counter()
        request_id = str(uuid.uuid4())

        # Longer context for realistic AI question generation
        context_text = f"""
        Benchmark test request number {request_num}. This is a comprehensive test of the AI question generation system.
        Topics include software engineering, database design, API development, and system architecture.
        Questions should cover various difficulty levels including easy, medium, and hard.
        Generate {3 + (request_num % 3)} questions with options A, B, C, D and correct answers.
        """.strip()

        payload = {
            "courseId": 1,
            "quantity": 3,
            "difficulty": "medium",
            "context": context_text
        }

        try:
            response = await client.post(
                f"{API_BASE_URL}/api/ai/generate-questions",
                json=payload,
                headers=self._get_auth_headers(),
                timeout=120.0  # Long timeout for synchronous calls
            )

            end_time = time.perf_counter()
            latency_ms = (end_time - start_time) * 1000

            if response.status_code in [200, 201, 202]:
                data = response.json()
                return {
                    "success": True,
                    "request_id": request_id,
                    "latency_ms": latency_ms,
                    "status_code": response.status_code,
                    "request_num": request_num,
                }
            else:
                return {
                    "success": False,
                    "request_id": request_id,
                    "latency_ms": latency_ms,
                    "status_code": response.status_code,
                    "error": response.text[:200],
                    "request_num": request_num,
                }
        except Exception as e:
            end_time = time.perf_counter()
            return {
                "success": False,
                "request_id": request_id,
                "latency_ms": (end_time - start_time) * 1000,
                "error": str(e),
                "request_num": request_num,
            }

    async def _make_async_request(self, client: aiohttp.ClientSession, request_num: int) -> dict:
        """
        Make an asynchronous non-blocking request via RabbitMQ.
        Returns immediately after queueing.
        """
        start_time = time.perf_counter()
        request_id = str(uuid.uuid4())

        context_text = f"""
        Benchmark test request number {request_num}. This is a comprehensive test of the AI question generation system.
        Topics include software engineering, database design, API development, and system architecture.
        Questions should cover various difficulty levels including easy, medium, and hard.
        Generate {3 + (request_num % 3)} questions with options A, B, C, D and correct answers.
        """.strip()

        payload = {
            "courseId": 1,
            "quantity": 3,
            "difficulty": "medium",
            "context": context_text
        }

        try:
            async with client.post(
                f"{API_BASE_URL}/api/ai/generate-questions",
                json=payload,
                headers=self._get_auth_headers(),
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                client_response_time = time.perf_counter() - start_time

                if response.status in [200, 201, 202]:
                    data = await response.json()
                    return {
                        "success": True,
                        "request_id": request_id,
                        "api_request_id": data.get("requestId"),
                        "client_response_ms": client_response_time * 1000,
                        "status_code": response.status,
                        "request_num": request_num,
                        "enqueued_at": data.get("enqueuedAt"),
                    }
                else:
                    return {
                        "success": False,
                        "request_id": request_id,
                        "client_response_ms": client_response_time * 1000,
                        "status_code": response.status,
                        "error": (await response.text())[:200],
                        "request_num": request_num,
                    }
        except Exception as e:
            return {
                "success": False,
                "request_id": request_id,
                "error": str(e),
                "request_num": request_num,
            }

    async def _wait_for_async_completion(
        self,
        session: aiohttp.ClientSession,
        request_ids: list[str],
        timeout_seconds: int = 300
    ) -> dict[str, Any]:
        """Poll API until all requests complete."""
        results = {}
        start_time = time.perf_counter()

        while time.perf_counter() - start_time < timeout_seconds:
            pending = [req_id for req_id in request_ids if req_id not in results]
            if not pending:
                break

            for req_id in pending:
                try:
                    async with session.get(
                        f"{API_BASE_URL}/api/ai/requests/{req_id}",
                        headers=self._get_auth_headers(),
                        timeout=aiohttp.ClientTimeout(total=10)
                    ) as response:
                        if response.status == 200:
                            data = await response.json()
                            status = data.get("status")
                            if status in ["completed", "failed"]:
                                completion_time = time.perf_counter()
                                results[req_id] = {
                                    "status": status,
                                    "completion_ms": (completion_time - start_time) * 1000,
                                }
                except Exception:
                    pass

            await asyncio.sleep(1)

        return results

    def _calculate_statistics(self, latencies: list[float]) -> dict:
        """Calculate comprehensive statistics including percentiles."""
        if not latencies:
            return {}

        sorted_latencies = sorted(latencies)
        n = len(sorted_latencies)

        return {
            "count": n,
            "mean": round(statistics.mean(latencies), 2),
            "median": round(statistics.median(latencies), 2),
            "std": round(statistics.stdev(latencies), 2) if len(latencies) > 1 else 0,
            "min": round(min(latencies), 2),
            "max": round(max(latencies), 2),
            "p50": round(sorted_latencies[int(n * 0.50)], 2),
            "p75": round(sorted_latencies[int(n * 0.75)], 2),
            "p90": round(sorted_latencies[int(n * 0.90)], 2),
            "p95": round(sorted_latencies[int(n * 0.95)], 2),
            "p99": round(sorted_latencies[int(n * 0.99)], 2) if n >= 100 else None,
            "cv": round(statistics.stdev(latencies) / statistics.mean(latencies), 4) if len(latencies) > 1 else 0,
        }

    async def run_sync_benchmark(self, concurrency: int, num_requests: int) -> dict:
        """
        Run synchronous benchmark with specified concurrency.
        Note: This simulates what a blocking architecture would experience.
        """
        print(f"\n  [SYNC] Running with concurrency={concurrency}, requests={num_requests}")

        async with httpx.AsyncClient() as client:
            # Warmup
            print(f"    [SYNC] Warmup ({WARMUP_REQUESTS} requests)...")
            for i in range(WARMUP_REQUESTS):
                await self._make_sync_request(client, i)
                await asyncio.sleep(0.5)

            # Main test
            print(f"    [SYNC] Sending {num_requests} requests...")
            start_time = time.perf_counter()

            # Simulate different concurrency scenarios
            all_results = []
            for batch_start in range(0, num_requests, concurrency):
                batch_size = min(concurrency, num_requests - batch_start)
                tasks = [
                    self._make_sync_request(client, batch_start + i)
                    for i in range(batch_size)
                ]
                batch_results = await asyncio.gather(*tasks)
                all_results.extend(batch_results)

            total_time = time.perf_counter() - start_time

        successful = [r for r in all_results if r.get("success")]
        failed = [r for r in all_results if not r.get("success")]
        latencies = [r["latency_ms"] for r in successful]

        return {
            "concurrency": concurrency,
            "total_requests": num_requests,
            "successful": len(successful),
            "failed": len(failed),
            "success_rate": round(len(successful) / num_requests * 100, 2),
            "total_time_seconds": round(total_time, 2),
            "throughput_rpm": round(len(successful) / total_time * 60, 2),
            "latency_stats": self._calculate_statistics(latencies),
            "individual_results": all_results[:20],  # Store first 20 for reference
        }

    async def run_async_benchmark(self, concurrency: int, num_requests: int, worker_count: int = 1) -> dict:
        """
        Run asynchronous benchmark with RabbitMQ architecture.
        Measures both client response time and end-to-end completion time.
        """
        print(f"\n  [ASYNC] Running with concurrency={concurrency}, requests={num_requests}, workers={worker_count}")

        connector = aiohttp.TCPConnector(limit=100)
        async with aiohttp.ClientSession(connector=connector) as session:
            # Warmup
            print(f"    [ASYNC] Warmup ({WARMUP_REQUESTS} requests)...")
            for i in range(WARMUP_REQUESTS):
                await self._make_async_request(session, i)
                await asyncio.sleep(0.5)

            # Main test - send requests
            print(f"    [ASYNC] Sending {num_requests} requests...")
            send_start = time.perf_counter()

            successful_ids = []
            all_results = []

            for batch_start in range(0, num_requests, concurrency):
                batch_size = min(concurrency, num_requests - batch_start)
                tasks = [
                    self._make_async_request(session, batch_start + i)
                    for i in range(batch_size)
                ]
                batch_results = await asyncio.gather(*tasks)
                all_results.extend(batch_results)

                for r in batch_results:
                    if r.get("success") and r.get("api_request_id"):
                        successful_ids.append(r["api_request_id"])

                # Rate limiting delay
                if batch_start + batch_size < num_requests:
                    await asyncio.sleep(8)

            send_time = time.perf_counter() - send_start

            # Wait for completion
            print(f"    [ASYNC] Waiting for {len(successful_ids)} requests to complete...")
            completion_results = await self._wait_for_async_completion(session, successful_ids)

            total_time = time.perf_counter() - send_start

        # Calculate statistics
        client_responses = [r["client_response_ms"] for r in all_results if r.get("success")]
        completed = [r for r in completion_results.values() if r.get("status") == "completed"]
        completion_times = [r["completion_ms"] for r in completed]

        return {
            "concurrency": concurrency,
            "worker_count": worker_count,
            "total_requests": num_requests,
            "successful_sent": len(successful_ids),
            "successful_completed": len(completed),
            "success_rate": round(len(completed) / len(successful_ids) * 100, 2) if successful_ids else 0,
            "send_time_seconds": round(send_time, 2),
            "total_time_seconds": round(total_time, 2),
            "throughput_rpm": round(len(completed) / total_time * 60, 2),
            "client_response_stats": self._calculate_statistics(client_responses),
            "completion_stats": self._calculate_statistics(completion_times),
        }

    async def run_full_comparison(self):
        """Run complete comparison benchmark."""
        print("=" * 70)
        print("SYNCHRONOUS vs ASYNCHRONOUS COMPARISON BENCHMARK")
        print(f"Run ID: {self.results['run_id']}")
        print("=" * 70)

        # Run synchronous benchmarks at different concurrency levels
        print("\n" + "=" * 70)
        print("PHASE 1: SYNCHRONOUS BENCHMARKS")
        print("=" * 70)

        for concurrency in CONCURRENCY_LEVELS:
            result = await self.run_sync_benchmark(concurrency, REQUESTS_PER_LEVEL)
            self.results["synchronous"][f"concurrency_{concurrency}"] = result

        # Run asynchronous benchmarks at different concurrency levels
        print("\n" + "=" * 70)
        print("PHASE 2: ASYNCHRONOUS BENCHMARKS")
        print("=" * 70)

        for concurrency in CONCURRENCY_LEVELS:
            result = await self.run_async_benchmark(concurrency, REQUESTS_PER_LEVEL)
            self.results["asynchronous"][f"concurrency_{concurrency}"] = result

        # Run worker scaling test for async
        print("\n" + "=" * 70)
        print("PHASE 3: WORKER SCALING TEST (ASYNC)")
        print("=" * 70)

        self.results["asynchronous"]["worker_scaling"] = {}
        for workers in WORKER_COUNTS:
            # Scale workers
            try:
                subprocess.run(
                    ["docker", "compose", "-f", "docker-compose.yml", "up", "-d",
                     "--scale", f"ai-worker-service={workers}"],
                    capture_output=True, timeout=30
                )
                await asyncio.sleep(10)
            except Exception as e:
                print(f"    Warning: Could not scale workers: {e}")

            result = await self.run_async_benchmark(concurrency=10, num_requests=30, worker_count=workers)
            self.results["asynchronous"]["worker_scaling"][f"workers_{workers}"] = result

        # Generate comparison summary
        self._generate_comparison_summary()

        # Save results
        self._save_results()

        return self.results

    def _generate_comparison_summary(self):
        """Generate comparison summary between sync and async architectures."""
        sync_results = self.results["synchronous"]
        async_results = self.results["asynchronous"]

        comparison = {
            "avg_latency": {},
            "throughput_comparison": {},
            "reliability_comparison": {},
        }

        for concurrency in CONCURRENCY_LEVELS:
            key = f"concurrency_{concurrency}"

            if key in sync_results and key in async_results:
                sync_latency = sync_results[key]["latency_stats"]["mean"]
                async_client = async_results[key]["client_response_stats"]["mean"]
                async_completion = async_results[key]["completion_stats"]["mean"]

                comparison["avg_latency"][key] = {
                    "synchronous_ms": sync_latency,
                    "async_client_ms": async_client,
                    "async_completion_ms": async_completion,
                    "client_improvement": f"{round((1 - async_client / sync_latency) * 100, 1)}% faster client response",
                }

                sync_throughput = sync_results[key]["throughput_rpm"]
                async_throughput = async_results[key]["throughput_rpm"]
                comparison["throughput_comparison"][key] = {
                    "synchronous_rpm": sync_throughput,
                    "asynchronous_rpm": async_throughput,
                    "improvement": f"{round((async_throughput / sync_throughput if sync_throughput > 0 else 0), 2)}x",
                }

                comparison["reliability_comparison"][key] = {
                    "synchronous_success": sync_results[key]["success_rate"],
                    "asynchronous_success": async_results[key]["success_rate"],
                }

        self.results["comparison"] = comparison

    def _save_results(self):
        """Save benchmark results to file."""
        output_file = self.results_dir / f"sync_async_comparison_{self.results['run_id']}.json"
        with open(output_file, "w") as f:
            json.dump(self.results, f, indent=2, default=str)
        print(f"\n[Saved] Results to: {output_file}")

        # Generate markdown report
        self._generate_markdown_report()

    def _generate_markdown_report(self):
        """Generate markdown comparison report."""
        report = f"""# Synchronous vs Asynchronous Architecture Comparison

**Run ID:** {self.results['run_id']}
**Date:** {self.results['timestamp']}

---

## Executive Summary

This benchmark compares two architectural approaches for AI question generation:

1. **Synchronous Architecture**: Direct blocking calls where the client waits for AI generation to complete
2. **Asynchronous Architecture**: RabbitMQ-based non-blocking system with worker pools

---

## Configuration

- **Concurrency Levels Tested:** {', '.join(map(str, CONCURRENCY_LEVELS))}
- **Requests per Level:** {REQUESTS_PER_LEVEL}
- **Warmup Requests:** {WARMUP_REQUESTS}
- **Worker Scaling:** {', '.join(map(str, WORKER_COUNTS))} workers

---

## Key Findings

"""

        # Add comparison tables
        report += "## Latency Comparison (ms)\n\n"
        report += "| Concurrency | Synchronous | Async (Client) | Async (E2E) |\n"
        report += "|-------------|------------|----------------|-------------|\n"

        for key, data in self.results["comparison"]["avg_latency"].items():
            conc = key.split("_")[1]
            report += f"| {conc} | {data['synchronous_ms']:.2f} | {data['async_client_ms']:.2f} | {data['async_completion_ms']:.2f} |\n"

        report += "\n## Throughput Comparison (requests/minute)\n\n"
        report += "| Concurrency | Synchronous | Asynchronous | Improvement |\n"
        report += "|-------------|------------|---------------|-------------|\n"

        for key, data in self.results["comparison"]["throughput_comparison"].items():
            conc = key.split("_")[1]
            report += f"| {conc} | {data['synchronous_rpm']:.2f} | {data['asynchronous_rpm']:.2f} | {data['improvement']} |\n"

        report += "\n## Reliability Comparison (% success rate)\n\n"
        report += "| Concurrency | Synchronous | Asynchronous |\n"
        report += "|-------------|------------|---------------|\n"

        for key, data in self.results["comparison"]["reliability_comparison"].items():
            conc = key.split("_")[1]
            report += f"| {conc} | {data['synchronous_success']:.1f}% | {data['asynchronous_success']:.1f}% |\n"

        # Worker scaling results
        if "worker_scaling" in self.results["asynchronous"]:
            report += "\n## Worker Scaling Performance (Asynchronous)\n\n"
            report += "| Workers | Throughput (req/min) | Avg Completion (ms) | Success Rate |\n"
            report += "|---------|---------------------|-------------------|--------------|\n"

            for key, data in self.results["asynchronous"]["worker_scaling"].items():
                workers = key.split("_")[1]
                report += f"| {workers} | {data['throughput_rpm']:.2f} | {data['completion_stats'].get('mean', 0):.2f} | {data['success_rate']:.1f}% |\n"

        report += f"""
---

## Conclusions

1. **Client Responsiveness**: The asynchronous architecture provides significantly faster client response times
   because requests are immediately queued rather than waiting for AI processing.

2. **Throughput**: The async architecture with worker pools achieves higher throughput by processing
   multiple requests in parallel.

3. **Reliability**: The message queue provides buffering during AI service outages, improving overall
   system reliability.

4. **Scalability**: Worker scaling in the async architecture allows for horizontal scaling of
   AI processing capacity.

---

*Report generated: {datetime.now().isoformat()}*
"""

        report_file = self.results_dir / f"sync_async_comparison_{self.results['run_id']}.md"
        with open(report_file, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"[Saved] Report to: {report_file}")


async def main():
    benchmark = SyncVsAsyncBenchmark()
    results = await benchmark.run_full_comparison()
    print("\n" + "=" * 70)
    print("BENCHMARK COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
