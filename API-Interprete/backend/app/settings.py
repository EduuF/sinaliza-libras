"""Settings configuration module for the Technium Q21 backend.

This module centralizes configuration management using Pydantic Settings,
allowing flexible loading of environment variables from different .env files.
"""

from __future__ import annotations

from functools import lru_cache
from os import PathLike
from typing import Any, Optional, Union

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

EnvPath = Union[str, PathLike[str]]


class Settings(BaseSettings):
    """
    Application settings configuration class.

    Loads settings from environment variables or .env files.
    """

    # PostgreSQL configuration
    POSTGRES_USER: Optional[str] = Field(default=None, description="PostgreSQL username.")
    POSTGRES_HOST: Optional[str] = Field(default=None, description="PostgreSQL server hostname.")
    POSTGRES_DB: Optional[str] = Field(default=None, description="PostgreSQL database name.")
    POSTGRES_PASSWORD: Optional[str] = Field(default=None, description="PostgreSQL password.")
    POSTGRES_PORT: int = Field(default=5432, description="PostgreSQL port number.")
    DATABASE_URL: Optional[str] = Field(
        default=None,
        description="SQLAlchemy connection string used by the application.",
    )

    model_config = SettingsConfigDict(case_sensitive=True, extra="ignore")

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def _split_allowed_origins(cls, value: Any) -> list[str]:
        """Normalize ALLOWED_ORIGINS env var into a clean string list."""
        if value is None:
            return []
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        if isinstance(value, (list, tuple, set)):
            return [str(item).strip() for item in value if str(item).strip()]
        return [str(value).strip()]


@lru_cache(maxsize=1)
def get_settings(path_var: str = ".env") -> Settings:
    """
    Get application settings with caching.

    Args:
        path_var: Path to environment file (default: ".env")

    Returns:
        Settings: Configured settings instance
    """

    class DynamicSettings(Settings):
        model_config = SettingsConfigDict(env_file=path_var, case_sensitive=True)

    return DynamicSettings()  # type: ignore[misc]


SETTINGS_VAR = get_settings(".env")
