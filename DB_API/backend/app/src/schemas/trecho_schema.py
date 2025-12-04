"""Pydantic schemas for trecho data transfer."""

from typing import Optional
from pydantic import BaseModel


class TrechoBase(BaseModel):
    """Shared fields for trecho operations."""

    trecho_id: Optional[int|float] = None
    trecho_hash: Optional[str|float] = None
    conteudo: str
    site_id: Optional[int|float] = None
    interprete_id: Optional[int|float] = None
    snapshot_name: Optional[str|float] = None
    video_url: Optional[str|float] = None