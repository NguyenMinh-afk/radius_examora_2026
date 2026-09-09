# Benchmark Results Summary

## Table 3: Performance Metrics

| Metric | Mean | Std | Min | Max |
|--------|------|-----|-----|-----|
| Client Response Time (ms) | 15.22 | 3.92 | 8.98 | 24.64 |
| Queue Waiting Time (ms) | 36505.38 | 29699.56 | 399.71 | 96399.62 |
| Worker Processing Time (s) | 27.31 | 6.22 | 6.24 | 30.11 |
| AI Completion Time (s) | 63.81 | 33.44 | 6.84 | 126.47 |

## Table 5: Processing Results

| Metric | Value |
|--------|-------|
| Total Requests | 40 |
| Completed | 36 |
| Pending | 4 |
| Success Rate (%) | 90.0 |
| Failed | 0 |
| Total Duration (s) | 556.98 |
| Throughput (tasks/s) | 0.0646 |

## Table 4: Worker Scaling Performance

| Workers | Throughput (tasks/s) | Avg Response (ms) | Scaling Efficiency (%) | Success Rate (%) |
|---------|---------------------|-------------------|----------------------|-----------------|
| 1 | 0.08 | 100.50 | 100.0 | 90.0 |
| 2 | 0.14 | 85.30 | 87.5 | 85.0 |
| 4 | 0.22 | 65.20 | 68.8 | 80.0 |

## Configuration

| Parameter | Value |
|-----------|-------|
| Platform | Windows-11-10.0.26200-SP0 |
| Python | 3.13.7 |
| Node.js | v22.19.0 |
| Docker | Docker 29.1.3 |
| AI Model | Gemini 3.1 Flash Lite |
| Benchmark Requests | 20 |
| Concurrency | 2 |
| Number of Runs | 2 |
