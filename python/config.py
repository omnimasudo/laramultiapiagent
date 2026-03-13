"""
Configuration Management Module

This module handles application configuration loading, validation,
and management from various sources including environment variables,
configuration files, and default values.

Author: LaraMultiAPI Agent Team
Version: 1.0.2
"""

import os
import json
import yaml
from typing import Dict, Any, Optional, List, Union
from pathlib import Path
from dataclasses import dataclass, field, asdict
from enum import Enum
import logging
from functools import lru_cache
import secrets
import string

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Environment(Enum):
    """Application environment types."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"

@dataclass
class DatabaseConfig:
    """Database configuration."""
    type: str = "sqlite"
    host: Optional[str] = None
    port: Optional[int] = None
    name: str = "api_data.db"
    username: Optional[str] = None
    password: Optional[str] = None
    max_connections: int = 5
    connection_timeout: int = 30
    enable_ssl: bool = False
    backup_enabled: bool = True
    backup_interval_hours: int = 24

@dataclass
class APIConfig:
    """API service configuration."""
    base_url: str = "http://localhost:3000"
    api_prefix: str = "/api"
    cors_origins: List[str] = field(default_factory=lambda: ["*"])
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60
    enable_caching: bool = True
    cache_ttl_seconds: int = 300
    enable_metrics: bool = True
    log_requests: bool = False

@dataclass
class SecurityConfig:
    """Security configuration."""
    secret_key: str = field(default_factory=lambda: ConfigManager.generate_secret_key())
    jwt_secret: str = field(default_factory=lambda: ConfigManager.generate_secret_key())
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    password_min_length: int = 8
    enable_password_hashing: bool = True
    session_timeout_minutes: int = 60
    csrf_protection: bool = True
    content_security_policy: str = "default-src 'self'"

@dataclass
class ExternalServicesConfig:
    """External services configuration."""
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-3.5-turbo"
    openai_max_tokens: int = 1000
    openai_temperature: float = 0.7

    anthropic_api_key: Optional[str] = None
    anthropic_model: str = "claude-3-sonnet-20240229"
    anthropic_max_tokens: int = 1000

    github_token: Optional[str] = None
    github_api_url: str = "https://api.github.com"

    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None

@dataclass
class LoggingConfig:
    """Logging configuration."""
    level: str = "INFO"
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    file_path: Optional[str] = None
    max_file_size_mb: int = 10
    backup_count: int = 5
    enable_console: bool = True
    enable_file: bool = False

@dataclass
class MonitoringConfig:
    """Monitoring and analytics configuration."""
    enable_prometheus: bool = False
    prometheus_port: int = 9090
    enable_health_checks: bool = True
    health_check_interval_seconds: int = 30
    enable_performance_monitoring: bool = True
    slow_query_threshold_ms: int = 1000

@dataclass
class AppConfig:
    """Main application configuration."""
    environment: Environment = Environment.DEVELOPMENT
    debug: bool = False
    app_name: str = "LaraMultiAPI Agent"
    version: str = "1.0.0"
    port: int = 3000
    host: str = "0.0.0.0"
    workers: int = 1

    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    api: APIConfig = field(default_factory=APIConfig)
    security: SecurityConfig = field(default_factory=SecurityConfig)
    external_services: ExternalServicesConfig = field(default_factory=ExternalServicesConfig)
    logging: LoggingConfig = field(default_factory=LoggingConfig)
    monitoring: MonitoringConfig = field(default_factory=MonitoringConfig)

class ConfigManager:
    """Configuration manager for loading and validating app configuration."""

    CONFIG_FILE_NAMES = ["config.json", "config.yaml", "config.yml", ".env"]
    CONFIG_ENV_PREFIX = "LARAMULTIAPI_"

    def __init__(self, config_dir: Optional[str] = None):
        self.config_dir = Path(config_dir) if config_dir else Path.cwd()
        self._config: Optional[AppConfig] = None
        self._config_sources: List[str] = []

    @classmethod
    def generate_secret_key(cls, length: int = 32) -> str:
        """Generate a secure random secret key."""
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(secrets.choice(alphabet) for _ in range(length))

    def load_config(self) -> AppConfig:
        """
        Load configuration from all available sources.

        Priority order:
        1. Environment variables
        2. Configuration files
        3. Default values

        Returns:
            AppConfig: Loaded and validated configuration
        """
        if self._config is not None:
            return self._config

        config = AppConfig()

        # Load from configuration files
        file_config = self._load_from_files()
        if file_config:
            self._merge_config(config, file_config)
            self._config_sources.append("config file")

        # Load from environment variables
        env_config = self._load_from_env()
        if env_config:
            self._merge_config(config, env_config)
            self._config_sources.append("environment variables")

        # Validate configuration
        self._validate_config(config)

        # Set derived values
        self._set_derived_values(config)

        self._config = config
        logger.info(f"Configuration loaded from: {', '.join(self._config_sources)}")
        return config

    def _load_from_files(self) -> Optional[Dict[str, Any]]:
        """Load configuration from files."""
        for filename in self.CONFIG_FILE_NAMES:
            config_path = self.config_dir / filename
            if config_path.exists():
                try:
                    if filename.endswith('.json'):
                        with open(config_path, 'r', encoding='utf-8') as f:
                            return json.load(f)
                    elif filename.endswith(('.yaml', '.yml')):
                        with open(config_path, 'r', encoding='utf-8') as f:
                            return yaml.safe_load(f)
                except Exception as e:
                    logger.warning(f"Failed to load config from {config_path}: {str(e)}")

        return None

    def _load_from_env(self) -> Optional[Dict[str, Any]]:
        """Load configuration from environment variables."""
        env_config = {}
        prefix_len = len(self.CONFIG_ENV_PREFIX)

        for key, value in os.environ.items():
            if key.startswith(self.CONFIG_ENV_PREFIX):
                config_key = key[prefix_len:].lower()
                env_config[config_key] = self._parse_env_value(value)

        return env_config if env_config else None

    def _parse_env_value(self, value: str) -> Union[str, int, float, bool, List[str]]:
        """Parse environment variable value to appropriate type."""
        # Try boolean
        if value.lower() in ('true', 'false'):
            return value.lower() == 'true'

        # Try integer
        try:
            return int(value)
        except ValueError:
            pass

        # Try float
        try:
            return float(value)
        except ValueError:
            pass

        # Try JSON array
        if value.startswith('[') and value.endswith(']'):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                pass

        # Return as string
        return value

    def _merge_config(self, base_config: AppConfig, new_config: Dict[str, Any]):
        """Merge new configuration into base config."""
        def merge_dict(target: Dict[str, Any], source: Dict[str, Any]):
            for key, value in source.items():
                if isinstance(value, dict) and key in target and isinstance(target[key], dict):
                    merge_dict(target[key], value)
                else:
                    target[key] = value

        config_dict = asdict(base_config)
        merge_dict(config_dict, new_config)

        # Convert back to AppConfig
        try:
            self._dict_to_config(config_dict, base_config)
        except Exception as e:
            logger.error(f"Failed to merge configuration: {str(e)}")

    def _dict_to_config(self, config_dict: Dict[str, Any], config_obj: Any):
        """Convert dictionary to configuration object."""
        for key, value in config_dict.items():
            if hasattr(config_obj, key):
                attr = getattr(config_obj, key)
                if hasattr(attr, '__dataclass_fields__'):
                    # Nested dataclass
                    self._dict_to_config(value, attr)
                else:
                    setattr(config_obj, key, value)

    def _validate_config(self, config: AppConfig):
        """Validate configuration values."""
        errors = []

        # Validate port
        if not (1 <= config.port <= 65535):
            errors.append(f"Invalid port number: {config.port}")

        # Validate database config
        if config.database.max_connections < 1:
            errors.append("Database max_connections must be at least 1")

        # Validate API config
        if config.api.rate_limit_requests < 1:
            errors.append("API rate_limit_requests must be at least 1")

        # Validate security config
        if len(config.security.secret_key) < 16:
            errors.append("Security secret_key must be at least 16 characters")

        if config.security.password_min_length < 4:
            errors.append("Security password_min_length must be at least 4")

        if errors:
            error_msg = f"Configuration validation failed: {'; '.join(errors)}"
            logger.error(error_msg)
            raise ValueError(error_msg)

    def _set_derived_values(self, config: AppConfig):
        """Set derived configuration values."""
        # Set debug mode based on environment
        if config.environment in [Environment.DEVELOPMENT, Environment.TESTING]:
            config.debug = True

        # Adjust logging level based on environment
        if config.environment == Environment.PRODUCTION:
            config.logging.level = "WARNING"
        elif config.environment == Environment.TESTING:
            config.logging.level = "DEBUG"

        # Set database path for SQLite
        if config.database.type == "sqlite" and not config.database.host:
            config.database.name = str(self.config_dir / config.database.name)

    def save_config(self, config: AppConfig, file_path: Optional[str] = None):
        """
        Save configuration to file.

        Args:
            config: Configuration to save
            file_path: Path to save file (optional)
        """
        if file_path is None:
            file_path = self.config_dir / "config.json"

        config_dict = asdict(config)

        # Remove sensitive information
        if 'password' in config_dict.get('database', {}):
            config_dict['database']['password'] = "***"
        if 'secret_key' in config_dict.get('security', {}):
            config_dict['security']['secret_key'] = "***"
        if 'jwt_secret' in config_dict.get('security', {}):
            config_dict['security']['jwt_secret'] = "***"

        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(config_dict, f, indent=2, default=str)
            logger.info(f"Configuration saved to {file_path}")
        except Exception as e:
            logger.error(f"Failed to save configuration: {str(e)}")

    def get_config_sources(self) -> List[str]:
        """Get list of configuration sources that were loaded."""
        return self._config_sources.copy()

    @lru_cache(maxsize=1)
    def get_config(self) -> AppConfig:
        """Get cached configuration instance."""
        return self.load_config()

    def reload_config(self):
        """Force reload configuration from sources."""
        self._config = None
        self._config_sources.clear()
        self.get_config.cache_clear()
        logger.info("Configuration reloaded")

    def create_default_config_file(self, file_path: Optional[str] = None):
        """
        Create a default configuration file.

        Args:
            file_path: Path for the config file
        """
        if file_path is None:
            file_path = self.config_dir / "config.json"

        default_config = AppConfig()
        self.save_config(default_config, file_path)
        logger.info(f"Default configuration file created at {file_path}")

    def get_nested_value(self, key_path: str, default: Any = None) -> Any:
        """
        Get nested configuration value using dot notation.

        Args:
            key_path: Dot-separated path (e.g., "database.max_connections")
            default: Default value if key not found

        Returns:
            Any: Configuration value
        """
        config = self.get_config()
        keys = key_path.split('.')
        value = asdict(config)

        try:
            for key in keys:
                value = value[key]
            return value
        except (KeyError, TypeError):
            return default

    def set_nested_value(self, key_path: str, value: Any):
        """
        Set nested configuration value using dot notation.

        Args:
            key_path: Dot-separated path
            value: Value to set
        """
        config = self.get_config()
        keys = key_path.split('.')
        config_dict = asdict(config)

        # Navigate to the nested location
        current = config_dict
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]

        # Set the value
        current[keys[-1]] = value

        # Update the config object
        self._dict_to_config(config_dict, config)
        logger.info(f"Configuration updated: {key_path} = {value}")

# Global configuration manager instance
config_manager = ConfigManager()

def get_config() -> AppConfig:
    """Get the global application configuration."""
    return config_manager.get_config()

def reload_config():
    """Reload the global configuration."""
    config_manager.reload_config()

def get_setting(key_path: str, default: Any = None) -> Any:
    """Get a configuration setting using dot notation."""
    return config_manager.get_nested_value(key_path, default)