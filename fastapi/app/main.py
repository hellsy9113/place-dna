from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.db_health import router as db_health_router
from app.api.place_dna import router as place_dna_router
from app.core.config import settings

app = FastAPI(
    title="PlaceDNA API",
    version="0.1.0",
)

allowed_origins = [
    "http://localhost:3000",
]

if settings.frontend_origin:
    allowed_origins.append(settings.frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(db_health_router, prefix="/api")
app.include_router(place_dna_router, prefix="/api")