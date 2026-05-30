import os
import sys
import random
from datasets import load_dataset
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

# Add the backend dir to the sys path so we can import from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.db.session import SessionLocal, engine
from app.models.course import TopikLevel
from app.models.srs import VocabItem
from app.db.session import Base

def map_difficulty_to_level(difficulty_str: str) -> int:
    """
    Robustly maps arbitrary difficulty strings to TOPIK levels 1-6.
    """
    if not difficulty_str:
        return random.randint(1, 6)
        
    diff = str(difficulty_str).lower()
    
    # Try exact level numbers first
    if '1' in diff: return 1
    if '2' in diff: return 2
    if '3' in diff: return 3
    if '4' in diff: return 4
    if '5' in diff: return 5
    if '6' in diff: return 6
    
    # Try textual mapping
    if 'beginner' in diff or 'novice' in diff or 'easy' in diff or 'a' in diff:
        return random.randint(1, 2)
    elif 'intermediate' in diff or 'medium' in diff or 'b' in diff:
        return random.randint(3, 4)
    elif 'advanced' in diff or 'hard' in diff or 'c' in diff:
        return random.randint(5, 6)
        
    # Fallback to random distribution
    return random.randint(1, 6)

def generate_hf_vocab(db: Session):
    # Ensure levels exist
    levels = {}
    for i in range(1, 7):
        lvl = db.query(TopikLevel).filter(TopikLevel.level_num == i).first()
        if not lvl:
            lvl = TopikLevel(level_num=i, title=f"TOPIK {i}", description=f"Mastery for TOPIK Level {i}")
            db.add(lvl)
            db.commit()
            db.refresh(lvl)
        levels[i] = lvl.id

    print("Fetching massive 5,000-word dataset from Hugging Face...")
    try:
        ds = load_dataset('jaylee8864/korean-vocabulary-5000', 'en', split='train')
    except Exception as e:
        print(f"Failed to load dataset: {e}")
        return

    print(f"Successfully loaded {len(ds)} records. Beginning DB injection...")
    
    count = 0
    duplicate_count = 0
    batch_size = 500
    
    for row in ds:
        ko_term = row.get('korean_term')
        en_term = row.get('english_term')
        
        # Skip if missing core data
        if not ko_term or not en_term:
            continue
            
        diff_str = row.get('difficulty', '')
        level_num = map_difficulty_to_level(diff_str)
        
        # Check for existence
        existing = db.query(VocabItem).filter(VocabItem.word == ko_term).first()
        if existing:
            duplicate_count += 1
            continue
            
        vocab = VocabItem(
            word=ko_term,
            meaning=en_term,
            pronunciation=row.get('romanization', ''),
            level_id=levels[level_num]
        )
        db.add(vocab)
        count += 1
        
        # Commit in batches for performance
        if count % batch_size == 0:
            print(f"Inserted {count} words...")
            db.commit()

    # Commit any remaining records
    db.commit()
    print(f"Injection Complete! Successfully added {count} NEW words. (Skipped {duplicate_count} duplicates).")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        generate_hf_vocab(db)
    finally:
        db.close()
