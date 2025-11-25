"""Pydantic schemas for trecho data transfer."""

from typing import Optional
from pydantic import BaseModel


class TrechoBase(BaseModel):
    """Shared fields for trecho operations."""

    trecho_id: Optional[int] = None
    trecho_hash: Optional[str] = None
    conteudo: str
    site_id: Optional[int] = None
    interprete_id: Optional[int] = None
    snapshot_name: Optional[str] = None
    video_url: Optional[int] = None