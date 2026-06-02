from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.srs import VocabItem
from app.core.config import settings
from groq import Groq
from pydantic import BaseModel
import itertools
import os

router = APIRouter()

# Initialize Groq client pool
client_pool = []
groq_keys = settings.get_groq_keys()
if groq_keys:
    for key in groq_keys:
        client_pool.append(Groq(api_key=key))

# Create an infinite iterator for round-robin load balancing
round_robin_clients = itertools.cycle(client_pool) if client_pool else None

class TranslationResponse(BaseModel):
    translation: str

@router.post("/translate/{word_id}", response_model=TranslationResponse)
async def translate_example(word_id: int, db: Session = Depends(get_db)):
    if not round_robin_clients or not client_pool:
        raise HTTPException(status_code=500, detail="Groq API Keys not configured.")
        
    word = db.query(VocabItem).filter(VocabItem.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")
        
    if not word.example_kr:
        raise HTTPException(status_code=400, detail="No Korean example available to translate")
        
    # Lazy Loading: If already translated, return it immediately
    if word.example_en:
        return TranslationResponse(translation=word.example_en)
        
    # Generate Translation on-the-fly
    prompt = f"""Translate this Korean sentence to natural English. 
    Provide ONLY the English translation, no other text or explanation.
    Sentence: {word.example_kr}"""
    
    # Load Balancer Failover Logic
    max_retries = len(client_pool)
    for attempt in range(max_retries):
        current_client = next(round_robin_clients)
        try:
            completion = current_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[
                    {"role": "system", "content": "You are a professional Korean to English translator."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=100,
            )
            
            translation = completion.choices[0].message.content.strip()
            
            # Save to database to cache it for the next user
            word.example_en = translation
            db.commit()
            db.refresh(word)
            
            return TranslationResponse(translation=translation)
        
        except Exception as e:
            # If this is the last attempt, raise the error
            if attempt == max_retries - 1:
                raise HTTPException(status_code=500, detail=f"All Groq API keys failed or rate-limited. Last error: {str(e)}")
            # Otherwise, it automatically loops to the next client in the round-robin cycle
            print(f"API Key failover triggered due to error: {str(e)}")
            continue
