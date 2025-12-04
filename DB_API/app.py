"""FastAPI application."""

import argparse
import logging
from typing import Dict
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.settings import SETTINGS_VAR
from backend.app.src.controllers.db_queries_controllers import db_queries_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

parser = argparse.ArgumentParser()
parser.add_argument("--docker", action="store_true", help="Running with docker")
parser.add_argument("--host", required=True, help="Application host.")
parser.add_argument("--port", required=True, help="Application port.")
parser.add_argument(
    "--reload",
    required=False,
    help="Enable auto-reload for development purposes.",
)

settings = SETTINGS_VAR
ROOT_PATH_BACKEND = settings.ROOT_PATH_BACKEND

if not ROOT_PATH_BACKEND:
    # Se o valor não estiver configurado, use string vazia para o root_path
    ROOT_PATH_APP = ""
elif ROOT_PATH_BACKEND.lower() == "localhost":
    # Se for "localhost", corrija para string vazia para desenvolvimento local.
    # O root_path deve ser um prefixo de caminho, não um nome de host.
    logger.warning(
        "ROOT_PATH_BACKEND='localhost' detectado. Corrigindo para '' (caminho raiz) "
        "para garantir que /docs e assets funcionem localmente."
    )
    ROOT_PATH_APP = "" # <--- ESTA LINHA RESOLVE O PROBLEMA
else:
    raise ValueError("ROOT_PATH_BACKEND must be configured in the environment settings.")


logger.info("Starting FastAPI application...")
app = FastAPI(
    title="Sinaliza",
    root_path=ROOT_PATH_APP,
    description="Documentação endpoints para consumo dos db_query da aplicação Sinaliza",
)

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(db_queries_router)


@app.get("/", response_description="Api healthcheck")  # type: ignore[misc]
async def index() -> Dict[str, str]:
    """Define a route for handling HTTP GET requests to the root URL ("/")."""
    return {"0": "0"}

"""
if __name__ == "__main__":

    uvicorn.run(
        "app:app", host=args.host, port=int(args.port), reload=(args.reload or False)
    )  # , log_level="trace")
"""

if __name__ == "__main__":
    uvicorn.run("app:app", host='localhost', port=8000)
