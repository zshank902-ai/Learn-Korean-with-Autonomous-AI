from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


def check_and_upgrade_db():
    inspector = inspect(engine)
    if "users" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("users")]
        if "oauth_provider" not in columns:
            print("DB Upgrade: Adding oauth_provider column to users table")
            with engine.begin() as conn:
                conn.execute(
                    text("ALTER TABLE users ADD COLUMN oauth_provider VARCHAR")
                )
        if "oauth_id" not in columns:
            print("DB Upgrade: Adding oauth_id column to users table")
            with engine.begin() as conn:
                conn.execute(
                    text("ALTER TABLE users ADD COLUMN oauth_id VARCHAR"))

    if "user_progress" in inspector.get_table_names():
        columns = [col["name"]
                   for col in inspector.get_columns("user_progress")]
        if "long_term_memory" not in columns:
            print("DB Upgrade: Adding long_term_memory column to user_progress table")
            with engine.begin() as conn:
                conn.execute(
                    text(
                        "ALTER TABLE user_progress ADD COLUMN long_term_memory VARCHAR"
                    )
                )


class Base(DeclarativeBase):
    """
    SQLAlchemy 2.0 declarative base class.
    Replaces deprecated declarative_base() function import.
    """


if "sqlite" in settings.DATABASE_URL:
    engine = create_engine(
        settings.DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
