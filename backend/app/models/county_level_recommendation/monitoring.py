"""
Additional monitoring utilities for County Energy Planning API
"""

import psutil
import time
from datetime import datetime, timedelta
from typing import Dict, Any
import asyncio
from prometheus_client import Gauge, Info
import structlog

logger = structlog.get_logger()

# Additional Prometheus metrics
SYSTEM_CPU_USAGE = Gauge('system_cpu_usage_percent', 'System CPU usage percentage')
SYSTEM_MEMORY_USAGE = Gauge('system_memory_usage_percent', 'System memory usage percentage')
SYSTEM_DISK_USAGE = Gauge('system_disk_usage_percent', 'System disk usage percentage')
MODEL_INFO = Info('model_info', 'Model information')

class SystemMonitor:
    """System monitoring utilities"""
    
    def __init__(self):
        self.start_time = datetime.now()
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get current system metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Update Prometheus metrics
            SYSTEM_CPU_USAGE.set(cpu_percent)
            SYSTEM_MEMORY_USAGE.set(memory.percent)
            SYSTEM_DISK_USAGE.set(disk.percent)
            
            return {
                "cpu_usage_percent": cpu_percent,
                "memory_usage_percent": memory.percent,
                "memory_available_gb": memory.available / (1024**3),
                "disk_usage_percent": disk.percent,
                "disk_free_gb": disk.free / (1024**3),
                "uptime_seconds": (datetime.now() - self.start_time).total_seconds()
            }
        except Exception as e:
            logger.error("system_metrics_error", error=str(e))
            return {}
    
    def get_uptime(self) -> str:
        """Get application uptime as formatted string"""
        uptime = datetime.now() - self.start_time
        return str(uptime).split('.')[0]  # Remove microseconds

class ModelMonitor:
    """Model-specific monitoring utilities"""
    
    def __init__(self, planner):
        self.planner = planner
        self.prediction_count = 0
        self.cache_hits = 0
        self.training_history = []
    
    def log_prediction(self, counties_count: int, duration: float):
        """Log a prediction event"""
        self.prediction_count += 1
        logger.info("model_prediction_logged",
                   count=self.prediction_count,
                   counties=counties_count,
                   duration=duration)
    
    def log_cache_hit(self):
        """Log a cache hit event"""
        self.cache_hits += 1
        logger.info("cache_hit_logged", total_hits=self.cache_hits)
    
    def log_training(self, metrics: Dict):
        """Log a training event"""
        training_event = {
            "timestamp": datetime.now().isoformat(),
            "metrics": metrics
        }
        self.training_history.append(training_event)
        logger.info("model_training_logged", metrics=metrics)
    
    def get_model_stats(self) -> Dict[str, Any]:
        """Get comprehensive model statistics"""
        if not self.planner:
            return {}
        
        model_info = self.planner.get_model_info()
        
        # Update Prometheus model info
        if model_info.get('is_trained'):
            MODEL_INFO.info({
                'version': model_info.get('model_version', 'unknown'),
                'last_trained': model_info.get('last_trained', 'unknown'),
                'features': str(len(model_info.get('feature_columns', [])))
            })
        
        return {
            "model_info": model_info,
            "prediction_count": self.prediction_count,
            "cache_hits": self.cache_hits,
            "training_history_count": len(self.training_history),
            "last_training": self.training_history[-1] if self.training_history else None
        }

# Global monitor instances
system_monitor = SystemMonitor()

async def collect_metrics_periodically():
    """Collect system metrics periodically in background"""
    while True:
        try:
            metrics = system_monitor.get_system_metrics()
            logger.info("periodic_metrics", **metrics)
            await asyncio.sleep(60)  # Collect every minute
        except Exception as e:
            logger.error("periodic_metrics_error", error=str(e))
            await asyncio.sleep(60)