"""
Analytics and Metrics Module

This module provides analytics capabilities for tracking API usage,
user behavior, performance metrics, and generating insights for
the API catalog system.

Author: LaraMultiAPI Agent Team
Version: 1.0.4
"""

import time
import statistics
from typing import Dict, List, Any, Optional, Tuple, Counter as CounterType
from collections import defaultdict, Counter
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass, field, asdict
import logging
from functools import wraps
import threading
from concurrent.futures import ThreadPoolExecutor
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MetricPoint:
    """Represents a single metric measurement."""
    timestamp: float
    value: float
    tags: Dict[str, str] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TimeSeriesMetric:
    """Time series metric data."""
    name: str
    points: List[MetricPoint] = field(default_factory=list)
    aggregation_type: str = "average"  # average, sum, count, min, max

@dataclass
class AnalyticsEvent:
    """Analytics event data."""
    event_type: str
    user_id: Optional[str] = None
    api_id: Optional[str] = None
    session_id: Optional[str] = None
    timestamp: float = field(default_factory=time.time)
    properties: Dict[str, Any] = field(default_factory=dict)
    context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class UserProfile:
    """User behavior profile."""
    user_id: str
    total_sessions: int = 0
    total_api_calls: int = 0
    favorite_categories: List[str] = field(default_factory=list)
    avg_session_duration: float = 0.0
    last_activity: Optional[float] = None
    preferred_apis: List[str] = field(default_factory=list)
    search_patterns: List[str] = field(default_factory=list)

@dataclass
class APIMetrics:
    """API usage metrics."""
    api_id: str
    total_calls: int = 0
    unique_users: int = 0
    avg_response_time: float = 0.0
    error_rate: float = 0.0
    popularity_score: float = 0.0
    trending_score: float = 0.0
    last_updated: float = field(default_factory=time.time)

class MetricsCollector:
    """Thread-safe metrics collection and storage."""

    def __init__(self):
        self._metrics: Dict[str, TimeSeriesMetric] = {}
        self._lock = threading.RLock()
        self._max_points_per_metric = 10000
        self._cleanup_interval = 3600  # 1 hour
        self._last_cleanup = time.time()

    def record_metric(self, name: str, value: float, tags: Dict[str, str] = None,
                     metadata: Dict[str, Any] = None):
        """
        Record a metric measurement.

        Args:
            name: Metric name
            value: Metric value
            tags: Metric tags for filtering
            metadata: Additional metadata
        """
        with self._lock:
            if name not in self._metrics:
                self._metrics[name] = TimeSeriesMetric(name=name)

            metric = self._metrics[name]
            point = MetricPoint(
                timestamp=time.time(),
                value=value,
                tags=tags or {},
                metadata=metadata or {}
            )

            metric.points.append(point)

            # Maintain max points limit
            if len(metric.points) > self._max_points_per_metric:
                # Keep only recent points
                metric.points = metric.points[-self._max_points_per_metric:]

            # Periodic cleanup
            if time.time() - self._last_cleanup > self._cleanup_interval:
                self._cleanup_old_metrics()

    def get_metric(self, name: str, time_range_seconds: int = 3600) -> Optional[TimeSeriesMetric]:
        """
        Get metric data for a time range.

        Args:
            name: Metric name
            time_range_seconds: Time range in seconds

        Returns:
            TimeSeriesMetric or None
        """
        with self._lock:
            if name not in self._metrics:
                return None

            metric = self._metrics[name]
            cutoff_time = time.time() - time_range_seconds

            # Filter points within time range
            filtered_points = [p for p in metric.points if p.timestamp >= cutoff_time]

            return TimeSeriesMetric(
                name=name,
                points=filtered_points,
                aggregation_type=metric.aggregation_type
            )

    def get_metric_stats(self, name: str, time_range_seconds: int = 3600) -> Dict[str, Any]:
        """
        Get statistical summary of a metric.

        Args:
            name: Metric name
            time_range_seconds: Time range in seconds

        Returns:
            Dict with statistical data
        """
        metric = self.get_metric(name, time_range_seconds)
        if not metric or not metric.points:
            return {
                'count': 0,
                'average': 0.0,
                'min': 0.0,
                'max': 0.0,
                'std_dev': 0.0
            }

        values = [p.value for p in metric.points]

        return {
            'count': len(values),
            'average': statistics.mean(values),
            'min': min(values),
            'max': max(values),
            'std_dev': statistics.stdev(values) if len(values) > 1 else 0.0
        }

    def _cleanup_old_metrics(self):
        """Clean up old metric data."""
        cutoff_time = time.time() - (7 * 24 * 3600)  # 7 days

        for name, metric in list(self._metrics.items()):
            # Remove old points
            metric.points = [p for p in metric.points if p.timestamp >= cutoff_time]

            # Remove empty metrics
            if not metric.points:
                del self._metrics[name]

        self._last_cleanup = time.time()
        logger.info("Metrics cleanup completed")

