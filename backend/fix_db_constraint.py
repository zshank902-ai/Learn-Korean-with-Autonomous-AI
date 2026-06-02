import os
import sys

# Add the backend dir to the sys path so we can import from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from app.core.config import settings
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

engine = create_engine(settings.DATABASE_URL)
Session = sessionmaker(bind=engine)

with Session() as session:
    print("Deleting duplicate words...")
    session.execute(text("""
        DELETE FROM vocab_items
        WHERE id IN (
            SELECT id
            FROM (
                SELECT id, ROW_NUMBER() OVER (partition BY word ORDER BY id) AS rnum
                FROM vocab_items
            ) t
            WHERE t.rnum > 1
        );
    """))
    print("Adding UNIQUE constraint to 'word' column...")
    try:
        session.execute(text("ALTER TABLE vocab_items ADD CONSTRAINT unique_word UNIQUE (word);"))
    except Exception as e:
        print("Constraint might already exist or error:", e)
    session.commit()
    print("Database is now perfectly configured for Bulk Upsert!")
