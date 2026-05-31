import os
import sys

# Add backend to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.session import SessionLocal
from app.models.srs import VocabItem
from app.models.course import TopikLevel
from korean_romanizer.romanizer import Romanizer

def update_romanizations():
    print("Starting Romanization Update Process...")
    with SessionLocal() as db:
        # Find items where pronunciation is empty or None
        items = db.query(VocabItem).filter(
            (VocabItem.pronunciation == "") | (VocabItem.pronunciation.is_(None))
        ).all()
        
        print(f"Found {len(items)} words missing romanization.")
        
        updated_count = 0
        batch_size = 500
        
        for item in items:
            try:
                if item.word:
                    r = Romanizer(item.word)
                    romanized = r.romanize()
                    item.pronunciation = romanized
                    updated_count += 1
            except Exception as e:
                print(f"Failed to romanize '{item.word}': {e}")
            
            if updated_count > 0 and updated_count % batch_size == 0:
                db.commit()
                print(f"Committed {updated_count} updates...")
                
        if updated_count % batch_size != 0:
            db.commit()
            
        print(f"✅ Update Complete! Successfully added {updated_count} romanizations.")

if __name__ == "__main__":
    update_romanizations()
