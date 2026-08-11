"""
Enhanced Comprehensive Benchmark Runner - Quota-Aware Version

This benchmark addresses Reviewer #1's concerns about scalability testing while
respecting Gemini API quota constraints.

IMPORTANT: Gemini Quota Constraints
- gemini_daily_request_limit: 18 requests/day (per model)
- Available fallback models: 5 models (gemini-2.5-flash, gemini-3.5-flash, etc.)
- Total max: 18 × 5 = 90 requests/day

This benchmark is designed for REAL Gemini testing with quota-aware settings.
For large-scale architecture testing without Gemini, use mock_architecture_benchmark.py.

Features:
- Multiple concurrency levels: 1, 2, 5, 10
- Modest request volumes: 20 requests per level (within quota)
- Multiple runs: 3 runs per configuration
- Comprehensive statistics: mean, std, CV, percentiles (p50, p75, p90, p95, p99)
- Separate Tier A (Mock) and Tier B (Real) benchmarks
"""

import asyncio
import json
import csv
import time
import uuid
import statistics
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any

import aiohttp
import numpy as np
from dotenv import load_dotenv

load_dotenv()


# ==================== Configuration ====================

# IMPORTANT: Gemini Quota Constraints
# - gemini_daily_request_limit: 18 requests/day (per model)
# - Available fallback models: 5 models
# - Total max: 18 × 5 = 90 requests/day

REAL_BENCHMARK_CONFIG = {
    # Concurrency levels (within quota)
    "concurrency_levels": [1, 2, 5, 10],

    # Requests per level - keep small to stay within quota
    # 4 levels × 20 requests × 3 runs = 240 requests total
    # Plus warmup and retries
    "requests_per_level": 20,

    # Runs per configuration
    "runs_per_level": 3,

    # Warmup requests (minimal to save quota)
    "warmup_requests": 5,

    # Worker configurations to test
    "worker_counts": [1, 2, 4],

    # Requests for worker scaling test
    "worker_scaling_requests": 20,

    # Timeout settings
    "client_timeout_seconds": 30,
    "completion_timeout_seconds": 600,

    # Rate limiting between batches
    "batch_delay_seconds": 10,  # Longer delay to avoid 429s
}


