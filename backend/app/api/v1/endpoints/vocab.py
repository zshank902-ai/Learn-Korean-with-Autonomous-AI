from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy.sql.expression import func
import random
from datetime import date

from app.db.session import get_db
from app.models.srs import VocabItem
from pydantic import BaseModel
from app.core.redis_client import get_redis
import json
import os
import requests

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

router = APIRouter()

class VocabItemResponse(BaseModel):
    id: int
    front: str
    back: str
    romanization: Optional[str]
    example: Optional[dict]
    level: str
    interval: int

    class Config:
        from_attributes = True

def _get_or_generate_examples(words: List[str], level: int) -> dict:
    examples_map = {}
    redis = None
    try:
        redis = get_redis()
        cache_key = f"vocab:examples:v3:level{level}"
        cached = redis.get(cache_key)
        if cached:
            examples_map = json.loads(cached)
    except Exception as e:
        print(f"Redis unavailable for reading examples: {e}")
    
    missing_words = [w for w in words if w not in examples_map]
    if missing_words and GROQ_API_KEY:
        system_prompt = (
            "You are a strict TOPIK Korean teacher. Provide a simple example sentence for each Korean word provided. "
            "CRITICAL REQUIREMENT: You MUST include the exact Korean word (or its grammatically conjugated root) in the Korean sentence. "
            "Do not hallucinate random sentences. "
            "Return ONLY a JSON object mapping each word exactly to its example. "
            'Format Example: {"가다": {"korean": "학교에 가요.", "english": "I go to school."}}'
        )
        try:
            res = requests.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": json.dumps(missing_words, ensure_ascii=False)}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.3,
                    "max_tokens": 4000
                },
                timeout=15
            )
            res.raise_for_status()
            content = res.json()["choices"][0]["message"]["content"]
            new_examples = json.loads(content)
            
            # Autonomous Verification Firewall (Structure Only)
            for word in missing_words:
                ex = new_examples.get(word)
                if not (ex and isinstance(ex, dict) and "korean" in ex and "english" in ex):
                    # Missing or malformed JSON structure
                    new_examples[word] = {
                        "korean": f"이 단어는 '{word}'입니다.",
                        "english": f"This word is '{word}'."
                    }
                    
            examples_map.update(new_examples)
            try:
                if redis:
                    redis.set(cache_key, json.dumps(examples_map, ensure_ascii=False))
            except Exception as e:
                print(f"Redis unavailable for saving examples: {e}")
        except Exception as e:
            print("AI example generation failed:", e)
    
    return examples_map

@router.get("/flashcards", response_model=List[VocabItemResponse])
def get_daily_flashcards(
    level: Optional[str] = Query("All"),
    limit: int = Query(20),
    db: Session = Depends(get_db)
):
    query = db.query(VocabItem)
    
    if level and level != "All":
        # Assumes level is passed as "1", "2", etc.
        try:
            level_id = int(level)
            query = query.filter(VocabItem.level_id == level_id)
        except ValueError:
            pass

    # Get all IDs matching the criteria
    all_ids = [item.id for item in query.with_entities(VocabItem.id).all()]
    
    # Mathematical seed based on today's date + the requested level
    # This guarantees the randomizer picks the exact same batch of words for 24 hours
    seed_value = f"{date.today().isoformat()}-{level}"
    random.seed(seed_value)
    
    # Safely pick 20 random IDs (or fewer if the DB is small)
    sampled_ids = random.sample(all_ids, min(limit, len(all_ids)))
    
    # Fetch the actual items
    vocab_items = db.query(VocabItem).filter(VocabItem.id.in_(sampled_ids)).all()

    # Generate or fetch examples
    words = [item.word for item in vocab_items]
    lvl_int = int(level) if level and level != "All" else 0
    examples_map = _get_or_generate_examples(words, lvl_int)

    response_items = []
    for item in vocab_items:
        ex = examples_map.get(item.word)
        if not ex:
            ex = {"korean": f"이것은 {item.word}의 예문입니다.", "english": f"This is an example for {item.word}."}
            
        response_items.append(
            VocabItemResponse(
                id=item.id,
                front=item.word,
                back=item.meaning,
                romanization=item.pronunciation,
                example=ex,
                level=str(item.level_id),
                interval=0 # Mock interval as SRS logic is not yet fully linked
            )
        )

    return response_items
