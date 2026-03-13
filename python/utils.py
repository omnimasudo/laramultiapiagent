"""
Utility Functions Module

This module contains various utility functions for data processing,
validation, formatting, and common operations used throughout the
API catalog system.

Author: LaraMultiAPI Agent Team
Version: 1.0.3
"""

import re
import json
import hashlib
import uuid
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import datetime, timezone
from urllib.parse import urlparse, urljoin
import logging
from functools import wraps
import time
from dataclasses import dataclass, asdict
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import asyncio
from asyncio import Semaphore
import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ValidationResult:
    """Result of data validation."""
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    sanitized_data: Optional[Any] = None

@dataclass
class APIEndpoint:
    """Represents an API endpoint."""
    url: str
    method: str = "GET"
    headers: Dict[str, str] = None
    timeout: int = 30
    retries: int = 3

    def __post_init__(self):
        if self.headers is None:
            self.headers = {}

class DataValidator:
    """Utility class for data validation and sanitization."""

    @staticmethod
    def validate_api_data(api_data: Dict[str, Any]) -> ValidationResult:
        """
        Validate API data structure.

        Args:
            api_data: API data dictionary

        Returns:
            ValidationResult: Validation result
        """
        errors = []
        warnings = []

        # Required fields
        required_fields = ['name', 'url', 'category']
        for field in required_fields:
            if field not in api_data or not api_data[field]:
                errors.append(f"Missing required field: {field}")

        # URL validation
        if 'url' in api_data:
            url = api_data['url']
            if not DataValidator.is_valid_url(url):
                errors.append(f"Invalid URL format: {url}")
            elif not url.startswith(('http://', 'https://')):
                warnings.append("URL should use HTTPS for security")

        # Category validation
        valid_categories = [
            'Development', 'Weather', 'Finance', 'Social', 'Entertainment',
            'Business', 'Science', 'Health', 'Sports', 'Travel', 'Food',
            'Education', 'Music', 'News', 'Productivity', 'Tools'
        ]

        if 'category' in api_data and api_data['category'] not in valid_categories:
            warnings.append(f"Category '{api_data['category']}' is not in standard list")

        # Name validation
        if 'name' in api_data:
            name = api_data['name']
            if len(name) < 2:
                errors.append("API name must be at least 2 characters long")
            elif len(name) > 100:
                errors.append("API name must be less than 100 characters")

        # Description validation
        if 'description' in api_data and len(api_data['description']) > 1000:
            warnings.append("Description is quite long, consider shortening")

        # Auth type validation
        valid_auth_types = ['No', 'API Key', 'OAuth', 'Basic Auth', 'Bearer Token']
        if 'auth' in api_data and api_data['auth'] not in valid_auth_types:
            warnings.append(f"Auth type '{api_data['auth']}' is not standard")

        # Sanitize data
        sanitized = api_data.copy()
        if 'name' in sanitized:
            sanitized['name'] = sanitized['name'].strip()
        if 'description' in sanitized:
            sanitized['description'] = sanitized['description'].strip()

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            sanitized_data=sanitized if len(errors) == 0 else None
        )

    @staticmethod
    def is_valid_url(url: str) -> bool:
        """
        Check if a string is a valid URL.

        Args:
            url: URL string to validate

        Returns:
            bool: True if valid URL
        """
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False

    @staticmethod
    def sanitize_string(text: str, max_length: int = 1000) -> str:
        """
        Sanitize a string by removing harmful characters and limiting length.

        Args:
            text: Input string
            max_length: Maximum allowed length

        Returns:
            str: Sanitized string
        """
        if not text:
            return ""

        # Remove null bytes and other control characters
        sanitized = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)

        # Limit length
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length] + "..."

        return sanitized.strip()