class AnalyticsTracker:
    """Analytics event tracking and processing."""

    def __init__(self):
        self._events: List[AnalyticsEvent] = []
        self._user_profiles: Dict[str, UserProfile] = {}
        self._api_metrics: Dict[str, APIMetrics] = {}
        self._lock = threading.RLock()
        self._max_events = 50000

    def track_event(self, event: AnalyticsEvent):
        """
        Track an analytics event.

        Args:
            event: Analytics event to track
        """
        with self._lock:
            self._events.append(event)

            # Maintain max events limit
            if len(self._events) > self._max_events:
                # Keep only recent events
                self._events = self._events[-self._max_events:]

            # Update user profile
            if event.user_id:
                self._update_user_profile(event)

            # Update API metrics
            if event.api_id:
                self._update_api_metrics(event)

    def _update_user_profile(self, event: AnalyticsEvent):
        """Update user profile based on event."""
        user_id = event.user_id
        if user_id not in self._user_profiles:
            self._user_profiles[user_id] = UserProfile(user_id=user_id)

        profile = self._user_profiles[user_id]

        if event.event_type == "session_start":
            profile.total_sessions += 1
        elif event.event_type == "api_call":
            profile.total_api_calls += 1
            if event.api_id and event.api_id not in profile.preferred_apis:
                profile.preferred_apis.append(event.api_id)
        elif event.event_type == "search":
            query = event.properties.get('query', '')
            if query and query not in profile.search_patterns:
                profile.search_patterns.append(query)

        profile.last_activity = event.timestamp

    def _update_api_metrics(self, event: AnalyticsEvent):
        """Update API metrics based on event."""
        api_id = event.api_id
        if api_id not in self._api_metrics:
            self._api_metrics[api_id] = APIMetrics(api_id=api_id)

        metrics = self._api_metrics[api_id]

        if event.event_type == "api_call":
            metrics.total_calls += 1
            if event.user_id:
                # Simple unique user tracking (in production, use a set)
                metrics.unique_users = max(metrics.unique_users,
                                         len(set(e.user_id for e in self._events
                                                if e.api_id == api_id and e.user_id)))

            response_time = event.properties.get('response_time', 0)
            if response_time > 0:
                # Simple moving average
                metrics.avg_response_time = (
                    (metrics.avg_response_time * (metrics.total_calls - 1)) + response_time
                ) / metrics.total_calls

            if event.properties.get('error', False):
                error_count = sum(1 for e in self._events[-100:]  # Last 100 events
                                if e.api_id == api_id and e.properties.get('error', False))
                metrics.error_rate = error_count / min(100, len([e for e in self._events[-100:]
                                                               if e.api_id == api_id]))

        metrics.last_updated = event.timestamp

    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """
        Get user profile.

        Args:
            user_id: User identifier

        Returns:
            UserProfile or None
        """
        with self._lock:
            return self._user_profiles.get(user_id)

    def get_api_metrics(self, api_id: str) -> Optional[APIMetrics]:
        """
        Get API metrics.

        Args:
            api_id: API identifier

        Returns:
            APIMetrics or None
        """
        with self._lock:
            return self._api_metrics.get(api_id)

    def get_popular_apis(self, limit: int = 10) -> List[Tuple[str, int]]:
        """
        Get most popular APIs by call count.

        Args:
            limit: Number of APIs to return

        Returns:
            List of (api_id, call_count) tuples
        """
        with self._lock:
            api_calls = [(api_id, metrics.total_calls)
                        for api_id, metrics in self._api_metrics.items()]
            return sorted(api_calls, key=lambda x: x[1], reverse=True)[:limit]

    def get_user_recommendations(self, user_id: str, limit: int = 5) -> List[str]:
        """
        Generate API recommendations for a user.

        Args:
            user_id: User identifier
            limit: Number of recommendations

        Returns:
            List of recommended API IDs
        """
        profile = self.get_user_profile(user_id)
        if not profile:
            return []

        # Simple collaborative filtering based on similar users
        similar_users = []
        for uid, p in self._user_profiles.items():
            if uid != user_id and p.preferred_apis:
                # Calculate similarity based on common preferred APIs
                common_apis = set(profile.preferred_apis) & set(p.preferred_apis)
                if common_apis:
                    similarity = len(common_apis) / len(set(profile.preferred_apis + p.preferred_apis))
                    similar_users.append((uid, similarity, p.preferred_apis))

        # Sort by similarity
        similar_users.sort(key=lambda x: x[1], reverse=True)

        # Get recommendations from similar users
        recommendations = set()
        user_apis = set(profile.preferred_apis)

        for _, _, apis in similar_users[:3]:  # Top 3 similar users
            for api in apis:
                if api not in user_apis:
                    recommendations.add(api)
                    if len(recommendations) >= limit:
                        break
            if len(recommendations) >= limit:
                break

        return list(recommendations)

    def get_analytics_summary(self, time_range_hours: int = 24) -> Dict[str, Any]:
        """
        Get analytics summary for the specified time range.

        Args:
            time_range_hours: Time range in hours

        Returns:
            Dict with analytics summary
        """
        with self._lock:
            cutoff_time = time.time() - (time_range_hours * 3600)

            # Filter recent events
            recent_events = [e for e in self._events if e.timestamp >= cutoff_time]

            # Calculate summary
            total_events = len(recent_events)
            unique_users = len(set(e.user_id for e in recent_events if e.user_id))
            unique_apis = len(set(e.api_id for e in recent_events if e.api_id))

            event_types = Counter(e.event_type for e in recent_events)
            api_calls = Counter(e.api_id for e in recent_events if e.api_id and e.event_type == "api_call")

            # Calculate average session duration (simplified)
            session_events = [e for e in recent_events if e.event_type in ["session_start", "session_end"]]
            avg_session_duration = 0.0
            if session_events:
                durations = []
                session_start = None
                for event in sorted(session_events, key=lambda x: x.timestamp):
                    if event.event_type == "session_start":
                        session_start = event.timestamp
                    elif event.event_type == "session_end" and session_start:
                        durations.append(event.timestamp - session_start)
                        session_start = None
                if durations:
                    avg_session_duration = statistics.mean(durations)

            return {
                'time_range_hours': time_range_hours,
                'total_events': total_events,
                'unique_users': unique_users,
                'unique_apis': unique_apis,
                'event_types': dict(event_types),
                'top_api_calls': dict(api_calls.most_common(5)),
                'avg_session_duration_minutes': avg_session_duration / 60 if avg_session_duration else 0,
                'generated_at': datetime.now(timezone.utc).isoformat()
            }

