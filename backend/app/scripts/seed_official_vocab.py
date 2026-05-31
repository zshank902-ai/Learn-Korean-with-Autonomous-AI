import os
import sys
import httpx
import csv
import io
from pathlib import Path

# Add backend to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.session import SessionLocal
from app.models.srs import VocabItem
from app.models.course import TopikLevel

TSV_URL = "https://raw.githubusercontent.com/julienshim/combined_korean_vocabulary_list/master/results.tsv"

def clean_value(val: str) -> str:
    if not val:
        return ""
    return val.strip()

def download_tsv() -> str:
    print(f"Downloading TSV from {TSV_URL}...")
    # use httpx sync client
    with httpx.Client(timeout=60.0) as client:
        response = client.get(TSV_URL)
        response.raise_for_status()
        return response.text

def seed_vocab():
    print("Starting Official Vocab Seed Process...")
    tsv_content = download_tsv()
    reader = csv.DictReader(io.StringIO(tsv_content), delimiter='\t')
    
    with SessionLocal() as db:
        # Get level mappings
        levels = db.query(TopikLevel).order_by(TopikLevel.level_num).all()
        
        level_map = {lvl.level_num: lvl.id for lvl in levels}
        if not level_map:
            print("Error: No Topik Levels found in the database. Run normal seed first.")
            return

        # Fallbacks in case 1, 3, 5 don't exist
        lvl_A_id = level_map.get(1) or level_map.get(2)
        lvl_B_id = level_map.get(3) or level_map.get(4)
        lvl_C_id = level_map.get(5) or level_map.get(6)

        # Get existing words to avoid duplicates
        existing_result = db.query(VocabItem.word).all()
        existing_words = set(row[0] for row in existing_result)

        added_count = 0
        skipped_count = 0

        batch = []
        BATCH_SIZE = 500

        for row in reader:
            word = clean_value(row.get('word', ''))
            
            # Skip empty rows or words we already have
            if not word:
                continue
                
            clean_word = ''.join(c for c in word if not c.isdigit())
            
            if clean_word in existing_words:
                skipped_count += 1
                continue
                
            meaning = clean_value(row.get('explanation', ''))
            nikl_level = clean_value(row.get('nikl_level', ''))
            topik_level = clean_value(row.get('topik_level', ''))
            
            target_level = topik_level if topik_level else nikl_level
            
            if target_level == 'A':
                target_level_id = lvl_A_id
            elif target_level == 'B':
                target_level_id = lvl_B_id
            elif target_level == 'C':
                target_level_id = lvl_C_id
            else:
                target_level_id = lvl_B_id
                
            if not target_level_id:
                target_level_id = list(level_map.values())[0] if level_map else 1
                
            new_item = VocabItem(
                word=clean_word,
                meaning=meaning if meaning else "See context",
                pronunciation="",
                level_id=target_level_id
            )
            
            batch.append(new_item)
            existing_words.add(clean_word)
            added_count += 1
            
            if len(batch) >= BATCH_SIZE:
                db.add_all(batch)
                db.commit()
                batch = []
                print(f"Inserted batch... Total added: {added_count}")
                
        if batch:
            db.add_all(batch)
            db.commit()
            
        print(f"✅ Seeding Complete!")
        print(f"Total Words Added: {added_count}")
        print(f"Total Words Skipped (Already existed): {skipped_count}")

if __name__ == "__main__":
    seed_vocab()
