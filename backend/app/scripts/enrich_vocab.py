import argparse
import json
import logging
import re
import sys
import os
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

# SQLAlchemy imports
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the backend dir to the sys path so we can import from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from app.core.config import settings
from app.models.srs import VocabItem
from app.models.course import TopikLevel

# Setup logging for skipped words
logging.basicConfig(
    filename='skipped_words.log',
    filemode='w',
    format='[%(levelname)s] %(message)s',
    level=logging.WARNING
)

# LAYER 1: Topic mapping
TOPIC_MAPPING = {
    "food": "Food and Drink", "cooking": "Food and Drink", "beverages": "Food and Drink",
    "sports": "Sports and Hobbies", "games": "Sports and Hobbies", "leisure": "Sports and Hobbies",
    "medicine": "Body and Health", "anatomy": "Body and Health", "healthcare": "Body and Health",
    "education": "Education and School", "mathematics": "Education and School", "linguistics": "Education and School",
    "technology": "Technology and Internet", "computing": "Technology and Internet", "internet": "Technology and Internet",
    "travel": "Travel and Transportation", "transport": "Travel and Transportation", "vehicles": "Travel and Transportation",
    "nature": "Nature and Weather", "weather": "Nature and Weather", "animals": "Nature and Weather", "plants": "Nature and Weather",
    "music": "Arts and Entertainment", "art": "Arts and Entertainment", "film": "Arts and Entertainment",
    "religion": "Society and Culture", "politics": "Society and Culture", "history": "Society and Culture",
    "law": "Formal and Academic", "philosophy": "Formal and Academic", "science": "Formal and Academic",
    "business": "Work and Career",
    "finance": "Shopping and Money", "economics": "Shopping and Money",
    "family": "Family and Relationships",
    "emotions": "Emotions and Feelings", "psychology": "Emotions and Feelings"
}

# LAYER 2: Keyword mapping
KEYWORD_MAPPING = {
    "Food and Drink": ["eat","food","drink","cook","rice","meal","dish","soup","meat","fish","vegetable","fruit","taste","flavor","restaurant","boil","fry","ingredient","snack","bread"],
    "Body and Health": ["body","health","disease","pain","doctor","hospital","medicine","symptom","blood","bone","muscle","skin","heart","brain","fever","surgery","cure","diet","therapy"],
    "Sports and Hobbies": ["sport","game","play","ball","team","athlete","score","match","race","swim","run","exercise","hobby","leisure","gym","compete","champion","train","coach"],
    "Nature and Weather": ["nature","weather","rain","wind","sun","mountain","river","tree","flower","animal","sky","cloud","season","forest","ocean","lake","soil","grass","bird","fish"],
    "Travel and Transportation": ["travel","transport","road","car","train","bus","flight","airport","station","map","trip","journey","ticket","hotel","tour","destination","subway","bicycle","taxi"],
    "Education and School": ["school","study","learn","teach","student","class","exam","book","knowledge","university","grade","subject","lesson","homework","professor","library","degree"],
    "Work and Career": ["work","job","career","office","company","employee","boss","salary","business","meeting","project","profession","hire","resign","contract","department","manager"],
    "Family and Relationships": ["family","parent","child","brother","sister","friend","marriage","relationship","love","together","husband","wife","son","daughter","relative","couple","bond","reunion"],
    "Emotions and Feelings": ["feel","emotion","happy","sad","angry","afraid","surprise","joy","worry","excited","lonely","proud","shame","nervous","calm","grief","jealous","embarrass","delight"],
    "Technology and Internet": ["technology","computer","internet","phone","software","digital","app","network","data","screen","device","code","server","battery","wireless","program","system","robot","ai"],
    "Shopping and Money": ["money","buy","sell","price","pay","market","shop","cost","cheap","expensive","currency","bank","save","discount","brand","purchase","wallet","receipt","refund","budget"],
    "Society and Culture": ["society","culture","tradition","custom","history","government","people","nation","community","social","event","festival","ceremony","belief","religion","media"],
    "Home and Daily Life": ["home","house","room","daily","morning","night","clean","sleep","wake","live","furniture","door","kitchen","bathroom","garden","neighbor","routine","chore"],
    "Greetings and Expressions": ["hello","goodbye","thank","sorry","please","excuse","welcome","greeting","expression","polite","bow","farewell","congratulate"],
    "Numbers and Time": ["number","time","hour","minute","second","day","week","month","year","date","clock","count","measure","calendar","schedule"],
    "Formal and Academic": ["formal","academic","legal","official","document","research","theory","concept","analysis","scientific","philosophical","thesis","hypothesis","conclusion","evidence"],
    "Arts and Entertainment": ["art","music","dance","film","drama","paint","draw","sing","perform","entertainment","theatre","creative","concert","gallery","poetry","novel","sculpture","exhibit"]
}

