from app.db.session import engine, Base
from sqlalchemy import text
import os
import sys

# Add backend to Python path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# Import all models so they register with Base.metadata


def reset_schema():
    print("Dropping legacy user tables...")
    with engine.begin() as conn:
        # We must drop tables that depend on users.id (UUID now) to avoid conflicts
        tables_to_drop = [
            "chat_sessions",
            "user_vocab_progress",
            "user_hangul_progress",
            "user_lesson_progress",
            "daily_quests",
            "user_learning_profile",
            "topik_progress",
            "user_progress",
            "users"
        ]

        for table in tables_to_drop:
            try:
                conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE;"))
                print(f"Dropped {table}")
            except Exception as e:
                print(f"Error dropping {table}: {e}")

    print("Recreating database schema with new UUIDs and tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Schema successfully recreated!")


if __name__ == "__main__":
    reset_schema()
