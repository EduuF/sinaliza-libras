"""Pydantic schemas for interprete data transfer."""

from typing import Optional, List

from pydantic import BaseModel


class InterpreteBase(BaseModel):
    """Shared fields for interprete operations."""

    interprete_id: int
    trechos_ids: Optional[List[int]] = []
