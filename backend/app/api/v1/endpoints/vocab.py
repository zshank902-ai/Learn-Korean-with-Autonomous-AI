import json
import os
import random
from datetime import date
from typing import List, Optional

import requests
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.ai_config import get_groq_api_key
from app.core.redis_client import get_redis
from app.db.session import get_db
from app.models.srs import VocabItem, UserVocabProgress
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
from datetime import datetime, timezone

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:latest")

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
        cache_key = f"vocab:examples:v4:level{level}"
        cached = redis.get(cache_key)
        if cached:
            examples_map = json.loads(cached)
    except Exception as e:
        print(f"Redis unavailable for reading examples: {e}")

    missing_words = [w for w in words if w not in examples_map]
    if missing_words:
        system_prompt = (
            "You are a strict TOPIK Korean teacher. Provide a simple example sentence for each Korean word provided. "
            "CRITICAL REQUIREMENT: You MUST include the exact Korean word (or its grammatically conjugated root) in the Korean sentence. "
            "You MUST also provide the Revised Romanization for the target word. "
            "Return ONLY a JSON object mapping each word exactly to its example and romanization, with NO markdown formatting, NO backticks. "
            'Format Example: {"가다": {"korean": "학교에 가요.", "english": "I go to school.", "romanization": "gada"}}'
        )

        batch_size = 10
        for i in range(0, len(missing_words), batch_size):
            batch = missing_words[i: i + batch_size]
            import time

            max_retries = 3
            success = False

            groq_key = get_groq_api_key()
            if groq_key:
                for attempt in range(max_retries):
                    try:
                        res = requests.post(
                            GROQ_URL,
                            headers={
                                "Authorization": f"Bearer {groq_key}",
                                "Content-Type": "application/json",
                            },
                            json={
                                "model": "llama-3.1-8b-instant",
                                "messages": [
                                    {"role": "system", "content": system_prompt},
                                    {
                                        "role": "user",
                                        "content": json.dumps(
                                            batch, ensure_ascii=False
                                        ),
                                    },
                                ],
                                "response_format": {"type": "json_object"},
                                "temperature": 0.3,
                                "max_tokens": 1000,
                            },
                            timeout=15,
                        )

                        if res.status_code == 429:
                            print(
                                f"Rate limited on attempt {attempt+1}, sleeping...")
                            time.sleep(2**attempt)
                            # Pick a new key on retry
                            groq_key = get_groq_api_key()
                            continue

                        res.raise_for_status()
                        content_str = res.json()["choices"][0]["message"][
                            "content"
                        ].strip()

                        if content_str.startswith("```json"):
                            content_str = content_str[7:]
                        if content_str.startswith("```"):
                            content_str = content_str[3:]
                        if content_str.endswith("```"):
                            content_str = content_str[:-3]

                        new_examples = json.loads(content_str.strip())
                        success = True
                        break
                    except Exception as e:
                        if attempt == max_retries - 1:
                            print(
                                f"Groq example generation failed after 3 attempts: {e}"
                            )
                        time.sleep(2**attempt)
                        groq_key = get_groq_api_key()

            # Fallback to Ollama if Groq failed or key is missing
            if not success:
                print("Falling back to Ollama for flashcards...")
                try:
                    res = requests.post(
                        f"{OLLAMA_URL}/api/generate",
                        json={
                            "model": OLLAMA_MODEL,
                            "prompt": f"{system_prompt}\\n\\nInput: {json.dumps(batch, ensure_ascii=False)}",
                            "stream": False,
                            "format": "json",
                        },
                        timeout=30,
                    )
                    res.raise_for_status()
                    new_examples = json.loads(res.json().get("response", "{}"))
                    success = True
                except Exception as e:
                    print(f"Ollama fallback failed: {e}")
                    new_examples = {}

            # Apply structure check and absolute worst-case fallback
            for word in batch:
                ex = new_examples.get(word)
                if not (
                    ex and isinstance(
                        ex, dict) and "korean" in ex and "english" in ex
                ):
                    new_examples[word] = {
                        "korean": f"'{word}' 단어를 사용해 보세요.",
                        "english": f"Try practicing the word '{word}'.",
                        "romanization": word,
                    }
                elif "romanization" not in new_examples[word]:
                    new_examples[word]["romanization"] = word

            examples_map.update(new_examples)
            try:
                if redis:
                    redis.set(cache_key, json.dumps(
                        examples_map, ensure_ascii=False))
            except Exception as e:
                print(f"Redis unavailable for saving examples: {e}")

    return examples_map



