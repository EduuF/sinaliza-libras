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
def ep_get_trecho_para_traduzir(site_id: Optional[int] = None, get_all_trechos_from_site: Optional[bool] = False) -> Dict[str, Any]:
    """List appointments filtered by patient, dentist or time window."""
    conteudo_trecho: str = get_trecho_para_traduzir(site_id=site_id, get_all_trechos_from_site=get_all_trechos_from_site)
    return {"status": 200, "response": conteudo_trecho}

@db_queries_router.get("/registra_video", response_model=Dict[str, Any])
def ep_registra_video(interprete_id: int, video_url: str, trecho_id: int) -> Dict[str, Any]:
    """List appointments filtered by patient, dentist or time window."""
    _: str = registra_video(interprete_id = interprete_id, video_url = video_url, trecho_id=trecho_id)
    return {"status": 200}


@db_queries_router.get("/registra_site", response_model=Dict[str, Any])
def ep_registra_site(site_url: str) -> Dict[str, Any]:
    """List appointments filtered by patient, dentist or time window."""
    #site_id: int = registra_site(site_url = site_url)
    #return {"status": 200, "response": {"site_url": site_url, "site_id": site_id}}

@db_queries_router.get("/get_site_id_by_url", response_model=Dict[str, Any])
def ep_get_site_id_by_url(site_url: str) -> Dict[str, Any]:
    """List appointments filtered by patient, dentist or time window."""
    #TODO
    #site_id: int = get_site_id_by_url(site_url = site_url)
    #return {"status": 200, "site_id": site_id}

@db_queries_router.get("/registra_trecho", response_model=Dict[str, Any])
def ep_registra_trecho(trecho_conteudo: str, site_url: str, site_id: int) -> Dict[str, Any]:
    """List appointments filtered by patient, dentist or time window."""
    #TODO
    #(trecho_id, trecho_hash) = registra_trecho(interprete_id = interprete_id, video_url = video_url, trecho_id=trecho_id)
    #return {"status": 200, "response": {"trecho_id": trecho_id, "trecho_hash": trecho_hash}}