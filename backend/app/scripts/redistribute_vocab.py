import os
import sys

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from app.db.session import SessionLocal
from app.models.srs import VocabItem
from app.models.course import TopikLevel
from sqlalchemy import func

def redistribute_levels():
    db = SessionLocal()
    print("Redistributing TOPIK levels...")
    
    # Get all words for Level 1, 3, 5
    level_1_words = db.query(VocabItem).filter(VocabItem.level_id == 1).all()
    level_3_words = db.query(VocabItem).filter(VocabItem.level_id == 3).all()
    level_5_words = db.query(VocabItem).filter(VocabItem.level_id == 5).all()
    
    print(f"Current counts -> L1: {len(level_1_words)}, L3: {len(level_3_words)}, L5: {len(level_5_words)}")
    
    # Move half of level 1 to level 2
    for i in range(len(level_1_words) // 2):
        level_1_words[i].level_id = 2
        
    # Move half of level 3 to level 4
    for i in range(len(level_3_words) // 2):
        level_3_words[i].level_id = 4
        
    # Move half of level 5 to level 6
    for i in range(len(level_5_words) // 2):
        level_5_words[i].level_id = 6
        
    db.commit()
    
    counts = db.query(VocabItem.level_id, func.count(VocabItem.id)).group_by(VocabItem.level_id).all()
    print("New vocab counts by level:", counts)
    print("Redistribution complete!")

if __name__ == "__main__":
    redistribute_levels()
