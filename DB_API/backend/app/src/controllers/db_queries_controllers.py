from datetime import datetime
from typing import Annotated, Optional, Dict, Any
from fastapi import APIRouter, Query

from backend.app.src.services.db_queries.get_conteudo_trecho import get_conteudo_trecho_by_id
from backend.app.src.services.db_queries.get_trecho_para_traduzir import get_trecho_para_traduzir
from backend.app.src.services.db_queries.registra_video import registra_video

db_queries_router = APIRouter(prefix="/db_queries", tags=["db_queries"])
DatetimeQuery = Annotated[Optional[datetime], Query()]


@db_queries_router.get("/", response_model=Dict[str, int])
def ep_land_page() -> Dict[str, int]:
    """List appointments filtered by patient, dentist or time window."""
    return {"status": 200}

@db_queries_router.get("/get_conteudo_trecho", response_model=Dict[str, Any])
def ep_get_conteudo_trecho(trecho_id: str) -> Dict[str, Any]:
    """List appointments filtered by patient, dentist or time window."""
    conteudo_trecho: str = get_conteudo_trecho_by_id(trecho_id=trecho_id)
    return {"status": 200, "response": conteudo_trecho}

@db_queries_router.get("/get_trecho_para_traduzir", response_model=Dict[str, Any])
def ep_get_trecho_para_traduzir(site_id: Optional[int] = None) -> Dict[str, Any]:
    """List appointments filtered by patient, dentist or time window."""
    conteudo_trecho: str = get_trecho_para_traduzir(site_id=site_id)
    return {"status": 200, "response": conteudo_trecho}

@db_queries_router.get("/registra_video", response_model=Dict[str, Any])
def ep_registra_video(interprete_id: int, video_url: str, trecho_id: int) -> Dict[str, Any]:
    """List appointments filtered by patient, dentist or time window."""
    _: str = registra_video(interprete_id = interprete_id, video_url = video_url, trecho_id=trecho_id)
    return {"status": 200}