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
from app.models.srs import VocabItem

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
    vocab_items = db.query(VocabItem).filter(
        VocabItem.id.in_(sampled_ids)).all()

    # Generate or fetch examples
    words = [item.word for item in vocab_items]
    lvl_int = int(level) if level and level != "All" else 0
    examples_map = _get_or_generate_examples(words, lvl_int)

    response_items = []
    for item in vocab_items:
        ex = examples_map.get(item.word)
        if not ex:
            ex = {
                "korean": f"'{item.word}' 단어를 연습하세요.",
                "english": f"Practice the word '{item.word}'.",
                "romanization": item.word,
            }

        response_items.append(
            VocabItemResponse(
                id=item.id,
                front=item.word,
                back=item.meaning,
                romanization=item.pronunciation or ex.get("romanization"),
                example=ex,
                level=str(item.level_id),
                interval=0,  # Mock interval as SRS logic is not yet fully linked
            )
        )

    return response_items
