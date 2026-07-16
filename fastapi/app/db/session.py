from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

connect_args = {}
if make_url(settings.database_url).get_backend_name() == "postgresql":
    connect_args["connect_timeout"] = settings.database_connect_timeout_seconds

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=settings.database_pool_recycle_seconds,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
