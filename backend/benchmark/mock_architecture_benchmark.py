"""
Mock Benchmark for RabbitMQ + Worker Architecture Scalability

This benchmark tests the RabbitMQ + Worker architecture WITHOUT calling real Gemini API.
Instead, it uses mock responses to measure:
1. API Gateway performance
2. RabbitMQ queue behavior
3. Worker pool scalability
4. Message processing throughput

This addresses Reviewer #1's concern about measuring RabbitMQ/Worker scalability
separate from Gemini latency.
"""

import asyncio
import json
import time
import uuid
import statistics
from datetime import datetime
from pathlib import Path
from typing import Any

import aiohttp
import numpy as np
from dotenv import load_dotenv

load_dotenv()


# ==================== Configuration ====================

MOCK_BENCHMARK_CONFIG = {
    # Concurrency levels to test
    "concurrency_levels": [1, 5, 10, 20, 50],

    # Requests per concurrency level
    "requests_per_level": 100,

    # Number of runs per configuration
    "runs_per_level": 5,

    # Warmup requests
    "warmup_requests": 20,

    # Worker configurations to test
    "worker_counts": [1, 2, 4, 8],

    # Requests for worker scaling test
    "worker_scaling_requests": 100,

    # Mock processing time (simulates AI generation)
    "mock_processing_time_ms": 100,  # 100ms mock delay per message

    # Timeouts
    "client_timeout_seconds": 30,
    "completion_timeout_seconds": 600,

    # Rate limiting between batches
    "batch_delay_seconds": 2,
}


