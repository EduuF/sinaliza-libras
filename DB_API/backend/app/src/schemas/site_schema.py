"""Pydantic schemas for site data transfer."""

from typing import Optional, List
from pydantic import BaseModel


class SiteBase(BaseModel):
    """Shared fields for site operations."""

    site_id: int
    site_url: str
    trechos_ids: Optional[List[int]] = []
