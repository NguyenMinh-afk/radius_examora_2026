import json
import statistics
from datetime import datetime

# Load raw metrics
with open('results/raw_metrics.json', 'r') as f:
    raw = json.load(f)

# Load benchmark results
with open('results/benchmark_results.json', 'r') as f:
    results = json.load(f)

# Client response times
client_times = [r['client_response_ms'] for r in raw if r.get('client_response_ms')]

# Completion times (only completed ones)
completion_times = [r['completion_ms'] for r in raw if r.get('completion_ms')]

# Calculate queue waiting time and worker processing from timestamps
queue_waiting = []
worker_processing = []
for r in raw:
    if r.get('started_at') and r.get('completed_at'):
        try:
            started = datetime.fromisoformat(r['started_at'].replace('Z', '+00:00'))
            completed = datetime.fromisoformat(r['completed_at'].replace('Z', '+00:00'))
            processing_ms = (completed - started).total_seconds() * 1000
            worker_processing.append(processing_ms)
            
            if r.get('completion_ms'):
                queue_wait = r['completion_ms'] - processing_ms
                if queue_wait > 0:
                    queue_waiting.append(queue_wait)
        except:
            pass

completed = sum(1 for r in raw if r.get('completion_ms'))
pending = sum(1 for r in raw if not r.get('completion_ms'))
success_rate = completed / len(raw) * 100

total_time_seconds = results.get('total_time_seconds', 0)
throughput = completed / total_time_seconds if total_time_seconds > 0 else 0

print('=== TABLE 3: PERFORMANCE METRICS ===')
print(f'Client Response Time (ms):')
print(f'  Mean: {statistics.mean(client_times):.2f}')
print(f'  Std:  {statistics.stdev(client_times) if len(client_times) > 1 else 0:.2f}')
print(f'  Min:  {min(client_times):.2f}')
print(f'  Max:  {max(client_times):.2f}')

print(f'\nQueue Waiting Time (ms):')
print(f'  Mean: {statistics.mean(queue_waiting):.2f}')
print(f'  Std:  {statistics.stdev(queue_waiting) if len(queue_waiting) > 1 else 0:.2f}')
print(f'  Min:  {min(queue_waiting):.2f}')
print(f'  Max:  {max(queue_waiting):.2f}')

print(f'\nWorker Processing Time (s):')
print(f'  Mean: {statistics.mean(worker_processing)/1000:.2f}')
print(f'  Std:  {statistics.stdev(worker_processing)/1000 if len(worker_processing) > 1 else 0:.2f}')
print(f'  Min:  {min(worker_processing)/1000:.2f}')
print(f'  Max:  {max(worker_processing)/1000:.2f}')

print(f'\nAI Completion Time (s):')
print(f'  Mean: {statistics.mean(completion_times)/1000:.2f}')
print(f'  Std:  {statistics.stdev(completion_times)/1000 if len(completion_times) > 1 else 0:.2f}')
print(f'  Min:  {min(completion_times)/1000:.2f}')
print(f'  Max:  {max(completion_times)/1000:.2f}')

print(f'\nThroughput: {throughput:.4f} tasks/s')
print(f'Success Rate: {success_rate:.1f}% ({completed}/{len(raw)})')

print('\n=== PER REQUEST DETAILS ===')
for i, r in enumerate(raw):
    run = r.get('run_number', 1)
    has_completion = 'completed' if r.get('completion_ms') else 'pending'
    status_marker = '[OK]' if r.get('completion_ms') else '[WIP]'
    print(f'{status_marker} Run {run}, req #{i+1}: client={r.get("client_response_ms",0):.1f}ms, completion={r.get("completion_ms",0):.0f}ms')
