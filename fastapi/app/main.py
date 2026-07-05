from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.db_health import router as db_health_router
from app.api.place_dna import router as place_dna_router

app = FastAPI(
    title="PlaceDNA API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(db_health_router, prefix="/api")
app.include_router(place_dna_router, prefix="/api")
