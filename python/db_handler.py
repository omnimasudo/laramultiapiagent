"""
Database Handler Module

This module provides a unified interface for database operations including
connection management, query execution, and data persistence. It supports
multiple database backends and provides caching capabilities for improved
performance.

Author: LaraMultiAPI Agent Team
Version: 1.0.5
"""

import sqlite3
import json
import os
from typing import Dict, List, Any, Optional, Union, Tuple
from contextlib import contextmanager
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import logging
import threading
from functools import lru_cache
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DatabaseConfig:
    """Database configuration settings."""
    db_type: str = "sqlite"
    db_path: str = "api_data.db"
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    max_connections: int = 5
    connection_timeout: int = 30
    enable_cache: bool = True
    cache_ttl: int = 300  # 5 minutes

@dataclass
class QueryResult:
    """Represents the result of a database query."""
    success: bool
    data: List[Dict[str, Any]]
    row_count: int
    execution_time: float
    error_message: Optional[str] = None

class DatabaseConnectionPool:
    """Simple connection pool for database connections."""

    def __init__(self, config: DatabaseConfig):
        self.config = config
        self._pool: List[Any] = []
        self._lock = threading.Lock()
        self._initialize_pool()

    def _initialize_pool(self):
        """Initialize the connection pool."""
        for _ in range(self.config.max_connections):
            try:
                conn = self._create_connection()
                self._pool.append(conn)
            except Exception as e:
                logger.error(f"Failed to create connection: {str(e)}")

    def _create_connection(self) -> Any:
        """Create a new database connection."""
        if self.config.db_type == "sqlite":
            return sqlite3.connect(
                self.config.db_path,
                timeout=self.config.connection_timeout,
                check_same_thread=False
            )
        else:
            raise NotImplementedError(f"Database type {self.config.db_type} not supported")

    @contextmanager
    def get_connection(self):
        """Context manager for getting a database connection."""
        conn = None
        try:
            with self._lock:
                if self._pool:
                    conn = self._pool.pop()
                else:
                    conn = self._create_connection()

            yield conn

        finally:
            if conn:
                with self._lock:
                    if len(self._pool) < self.config.max_connections:
                        self._pool.append(conn)
                    else:
                        conn.close()

