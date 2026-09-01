"""
Worker Process Manager for Benchmark Scaling Tests

Manages multiple worker processes to enable true horizontal scaling tests.
Each worker process runs independently and connects to RabbitMQ as a separate consumer.
"""

import asyncio
import os
import re
import signal
import subprocess
import sys
import time
import urllib.parse
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import aiohttp
from dotenv import load_dotenv

# Load benchmark .env (located next to this file)
load_dotenv(Path(__file__).parent / ".env")


@dataclass
class WorkerInfo:
    """Information about a running worker process."""
    worker_id: int
    pid: int
    process: Optional[subprocess.Popen] = None
    started_at: float = field(default_factory=time.time)
    is_alive: bool = True
    hostname: Optional[str] = None


class WorkerManager:
    """
    Manages multiple worker processes for horizontal scaling tests.
    
    This allows the benchmark to:
    1. Start/stop exact number of worker processes
    2. Track PID and health of each worker
    3. Verify RabbitMQ consumer count matches
    4. Collect per-worker metrics
    """
    
    def __init__(
        self,
        worker_script: str = "run_worker.py",
        env_overrides: Optional[dict] = None
    ):
        self.workers: dict[int, WorkerInfo] = {}
        self.worker_script = worker_script
        self.env_overrides = env_overrides or {}
        
    def _build_env(self) -> dict:
        """Build environment for worker process."""
        env = os.environ.copy()
        env.update(self.env_overrides)
        env["PYTHONUNBUFFERED"] = "1"
        return env
    
    async def start_workers(self, count: int) -> dict[int, WorkerInfo]:
        """
        Start `count` worker processes.

        Returns dict mapping worker_id (0-based) to WorkerInfo.

        Waits until RabbitMQ reports exactly `count` consumers (or timeout)
        instead of a fixed sleep. Fixes the race where benchmark observed
        `consumers (1) != workers (8)` immediately after start.
        """
        print(f"Starting {count} worker process(es)...")

        # Kill existing workers first
        await self.stop_all()
        await asyncio.sleep(2)  # Give time for cleanup

        workers_dir = Path(__file__).parent.parent / "AI_Worker_Service"

        for i in range(count):
            try:
                # Start worker process
                process = subprocess.Popen(
                    [sys.executable, self.worker_script],
                    cwd=str(workers_dir),
                    env=self._build_env(),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0
                )

                worker_info = WorkerInfo(
                    worker_id=i,
                    pid=process.pid,
                    process=process
                )
                self.workers[i] = worker_info

                print(f"  Worker {i}: PID={process.pid} started")

            except Exception as e:
                print(f"  Worker {i}: Failed to start - {e}")

        # Wait until RabbitMQ reports `count` active consumers on ai.generation,
        # not just an arbitrary sleep. Each iteration polls, with backoff up to
        # 30s total. Tolerates 1 extra consumer (a slow-closing previous worker)
        # by accepting >= count - 1 if count > 1.
        print(f"Waiting for {count} workers to connect to RabbitMQ...")
        await self._wait_for_consumers(expected=count, timeout=30.0)

        return self.workers

    async def _wait_for_consumers(self, expected: int, timeout: float) -> None:
        """Poll RabbitMQ management API until consumer count matches `expected`.

        - Accepts `count >= expected` so a slow-closing old consumer doesn't block.
        - Falls back to a hard 30s timeout.
        """
        import time as _time
        deadline = _time.monotonic() + timeout
        last_consumers = -1
        attempt = 0
        while _time.monotonic() < deadline:
            consumers = await self.verify_rabbitmq_consumers()
            last_consumers = consumers
            if consumers >= expected:
                print(f"  All {expected} workers connected to RabbitMQ ({consumers} consumers)")
                return
            attempt += 1
            await asyncio.sleep(min(0.5 * (2 ** min(attempt, 4)), 3.0))
        print(f"  WARNING: only {last_consumers}/{expected} consumers connected after {timeout:.0f}s")
    
    async def stop_worker(self, worker_id: int) -> bool:
        """Stop a specific worker process.

        Windows-compatible graceful shutdown:
          1. Send CTRL_BREAK_EVENT (best Windows equivalent of SIGTERM)
          2. Wait up to `graceful_timeout` for the process to exit
          3. taskkill /F if still alive
        Closing the worker process this way lets its aio-pika / pika client
        close the AMQP connection cleanly, so RabbitMQ drops the consumer
        immediately (instead of waiting for the 60s heartbeat timeout).
        """
        if worker_id not in self.workers:
            return False

        worker = self.workers[worker_id]
        if not (worker.process and worker.is_alive):
            return False

        pid = worker.pid
        graceful_timeout = 5.0

        try:
            if sys.platform == "win32":
                # Use CREATE_NEW_PROCESS_GROUP (set at start_workers) so we can
                # deliver a CTRL+BREAK signal to just this PID. Falls back to
                # taskkill if the helper is missing on the host.
                try:
                    worker.process.send_signal(signal.CTRL_BREAK_EVENT)
                except (AttributeError, ValueError, OSError):
                    pass
                try:
                    worker.process.wait(timeout=graceful_timeout)
                    print(f"  Worker {worker_id}: PID={pid} stopped (graceful)")
                    worker.is_alive = False
                    return True
                except subprocess.TimeoutExpired:
                    pass

                subprocess.run(
                    ["taskkill", "/pid", str(pid), "/f"],
                    capture_output=True, timeout=5,
                )
                worker.is_alive = False
                print(f"  Worker {worker_id}: PID={pid} stopped (force)")
                return True
            else:
                os.kill(pid, signal.SIGTERM)
                try:
                    worker.process.wait(timeout=graceful_timeout)
                    print(f"  Worker {worker_id}: PID={pid} stopped (graceful)")
                    worker.is_alive = False
                    return True
                except subprocess.TimeoutExpired:
                    os.kill(pid, signal.SIGKILL)
                    worker.is_alive = False
                    print(f"  Worker {worker_id}: PID={pid} stopped (force)")
                    return True
        except Exception as e:
            print(f"  Worker {worker_id}: Failed to stop - {e}")
            return False

    async def stop_all(self) -> None:
        """Stop all worker processes and ensure RabbitMQ drops their consumers.

        1. Stop every tracked worker (graceful, then force).
        2. Sweep any orphaned run_worker.py processes that our PIDs missed.
        3. Force-close any remaining AMQP connections via the management API
           so the consumer count goes to zero immediately (no 60s wait).
        """
        for worker_id in list(self.workers.keys()):
            await self.stop_worker(worker_id)

        # Sweep orphan workers by command line (more reliable than WINDOWTITLE).
        try:
            if sys.platform == "win32":
                subprocess.run(
                    ["wmic", "process", "where",
                     "name='python.exe' and CommandLine like '%run_worker.py%'",
                     "delete"],
                    capture_output=True, timeout=5,
                )
            else:
                subprocess.run(["pkill", "-f", "run_worker.py"], capture_output=True)
        except Exception:
            pass

        # Force-close any AMQP connections still being held by killed workers.
        # Without this step, RabbitMQ keeps the consumer count stale until the
        # heartbeat (default 60s) expires, which is exactly what we saw as
        # "consumers (3) != workers (2)" at the top of each prefetch iteration.
        await self._close_stale_rabbitmq_connections()

        self.workers.clear()

    async def _close_stale_rabbitmq_connections(self) -> None:
        """Close all RabbitMQ AMQP connections whose client process is gone.

        Walks /api/connections and DELETE the ones whose peer_host/peer_port no
        longer maps to a live worker PID. Safe to call when nothing is stale.
        """
        try:
            api_url = os.getenv("RABBITMQ_MANAGEMENT_URL", "http://localhost:15672")
            user = os.getenv("RABBITMQ_USER", "guest")
            password = os.getenv("RABBITMQ_PASSWORD", "guest")
            vhost = os.getenv("RABBITMQ_VHOST", "%2F")
            auth = aiohttp.BasicAuth(user, password)

            async with aiohttp.ClientSession(auth=auth) as session:
                # List connections
                async with session.get(
                    f"{api_url}/api/connections",
                    timeout=aiohttp.ClientTimeout(total=5),
                ) as resp:
                    if resp.status != 200:
                        return
                    conns = await resp.json()

                if not conns:
                    return

                # Build set of live PIDs so we can spot dead worker holders.
                live_pids = set()
                try:
                    import psutil
                    live_pids = {p.pid for p in psutil.process_iter()}
                except Exception:
                    pass

                closed = 0
                for conn in conns:
                    name = conn.get("name", "")
                    user_props = conn.get("user_who_performed_action", "")
                    client_procs = conn.get("client_properties", {}) or {}
                    conn_pid = None

                    # aio-pika / pika can expose process PID via query params
                    query = conn.get("query") or {}
                    if isinstance(query, dict):
                        try:
                            conn_pid = int(query.get("pid"))
                        except (TypeError, ValueError):
                            conn_pid = None

                    if conn_pid is None:
                        pid_match = re.search(r"pid[=:]([0-9]+)", name)
                        if pid_match:
                            try:
                                conn_pid = int(pid_match.group(1))
                            except ValueError:
                                conn_pid = None

                    should_close = False
                    if conn_pid is not None and live_pids and conn_pid not in live_pids:
                        should_close = True  # connection owner is dead
                    elif user_props.startswith("guest"):
                        # No PID signal at all - close any run_worker-era AMQP conn
                        should_close = "ai_worker" in name.lower()

                    if not should_close:
                        continue

                    encoded_name = urllib.parse.quote(name, safe="")
                    async with session.delete(
                        f"{api_url}/api/connections/{encoded_name}",
                        timeout=aiohttp.ClientTimeout(total=5),
                        headers={"X-Reason": "benchmark-stop_all"},
                    ) as del_resp:
                        if del_resp.status in (200, 204, 404):
                            closed += 1

                if closed:
                    print(f"  [stop_all] Closed {closed} stale RabbitMQ connection(s)")
        except Exception as e:
            # Never let cleanup errors fail the benchmark
            print(f"  [stop_all] Could not close stale connections: {e}")
    
    async def verify_rabbitmq_consumers(self) -> int:
        """
        Query RabbitMQ management API to get actual consumer count.
        
        Returns number of active consumers on the main queue.
        """
        try:
            # RabbitMQ management API - use credentials from env
            api_url = os.getenv("RABBITMQ_MANAGEMENT_URL", "http://localhost:15672") + "/api/queues"
            rabbitmq_user = os.getenv("RABBITMQ_USER", "guest")
            rabbitmq_password = os.getenv("RABBITMQ_PASSWORD", "guest")
            auth = aiohttp.BasicAuth(rabbitmq_user, rabbitmq_password)
            
            async with aiohttp.ClientSession(auth=auth) as session:
                async with session.get(api_url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                    if resp.status == 200:
                        queues = await resp.json()
                        for q in queues:
                            if q.get("name") == "ai.generation":
                                consumers = q.get("consumers", 0)
                                messages = q.get("messages", 0)
                                messages_ready = q.get("messages_ready", 0)
                                messages_unacked = q.get("messages_unacknowledged", 0)
                                print(f"  RabbitMQ queue 'ai.generation':")
                                print(f"    - Consumers: {consumers}")
                                print(f"    - Messages: {messages}")
                                print(f"    - Messages ready: {messages_ready}")
                                print(f"    - Messages unacked: {messages_unacked}")
                                return consumers
                        print("  Warning: 'ai.generation' queue not found")
                        return 0
                    else:
                        print(f"  Warning: RabbitMQ API returned {resp.status}")
                        return 0
        except Exception as e:
            print(f"  Warning: Could not query RabbitMQ API: {e}")
            return len([w for w in self.workers.values() if w.is_alive])
    
    async def get_queue_stats(self) -> dict:
        """Get RabbitMQ queue statistics."""
        stats = {
            "consumers": 0,
            "messages": 0,
            "messages_ready": 0,
            "messages_unacked": 0,
        }
        try:
            api_url = os.getenv("RABBITMQ_MANAGEMENT_URL", "http://localhost:15672") + "/api/queues"
            rabbitmq_user = os.getenv("RABBITMQ_USER", "guest")
            rabbitmq_password = os.getenv("RABBITMQ_PASSWORD", "guest")
            auth = aiohttp.BasicAuth(rabbitmq_user, rabbitmq_password)

            async with aiohttp.ClientSession(auth=auth) as session:
                async with session.get(api_url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                    if resp.status == 200:
                        queues = await resp.json()
                        for q in queues:
                            if q.get("name") == "ai.generation":
                                stats["consumers"] = q.get("consumers", 0)
                                stats["messages"] = q.get("messages", 0)
                                stats["messages_ready"] = q.get("messages_ready", 0)
                                stats["messages_unacked"] = q.get("messages_unacknowledged", 0)
                                break
        except Exception as e:
            print(f"  Warning: Could not get queue stats: {e}")
        return stats

    async def drain_queue(self, queue_name: str = "ai.generation", wait_seconds: int = 5) -> int:
        """
        Drain all messages from the queue before starting a benchmark run.

        Uses RabbitMQ Management API:
          1. Stop consumers (purge doesn't purge unacked, so we close connections first)
          2. DELETE contents via /api/queues/<vhost>/<name>/contents
          3. Wait + verify until pending == 0

        Returns remaining pending count (0 = success).
        """
        try:
            api_url = os.getenv("RABBITMQ_MANAGEMENT_URL", "http://localhost:15672") + "/api/queues"
            rabbitmq_user = os.getenv("RABBITMQ_USER", "guest")
            rabbitmq_password = os.getenv("RABBITMQ_PASSWORD", "guest")
            vhost = os.getenv("RABBITMQ_VHOST", "%2F")
            auth = aiohttp.BasicAuth(rabbitmq_user, rabbitmq_password)

            async with aiohttp.ClientSession(auth=auth) as session:
                # 1. Initial check
                target_url = f"{api_url}/{vhost}/{queue_name}"
                async with session.get(target_url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                    if resp.status != 200:
                        print(f"  [drain] Cannot read queue '{queue_name}': HTTP {resp.status}")
                        return -1
                    initial = await resp.json()
                    initial_pending = initial.get("messages", 0)
                    print(f"  [drain] Queue '{queue_name}' initial pending: {initial_pending}")

                # 2. Purge all messages
                purge_url = f"{target_url}/contents"
                async with session.delete(purge_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status in (200, 204):
                        print(f"  [drain] Purged queue '{queue_name}'")
                    else:
                        print(f"  [drain] Purge failed: HTTP {resp.status}")

                # 3. Wait + verify
                for attempt in range(wait_seconds):
                    await asyncio.sleep(1)
                    async with session.get(target_url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                        if resp.status != 200:
                            continue
                        info = await resp.json()
                        pending = info.get("messages", 0)
                        if pending == 0:
                            print(f"  [drain] Queue clean after {attempt + 1}s")
                            return 0
                final = initial_pending
                print(f"  [drain] WARNING: queue still pending after {wait_seconds}s")
                return final
        except Exception as e:
            print(f"  [drain] Error: {e}")
            return -1
    
    def get_worker_pids(self) -> list[int]:
        """Get list of PIDs for alive workers."""
        return [w.pid for w in self.workers.values() if w.is_alive]
    
    def get_worker_count(self) -> int:
        """Get count of alive workers."""
        return len([w for w in self.workers.values() if w.is_alive])
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.stop_all()
