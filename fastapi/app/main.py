import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.health import router as health_router
from app.api.db_health import router as db_health_router
from app.api.place_dna import router as place_dna_router
from app.core.config import settings

logger = logging.getLogger(__name__)

app = FastAPI(
    title="PlaceDNA API",
    version="0.1.0",
)


def build_allowed_origins() -> list[str]:
    origins = []

    if settings.allowed_origins:
        origins.extend(
            origin.strip().rstrip("/")
            for origin in settings.allowed_origins.split(",")
            if origin.strip()
        )

    if settings.frontend_origin:
        origins.append(settings.frontend_origin.strip().rstrip("/"))

    return list(dict.fromkeys(origins))


app.add_middleware(
    CORSMiddleware,
    allow_origins=build_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled backend error")

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error. Check backend logs.",
        },
    )


app.include_router(health_router, prefix="/api")
app.include_router(db_health_router, prefix="/api")
app.include_router(place_dna_router, prefix="/api")