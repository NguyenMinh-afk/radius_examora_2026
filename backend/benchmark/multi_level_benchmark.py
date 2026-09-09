"""
Multi-Level Benchmark Runner
Runs benchmark with multiple request levels for comprehensive charts.
"""

import asyncio
import json
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from benchmark_runner import BenchmarkRunner


# Request levels to test
REQUEST_LEVELS = [10, 20, 50, 100]

# Runs per level
RUNS_PER_LEVEL = 3

# Concurrency
CONCURRENCY = 5


async def run_level_benchmark(num_requests: int, num_runs: int, concurrency: int) -> dict:
    """Run benchmark at a specific request level."""
    print(f"\n{'='*60}")
    print(f"Testing: {num_requests} requests, {num_runs} runs, concurrency={concurrency}")
    print(f"{'='*60}")
    
    config = {
        "benchmark_requests": num_requests,
        "num_runs": num_runs,
        "concurrency": concurrency,
        "warmup_requests": 2,
    }
    
    runner = BenchmarkRunner(config)
    
    try:
        results = await runner.run_full_benchmark(skip_optional=True)
        return results
    except Exception as e:
        print(f"Error running benchmark: {e}")
        return None


async def main():
    """Run multi-level benchmark and save combined results."""
    print("=" * 70)
    print("MULTI-LEVEL BENCHMARK")
    print(f"Request Levels: {REQUEST_LEVELS}")
    print(f"Runs per Level: {RUNS_PER_LEVEL}")
    print(f"Concurrency: {CONCURRENCY}")
    print("=" * 70)
    
    results_dir = Path(__file__).parent / "results"
    backup_dir = results_dir / f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Backup existing results
    if (results_dir / "benchmark_results.json").exists():
        print(f"\n[BACKUP] Existing results -> {backup_dir}")
        backup_dir.mkdir(exist_ok=True)
        shutil.copy2(results_dir / "benchmark_results.json", backup_dir / "benchmark_results.json")
        if (results_dir / "raw_metrics.json").exists():
            shutil.copy2(results_dir / "raw_metrics.json", backup_dir / "raw_metrics.json")
    
    all_combined_results = {
        "run_id": f"multi_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "benchmark_start": datetime.now().isoformat(),
        "configuration": {
            "request_levels": REQUEST_LEVELS,
            "runs_per_level": RUNS_PER_LEVEL,
            "concurrency": CONCURRENCY,
        },
        "results": {},
        "raw_metrics": [],
    }
    
    for level in REQUEST_LEVELS:
        results = await run_level_benchmark(level, RUNS_PER_LEVEL, CONCURRENCY)
        
        if results:
            # Store results for this level
            key = f"level_{level}_requests"
            all_combined_results["results"][key] = {
                "num_requests": level,
                "concurrency": CONCURRENCY,
                "num_runs": RUNS_PER_LEVEL,
                "client_response": results.get("results", {}).get(f"client_response_run_1", {}).get("client_response", {}),
                "completion_time": results.get("results", {}).get(f"client_response_run_1", {}).get("completion_time", {}),
                "success_count": results.get("results", {}).get(f"client_response_run_1", {}).get("success_count", 0),
                "total_requests": level * RUNS_PER_LEVEL,
            }
            
            # Collect raw metrics
            for run_num in range(1, RUNS_PER_LEVEL + 1):
                run_key = f"client_response_run_{run_num}"
                if run_key in results.get("results", {}):
                    run_data = results["results"][run_key]
                    for m in run_data.get("individual_results", []):
                        m["request_level"] = level
                        m["concurrency"] = CONCURRENCY
                        all_combined_results["raw_metrics"].append(m)
        
        # Wait between levels
        if level != REQUEST_LEVELS[-1]:
            print(f"\nWaiting 10 seconds before next level...")
            await asyncio.sleep(10)
    
    # Calculate summary statistics
    all_combined_results["summary"] = {}
    for level in REQUEST_LEVELS:
        key = f"level_{level}_requests"
        if key in all_combined_results["results"]:
            data = all_combined_results["results"][key]
            all_combined_results["summary"][key] = {
                "num_requests": level,
                "avg_client_response_ms": data.get("client_response", {}).get("mean", 0),
                "avg_completion_ms": data.get("completion_time", {}).get("mean", 0),
                "success_rate": data.get("success_count", 0) / data.get("total_requests", 1) * 100,
            }
    
    # Save combined results
    output_file = results_dir / "benchmark_results.json"
    with open(output_file, "w") as f:
        json.dump(all_combined_results, f, indent=2, default=str)
    
    raw_output = results_dir / "raw_metrics.json"
    with open(raw_output, "w") as f:
        json.dump(all_combined_results["raw_metrics"], f, indent=2, default=str)
    
    print("\n" + "=" * 70)
    print("MULTI-LEVEL BENCHMARK COMPLETED")
    print("=" * 70)
    print(f"\nResults saved to: {output_file}")
    print(f"Raw metrics saved to: {raw_output}")
    
    # Print summary
    print("\n" + "-" * 50)
    print("SUMMARY")
    print("-" * 50)
    print(f"{'Level':<15} {'Client (ms)':<15} {'Completion (ms)':<15} {'Success %':<10}")
    print("-" * 50)
    for level in REQUEST_LEVELS:
        key = f"level_{level}_requests"
        if key in all_combined_results["summary"]:
            s = all_combined_results["summary"][key]
            print(f"{level:<15} {s['avg_client_response_ms']:<15.2f} {s['avg_completion_ms']:<15.2f} {s['success_rate']:<10.1f}")
    
    print("\nNext: Run 'py charts_generator.py' to generate charts")


if __name__ == "__main__":
    asyncio.run(main())
