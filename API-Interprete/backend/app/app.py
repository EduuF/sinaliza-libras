"""FastAPI application."""

import argparse
import logging
from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from settings import SETTINGS_VAR

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
args = parser.parse_args()

settings = SETTINGS_VAR
ROOT_PATH_BACKEND = settings.ROOT_PATH_BACKEND

if not ROOT_PATH_BACKEND:
    raise ValueError("ROOT_PATH_BACKEND must be configured in the environment settings.")

allowed_origins = settings.ALLOWED_ORIGINS or [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

logger.info("Starting FastAPI application...")
app = FastAPI(
    title="Sinaliza",
    root_path=ROOT_PATH_BACKEND,
    description="Documentação endpoints para consumo dos interpretes da aplicação Sinaliza",
)

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

#app.include_router(user_router)
#app.include_router(zapi_router)


@app.get("/", response_description="Api healthcheck")  # type: ignore[misc]
async def index() -> Dict[str, str]:
    """Define a route for handling HTTP GET requests to the root URL ("/")."""
    return {"0": "0"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app", host=args.host, port=int(args.port), reload=(args.reload or False)
    )  # , log_level="trace")