@router.get("/flashcards", response_model=List[VocabItemResponse])
def get_daily_flashcards(
    level: Optional[str] = Query("All"),
    limit: int = Query(20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import json
    
    redis = None
    try:
        redis = get_redis()
    except:
        pass

    today_str = date.today().isoformat()
    cache_key = f"flashcards:u{current_user.id}:{today_str}:lvl{level}"
    
    if redis:
        cached_pool = redis.get(cache_key)
        if cached_pool:
            try:
                cached_data = json.loads(cached_pool)
                # If cached data exists, return it
                return [VocabItemResponse(**item) for item in cached_data]
            except:
                pass

    # 1. Fetch due cards
    now = datetime.now(timezone.utc)
    due_progress = db.query(UserVocabProgress).join(VocabItem).filter(
        UserVocabProgress.user_id == current_user.id,
        UserVocabProgress.next_review <= now
    )
    
    if level and level != "All":
        try:
            level_id = int(level)
            due_progress = due_progress.filter(VocabItem.level_id == level_id)
        except ValueError:
            pass
            
    due_items = due_progress.limit(limit).all()
    due_vocab_ids = [p.vocab_id for p in due_items]
    
    # 2. If short of limit, fetch new cards
    new_cards_needed = limit - len(due_vocab_ids)
    new_vocab_items = []
    
    if new_cards_needed > 0:
        # Get all vocab IDs for this user that already have progress
        all_user_progress = db.query(UserVocabProgress.vocab_id).filter(UserVocabProgress.user_id == current_user.id).all()
        learned_ids = {p[0] for p in all_user_progress}
        
        # Query for new cards
        new_query = db.query(VocabItem)
        if level and level != "All":
            try:
                new_query = new_query.filter(VocabItem.level_id == int(level))
            except:
                pass
                
        # Get all available new IDs
        available_new_ids = [v.id for v in new_query.with_entities(VocabItem.id).all() if v.id not in learned_ids]
        
        # Pick randomly
        import random
        random.seed(f"{today_str}-{current_user.id}-{level}") # deterministic fallback
        sampled_new_ids = random.sample(available_new_ids, min(new_cards_needed, len(available_new_ids)))
        
        new_vocab_items = db.query(VocabItem).filter(VocabItem.id.in_(sampled_new_ids)).all()

    # Combine VocabItems
    due_vocab_items = [p.vocab_item for p in due_items]
    final_vocab_items = due_vocab_items + new_vocab_items
    
    # Generate or fetch examples
    words = [item.word for item in final_vocab_items]
    lvl_int = int(level) if level and level != "All" else 0
    examples_map = _get_or_generate_examples(words, lvl_int)

    response_items = []
    for item in final_vocab_items:
        ex = examples_map.get(item.word)
        if not ex:
            ex = {
                "korean": f"'{item.word}' 단어를 연습하세요.",
                "english": f"Practice the word '{item.word}'.",
                "romanization": item.word,
            }
            
        # Find interval
        interval = 0
        for p in due_items:
            if p.vocab_id == item.id:
                interval = p.interval
                break

        response_items.append(
            VocabItemResponse(
                id=item.id,
                front=item.word,
                back=item.meaning,
                romanization=item.pronunciation or ex.get("romanization"),
                example=ex,
                level=str(item.level_id),
                interval=interval,
            )
        )

    # Save to Redis
    if redis and response_items:
        # Cache for 24 hours (86400 seconds)
        try:
            redis.setex(cache_key, 86400, json.dumps([item.dict() for item in response_items], ensure_ascii=False))
        except:
            pass

    return response_items



from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta

class FlashcardReview(BaseModel):
    vocab_id: int
    quality: int  # 0-5 scale (SM-2)

@router.post("/flashcards/review")
def review_flashcard(
    review: FlashcardReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    progress = db.query(UserVocabProgress).filter(
        UserVocabProgress.user_id == current_user.id,
        UserVocabProgress.vocab_id == review.vocab_id
    ).first()

    if not progress:
        progress = UserVocabProgress(
            user_id=current_user.id,
            vocab_id=review.vocab_id,
            ease_factor=2.5,
            interval=0,
            repetitions=0,
            last_reviewed=datetime.now(timezone.utc),
            next_review=datetime.now(timezone.utc)
        )
        db.add(progress)

    # SM-2 Algorithm implementation
    if review.quality >= 3:
        if progress.repetitions == 0:
            progress.interval = 1
        elif progress.repetitions == 1:
            progress.interval = 6
        else:
            progress.interval = round(progress.interval * progress.ease_factor)
        progress.repetitions += 1
    else:
        progress.repetitions = 0
        progress.interval = 1

    progress.ease_factor = progress.ease_factor + (0.1 - (5 - review.quality) * (0.08 + (5 - review.quality) * 0.02))
    if progress.ease_factor < 1.3:
        progress.ease_factor = 1.3

    progress.last_reviewed = datetime.now(timezone.utc)
    progress.next_review = datetime.now(timezone.utc) + timedelta(days=progress.interval)

    db.commit()
    
    return {"status": "success", "interval": progress.interval, "next_review": progress.next_review}

