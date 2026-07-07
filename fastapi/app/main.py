import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.health import router as health_router
from app.api.db_health import router as db_health_router
from app.api.place_dna import router as place_dna_router
from app.core.config import settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="PlaceDNA API",
    version="0.1.0",
)


def build_allowed_origins() -> list[str]:
    origins: list[str] = []

    if settings.allowed_origins:
        origins.extend(
            origin.strip().rstrip("/")
            for origin in settings.allowed_origins.split(",")
            if origin.strip()
        )

    if settings.frontend_origin:
        origins.append(settings.frontend_origin.strip().rstrip("/"))

    origins.append("https://place-dna.vercel.app")

    return list(dict.fromkeys(origins))


allowed_origins = build_allowed_origins()

logger.info("Allowed CORS origins: %s", allowed_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled backend error on %s", request.url.path)

    origin = request.headers.get("origin")
    headers: dict[str, str] = {}

    if origin and origin.rstrip("/") in allowed_origins:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error. Check Render backend logs.",
        },
        headers=headers,
    )


@app.get("/api/cors-test")
def cors_test() -> dict[str, list[str] | str]:
    return {
        "status": "ok",
        "allowed_origins": allowed_origins,
    }


app.include_router(health_router, prefix="/api")
app.include_router(db_health_router, prefix="/api")
app.include_router(place_dna_router, prefix="/api")
