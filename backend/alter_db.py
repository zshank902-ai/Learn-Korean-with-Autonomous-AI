from app.db.session import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        conn.execute(text('ALTER TABLE user_progress ADD COLUMN roadmap_status_json TEXT;'))
        conn.commit()
    print("Column roadmap_status_json added successfully.")
except Exception as e:
    print(f"Error (column may already exist): {e}")

try:
    from app.db.session import Base
    from app.models import user, tutor
    Base.metadata.create_all(bind=engine)
    print("New tables (ChatSession) created successfully.")
except Exception as e:
    print(f"Error creating tables: {e}")