# Translate NIKL tags to English POS
POS_MAPPING = {
    "명사": "noun", "대명사": "pronoun", "수사": "numeral",
    "동사": "verb", "형용사": "adjective", 
    "관형사": "determiner", "부사": "adverb", 
    "조사": "particle", "감탄사": "interjection",
    "어미": "ending", "접사": "affix"
}

def clean_meaning(gloss: str) -> str:
    gloss = gloss.strip()
    if not gloss:
        return ""
    
    # Capitalize first letter safely
    gloss = gloss[0].upper() + gloss[1:]
    
    # Ensure trailing period
    if not gloss.endswith('.'):
        gloss += '.'
        
    return gloss

def assign_category(entry: Dict, meaning: str, pos: str) -> str:
    m_lower = meaning.lower()
    
    # Layer 1 & 2 combined: Semantic mapping based on english meaning
    for cat, keywords in KEYWORD_MAPPING.items():
        if any(re.search(r'\b' + re.escape(kw) + r'\b', m_lower) for kw in keywords):
            return cat
            
    # Layer 3: Part of Speech Fallback
    if pos == "conjunction": return "Grammar and Connectors"
    elif pos == "particle": return "Korean Particles"
    elif pos == "determiner": return "Demonstratives and Determiners"
    elif pos == "interjection": return "Exclamations and Expressions"
    elif pos == "adverb": return "Adverbs and Frequency"
    elif pos == "verb": return "Common Actions"
    elif pos == "adjective": return "Descriptive Words"
    elif pos == "noun": return "Abstract Concepts"
        
    return "General"

def normalize_list(item):
    if item is None: return []
    if isinstance(item, list): return item
    return [item]

def parse_nikl_entry(entry: Dict) -> Optional[Dict]:
    word = ""
    # Extract Lemma
    lemma = entry.get("Lemma", {})
    if isinstance(lemma, dict):
        feats = normalize_list(lemma.get("feat"))
        for f in feats:
            if isinstance(f, dict) and f.get("att") == "writtenForm":
                word = f.get("val", "")
                
    if not word:
        return None
        
    word = word.replace("-", "").replace("^", "").strip()

    # Get audio path
    audio_path = None
    word_forms = normalize_list(entry.get("WordForm"))
    for wf in word_forms:
        if not isinstance(wf, dict): continue
        wfeats = normalize_list(wf.get("feat"))
        for f in wfeats:
            if isinstance(f, dict) and f.get("att") == "sound":
                audio_path = f.get("val", "")
                break
        if audio_path: break

    # Get POS and Level
    pos = "other"
    level = 3
    feats = normalize_list(entry.get("feat"))
    for f in feats:
        if isinstance(f, dict):
            if f.get("att") == "partOfSpeech":
                kr_pos = f.get("val", "")
                pos = POS_MAPPING.get(kr_pos, "other")
            if f.get("att") == "vocabularyLevel":
                val = f.get("val", "")
                if val == "초급": level = 1
                elif val == "중급": level = 3
                elif val == "고급": level = 5

    # Get meaning and examples
    meaning = ""
    ex_kr = ""
    ex_en = ""
    
    senses = normalize_list(entry.get("Sense"))
    for sense in senses:
        if not isinstance(sense, dict): continue
        
        # English Equivalent
        if not meaning:
            equivs = normalize_list(sense.get("Equivalent"))
            for equiv in equivs:
                if not isinstance(equiv, dict): continue
                efeats = normalize_list(equiv.get("feat"))
                is_eng = False
                temp_meaning = ""
                for ef in efeats:
                    if isinstance(ef, dict):
                        if ef.get("att") == "language" and ef.get("val") == "영어":
                            is_eng = True
                        if ef.get("att") == "lemma":
                            temp_meaning = ef.get("val", "")
                if is_eng and temp_meaning:
                    meaning = clean_meaning(temp_meaning)
                    break
                    
        # Example
        if not ex_kr:
            examples = normalize_list(sense.get("SenseExample"))
            for ex in examples:
                if not isinstance(ex, dict): continue
                exfeats = normalize_list(ex.get("feat"))
                for ex_f in exfeats:
                    if isinstance(ex_f, dict) and ex_f.get("att") == "example":
                        ex_kr = ex_f.get("val", "").strip()
                        break
                if ex_kr: break
                
    if not meaning:
        logging.warning(f"EMPTY_MEANING -> {word}")
        return None
        
    cat = assign_category(entry, meaning, pos)
    
    return {
        "word": word,
        "english_meaning": meaning,
        "romanization": "", # NIKL doesn't provide romanization
        "audio_path": audio_path,
        "part_of_speech": pos,
        "example_korean": ex_kr,
        "example_english": ex_en,
        "difficulty_level": level,
        "category": cat,
        "is_enriched": True
    }