class DatabaseHandler:
    """Main database handler class."""

    def __init__(self, config: DatabaseConfig):
        self.config = config
        self.connection_pool = DatabaseConnectionPool(config)
        self.cache: Dict[str, Tuple[Any, float]] = {}  # cache_key -> (data, timestamp)
        self._initialize_database()

    def _initialize_database(self):
        """Initialize database schema."""
        with self.connection_pool.get_connection() as conn:
            cursor = conn.cursor()

            # Create APIs table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS apis (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    url TEXT NOT NULL,
                    category TEXT,
                    auth_type TEXT,
                    https_enabled BOOLEAN,
                    cors_enabled BOOLEAN,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Create user interactions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_interactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    api_id TEXT NOT NULL,
                    interaction_type TEXT NOT NULL,
                    rating REAL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (api_id) REFERENCES apis (id)
                )
            ''')

            # Create search history table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS search_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    query TEXT NOT NULL,
                    results_count INTEGER,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Create indexes for better performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_apis_category ON apis(category)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_apis_auth ON apis(auth_type)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_interactions_user ON user_interactions(user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_search_user ON search_history(user_id)')

            conn.commit()
            logger.info("Database initialized successfully")

    def _get_cache_key(self, table: str, conditions: Dict[str, Any]) -> str:
        """Generate a cache key for the given query."""
        return f"{table}:{json.dumps(conditions, sort_keys=True)}"

    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid."""
        if not self.config.enable_cache:
            return False

        if cache_key not in self.cache:
            return False

        _, timestamp = self.cache[cache_key]
        return (time.time() - timestamp) < self.config.cache_ttl

    def _cache_result(self, cache_key: str, data: Any):
        """Cache query result."""
        if self.config.enable_cache:
            self.cache[cache_key] = (data, time.time())

    def _get_cached_result(self, cache_key: str) -> Optional[Any]:
        """Get cached result if valid."""
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key][0]
        return None

    def execute_query(self, query: str, params: Tuple = (), fetch: bool = True) -> QueryResult:
        """
        Execute a database query.

        Args:
            query: SQL query string
            params: Query parameters
            fetch: Whether to fetch results

        Returns:
            QueryResult: Query execution result
        """
        start_time = time.time()

        try:
            with self.connection_pool.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, params)

                if fetch:
                    columns = [desc[0] for desc in cursor.description] if cursor.description else []
                    rows = cursor.fetchall()
                    data = [dict(zip(columns, row)) for row in rows]
                    row_count = len(data)
                else:
                    data = []
                    row_count = cursor.rowcount
                    conn.commit()

                execution_time = time.time() - start_time

                return QueryResult(
                    success=True,
                    data=data,
                    row_count=row_count,
                    execution_time=execution_time
                )

        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"Query execution failed: {str(e)}")

            return QueryResult(
                success=False,
                data=[],
                row_count=0,
                execution_time=execution_time,
                error_message=str(e)
            )

    def insert_api(self, api_data: Dict[str, Any]) -> QueryResult:
        """
        Insert a new API into the database.

        Args:
            api_data: API data dictionary

        Returns:
            QueryResult: Insertion result
        """
        query = '''
            INSERT OR REPLACE INTO apis
            (id, name, description, url, category, auth_type, https_enabled, cors_enabled, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        '''

        params = (
            api_data['id'],
            api_data['name'],
            api_data['description'],
            api_data['url'],
            api_data['category'],
            api_data['auth'],
            api_data.get('https', False),
            api_data.get('cors', 'No') == 'Yes',
        )

        result = self.execute_query(query, params, fetch=False)

        if result.success:
            # Invalidate related caches
            self._invalidate_cache_pattern("apis:*")

        return result

    def get_apis(self, filters: Dict[str, Any] = None, limit: int = 100,
                 offset: int = 0) -> QueryResult:
        """
        Retrieve APIs with optional filtering.

        Args:
            filters: Dictionary of filter conditions
            limit: Maximum number of results
            offset: Number of results to skip

        Returns:
            QueryResult: Query result
        """
        cache_key = self._get_cache_key("apis", filters or {})
        cached_result = self._get_cached_result(cache_key)

        if cached_result:
            return cached_result

        query = "SELECT * FROM apis WHERE 1=1"
        params = []

        if filters:
            if 'category' in filters:
                query += " AND category = ?"
                params.append(filters['category'])

            if 'auth_type' in filters:
                query += " AND auth_type = ?"
                params.append(filters['auth_type'])

            if 'https_enabled' in filters:
                query += " AND https_enabled = ?"
                params.append(filters['https_enabled'])

            if 'search' in filters:
                query += " AND (name LIKE ? OR description LIKE ?)"
                search_term = f"%{filters['search']}%"
                params.extend([search_term, search_term])

        query += " ORDER BY name LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        result = self.execute_query(query, tuple(params))

        if result.success:
            self._cache_result(cache_key, result)

        return result

    def update_api_stats(self, api_id: str, interaction_type: str) -> QueryResult:
        """
        Update API usage statistics.

        Args:
            api_id: API identifier
            interaction_type: Type of interaction (view, use, rate)

        Returns:
            QueryResult: Update result
        """
        query = '''
            INSERT INTO user_interactions (user_id, api_id, interaction_type, timestamp)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        '''

        # Use anonymous user for now
        params = ('anonymous', api_id, interaction_type)

        result = self.execute_query(query, params, fetch=False)
        return result

    def get_popular_apis(self, limit: int = 10) -> QueryResult:
        """
        Get most popular APIs based on interactions.

        Args:
            limit: Number of APIs to return

        Returns:
            QueryResult: Query result
        """
        query = '''
            SELECT a.*, COUNT(i.id) as interaction_count
            FROM apis a
            LEFT JOIN user_interactions i ON a.id = i.api_id
            GROUP BY a.id
            ORDER BY interaction_count DESC
            LIMIT ?
        '''

        return self.execute_query(query, (limit,))

    def log_search_query(self, user_id: str, query: str, results_count: int) -> QueryResult:
        """
        Log a search query for analytics.

        Args:
            user_id: User identifier
            query: Search query string
            results_count: Number of results returned

        Returns:
            QueryResult: Insert result
        """
        query_sql = '''
            INSERT INTO search_history (user_id, query, results_count, timestamp)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        '''

        params = (user_id, query, results_count)
        return self.execute_query(query_sql, params, fetch=False)

    def get_search_analytics(self, days: int = 7) -> QueryResult:
        """
        Get search analytics for the specified number of days.

        Args:
            days: Number of days to look back

        Returns:
            QueryResult: Analytics result
        """
        query = '''
            SELECT
                DATE(timestamp) as date,
                COUNT(*) as total_searches,
                COUNT(DISTINCT user_id) as unique_users,
                AVG(results_count) as avg_results
            FROM search_history
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
        '''.format(days)

        return self.execute_query(query)

    def _invalidate_cache_pattern(self, pattern: str):
        """Invalidate cache entries matching a pattern."""
        keys_to_remove = [key for key in self.cache.keys() if key.startswith(pattern)]
        for key in keys_to_remove:
            del self.cache[key]

    def cleanup_old_data(self, days: int = 90):
        """
        Clean up old data to maintain database performance.

        Args:
            days: Remove data older than this many days
        """
        queries = [
            "DELETE FROM user_interactions WHERE timestamp < datetime('now', '-{} days')".format(days),
            "DELETE FROM search_history WHERE timestamp < datetime('now', '-{} days')".format(days),
        ]

        for query in queries:
            result = self.execute_query(query, fetch=False)
            if result.success:
                logger.info(f"Cleaned up {result.row_count} old records")

    def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        stats = {}

        # Table sizes
        tables = ['apis', 'user_interactions', 'search_history']
        for table in tables:
            result = self.execute_query(f"SELECT COUNT(*) as count FROM {table}")
            if result.success and result.data:
                stats[f'{table}_count'] = result.data[0]['count']

        # Database file size (SQLite specific)
        if self.config.db_type == "sqlite" and os.path.exists(self.config.db_path):
            stats['database_size_mb'] = round(os.path.getsize(self.config.db_path) / (1024 * 1024), 2)

        return stats