class TextProcessor:
    """Utility class for text processing operations."""

    @staticmethod
    def generate_slug(text: str) -> str:
        """
        Generate a URL-friendly slug from text.

        Args:
            text: Input text

        Returns:
            str: Generated slug
        """
        # Convert to lowercase and replace spaces with hyphens
        slug = text.lower().replace(' ', '-')

        # Remove special characters except hyphens
        slug = re.sub(r'[^a-z0-9-]', '', slug)

        # Remove multiple consecutive hyphens
        slug = re.sub(r'-+', '-', slug)

        # Remove leading/trailing hyphens
        slug = slug.strip('-')

        return slug

    @staticmethod
    def extract_keywords(text: str, max_keywords: int = 10) -> List[str]:
        """
        Extract keywords from text using simple frequency analysis.

        Args:
            text: Input text
            max_keywords: Maximum number of keywords to return

        Returns:
            List[str]: List of keywords
        """
        if not text:
            return []

        # Convert to lowercase and split into words
        words = re.findall(r'\b\w+\b', text.lower())

        # Remove common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
            'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
            'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
        }

        # Filter words
        filtered_words = [word for word in words if len(word) > 2 and word not in stop_words]

        # Count frequency
        word_freq = {}
        for word in filtered_words:
            word_freq[word] = word_freq.get(word, 0) + 1

        # Sort by frequency and return top keywords
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:max_keywords]]

    @staticmethod
    def calculate_similarity(text1: str, text2: str) -> float:
        """
        Calculate simple text similarity using Jaccard similarity.

        Args:
            text1: First text
            text2: Second text

        Returns:
            float: Similarity score (0.0 to 1.0)
        """
        if not text1 or not text2:
            return 0.0

        # Extract word sets
        words1 = set(re.findall(r'\b\w+\b', text1.lower()))
        words2 = set(re.findall(r'\b\w+\b', text2.lower()))

        # Calculate Jaccard similarity
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))

        return intersection / union if union > 0 else 0.0

class HashUtils:
    """Utility class for hashing and ID generation."""

    @staticmethod
    def generate_id(prefix: str = "") -> str:
        """
        Generate a unique ID.

        Args:
            prefix: Optional prefix for the ID

        Returns:
            str: Generated unique ID
        """
        unique_id = str(uuid.uuid4())
        return f"{prefix}{unique_id}" if prefix else unique_id

    @staticmethod
    def hash_string(text: str, algorithm: str = "sha256") -> str:
        """
        Generate hash of a string.

        Args:
            text: Input string
            algorithm: Hash algorithm to use

        Returns:
            str: Hexadecimal hash string
        """
        if algorithm == "md5":
            return hashlib.md5(text.encode()).hexdigest()
        elif algorithm == "sha1":
            return hashlib.sha1(text.encode()).hexdigest()
        else:  # default to sha256
            return hashlib.sha256(text.encode()).hexdigest()

    @staticmethod
    def generate_api_key() -> str:
        """
        Generate a secure API key.

        Returns:
            str: Generated API key
        """
        return HashUtils.hash_string(str(uuid.uuid4()) + str(time.time()))

