import os
import sys

# Add backend to Python path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy import text
from app.db.session import engine, Base
# Import all models so they register with Base.metadata
from app.models.user import User, UserProgress, DailyQuest, UserLearningProfile, TopikProgress
from app.models.course import TopikLevel, CourseModule, Lesson, UserLessonProgress
from app.models.hangul import HangulVocabulary, UserHangulProgress
from app.models.srs import VocabItem, UserVocabProgress
from app.models.tutor import ChatSession

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
