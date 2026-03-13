"""
API Data Processor Module

This module handles the processing, validation, and transformation of API data
from various sources. It provides utilities for data cleaning, normalization,
and enrichment to ensure consistent data quality across the platform.

Author: LaraMultiAPI Agent Team
Version: 1.2.0
"""

import json
import re
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class APIEndpoint:
    """Represents a processed API endpoint with enhanced metadata."""
    id: str
    name: str
    description: str
    url: str
    category: str
    auth_type: str
    https_support: bool
    cors_enabled: bool
    response_time: Optional[float] = None
    last_checked: Optional[datetime] = None
    tags: List[str] = None

    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.last_checked is None:
            self.last_checked = datetime.now()

class DataProcessor:
    """Main class for processing API data from various sources."""

    def __init__(self, config_path: str = "config.json"):
        self.config = self._load_config(config_path)
        self.processed_data: Dict[str, APIEndpoint] = {}
        self.validation_rules = self._initialize_validation_rules()

    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from JSON file."""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config file {config_path} not found, using defaults")
            return {
                "max_response_time": 5000,
                "supported_categories": ["Development", "Weather", "Finance", "Social"],
                "validation_strict": True
            }

    def _initialize_validation_rules(self) -> Dict[str, Any]:
        """Initialize data validation rules."""
        return {
            "url_pattern": re.compile(r'^https?://[^\s/$.?#].[^\s]*$'),
            "name_min_length": 3,
            "description_min_length": 10,
            "supported_auth_types": ["apiKey", "OAuth", "bearer", "basic", "none"]
        }

    def validate_api_data(self, raw_data: Dict[str, Any]) -> bool:
        """
        Validate raw API data against predefined rules.

        Args:
            raw_data: Raw API data dictionary

        Returns:
            bool: True if data is valid, False otherwise
        """
        try:
            # Check required fields
            required_fields = ["name", "description", "url", "category"]
            for field in required_fields:
                if field not in raw_data or not raw_data[field]:
                    logger.error(f"Missing required field: {field}")
                    return False

            # Validate URL format
            if not self.validation_rules["url_pattern"].match(raw_data["url"]):
                logger.error(f"Invalid URL format: {raw_data['url']}")
                return False

            # Validate name and description length
            if len(raw_data["name"]) < self.validation_rules["name_min_length"]:
                logger.error("API name too short")
                return False

            if len(raw_data["description"]) < self.validation_rules["description_min_length"]:
                logger.error("API description too short")
                return False

            # Validate auth type
            if raw_data.get("auth") not in self.validation_rules["supported_auth_types"]:
                logger.warning(f"Unsupported auth type: {raw_data.get('auth')}")

            return True

        except Exception as e:
            logger.error(f"Validation error: {str(e)}")
            return False

    def normalize_data(self, raw_data: Dict[str, Any]) -> APIEndpoint:
        """
        Normalize and transform raw API data into standardized format.

        Args:
            raw_data: Raw API data dictionary

        Returns:
            APIEndpoint: Normalized API endpoint object
        """
        # Extract and normalize fields
        normalized = {
            "id": raw_data.get("id", ""),
            "name": self._clean_text(raw_data.get("name", "")),
            "description": self._clean_text(raw_data.get("description", "")),
            "url": raw_data.get("url", "").strip(),
            "category": self._normalize_category(raw_data.get("category", "")),
            "auth_type": raw_data.get("auth", "none"),
            "https_support": raw_data.get("https", False) in [True, "true", "True", "yes", "Yes"],
            "cors_enabled": raw_data.get("cors", "No") in ["Yes", "yes", "true", "True"],
            "tags": self._extract_tags(raw_data)
        }

        return APIEndpoint(**normalized)

    def _clean_text(self, text: str) -> str:
        """Clean and normalize text data."""
        if not text:
            return ""
        # Remove extra whitespace and normalize
        cleaned = re.sub(r'\s+', ' ', text.strip())
        return cleaned

    def _normalize_category(self, category: str) -> str:
        """Normalize category names to standard format."""
        category_map = {
            "development": "Development",
            "weather": "Weather",
            "finance": "Finance",
            "social": "Social",
            "entertainment": "Entertainment",
            "science": "Science & Math",
            "sports": "Sports & Fitness"
        }
        return category_map.get(category.lower(), category.title())

    def _extract_tags(self, data: Dict[str, Any]) -> List[str]:
        """Extract relevant tags from API data."""
        tags = []

        # Add category-based tags
        category = data.get("category", "").lower()
        if "development" in category:
            tags.extend(["coding", "programming", "software"])
        elif "weather" in category:
            tags.extend(["forecast", "climate", "meteorology"])
        elif "finance" in category:
            tags.extend(["money", "trading", "economics"])

        # Add auth-based tags
        auth = data.get("auth", "").lower()
        if auth == "apikey":
            tags.append("authentication")
        elif auth == "oauth":
            tags.append("oauth")

        return list(set(tags))  # Remove duplicates

    def process_batch(self, raw_data_list: List[Dict[str, Any]]) -> Dict[str, APIEndpoint]:
        """
        Process a batch of raw API data.

        Args:
            raw_data_list: List of raw API data dictionaries

        Returns:
            Dict[str, APIEndpoint]: Dictionary of processed API endpoints
        """
        processed = {}
        success_count = 0
        error_count = 0

        for raw_data in raw_data_list:
            try:
                if self.validate_api_data(raw_data):
                    endpoint = self.normalize_data(raw_data)
                    processed[endpoint.id] = endpoint
                    success_count += 1
                else:
                    error_count += 1
            except Exception as e:
                logger.error(f"Error processing API data: {str(e)}")
                error_count += 1

        logger.info(f"Batch processing complete: {success_count} successful, {error_count} errors")
        return processed

    def export_processed_data(self, output_path: str, format: str = "json") -> bool:
        """
        Export processed data to file.

        Args:
            output_path: Path to output file
            format: Export format ("json" or "csv")

        Returns:
            bool: True if export successful, False otherwise
        """
        try:
            if format.lower() == "json":
                data = {
                    "metadata": {
                        "exported_at": datetime.now().isoformat(),
                        "total_endpoints": len(self.processed_data),
                        "version": "1.0"
                    },
                    "endpoints": [asdict(endpoint) for endpoint in self.processed_data.values()]
                }

                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, default=str)

            elif format.lower() == "csv":
                # CSV export logic would go here
                logger.warning("CSV export not implemented yet")
                return False

            logger.info(f"Data exported successfully to {output_path}")
            return True

        except Exception as e:
            logger.error(f"Export failed: {str(e)}")
            return False

    def get_statistics(self) -> Dict[str, Any]:
        """Generate statistics about processed data."""
        if not self.processed_data:
            return {"total_endpoints": 0}

        categories = {}
        auth_types = {}
        https_count = 0
        cors_count = 0

        for endpoint in self.processed_data.values():
            # Category stats
            categories[endpoint.category] = categories.get(endpoint.category, 0) + 1

            # Auth type stats
            auth_types[endpoint.auth_type] = auth_types.get(endpoint.auth_type, 0) + 1

            # HTTPS and CORS stats
            if endpoint.https_support:
                https_count += 1
            if endpoint.cors_enabled:
                cors_count += 1

        return {
            "total_endpoints": len(self.processed_data),
            "categories": categories,
            "auth_types": auth_types,
            "https_percentage": round((https_count / len(self.processed_data)) * 100, 2),
            "cors_percentage": round((cors_count / len(self.processed_data)) * 100, 2)
        }