class HTTPClient:
    """Utility class for HTTP operations with retry logic."""

    def __init__(self, timeout: int = 30, max_retries: int = 3):
        self.timeout = timeout
        self.max_retries = max_retries
        self.session = requests.Session()

    def get(self, url: str, headers: Dict[str, str] = None, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Perform HTTP GET request with retry logic.

        Args:
            url: Target URL
            headers: Request headers
            params: Query parameters

        Returns:
            Dict: Response data
        """
        return self._request_with_retry('GET', url, headers=headers, params=params)

    def post(self, url: str, data: Dict[str, Any] = None, headers: Dict[str, str] = None) -> Dict[str, Any]:
        """
        Perform HTTP POST request with retry logic.

        Args:
            url: Target URL
            data: Request data
            headers: Request headers

        Returns:
            Dict: Response data
        """
        return self._request_with_retry('POST', url, data=data, headers=headers)

    def _request_with_retry(self, method: str, url: str, **kwargs) -> Dict[str, Any]:
        """Internal method to handle requests with retry logic."""
        last_exception = None

        for attempt in range(self.max_retries):
            try:
                response = self.session.request(method, url, timeout=self.timeout, **kwargs)
                return {
                    'status_code': response.status_code,
                    'headers': dict(response.headers),
                    'content': response.text,
                    'json': response.json() if response.headers.get('content-type', '').startswith('application/json') else None,
                    'success': response.status_code < 400
                }
            except Exception as e:
                last_exception = e
                logger.warning(f"Request attempt {attempt + 1} failed: {str(e)}")
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff

        return {
            'status_code': 0,
            'headers': {},
            'content': '',
            'json': None,
            'success': False,
            'error': str(last_exception)
        }

class AsyncHTTPClient:
    """Asynchronous HTTP client for concurrent requests."""

    def __init__(self, timeout: int = 30, max_concurrent: int = 10):
        self.timeout = timeout
        self.max_concurrent = max_concurrent
        self.semaphore = Semaphore(max_concurrent)

    async def get_multiple(self, urls: List[str], headers: Dict[str, str] = None) -> List[Dict[str, Any]]:
        """
        Perform multiple GET requests concurrently.

        Args:
            urls: List of URLs to request
            headers: Common headers for all requests

        Returns:
            List[Dict]: List of response data
        """
        if headers is None:
            headers = {}

        async def fetch_url(url: str) -> Dict[str, Any]:
            async with self.semaphore:
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(url, headers=headers, timeout=self.timeout) as response:
                            content = await response.text()
                            return {
                                'url': url,
                                'status_code': response.status,
                                'headers': dict(response.headers),
                                'content': content,
                                'success': response.status < 400
                            }
                except Exception as e:
                    return {
                        'url': url,
                        'status_code': 0,
                        'headers': {},
                        'content': '',
                        'success': False,
                        'error': str(e)
                    }

        tasks = [fetch_url(url) for url in urls]
        results = await asyncio.gather(*tasks)
        return results

def format_datetime(dt: datetime = None, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Format datetime to string.

    Args:
        dt: Datetime object (defaults to current time)
        format_str: Format string

    Returns:
        str: Formatted datetime string
    """
    if dt is None:
        dt = datetime.now(timezone.utc)
    return dt.strftime(format_str)

def parse_datetime(date_str: str, format_str: str = "%Y-%m-%d %H:%M:%S") -> Optional[datetime]:
    """
    Parse datetime from string.

    Args:
        date_str: Date string
        format_str: Expected format

    Returns:
        datetime: Parsed datetime object or None if parsing fails
    """
    try:
        return datetime.strptime(date_str, format_str)
    except ValueError:
        return None

def safe_json_loads(json_str: str, default: Any = None) -> Any:
    """
    Safely parse JSON string.

    Args:
        json_str: JSON string to parse
        default: Default value if parsing fails

    Returns:
        Any: Parsed JSON or default value
    """
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return default

def safe_json_dumps(data: Any, default: str = "{}") -> str:
    """
    Safely serialize data to JSON string.

    Args:
        data: Data to serialize
        default: Default string if serialization fails

    Returns:
        str: JSON string or default value
    """
    try:
        return json.dumps(data, indent=2, default=str)
    except (TypeError, ValueError):
        return default

def chunk_list(items: List[Any], chunk_size: int) -> List[List[Any]]:
    """
    Split a list into chunks of specified size.

    Args:
        items: List to chunk
        chunk_size: Size of each chunk

    Returns:
        List[List]: List of chunks
    """
    return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]

def retry_on_failure(max_retries: int = 3, delay: float = 1.0, backoff: float = 2.0):
    """
    Decorator to retry function calls on failure.

    Args:
        max_retries: Maximum number of retry attempts
        delay: Initial delay between retries
        backoff: Backoff multiplier for delay
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            current_delay = delay
            last_exception = None

            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries:
                        logger.warning(f"Attempt {attempt + 1} failed: {str(e)}. Retrying in {current_delay}s...")
                        time.sleep(current_delay)
                        current_delay *= backoff
                    else:
                        logger.error(f"All {max_retries + 1} attempts failed. Last error: {str(e)}")

            raise last_exception
        return wrapper
    return decorator