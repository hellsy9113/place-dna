import logging

from fastapi import APIRouter, HTTPException
from sqlalchemy import text

from app.db.session import engine

logger = logging.getLogger(__name__)

router = APIRouter(tags=["database"])


@router.get("/db-health")
def db_health() -> dict[str, str]:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as exc:
        logger.exception("Database health check failed")
        raise HTTPException(
            status_code=500,
            detail="Database connection failed. Check Render DATABASE_URL.",
        ) from exc

    return {"database": "connected"}
