"""Settings configuration module for the Technium Q21 backend.

This module centralizes configuration management using Pydantic Settings,
allowing flexible loading of environment variables from different .env files.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings configuration class.

    Loads settings from environment variables or .env files.
    """

    # Global
    sheets_credentials_file: Optional[str] = Field(default=None,description="Pasta para as credenciais de acesso ao sheets")

    # Interprete
    planilha_interprete_url: Optional[str] = Field(default=None, description="Link para a planilha de interpretes")
    planilha_interprete_tab_name: Optional[str] = Field(default=None,description="Nome da aba da planilha para trechos")

    # Site
    planilha_site_url: Optional[str] = Field(default=None, description="Link para a planilha de sites")
    planilha_site_tab_name: Optional[str] = Field(default=None, description="Nome da aba da planilha para trechos")

    # Trecho
    planilha_trecho_url: Optional[str] = Field(default=None, description="Link para a planilha de trechos")
    planilha_trecho_tab_name: Optional[str] = Field(default=None, description="Nome da aba da planilha para trechos")



    ROOT_PATH_BACKEND: Optional[str] = Field(default=None, description="ROOT_PATH_BACKEND")

    model_config = SettingsConfigDict(case_sensitive=True, extra="ignore")


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
