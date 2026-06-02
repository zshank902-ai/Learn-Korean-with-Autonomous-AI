import os
from sqlalchemy import create_engine, text
from app.core.config import settings

def alter_vocab_table():
    print(f"Connecting to DB at: {settings.DATABASE_URL}")
    
    # SQLAlchemy engine handles both Postgres and SQLite seamlessly
    engine = create_engine(settings.DATABASE_URL)
    
    columns_to_add = [
        ("pos", "VARCHAR"),
        ("example_kr", "VARCHAR"),
        ("example_en", "VARCHAR"),
        ("category", "VARCHAR"),
        ("is_enriched", "BOOLEAN DEFAULT FALSE")
    ]
    
    with engine.begin() as conn:
        for col_name, col_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE vocab_items ADD COLUMN {col_name} {col_type}"))
                print(f"[OK] Added column: {col_name}")
            except Exception as e:
                # Postgres throws DuplicateColumn errors which we can safely ignore
                print(f"[WARN] Could not add {col_name} (might already exist)")
                
    print("Database alteration complete!")

if __name__ == "__main__":
    alter_vocab_table()
