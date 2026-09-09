# EXAMORA Benchmark Suite

Benchmark toolkit for evaluating the RabbitMQ-driven microservice architecture of the EXAMORA examination system.

## Overview

This benchmark suite measures key performance metrics of the system's asynchronous message processing architecture:

- **Client Response Time**: API response latency
- **Queue Behavior**: RabbitMQ message queue dynamics
- **Worker Scaling**: Performance with multiple AI workers
- **Message Processing**: Success/failure rates
- **Failure Recovery**: System resilience

## Installation

```bash
cd backend/benchmark
pip install -r requirements.txt
```

## Configuration

Set environment variables or create a `.env` file. The `.env` file has been pre-configured with your database settings.

```bash
# API settings - REQUIRED: Get JWT token from a logged-in user
API_BASE_URL=http://localhost:3000
API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Get from browser DevTools

# Database (pre-configured from AI_Generation_Service)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Exam_Bank
DB_USER=postgres
DB_PASSWORD=123456

# RabbitMQ (pre-configured)
RABBITMQ_MANAGEMENT_URL=http://localhost:15672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=StrongPassword123
RABBITMQ_QUEUE=ai.generation

# Benchmark settings
WARMUP_REQUESTS=10
BENCHMARK_REQUESTS=100
NUM_RUNS=5
CONCURRENCY=5
```

### How to get JWT Token

1. Log in to the EXAMORA frontend at http://localhost:5173
2. Open DevTools (F12) → Application → Local Storage
3. Copy the `token` value

Or from API response, the endpoint is `POST /api/auth/login`.

## Usage

### 1. Run Full Benchmark

```bash
py benchmark_runner.py
```

This will execute all benchmark tests:
- Client Response Time Test (5 runs)
- Queue Metrics Test
- Worker Scaling Test (1, 2, 4 workers)
- Message Processing Test
- Failure Recovery Test
- Concurrent Users Test (optional)
- Queue Saturation Test (optional)

### 2. Generate Charts

```bash
py charts_generator.py
```

Generates:
- `fig6_client_response_time.png`
- `fig7_queue_length.png`
- `fig8_worker_scaling.png`
- `fig9_processing_results.png`
- `fig10_queue_timeline.png`

### 3. Generate Report

```bash
py report_generator.py
```

# 4. Hoặc chạy demo mode (không cần services)
```bash
py benchmark_runner.py --demo
```

Generates:
- `benchmark_report.md` - Full report with figures and tables
- `table2_config.csv` - Experimental configuration
- `table3_metrics.csv` - Performance metrics summary
- `table4_worker_scaling.csv` - Worker scaling data
- `table5_processing.csv` - Processing results

## Output Files

```
benchmark/results/
├── fig6_client_response_time.png
├── fig7_queue_length.png
├── fig8_worker_scaling.png
├── fig9_processing_results.png
├── fig10_queue_timeline.png
├── table2_config.csv
├── table3_metrics.csv
├── table4_worker_scaling.csv
├── table5_processing.csv
├── raw_metrics.json
├── benchmark_results.json
└── benchmark_report.md
```

## Methodology

### Warm-up Phase
Before each test, 10 warm-up requests are executed to eliminate initialization overhead:
- Node.js JIT compilation
- Python module imports
- Database connection pooling
- RabbitMQ channel establishment

### Multiple Runs
Each benchmark is run 5 times to calculate:
- Mean (average)
- Standard deviation
- Min/Max values

This ensures statistically significant results.

### Metrics Collected

| Metric | Description |
|--------|-------------|
| Client Response Time | Time from POST to HTTP 202 response |
| Queue Waiting Time | Time message waits in RabbitMQ |
| Worker Processing Time | AI generation time |
| AI Completion Time | End-to-end processing time |
| Throughput | Tasks processed per second |
| Queue Length | Messages in queue |
| CPU/Memory Usage | Worker resource consumption |

## Test Cases

### Mandatory Tests

1. **Client Response Time Test**
   - Measures API responsiveness
   - Varies request load (1-100 requests)
   - Tests concurrency levels

2. **Queue Metrics Test**
   - Monitors RabbitMQ queue behavior
   - Tracks queue length, ready/unacked messages
   - Samples every 500ms

3. **Worker Scaling Test**
   - Tests with 1, 2, 4, 8 workers
   - Measures throughput and resource usage
   - Validates horizontal scalability

4. **Message Processing Test**
   - Tracks success/failure rates
   - Monitors retry behavior
   - Calculates success rate percentage

5. **Failure Recovery Test**
   - Simulates worker failure
   - Measures recovery time
   - Validates no message loss

### Optional Tests

6. **Concurrent Users Test**
   - Simulates 1, 5, 10, 20 concurrent users
   - Tests system under realistic load

7. **Queue Saturation Test**
   - Bursts 100 requests
   - Observes queue saturation
   - Measures drain time

## Figures Generated

### Fig. 6: Average Client Response Time Comparison
Line chart comparing:
- Client Response Time
- Queue Waiting Time
- Worker Processing Time
- AI Completion Time

### Fig. 7: RabbitMQ Queue Length
Line chart showing queue behavior under:
- Normal load (50 requests)
- Heavy load (100 requests burst)

### Fig. 8: Worker Scaling Performance
Three panels:
- Processing Time vs Worker Count
- Throughput vs Worker Count
- CPU Utilization vs Worker Count

### Fig. 9: Message Processing Results
Stacked bar chart:
- Completed messages
- Failed messages
- Retry attempts

### Fig. 10: Queue Status Timeline
Timeline showing:
- Worker status (idle, processing, down, recovering)
- Queue depth during failure/recovery

## Tables Generated

### Table 2: Experimental Configuration
Hardware and software environment details.

### Table 3: Performance Metrics
Summary statistics for all key metrics.

### Table 4: Worker Scaling Performance
Performance metrics per worker count.

### Table 5: Message Processing Results
Success/failure rates across runs.

## Notes

- All timings are in milliseconds unless otherwise specified
- Throughput is measured in tasks/second
- Success rate is percentage of completed vs total requests
- Charts use sample data if no benchmark results exist
- Reports can be directly used in Springer paper Section 5

## Troubleshooting

### RabbitMQ Connection Failed
- Ensure RabbitMQ Management API is enabled (port 15672)
- Check credentials in environment variables

### Database Connection Failed
- Verify PostgreSQL is running
- Check connection settings in `.env`

### API Errors
- Ensure API Gateway is running
- Verify JWT token is valid
- Check API_BASE_URL setting

## License

Part of the EXAMORA examination system.
