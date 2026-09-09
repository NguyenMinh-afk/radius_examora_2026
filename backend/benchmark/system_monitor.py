"""
EXAMORA Benchmark - System Monitor
Monitors CPU, RAM, and Docker container stats during benchmarks.
"""

import asyncio
import subprocess
import time
from datetime import datetime
from typing import Any
import logging

import psutil

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SystemMonitor:
    """Monitors system resources during benchmark runs."""

    def __init__(self, config: dict[str, Any] | None = None):
        self.config = config or {}
        self.monitoring = False
        self.samples: list[dict[str, Any]] = []
        self._monitor_task: asyncio.Task | None = None

    # ==================== Basic System Stats ====================

    def get_cpu_usage(self) -> float:
        """Get current CPU usage percentage."""
        return psutil.cpu_percent(interval=0.1)

    def get_memory_usage(self) -> dict[str, Any]:
        """Get current memory usage."""
        mem = psutil.virtual_memory()
        return {
            "total_mb": mem.total / (1024 * 1024),
            "available_mb": mem.available / (1024 * 1024),
            "used_mb": mem.used / (1024 * 1024),
            "percent": mem.percent,
        }

    def get_disk_usage(self, path: str = "/") -> dict[str, Any]:
        """Get disk usage for a path."""
        try:
            disk = psutil.disk_usage(path)
            return {
                "total_gb": disk.total / (1024 ** 3),
                "used_gb": disk.used / (1024 ** 3),
                "free_gb": disk.free / (1024 ** 3),
                "percent": disk.percent,
            }
        except Exception as e:
            logger.warning(f"Could not get disk usage: {e}")
            return {}

    # ==================== Docker Stats ====================

    def get_docker_stats(self, container_name: str | None = None) -> list[dict[str, Any]]:
        """
        Get Docker container stats.

        Args:
            container_name: Specific container name, or None for all

        Returns:
            List of container stats
        """
        try:
            cmd = ["docker", "stats", "--no-stream", "--format",
                   "{{.Container}},{{.Name}},{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}},{{.NetIO}},{{.BlockIO}}"]

            if container_name:
                cmd.append(container_name)

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode != 0:
                logger.warning(f"docker stats failed: {result.stderr}")
                return []

            containers = []
            for line in result.stdout.strip().split("\n"):
                if not line:
                    continue

                parts = line.split(",")
                if len(parts) >= 6:
                    container_id = parts[0][:12]
                    name = parts[1]
                    cpu = parts[2].replace("%", "")
                    mem_parts = parts[3].split("/")
                    mem_used = mem_parts[0].strip() if len(mem_parts) > 0 else "0"
                    mem_percent = parts[4].replace("%", "")
                    net_io = parts[5]
                    block_io = parts[6] if len(parts) > 6 else ""

                    containers.append({
                        "container_id": container_id,
                        "name": name,
                        "cpu_percent": float(cpu) if cpu else 0,
                        "memory_used": mem_used,
                        "memory_percent": float(mem_percent) if mem_percent else 0,
                        "net_io": net_io,
                        "block_io": block_io,
                        "timestamp": datetime.now().isoformat(),
                    })

            return containers

        except FileNotFoundError:
            logger.warning("Docker not found - skipping container stats")
            return []
        except Exception as e:
            logger.warning(f"Error getting docker stats: {e}")
            return []

    def get_docker_container_list(self) -> list[dict[str, Any]]:
        """Get list of running Docker containers."""
        try:
            result = subprocess.run(
                ["docker", "ps", "--format", "{{.ID}},{{.Names}},{{.Image}},{{.Status}}"],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode != 0:
                return []

            containers = []
            for line in result.stdout.strip().split("\n"):
                if not line:
                    continue

                parts = line.split(",")
                if len(parts) >= 4:
                    containers.append({
                        "id": parts[0],
                        "name": parts[1],
                        "image": parts[2],
                        "status": parts[3],
                    })

            return containers

        except Exception as e:
            logger.debug(f"Error listing containers: {e}")
            return []

    def get_container_logs(self, container_name: str, lines: int = 50) -> str:
        """Get recent logs from a container."""
        try:
            result = subprocess.run(
                ["docker", "logs", "--tail", str(lines), container_name],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.stdout + result.stderr
        except Exception as e:
            return f"Error getting logs: {e}"

    # ==================== Background Monitoring ====================

    async def start_monitoring(
        self,
        interval_seconds: float = 1.0,
        container_names: list[str] | None = None
    ) -> None:
        """
        Start background monitoring of system resources.

        Args:
            interval_seconds: Sampling interval
            container_names: Docker containers to monitor
        """
        self.monitoring = True
        self.samples = []

        self._monitor_task = asyncio.create_task(
            self._monitor_loop(interval_seconds, container_names)
        )

    async def stop_monitoring(self) -> list[dict[str, Any]]:
        """Stop monitoring and return collected samples."""
        self.monitoring = False

        if self._monitor_task:
            try:
                await asyncio.wait_for(self._monitor_task, timeout=5.0)
            except asyncio.TimeoutError:
                self._monitor_task.cancel()

        return self.samples

    async def _monitor_loop(
        self,
        interval_seconds: float,
        container_names: list[str] | None
    ) -> None:
        """Background monitoring loop."""
        while self.monitoring:
            try:
                sample = {
                    "timestamp": datetime.now().isoformat(),
                    "cpu_percent": self.get_cpu_usage(),
                    "memory": self.get_memory_usage(),
                }

                # Get Docker stats
                docker_stats = self.get_docker_stats()
                if container_names:
                    docker_stats = [
                        s for s in docker_stats
                        if s.get("name") in container_names
                    ]

                sample["docker_containers"] = docker_stats

                self.samples.append(sample)

                await asyncio.sleep(interval_seconds)

            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(interval_seconds)

    # ==================== Worker Scaling Test Helpers ====================

    def scale_workers(self, service_name: str, replicas: int) -> bool:
        """
        Scale Docker Compose service to specified replicas.

        Args:
            service_name: Name of the service (e.g., "ai_worker")
            replicas: Number of replicas

        Returns:
            True if successful
        """
        try:
            # Use docker-compose scale
            result = subprocess.run(
                ["docker-compose", "up", "-d", "--scale", f"{service_name}={replicas}"],
                capture_output=True,
                text=True,
                timeout=30
            )
            return result.returncode == 0
        except Exception as e:
            logger.error(f"Error scaling workers: {e}")
            return False

    def get_worker_count(self, pattern: str = "ai_worker") -> int:
        """Get number of running AI worker containers."""
        containers = self.get_docker_container_list()
        return sum(1 for c in containers if pattern.lower() in c.get("name", "").lower())

    def wait_for_workers(self, expected_count: int, timeout_seconds: int = 30) -> bool:
        """Wait for expected number of workers to be ready."""
        start = time.time()

        while time.time() - start < timeout_seconds:
            current = self.get_worker_count()
            if current >= expected_count:
                return True
            time.sleep(1)

        return False

    # ==================== Process Stats ====================

    def get_process_stats(self, process_name: str) -> list[dict[str, Any]]:
        """Get stats for processes matching a name."""
        stats = []

        for proc in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent"]):
            try:
                if process_name.lower() in proc.info["name"].lower():
                    stats.append({
                        "pid": proc.info["pid"],
                        "name": proc.info["name"],
                        "cpu_percent": proc.info["cpu_percent"],
                        "memory_percent": proc.info["memory_percent"],
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

        return stats

    # ==================== Summary ====================

    def get_system_summary(self) -> dict[str, Any]:
        """Get a summary of system resources."""
        return {
            "cpu_percent": self.get_cpu_usage(),
            "cpu_count": psutil.cpu_count(),
            "memory": self.get_memory_usage(),
            "disk": self.get_disk_usage(),
            "docker_containers": self.get_docker_container_list(),
            "timestamp": datetime.now().isoformat(),
        }


# ==================== Helper Functions ====================

def calculate_resource_stats(samples: list[dict[str, Any]], key: str) -> dict[str, float]:
    """
    Calculate statistics for a resource from monitoring samples.

    Args:
        samples: List of monitoring samples
        key: Key to extract (e.g., "cpu_percent" or "memory.percent")

    Returns:
        Statistics dict
    """
    import numpy as np

    values = []
    for sample in samples:
        if "." in key:
            parts = key.split(".")
            value = sample
            for part in parts:
                value = value.get(part, {})
            if isinstance(value, (int, float)):
                values.append(float(value))
        else:
            if isinstance(sample.get(key), (int, float)):
                values.append(float(sample.get(key)))

    if not values:
        return {"mean": 0, "std": 0, "min": 0, "max": 0, "count": 0}

    arr = np.array(values)

    return {
        "mean": float(np.mean(arr)),
        "std": float(np.std(arr)),
        "min": float(np.min(arr)),
        "max": float(np.max(arr)),
        "median": float(np.median(arr)),
        "count": len(values),
    }
