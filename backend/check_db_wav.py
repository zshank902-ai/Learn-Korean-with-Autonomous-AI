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
    words_with_wav = session.query(VocabItem).filter(VocabItem.audio_path.isnot(None)).count()
    
    print(f"Total Words currently in Database: {total_words}")
    print(f"Words successfully injected with .wav Audio: {words_with_wav}")