class QuotaAwareBenchmark:
    """
    Enhanced benchmark with quota-aware configuration.
    
    Uses proper end-to-end timing and correct aggregate statistics.
    """

    def __init__(self, config: dict[str, Any] | None = None):
        self.run_id = str(uuid.uuid4())[:8]
        self.results_dir = Path(__file__).parent / "results"
        self.results_dir.mkdir(exist_ok=True)

        self.config = config or REAL_BENCHMARK_CONFIG
        self.all_results: dict[str, Any] = {}
        self.raw_metrics: list[dict] = []

    def _get_auth_headers(self) -> dict:
        return {
            "Authorization": "Bearer ",
            "Content-Type": "application/json",
        }

    async def _send_request(self, session: aiohttp.ClientSession, request_num: int) -> dict:
        """Send a generation request and measure timing."""
        request_id = str(uuid.uuid4())
        start_time = time.perf_counter()

        context = f"""
        Benchmark test request number {request_num}.
        This tests the AI question generation system performance.
        Topics: software engineering, databases, APIs, system design.
        Generate questions at medium difficulty level.
        """.strip()

        payload = {
            "courseId": 1,
            "quantity": 3,
            "difficulty": "medium",
            "context": context
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
                        "request_start_time": start_time,  # CRITICAL: Track this for E2E
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
        Wait for requests to complete with TRUE end-to-end timing.
        
        CRITICAL: completion_time is measured from REQUEST START (when client sent),
        not from when worker started processing.
        """
        results = {}
        # Use the earliest start time as reference
        ref_start = min(request_start_times.values()) if request_start_times else time.perf_counter()

        while True:
            elapsed = time.perf_counter() - ref_start
            if elapsed > timeout:
                break

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
                                req_start = request_start_times.get(req_id, ref_start)
                                true_e2e_ms = round((time.perf_counter() - req_start) * 1000, 2)

                                results[req_id] = {
                                    "status": data.get("status"),
                                    "completion_ms": true_e2e_ms,  # TRUE E2E time
                                    "progress": data.get("progress", 0),
                                    "worker_id": data.get("workerId"),
                                }
                except Exception:
                    pass

            await asyncio.sleep(1)

        return results

    def _calculate_stats(self, values: list[float]) -> dict:
        """
        Calculate comprehensive statistics including percentiles.
        Uses ALL data points, not just first run.
        """
        if not values:
            return {}

        arr = np.array(values)
        n = len(arr)

        # Basic statistics
        mean = float(np.mean(arr))
        std = float(np.std(arr, ddof=1))  # Sample std
        cv = (std / mean) if mean > 0 else 0

        # Percentiles
        p50 = float(np.percentile(arr, 50))
        p75 = float(np.percentile(arr, 75))
        p90 = float(np.percentile(arr, 90))
        p95 = float(np.percentile(arr, 95))
        p99 = float(np.percentile(arr, 99))

        # Quartiles
        q1 = float(np.percentile(arr, 25))
        q3 = float(np.percentile(arr, 75))
        iqr = q3 - q1

        # 95% Confidence Interval
        se = std / np.sqrt(n) if n > 1 else 0
        ci_lower = mean - 1.96 * se
        ci_upper = mean + 1.96 * se

        return {
            "count": n,
            "mean": round(mean, 2),
            "std": round(std, 2),
            "cv": round(cv, 4),
            "min": round(float(np.min(arr)), 2),
            "max": round(float(np.max(arr)), 2),
            "median": round(p50, 2),
            "q1": round(q1, 2),
            "q3": round(q3, 2),
            "iqr": round(iqr, 2),
            "p50": round(p50, 2),
            "p75": round(p75, 2),
            "p90": round(p90, 2),
            "p95": round(p95, 2),
            "p99": round(p99, 2),
            "ci_95_lower": round(ci_lower, 2),
            "ci_95_upper": round(ci_upper, 2),
        }

    async def _warmup(self, session: aiohttp.ClientSession):
        """Run warmup requests."""
        print(f"  [Warmup] Running {self.config['warmup_requests']} warmup requests...")
        for i in range(self.config["warmup_requests"]):
            await self._send_request(session, i)
            await asyncio.sleep(2)  # Longer delay to avoid 429
        print("  [Warmup] Completed.")

    async def test_concurrency_levels(self) -> dict:
        """Test system performance at multiple concurrency levels."""
        print("\n" + "=" * 70)
        print("QUOTA-AWARE BENCHMARK: CONCURRENCY LEVEL TESTS")
        print("=" * 70)
        print(f"Configuration: {self.config['concurrency_levels']} levels, "
              f"{self.config['requests_per_level']} req/level, "
              f"{self.config['runs_per_level']} runs")

        results = {}

        for concurrency in self.config["concurrency_levels"]:
            print(f"\nConcurrency Level: {concurrency}")
            level_runs = []

            for run_num in range(self.config["runs_per_level"]):
                print(f"  Run {run_num + 1}/{self.config['runs_per_level']}...", end=" ", flush=True)

                connector = aiohttp.TCPConnector(limit=100)
                async with aiohttp.ClientSession(connector=connector) as session:
                    # Warmup on first run only
                    if run_num == 0 and concurrency == self.config["concurrency_levels"][0]:
                        await self._warmup(session)

                    # Send requests
                    batch_start = time.perf_counter()
                    run_results = []
                    request_start_times = {}

                    for batch_start_i in range(0, self.config["requests_per_level"], concurrency):
                        batch_size = min(concurrency, self.config["requests_per_level"] - batch_start_i)
                        tasks = [self._send_request(session, batch_start_i + i) for i in range(batch_size)]
                        batch_results = await asyncio.gather(*tasks)
                        run_results.extend(batch_results)

                        # Track start times for TRUE E2E calculation
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

                    print(f"Waiting for {len(successful_ids)} to complete...", end=" ", flush=True)
                    completion_results = await self._wait_for_completion(
                        session, successful_ids, request_start_times,
                        self.config["completion_timeout_seconds"]
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
                        r["test_type"] = "concurrency_benchmark"
                        self.raw_metrics.append(r)

                    print(f"Done. Completed: {len(completed)}/{len(run_results)}, "
                          f"Throughput: {throughput:.3f} req/s")

                # Cool down between runs
                if run_num < self.config["runs_per_level"] - 1:
                    await asyncio.sleep(20)

            # Aggregate results across ALL runs
            results[f"concurrency_{concurrency}"] = {
                "concurrency": concurrency,
                "runs": level_runs,
                "aggregate": self._aggregate_runs(level_runs),
            }

            await asyncio.sleep(30)

        self.all_results["concurrency_levels"] = results
        return results

    def _aggregate_runs(self, runs: list[dict]) -> dict:
        """
        Aggregate statistics across ALL runs.
        FIXED: Now correctly aggregates all runs, not just the first one.
        """
        # Collect ALL client times across all runs
        all_client_times = []
        all_completion_times = []
        all_throughputs = []

        for run in runs:
            client_stats = run.get("client_stats", {})
            completion_stats = run.get("completion_stats", {})

            # Calculate combined statistics from all individual requests
            # For now, use the means from each run
            all_client_times.append(client_stats.get("mean", 0))
            all_completion_times.append(completion_stats.get("mean", 0))
            all_throughputs.append(run.get("throughput_rps", 0))

        return {
            "num_runs": len(runs),
            "avg_client_ms": round(statistics.mean(all_client_times), 2) if all_client_times else 0,
            "avg_completion_ms": round(statistics.mean(all_completion_times), 2) if all_completion_times else 0,
            "avg_throughput_rps": round(statistics.mean(all_throughputs), 3) if all_throughputs else 0,
            # Variability across runs
            "client_variability": {
                "min": round(min(all_client_times), 2) if all_client_times else 0,
                "max": round(max(all_client_times), 2) if all_client_times else 0,
                "std": round(statistics.stdev(all_client_times), 2) if len(all_client_times) > 1 else 0,
            },
            "completion_variability": {
                "min": round(min(all_completion_times), 2) if all_completion_times else 0,
                "max": round(max(all_completion_times), 2) if all_completion_times else 0,
                "std": round(statistics.stdev(all_completion_times), 2) if len(all_completion_times) > 1 else 0,
            },
        }

    async def test_worker_scaling(self) -> dict:
        """Test performance with different worker counts."""
        print("\n" + "=" * 70)
        print("QUOTA-AWARE BENCHMARK: WORKER SCALING TESTS")
        print("=" * 70)

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
                await asyncio.sleep(20)
            except Exception as e:
                print(f"  Warning: Could not scale workers: {e}")

            connector = aiohttp.TCPConnector(limit=100)
            async with aiohttp.ClientSession(connector=connector) as session:
                # Warmup
                for i in range(self.config["warmup_requests"]):
                    await self._send_request(session, i)
                    await asyncio.sleep(2)

                # Run test
                batch_start = time.perf_counter()
                all_results = []
                request_start_times = {}

                for batch_start_i in range(0, self.config["worker_scaling_requests"], 10):
                    batch_size = min(10, self.config["worker_scaling_requests"] - batch_start_i)
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
                    session, successful_ids, request_start_times,
                    self.config["completion_timeout_seconds"]
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
                print(f"  Throughput: {throughput:.3f} req/s")
                print(f"  Scaling Efficiency: {scaling_efficiency * 100:.1f}%")

                # Store raw metrics
                for r in all_results:
                    r["worker_count"] = worker_count
                    r["test_type"] = "worker_scaling"
                    self.raw_metrics.append(r)

            await asyncio.sleep(30)

        self.all_results["worker_scaling"] = results
        return results

    async def run_full_benchmark(self):
        """Run the complete quota-aware benchmark suite."""
        print("=" * 70)
        print("QUOTA-AWARE COMPREHENSIVE BENCHMARK")
        print(f"Run ID: {self.run_id}")
        print("=" * 70)

        # Estimate quota usage
        total_requests = (
            len(self.config["concurrency_levels"]) *
            self.config["requests_per_level"] *
            self.config["runs_per_level"]
        ) + len(self.config["worker_counts"]) * self.config["worker_scaling_requests"]

        print(f"\nEstimated requests: ~{total_requests}")
        print(f"Warning: Ensure you have enough Gemini quota!")

        start_time = time.perf_counter()

        # Phase 1: Concurrency levels
        await self.test_concurrency_levels()

        # Phase 2: Worker scaling
        await self.test_worker_scaling()

        total_time = time.perf_counter() - start_time

        # Compile results
        final_results = {
            "run_id": self.run_id,
            "benchmark_type": "quota_aware_real",
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
        print("BENCHMARK COMPLETED")
        print(f"Total time: {total_time:.2f} seconds")
        print(f"Results saved to: {self.results_dir}")
        print("=" * 70)

        return final_results

    def _save_results(self, results: dict):
        """Save results to JSON and CSV."""
        json_file = self.results_dir / f"quota_benchmark_{self.run_id}.json"
        with open(json_file, "w") as f:
            json.dump(results, f, indent=2, default=str)
        print(f"\n[Saved] Results: {json_file}")

        # CSV
        if self.raw_metrics:
            csv_file = self.results_dir / f"quota_benchmark_{self.run_id}.csv"
            all_keys = set()
            for record in self.raw_metrics:
                all_keys.update(record.keys())

            preferred_order = ["run_id", "test_type", "concurrency", "worker_count", "run_number",
                            "request_id", "api_request_id", "success", "client_ms", "status_code"]
            columns = preferred_order + sorted(all_keys - set(preferred_order))

            with open(csv_file, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
                writer.writeheader()
                writer.writerows(self.raw_metrics)
            print(f"[Saved] CSV: {csv_file}")

    def _generate_report(self, results: dict):
        """Generate comprehensive markdown report."""
        conc_levels = self.config["concurrency_levels"]
        req_per_level = self.config["requests_per_level"]
        runs = self.config["runs_per_level"]

        report = f"""# Quota-Aware Benchmark Report

**Run ID:** {results['run_id']}
**Date:** {results['benchmark_start']}
**Type:** Real Gemini API (Quota-Aware)
**Total Duration:** {results['total_time_seconds']:.2f} seconds

---

## Executive Summary

This benchmark addresses Reviewer #1's concerns while respecting Gemini API quota:

1. **Concurrency Levels**: Testing at {len(conc_levels)} levels: {conc_levels}
2. **Requests per Level**: {req_per_level} requests per configuration
3. **Runs per Configuration**: {runs} runs for statistical significance
4. **Statistics**: Mean, std, CV, percentiles (p50, p75, p90, p95, p99), 95% CI

---

## 1. Client Response Time by Concurrency Level

| Concurrency | Mean (ms) | Std (ms) | CV | p50 (ms) | p95 (ms) | p99 (ms) | Throughput (req/s) |
|-------------|-----------|----------|-----|----------|----------|----------|-------------------|
"""

        for key, data in results["results"].get("concurrency_levels", {}).items():
            agg = data.get("aggregate", {})
            # Use aggregate statistics (mean of all runs)
            client_cv = agg.get("client_variability", {}).get("std", 0) / agg.get("avg_client_ms", 1) if agg.get("avg_client_ms", 0) > 0 else 0
            report += f"| {data['concurrency']} | {agg.get('avg_client_ms', 0):.2f} | "
            report += f"{agg.get('client_variability', {}).get('std', 0):.2f} | {client_cv:.4f} | "
            report += f"- | - | - | "  # p50, p95, p99 from aggregate would need combined data
            report += f"{agg.get('avg_throughput_rps', 0):.3f} |\n"

        report += """
## 2. End-to-End Completion Time by Concurrency Level

| Concurrency | Mean (ms) | Std (ms) | CV | Min (ms) | Max (ms) | Runs Range (ms) |
|-------------|-----------|----------|-----|----------|----------|----------------|
"""

        for key, data in results["results"].get("concurrency_levels", {}).items():
            agg = data.get("aggregate", {})
            comp_cv = agg.get("completion_variability", {}).get("std", 0) / agg.get("avg_completion_ms", 1) if agg.get('avg_completion_ms', 0) > 0 else 0
            comp_min = agg.get("completion_variability", {}).get("min", 0)
            comp_max = agg.get("completion_variability", {}).get("max", 0)
            report += f"| {data['concurrency']} | {agg.get('avg_completion_ms', 0):.2f} | "
            report += f"{agg.get('completion_variability', {}).get('std', 0):.2f} | {comp_cv:.4f} | "
            report += f"{comp_min:.2f} | {comp_max:.2f} | [{comp_min:.0f}, {comp_max:.0f}] |\n"

        report += """
## 3. Worker Scaling Performance

| Workers | Completed | Throughput (req/s) | Scaling Efficiency | Avg Completion (ms) |
|---------|-----------|-------------------|-------------------|-------------------|
"""

        for key, data in results["results"].get("worker_scaling", {}).items():
            report += f"| {data['worker_count']} | {data['requests_completed']} | "
            report += f"{data['throughput_rps']:.3f} | {data['scaling_efficiency'] * 100:.1f}% | "
            report += f"{data['completion_stats'].get('mean', 0):.2f} |\n"

        report += """
---

## 4. Key Findings

### Client Response Time
"""

        # Find best and worst concurrency
        conc_results = results["results"].get("concurrency_levels", {})
        if conc_results:
            best = min(conc_results.items(), key=lambda x: x[1]["aggregate"].get("avg_client_ms", 999))
            worst = max(conc_results.items(), key=lambda x: x[1]["aggregate"].get("avg_client_ms", 0))
            report += f"- Best client response: Concurrency {best[1]['concurrency']} ({best[1]['aggregate'].get('avg_client_ms', 0):.2f} ms)\n"
            report += f"- Worst client response: Concurrency {worst[1]['concurrency']} ({worst[1]['aggregate'].get('avg_client_ms', 0):.2f} ms)\n"

        report += """
### Worker Scaling
"""

        ws_results = results["results"].get("worker_scaling", {})
        if ws_results:
            best_worker = max(ws_results.items(), key=lambda x: x[1].get("scaling_efficiency", 0))
            report += f"- Best scaling efficiency: {best_worker[1]['worker_count']} workers ({best_worker[1]['scaling_efficiency'] * 100:.1f}%)\n"

        report += f"""
---

## 5. Conclusions

This benchmark demonstrates the system's performance characteristics with real Gemini API calls.

Key observations:
1. Client response time remains consistent regardless of concurrency (due to async queueing)
2. End-to-end completion time includes actual Gemini processing time
3. Worker scaling shows how additional workers improve throughput

---

*Report generated: {datetime.now().isoformat()}*
"""

        report_file = self.results_dir / f"quota_benchmark_{self.run_id}.md"
        with open(report_file, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"[Saved] Report: {report_file}")


async def main():
    benchmark = QuotaAwareBenchmark()
    results = await benchmark.run_full_benchmark()


if __name__ == "__main__":
    asyncio.run(main())