class PerformanceMonitor:
    """Performance monitoring decorator and utilities."""

    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics = metrics_collector

    def monitor_performance(self, metric_name: str, tags: Dict[str, str] = None):
        """
        Decorator to monitor function performance.

        Args:
            metric_name: Name for the performance metric
            tags: Additional tags for the metric
        """
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                try:
                    result = func(*args, **kwargs)
                    execution_time = time.time() - start_time

                    # Record execution time
                    self.metrics.record_metric(
                        f"{metric_name}_execution_time",
                        execution_time,
                        tags=tags,
                        metadata={'function': func.__name__}
                    )

                    # Record success
                    self.metrics.record_metric(
                        f"{metric_name}_success",
                        1,
                        tags=tags
                    )

                    return result

                except Exception as e:
                    execution_time = time.time() - start_time

                    # Record execution time for failed calls
                    self.metrics.record_metric(
                        f"{metric_name}_execution_time",
                        execution_time,
                        tags=tags,
                        metadata={'function': func.__name__, 'error': str(e)}
                    )

                    # Record failure
                    self.metrics.record_metric(
                        f"{metric_name}_failure",
                        1,
                        tags=tags,
                        metadata={'error': str(e)}
                    )

                    raise

            return wrapper
        return decorator

    def record_custom_metric(self, name: str, value: float, tags: Dict[str, str] = None):
        """
        Record a custom metric.

        Args:
            name: Metric name
            value: Metric value
            tags: Metric tags
        """
        self.metrics.record_metric(name, value, tags=tags)

# Global instances
metrics_collector = MetricsCollector()
analytics_tracker = AnalyticsTracker()
performance_monitor = PerformanceMonitor(metrics_collector)

def track_api_call(api_id: str, user_id: Optional[str] = None,
                  response_time: float = 0.0, error: bool = False):
    """
    Track an API call event.

    Args:
        api_id: API identifier
        user_id: User identifier
        response_time: Response time in seconds
        error: Whether the call resulted in an error
    """
    event = AnalyticsEvent(
        event_type="api_call",
        user_id=user_id,
        api_id=api_id,
        properties={
            'response_time': response_time,
            'error': error
        }
    )
    analytics_tracker.track_event(event)

def track_search_query(user_id: Optional[str], query: str, results_count: int):
    """
    Track a search query event.

    Args:
        user_id: User identifier
        query: Search query
        results_count: Number of results returned
    """
    event = AnalyticsEvent(
        event_type="search",
        user_id=user_id,
        properties={
            'query': query,
            'results_count': results_count
        }
    )
    analytics_tracker.track_event(event)

def track_session_start(user_id: str, session_id: str):
    """
    Track session start event.

    Args:
        user_id: User identifier
        session_id: Session identifier
    """
    event = AnalyticsEvent(
        event_type="session_start",
        user_id=user_id,
        session_id=session_id
    )
    analytics_tracker.track_event(event)

def get_analytics_dashboard_data() -> Dict[str, Any]:
    """
    Get data for analytics dashboard.

    Returns:
        Dict with dashboard data
    """
    summary = analytics_tracker.get_analytics_summary()

    # Get top APIs
    top_apis = analytics_tracker.get_popular_apis(10)

    # Get system metrics
    api_response_time_stats = metrics_collector.get_metric_stats("api_response_time", 3600)
    error_rate_stats = metrics_collector.get_metric_stats("api_error_rate", 3600)

    return {
        'summary': summary,
        'top_apis': top_apis,
        'performance': {
            'api_response_time': api_response_time_stats,
            'error_rate': error_rate_stats
        },
        'timestamp': datetime.now(timezone.utc).isoformat()
    }