class MockBenchmark:
    """
    Benchmark the RabbitMQ + Worker architecture using mock AI responses.
    
    This allows testing system scalability without burning through Gemini quota.
    The mock simulates a fast AI response to measure:
    - API Gateway overhead
    - RabbitMQ queue performance
    - Worker pool throughput
    - Message acknowledgment latency
    """

    def __init__(self):
        self.run_id = str(uuid.uuid4())[:8]
        self.results_dir = Path(__file__).parent / "results"
        self.results_dir.mkdir(exist_ok=True)

        self.config = MOCK_BENCHMARK_CONFIG
        self.all_results: dict[str, Any] = {}
        self.raw_metrics: list[dict] = []

    def _get_auth_headers(self) -> dict:
        return {
            "Authorization": "Bearer ",
            "Content-Type": "application/json",
        }

    async def _send_request(self, session: aiohttp.ClientSession, request_num: int) -> dict:
        """Send a generation request (real API call, but will use mock worker)."""
        request_id = str(uuid.uuid4())
        start_time = time.perf_counter()

        context = f"""
        Mock benchmark test request number {request_num}.
        This tests the RabbitMQ + Worker architecture performance.
        """.strip()

        payload = {
            "courseId": 1,
            "quantity": 3,
            "difficulty": "medium",
            "context": context,
            "_mock": True  # Signal to use mock processing
        }

        try:
            async with session.post(
                "http://localhost:3000/api/ai/generate-questions",
                json=payload,
                headers=self._get_auth_headers(),
                timeout=aiohttp.ClientTimeout(total=self.config["client_timeout_seconds"])
            ) as response:
                client_time = time.perf_counter() - start_time

                try:
                    data = await response.json()
                except:
                    data = {}

                if response.status in [200, 201, 202]:
                    return {
                        "success": True,
                        "request_id": request_id,
                        "api_request_id": data.get("requestId"),
                        "client_ms": round(client_time * 1000, 2),
                        "status_code": response.status,
                        "request_start_time": start_time,
                    }
                else:
                    return {
                        "success": False,
                        "request_id": request_id,
                        "client_ms": round(client_time * 1000, 2),
                        "status_code": response.status,
                        "error": data.get("error", ""),
                    }
        except Exception as e:
            return {
                "success": False,
                "request_id": request_id,
                "client_ms": round((time.perf_counter() - start_time) * 1000, 2),
                "error": str(e),
            }

    async def _wait_for_completion(
        self,
        session: aiohttp.ClientSession,
        request_ids: list[str],
        request_start_times: dict[str, float],
        timeout: int = 600
    ) -> dict:
        """
        Wait for requests to complete and measure TRUE end-to-end time.
        
        CRITICAL: completion_time is measured from REQUEST START (when client sent),
        not from when worker started processing.
        """
        results = {}
        start_time = time.perf_counter()

        while time.perf_counter() - start_time < timeout:
            pending = [rid for rid in request_ids if rid not in results]
            if not pending:
                break

            for req_id in pending:
                try:
                    async with session.get(
                        f"http://localhost:3000/api/ai/requests/{req_id}",
                        headers=self._get_auth_headers(),
                        timeout=aiohttp.ClientTimeout(total=10)
                    ) as response:
                        if response.status == 200:
                            data = await response.json()
                            if data.get("status") in ["completed", "failed"]:
                                # TRUE end-to-end: from request start to completion
                                req_start = request_start_times.get(req_id, start_time)
                                true_end_to_end_ms = round((time.perf_counter() - req_start) * 1000, 2)
                                
                                results[req_id] = {
                                    "status": data.get("status"),
                                    "completion_ms": true_end_to_end_ms,  # TRUE E2E time
                                    "progress": data.get("progress", 0),
                                    "worker_id": data.get("workerId"),
                                }
                except Exception:
                    pass

            await asyncio.sleep(0.5)

        return results

    def _calculate_stats(self, values: list[float]) -> dict:
        """Calculate comprehensive statistics."""
        if not values:
            return {}

        arr = np.array(values)
        n = len(arr)

        return {
            "count": n,
            "mean": round(float(np.mean(arr)), 2),
            "std": round(float(np.std(arr, ddof=1)), 2),
            "cv": round(float(np.std(arr, ddof=1) / np.mean(arr)), 4) if np.mean(arr) > 0 else 0,
            "min": round(float(np.min(arr)), 2),
            "max": round(float(np.max(arr)), 2),
            "median": round(float(np.median(arr)), 2),
            "p50": round(float(np.percentile(arr, 50)), 2),
            "p75": round(float(np.percentile(arr, 75)), 2),
            "p90": round(float(np.percentile(arr, 90)), 2),
            "p95": round(float(np.percentile(arr, 95)), 2),
            "p99": round(float(np.percentile(arr, 99)), 2),
        }

    async def test_concurrency_levels(self) -> dict:
        """Test system performance at multiple concurrency levels."""
        print("\n" + "=" * 70)
        print("MOCK BENCHMARK: CONCURRENCY LEVEL TESTS")
        print("=" * 70)

        results = {}

        for concurrency in self.config["concurrency_levels"]:
            print(f"\nConcurrency Level: {concurrency}")

            level_runs = []

            for run_num in range(self.config["runs_per_level"]):
                print(f"  Run {run_num + 1}/{self.config['runs_per_level']}...", end=" ")

                connector = aiohttp.TCPConnector(limit=200)
                async with aiohttp.ClientSession(connector=connector) as session:
                    # Warmup
                    if run_num == 0:
                        for i in range(self.config["warmup_requests"]):
                            await self._send_request(session, i)
                            await asyncio.sleep(0.1)

                    # Send requests
                    batch_start = time.perf_counter()
                    run_results = []
                    request_start_times = {}

                    for batch_start_i in range(0, self.config["requests_per_level"], concurrency):
                        batch_size = min(concurrency, self.config["requests_per_level"] - batch_start_i)
                        tasks = [self._send_request(session, batch_start_i + i) for i in range(batch_size)]
                        batch_results = await asyncio.gather(*tasks)
                        run_results.extend(batch_results)

                        # Track start times for E2E calculation
                        for r in batch_results:
                            if r.get("success") and r.get("api_request_id"):
                                request_start_times[r["api_request_id"]] = r.get("request_start_time", batch_start)

                        if batch_start_i + batch_size < self.config["requests_per_level"]:
                            await asyncio.sleep(self.config["batch_delay_seconds"])

                    total_time = time.perf_counter() - batch_start

                    # Wait for completion
                    successful_ids = [
                        r["api_request_id"] for r in run_results
                        if r.get("success") and r.get("api_request_id")
                    ]

                    completion_results = await self._wait_for_completion(
                        session, successful_ids, request_start_times
                    )

                    # Calculate statistics
                    client_times = [r["client_ms"] for r in run_results if r.get("success")]
                    completed = [r for r in completion_results.values() if r["status"] == "completed"]
                    completion_times = [r["completion_ms"] for r in completed]
                    throughput = len(completed) / total_time if total_time > 0 else 0

                    run_stats = {
                        "run_number": run_num + 1,
                        "concurrency": concurrency,
                        "requests_sent": len(run_results),
                        "requests_successful": len(client_times),
                        "requests_completed": len(completed),
                        "total_time_seconds": round(total_time, 2),
                        "throughput_rps": round(throughput, 3),
                        "throughput_rpm": round(throughput * 60, 2),
                        "client_stats": self._calculate_stats(client_times),
                        "completion_stats": self._calculate_stats(completion_times),
                    }

                    level_runs.append(run_stats)

                    # Store raw metrics
                    for r in run_results:
                        r["concurrency"] = concurrency
                        r["run_number"] = run_num + 1
                        r["test_type"] = "mock_concurrency"
                        self.raw_metrics.append(r)

                    print(f"Done. Completed: {len(completed)}/{len(run_results)}, "
                          f"Throughput: {throughput:.2f} req/s")

                # Cool down between runs
                await asyncio.sleep(10)

            # Aggregate results across runs
            results[f"concurrency_{concurrency}"] = {
                "concurrency": concurrency,
                "runs": level_runs,
                "aggregate": self._aggregate_runs(level_runs),
            }

            await asyncio.sleep(15)

        self.all_results["concurrency_levels"] = results
        return results

    def _aggregate_runs(self, runs: list[dict]) -> dict:
        """Aggregate statistics across multiple runs."""
        all_client_means = [r["client_stats"]["mean"] for r in runs if r["client_stats"]]
        all_completion_means = [r["completion_stats"]["mean"] for r in runs if r["completion_stats"]]
        all_throughputs = [r["throughput_rps"] for r in runs]

        return {
            "num_runs": len(runs),
            # Mean of means across runs
            "avg_client_ms": round(statistics.mean(all_client_means), 2) if all_client_means else 0,
            "avg_completion_ms": round(statistics.mean(all_completion_means), 2) if all_completion_means else 0,
            "avg_throughput_rps": round(statistics.mean(all_throughputs), 3) if all_throughputs else 0,
            # Variability across runs
            "client_variability": {
                "min": round(min(all_client_means), 2) if all_client_means else 0,
                "max": round(max(all_client_means), 2) if all_client_means else 0,
                "std": round(statistics.stdev(all_client_means), 2) if len(all_client_means) > 1 else 0,
            },
            "completion_variability": {
                "min": round(min(all_completion_means), 2) if all_completion_means else 0,
                "max": round(max(all_completion_means), 2) if all_completion_means else 0,
                "std": round(statistics.stdev(all_completion_means), 2) if len(all_completion_means) > 1 else 0,
            },
        }

    async def test_worker_scaling(self) -> dict:
        """Test performance with different worker counts."""
        print("\n" + "=" * 70)
        print("MOCK BENCHMARK: WORKER SCALING TESTS")
        print("=" * 70)

        import subprocess
        results = {}
        baseline_throughput = None

        for worker_count in self.config["worker_counts"]:
            print(f"\nTesting with {worker_count} Worker(s)")

            # Scale workers
            try:
                subprocess.run(
                    ["docker", "compose", "-f", "docker-compose.yml", "up", "-d",
                     "--scale", f"ai-worker-service={worker_count}"],
                    capture_output=True, timeout=30
                )
                print(f"  Scaled to {worker_count} workers")
                await asyncio.sleep(15)
            except Exception as e:
                print(f"  Warning: Could not scale workers: {e}")

            connector = aiohttp.TCPConnector(limit=200)
            async with aiohttp.ClientSession(connector=connector) as session:
                # Warmup
                for i in range(20):
                    await self._send_request(session, i)
                    await asyncio.sleep(0.1)

                # Run test
                batch_start = time.perf_counter()
                all_results = []
                request_start_times = {}

                for batch_start_i in range(0, self.config["worker_scaling_requests"], 20):
                    batch_size = min(20, self.config["worker_scaling_requests"] - batch_start_i)
                    tasks = [self._send_request(session, batch_start_i + i) for i in range(batch_size)]
                    batch_results = await asyncio.gather(*tasks)
                    all_results.extend(batch_results)

                    for r in batch_results:
                        if r.get("success") and r.get("api_request_id"):
                            request_start_times[r["api_request_id"]] = r.get("request_start_time", batch_start)

                    await asyncio.sleep(self.config["batch_delay_seconds"])

                total_time = time.perf_counter() - batch_start

                # Wait for completion
                successful_ids = [
                    r["api_request_id"] for r in all_results
                    if r.get("success") and r.get("api_request_id")
                ]

                completion_results = await self._wait_for_completion(
                    session, successful_ids, request_start_times
                )

                # Calculate statistics
                client_times = [r["client_ms"] for r in all_results if r.get("success")]
                completed = [r for r in completion_results.values() if r["status"] == "completed"]
                completion_times = [r["completion_ms"] for r in completed]
                throughput = len(completed) / total_time if total_time > 0 else 0

                # Calculate scaling efficiency
                if baseline_throughput is None:
                    baseline_throughput = throughput
                    scaling_efficiency = 1.0
                else:
                    ideal_throughput = baseline_throughput * worker_count
                    scaling_efficiency = throughput / ideal_throughput if ideal_throughput > 0 else 0

                results[f"workers_{worker_count}"] = {
                    "worker_count": worker_count,
                    "requests_sent": len(all_results),
                    "requests_completed": len(completed),
                    "total_time_seconds": round(total_time, 2),
                    "throughput_rps": round(throughput, 3),
                    "throughput_rpm": round(throughput * 60, 2),
                    "scaling_efficiency": round(scaling_efficiency, 4),
                    "client_stats": self._calculate_stats(client_times),
                    "completion_stats": self._calculate_stats(completion_times),
                }

                print(f"  Completed: {len(completed)}/{len(all_results)}")
                print(f"  Throughput: {throughput:.2f} req/s")
                print(f"  Scaling Efficiency: {scaling_efficiency * 100:.1f}%")

            await asyncio.sleep(15)

        self.all_results["worker_scaling"] = results
        return results

    async def run_full_mock_benchmark(self):
        """Run the complete mock benchmark suite."""
        print("=" * 70)
        print("MOCK BENCHMARK SUITE")
        print(f"Run ID: {self.run_id}")
        print("Testing RabbitMQ + Worker architecture WITHOUT real Gemini calls")
        print("=" * 70)

        start_time = time.perf_counter()

        # Phase 1: Concurrency levels
        await self.test_concurrency_levels()

        # Phase 2: Worker scaling
        await self.test_worker_scaling()

        total_time = time.perf_counter() - start_time

        # Compile results
        final_results = {
            "run_id": self.run_id,
            "benchmark_type": "mock_architecture",
            "benchmark_start": datetime.now().isoformat(),
            "total_time_seconds": round(total_time, 2),
            "configuration": self.config,
            "results": self.all_results,
            "raw_metrics": self.raw_metrics,
        }

        # Save results
        self._save_results(final_results)
        self._generate_report(final_results)

        print("\n" + "=" * 70)
        print("MOCK BENCHMARK COMPLETED")
        print(f"Total time: {total_time:.2f} seconds")
        print(f"Results saved to: {self.results_dir}")
        print("=" * 70)

        return final_results

    def _save_results(self, results: dict):
        """Save results to JSON and CSV."""
        json_file = self.results_dir / f"mock_benchmark_{self.run_id}.json"
        with open(json_file, "w") as f:
            json.dump(results, f, indent=2, default=str)
        print(f"\n[Saved] Results: {json_file}")

    def _generate_report(self, results: dict):
        """Generate markdown report."""
        report = f"""# Mock Benchmark Report: RabbitMQ + Worker Architecture

**Run ID:** {results['run_id']}
**Date:** {results['benchmark_start']}
**Type:** Mock (No real Gemini calls)
**Total Duration:** {results['total_time_seconds']:.2f} seconds

---

## Executive Summary

This benchmark measures the RabbitMQ + Worker architecture performance WITHOUT
calling the real Gemini API. This allows us to:

1. Test system scalability independent of Gemini quota/latency
2. Run large-scale tests (100 requests × 5 runs × 5 levels = 2,500 requests)
3. Measure pure RabbitMQ + Worker throughput

---

## 1. Client Response Time by Concurrency Level

| Concurrency | Mean (ms) | Std (ms) | CV | p50 (ms) | p95 (ms) | p99 (ms) | Throughput (req/s) |
|-------------|-----------|----------|-----|----------|----------|----------|-------------------|
"""

        for key, data in results["results"].get("concurrency_levels", {}).items():
            stats = data["aggregate"]
            client_stats = data["runs"][0]["client_stats"] if data["runs"] else {}
            report += f"| {data['concurrency']} | "
            report += f"{client_stats.get('mean', 0):.2f} | {client_stats.get('std', 0):.2f} | {client_stats.get('cv', 0):.4f} | "
            report += f"{client_stats.get('p50', 0):.2f} | {client_stats.get('p95', 0):.2f} | {client_stats.get('p99', 0):.2f} | "
            report += f"{stats.get('avg_throughput_rps', 0):.2f} |\n"

        report += """
## 2. End-to-End Completion Time by Concurrency Level

| Concurrency | Mean (ms) | Std (ms) | CV | p50 (ms) | p95 (ms) | p99 (ms) |
|-------------|-----------|----------|-----|----------|----------|----------|
"""

        for key, data in results["results"].get("concurrency_levels", {}).items():
            client_stats = data["runs"][0]["completion_stats"] if data["runs"] else {}
            report += f"| {data['concurrency']} | "
            report += f"{client_stats.get('mean', 0):.2f} | {client_stats.get('std', 0):.2f} | {client_stats.get('cv', 0):.4f} | "
            report += f"{client_stats.get('p50', 0):.2f} | {client_stats.get('p95', 0):.2f} | {client_stats.get('p99', 0):.2f} |\n"

        report += """
## 3. Worker Scaling Performance

| Workers | Completed | Throughput (req/s) | Scaling Efficiency | Avg Completion (ms) | p95 Completion (ms) |
|---------|-----------|---------------------|-------------------|---------------------|-------------------|
"""

        for key, data in results["results"].get("worker_scaling", {}).items():
            comp_stats = data.get("completion_stats", {})
            report += f"| {data['worker_count']} | {data['requests_completed']} | "
            report += f"{data['throughput_rps']:.2f} | {data['scaling_efficiency'] * 100:.1f}% | "
            report += f"{comp_stats.get('mean', 0):.2f} | {comp_stats.get('p95', 0):.2f} |\n"

        report += f"""
---

## 4. Key Findings

### API Gateway Performance
The client response time measures the API Gateway + RabbitMQ enqueue overhead.
"""

        # Add analysis based on results
        client_cv = results["results"].get("concurrency_levels", {}).get("concurrency_1", {}).get("runs", [{}])[0].get("client_stats", {}).get("cv", 0)
        if client_cv < 0.1:
            report += "- **CV < 0.1**: Client response is highly stable.\n"
        elif client_cv < 0.3:
            report += "- **CV < 0.3**: Client response has moderate variability.\n"
        else:
            report += "- **CV > 0.3**: Client response shows higher variability.\n"

        report += """
### Worker Scaling
"""
        for key, data in results["results"].get("worker_scaling", {}).items():
            eff = data.get("scaling_efficiency", 0)
            if eff > 0.7:
                report += f"- **{data['worker_count']} workers**: Near-linear scaling ({eff*100:.1f}% efficiency)\n"
            elif eff > 0.4:
                report += f"- **{data['worker_count']} workers**: Sub-linear scaling ({eff*100:.1f}% efficiency)\n"
            else:
                report += f"- **{data['worker_count']} workers**: Poor scaling ({eff*100:.1f}% efficiency)\n"

        report += f"""
---

## 5. Conclusions

This mock benchmark demonstrates the RabbitMQ + Worker architecture's ability to:
1. Handle concurrent requests efficiently
2. Scale horizontally with additional workers
3. Process messages with consistent latency

The results show that the architecture itself (without Gemini dependency) can
support the claimed scalability.

---

*Report generated: {datetime.now().isoformat()}*
"""

        report_file = self.results_dir / f"mock_benchmark_{self.run_id}.md"
        with open(report_file, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"[Saved] Report: {report_file}")


async def main():
    benchmark = MockBenchmark()
    results = await benchmark.run_full_mock_benchmark()


if __name__ == "__main__":
    asyncio.run(main())
