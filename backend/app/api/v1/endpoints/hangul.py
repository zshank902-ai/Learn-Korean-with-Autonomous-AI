import json
import os
import random

import requests
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.redis_client import get_redis
from app.db.session import get_db
from app.models.hangul import HangulVocabulary, UserHangulProgress
from app.models.user import User
from app.schemas.hangul import (LookupResponse, ProgressUpdate,
                                VocabularyCreate, VocabularyResponse)

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

HANGUL_LOOKUP_SYSTEM_PROMPT = """
You are a Korean-English dictionary API. When given a Korean word, respond ONLY with a
valid JSON object. No explanation, no markdown, no extra text. Just the JSON.

Format:
{
  "word": "<the Korean word>",
  "romanization": "<romanized pronunciation>",
  "meaning": "<English definition, concise>",
  "example": "<one short example sentence in Korean with English translation>",
  "difficulty": <1-6 matching TOPIK levels>
}

If the input is not a valid Korean word, return:
{ "word": "<input>", "romanization": "", "meaning": "Unknown word", "example": "", "difficulty": 0 }
"""


@router.get("/lookup", response_model=LookupResponse)
def lookup_word(word: str = Query(..., min_length=1, max_length=50)):
    redis = get_redis()
    cache_key = f"hangul:lookup:{word}"
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)

    if not GROQ_API_KEY:
        # Fallback if no LLM
        return LookupResponse(
            word=word, romanization="", meaning="LLM Offline", example="", difficulty=0
        )

    try:
        response = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {"role": "system", "content": HANGUL_LOOKUP_SYSTEM_PROMPT},
                    {"role": "user", "content": word},
                ],
                "temperature": 0.1,
                "response_format": {"type": "json_object"},
            },
            timeout=10,
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        data = json.loads(content)

        # Cache for 7 days
        redis.setex(cache_key, 604800, json.dumps(data))
        return LookupResponse(**data)
    except Exception as e:
        print(f"Lookup Error: {e}")
        return LookupResponse(
            word=word,
            romanization="",
            meaning="Dictionary lookup failed",
            example="",
            difficulty=0,
        )


@router.post("/vocabulary", response_model=VocabularyResponse)
def save_vocabulary(
    body: VocabularyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vocab = HangulVocabulary(
        user_id=current_user.id, word=body.word, syllables=json.dumps(
            body.syllables)
    )
    db.add(vocab)
    db.commit()

    total = (
        db.query(HangulVocabulary)
        .filter(HangulVocabulary.user_id == current_user.id)
        .count()
    )
    return VocabularyResponse(saved=True, total_words=total)


@router.get("/quiz")
def get_quiz(difficulty: int = 1, count: int = 10):
    try:
        with open("data/hangul_quiz_bank.json", "r", encoding="utf-8") as f:
            bank = json.load(f)

        # Optional: filter by difficulty if bank supports it
        questions = random.sample(bank, min(count, len(bank)))
        return questions
    except Exception as e:
        print(f"Quiz Error: {e}")
        # Fallback to prevent crash
        return [
            {
                "type": "A",
                "prompt": "What Jamo is this?",
                "target": "ㄱ",
                "options": ["g/k", "n", "d/t", "r/l"],
                "answer": "g/k",
            }
        ] * count


@router.post("/progress")
def update_progress(
    body: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prog = (
        db.query(UserHangulProgress)
        .filter(UserHangulProgress.user_id == current_user.id)
        .first()
    )
    if not prog:
        prog = UserHangulProgress(
            user_id=current_user.id,
            total_xp=body.xp_earned,
            average_accuracy=body.accuracy,
            quizzes_taken=1,
        )
        db.add(prog)
    else:
        prog.total_xp += body.xp_earned
        total_acc = (prog.average_accuracy *
                     prog.quizzes_taken) + body.accuracy
        prog.quizzes_taken += 1
        prog.average_accuracy = total_acc / prog.quizzes_taken

    db.commit()
    return {"status": "ok", "total_xp": prog.total_xp}