def write_json(vocab_dict: Dict, output_file: str):
    total_words = sum(len(words) for words in vocab_dict.values())
    cat_counts = {k: len(v) for k, v in vocab_dict.items()}
    
    master = {
        "metadata": {
            "total_words": total_words,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source": "NIKL Dictionary",
            "category_counts": cat_counts
        },
        "categories": vocab_dict
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(master, f, indent=2, ensure_ascii=False)
        
def upsert_batch(engine, words: List[Dict], stats: Dict):
    Session = sessionmaker(bind=engine)
    
    with Session() as session:
        levels = session.query(TopikLevel).all()
        level_map = {lvl.level_num: lvl.id for lvl in levels}
        fallback_level = levels[0].id if levels else 1
        
        values = []
        seen_words = set()
        
        # Deduplicate words in this batch to prevent Postgres ON CONFLICT errors
        deduped_words = []
        for w in words:
            if w["word"] not in seen_words:
                seen_words.add(w["word"])
                deduped_words.append(w)
                
        for w in deduped_words:
            values.append({
                "word": w["word"],
                "meaning": w["english_meaning"],
                "pronunciation": w["romanization"],
                "audio_path": w["audio_path"],
                "pos": w["part_of_speech"],
                "example_kr": w["example_korean"],
                "example_en": w["example_english"],
                "category": w["category"],
                "is_enriched": True,
                "level_id": level_map.get(w["difficulty_level"], fallback_level)
            })
            
        if not values:
            return

        query = text("""
            INSERT INTO vocab_items (word, meaning, pronunciation, audio_path, pos, example_kr, example_en, category, is_enriched, level_id)
            VALUES (:word, :meaning, :pronunciation, :audio_path, :pos, :example_kr, :example_en, :category, :is_enriched, :level_id)
            ON CONFLICT (word) DO UPDATE SET
                meaning = EXCLUDED.meaning,
                audio_path = EXCLUDED.audio_path,
                pos = EXCLUDED.pos,
                example_kr = EXCLUDED.example_kr,
                example_en = EXCLUDED.example_en,
                category = EXCLUDED.category,
                is_enriched = EXCLUDED.is_enriched,
                level_id = EXCLUDED.level_id
        """)
        
        try:
            session.execute(query, values)
            session.commit()
            stats["updated"] += len(values)
            print(f"✓ Bulk Upserted {len(values)} words securely to Neon Database...")
        except Exception as e:
            logging.warning(f"DB_BATCH_ERROR -> {str(e)}")
            session.rollback()
            stats["skipped"] += len(values)

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser()
    parser.add_argument("--folder", type=str, required=True, help="Path to NIKL folder")
    parser.add_argument("--db-only", action="store_true")
    parser.add_argument("--json-only", action="store_true")
    args = parser.parse_args()

    vocab_dict = {}
    stats = {"read": 0, "processed": 0, "inserted": 0, "updated": 0, "skipped": 0}
    
    print(f"Reading NIKL JSON files from {args.folder}...")
    
    if not os.path.exists(args.folder):
        print(f"Error: Folder {args.folder} not found.")
        sys.exit(1)

    for filename in os.listdir(args.folder):
        if not filename.endswith(".json"): continue
        
        filepath = os.path.join(args.folder, filename)
        print(f"Parsing {filename}...")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            entries = data.get('LexicalResource', {}).get('Lexicon', {}).get('LexicalEntry', [])
            if isinstance(entries, dict): entries = [entries]
            
            for entry in entries:
                stats["read"] += 1
                parsed = parse_nikl_entry(entry)
                if parsed:
                    cat = parsed["category"]
                    if cat not in vocab_dict:
                        vocab_dict[cat] = []
                    vocab_dict[cat].append(parsed)
                    stats["processed"] += 1
        except Exception as e:
            print(f"Error parsing {filename}: {e}")

    json_out = os.path.join(os.path.dirname(__file__), "../../data/master_korean_vocab.json")
    if not os.path.exists(os.path.dirname(json_out)):
        os.makedirs(os.path.dirname(json_out))
        
    if not args.db_only:
        print(f"Writing {json_out}...")
        write_json(vocab_dict, json_out)

    if not args.json_only:
        print(f"Connecting to DB at {settings.DATABASE_URL}...")
        engine = create_engine(settings.DATABASE_URL)
        all_words = []
        for words in vocab_dict.values():
            all_words.extend(words)
            
        batch_size = 500
        for i in range(0, len(all_words), batch_size):
            batch = all_words[i:i+batch_size]
            upsert_batch(engine, batch, stats)

    print("\n════════════════════════════════════")
    print(" NIKL VOCAB ENRICHMENT COMPLETE")
    print("════════════════════════════════════")
    print(f"Total entries read      : {stats['read']}")
    print(f"Successfully processed  : {stats['processed']}")
    if not args.json_only:
        print(f"Inserted (new)          : {stats['inserted']}")
        print(f"Updated (existing)      : {stats['updated']}")
    print(f"Skipped (errors)        : {stats['skipped']}")
    print("════════════════════════════════════")

if __name__ == "__main__":
    main()
