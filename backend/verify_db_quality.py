import os
import sys

# Add the backend dir to the sys path so we can import from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from app.core.config import settings
from app.models.srs import VocabItem
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(settings.DATABASE_URL)
Session = sessionmaker(bind=engine)

with Session() as session:
    total_words = session.query(VocabItem).count()
    words_with_wav = session.query(VocabItem).filter(VocabItem.audio_path.isnot(None)).filter(VocabItem.audio_path != '').count()
    missing_meaning = session.query(VocabItem).filter((VocabItem.meaning == None) | (VocabItem.meaning == '')).count()
    missing_kr_example = session.query(VocabItem).filter((VocabItem.example_kr == None) | (VocabItem.example_kr == '')).count()
    missing_en_example = session.query(VocabItem).filter((VocabItem.example_en == None) | (VocabItem.example_en == '')).count()
    
    print("-" * 40)
    print(" LIVE DATABASE QUALITY REPORT")
    print("-" * 40)
    print(f"Total Words in DB              : {total_words}")
    print(f"Words with official .wav Audio : {words_with_wav} ({0 if total_words==0 else (words_with_wav/total_words)*100:.1f}%)")
    print(f"Words MISSING English Meaning  : {missing_meaning}")
    print(f"Words MISSING Korean Example   : {missing_kr_example}")
    print(f"Words MISSING English Example  : {missing_en_example}")
    print("-" * 40)
