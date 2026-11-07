from pathlib import Path
from sqlalchemy import create_engine, inspect, text, event
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.store.models import Base

# Đảm bảo thư mục cha của SQLite DB tồn tại
if settings.DB_URL.startswith("sqlite:///"):
    db_path = settings.DB_URL.replace("sqlite:///", "")
    Path(db_path).resolve().parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    settings.DB_URL,
    # SQLite has one writer. Give short-lived concurrent status polling a
    # chance to wait instead of immediately failing with "database is locked".
    connect_args={"check_same_thread": False, "timeout": 30} if settings.DB_URL.startswith("sqlite") else {}
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
    if engine.dialect.name == "sqlite":
        columns = {column["name"] for column in inspect(engine).get_columns("ingest_jobs")}
        with engine.begin() as connection:
            for name in ("chunks_total", "chunks_embedded", "chunks_indexed"):
                if name not in columns:
                    connection.execute(text(f"ALTER TABLE ingest_jobs ADD COLUMN {name} INTEGER DEFAULT 0"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
