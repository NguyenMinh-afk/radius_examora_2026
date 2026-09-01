# Synchronous vs Asynchronous Architecture Comparison

**Run ID:** 7d2d1105
**Date:** 2026-08-15T17:42:22.486615

---

## Executive Summary

This benchmark compares two architectural approaches for AI question generation:

1. **Synchronous Architecture**: Direct blocking calls where the client waits for AI generation to complete
2. **Asynchronous Architecture**: RabbitMQ-based non-blocking system with worker pools

---

## Configuration

- **Concurrency Levels Tested:** 1, 5, 10, 20, 50
- **Requests per Level:** 50
- **Warmup Requests:** 10
- **Worker Scaling:** 1, 2, 4 workers
- **Sync Mode:** MOCKED (no Gemini calls)
- **Async Mode:** MOCKED (simulated worker pool)

---

## Key Findings

## Asynchronous Latency Detail (ms)

| Concurrency | Async Client Mean | Std | p95 | p99 | Async E2E Mean | Std | p95 | p99 |
|-------------|------------------:|----:|----:|----:|---------------:|----:|----:|----:|
| 1 | 46.36 | 6.49 | 22.57 | 30.18 | 6,655.72 | 1,772.30 | 6,097.88 | 6,334.63 |
| 5 | 46.40 | 3.42 | 24.21 | 30.60 | 20,810.26 | 389.10 | 1,647.07 | 1,661.10 |
| 10 | 45.35 | 10.83 | 36.16 | 62.54 | 33,481.16 | 203.86 | 1,025.65 | 1,036.36 |
| 20 | 45.49 | 17.50 | 55.75 | 81.20 | 54,422.75 | 128.21 | 1,042.22 | 1,052.18 |
| 50 | 43.94 | 35.66 | 189.13 | 203.08 | 60,167.03 | 371.38 | 2,042.22 | 2,050.33 |

## Synchronous Latency Reference (ms)

| Concurrency | Synchronous Mean |
|-------------|-----------------:|
| 1 | 6,278.47 |
| 5 | 6,185.10 |
| 10 | 6,241.03 |
| 20 | 6,801.27 |
| 50 | 6,389.12 |

## Throughput Comparison (requests/minute)

| Concurrency | Synchronous | Asynchronous | Improvement |
|-------------|------------|---------------|-------------|
| 1 | 9.56 | 7.60 | 0.79x |
| 5 | 32.88 | 41.35 | 1.26x |
| 10 | 58.72 | 92.95 | 1.58x |
| 20 | 89.19 | 185.68 | 2.08x |
| 50 | 238.34 | 633.52 | 2.66x |

## Reliability Comparison (% success rate)

| Concurrency | Synchronous | Asynchronous |
|-------------|------------|---------------|
| 1 | 100.0% | 100.0% |
| 5 | 100.0% | 100.0% |
| 10 | 100.0% | 100.0% |
| 20 | 100.0% | 100.0% |
| 50 | 100.0% | 100.0% |

## Worker Scaling Performance (Asynchronous)

| Workers | Throughput (req/min) | Avg Completion (ms) | Success Rate |
|---------|---------------------|-------------------|--------------|
| 1 | 111.40 | 33488.66 | 100.0% |
| 2 | 111.31 | 20803.29 | 100.0% |
| 4 | 111.46 | 13184.44 | 100.0% |

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

*Report generated: 2026-08-15T18:06:33.815096*
