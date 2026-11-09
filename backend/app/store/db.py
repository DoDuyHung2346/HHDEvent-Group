from pathlib import Path
from sqlalchemy import create_engine, inspect, text, event
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.store.models import Base

# Đảm bảo thư mục cha của SQLite DB tồn tại
if settings.DB_URL.startswith("sqlite:///"):
    db_path = settings.DB_URL.replace("sqlite:///", "")
    Path(db_path).resolve().parent.mkdir(parents=True, exist_ok=True)

def normalized_database_url(raw_url: str) -> str:
    """Accept Supabase's standard postgres URI with SQLAlchemy's psycopg driver."""
    if raw_url.startswith("postgresql://"):
        return "postgresql+psycopg://" + raw_url.removeprefix("postgresql://")
    if raw_url.startswith("postgres://"):
        return "postgresql+psycopg://" + raw_url.removeprefix("postgres://")
    return raw_url


DATABASE_URL = normalized_database_url(settings.DB_URL)

engine = create_engine(
    DATABASE_URL,
    # SQLite has one writer. Give short-lived concurrent status polling a
    # chance to wait instead of immediately failing with "database is locked".
    connect_args={"check_same_thread": False, "timeout": 30} if DATABASE_URL.startswith("sqlite") else {}
)

if settings.DB_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def configure_sqlite_connection(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=30000")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    # Lightweight forward migration for installations created before detailed
    # ingestion progress was added. SQLAlchemy create_all does not add columns.
    with engine.begin() as connection:
        job_columns = {column["name"] for column in inspect(engine).get_columns("ingest_jobs")}
        for name in ("chunks_total", "chunks_embedded", "chunks_indexed"):
            if name not in job_columns:
                connection.execute(text(f"ALTER TABLE ingest_jobs ADD COLUMN {name} INTEGER DEFAULT 0"))

        document_columns = {column["name"] for column in inspect(engine).get_columns("documents")}
        if "storage_backend" not in document_columns:
            connection.execute(text("ALTER TABLE documents ADD COLUMN storage_backend VARCHAR(32) DEFAULT 'local'"))
        if "storage_path" not in document_columns:
            connection.execute(text("ALTER TABLE documents ADD COLUMN storage_path VARCHAR(512)"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
