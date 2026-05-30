"""
exam.py
TOPIK Exam endpoints — TOPIK-I (30L + 40R MCQ) and TOPIK-II (4W + 50L + 50R).
All questions are instantly loaded from a pre-generated realistic JSON bank.
"""
from __future__ import annotations

import json
import os
import random
from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# ─── Pydantic Models ─────────────────────────────────────────────────────────

class TopikISubmitRequest(BaseModel):
    answers: dict[str, int]
    seed: str = ""
    user_id: int = 1

class TopikIISubmitRequest(BaseModel):
    mcq_answers: dict[str, int]
    writing_answers: dict[str, str]  # "51","52","53","54" → text
    target_level: int = 3
    seed: str = ""
    user_id: int = 1


# ─── Load Static Bank ─────────────────────────────────────────────────────────

def _load_bank(level: int) -> dict[str, list[dict]]:
    path = f"app/data/topik_{level}_bank.json"
    if not os.path.exists(path):
        return {"listening": [], "reading": []}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

WRITING_QUESTIONS_STATIC = [
    {
        "questionNumber": 51,
        "type": "sentence_completion",
        "passageText": "사람들은 건강을 위해 운동을 합니다. 특히 걷기는 ( ㉠ ) 좋은 운동입니다.",
        "blankLabel": "㉠",
        "charMin": 0,
        "charMax": 50,
    },
    {
        "questionNumber": 52,
        "type": "sentence_completion",
        "passageText": "환경 문제를 해결하기 위해서는 개인의 노력이 ( ㉠ ) 사회 전체의 변화도 필요합니다.",
        "blankLabel": "㉠",
        "charMin": 0,
        "charMax": 50,
    },
    {
        "questionNumber": 53,
        "type": "short_essay",
        "topic": "좋아하는 계절",
        "hints": ["좋아하는 계절은 무엇입니까?", "그 계절을 좋아하는 이유는 무엇입니까?", "그 계절에 무엇을 합니까?"],
        "charMin": 200,
        "charMax": 300,
    },
    {
        "questionNumber": 54,
        "type": "long_essay",
        "topic": "현대 사회에서 인터넷이 인간관계에 미치는 영향에 대해 논하시오.",
        "charMin": 600,
        "charMax": 700,
    },
]


# ─── Score Helpers ────────────────────────────────────────────────────────────

def _score_mcq(questions: list[dict], answers: dict[str, int]) -> int:
    if not questions:
        return 0
    correct = sum(1 for q in questions if answers.get(q["id"]) == q["correctAnswer"])
    return round((correct / len(questions)) * 100)


def _award_topik_i_level(total: int) -> int:
    if total >= 140:
        return 2
    if total >= 80:
        return 1
    return 0


def _award_topik_ii_level(total: int) -> int:
    if total >= 230:
        return 6
    if total >= 190:
        return 5
    if total >= 150:
        return 4
    if total >= 120:
        return 3
    return 0


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/topik-i/questions")
def get_topik_i_questions(seed: str = "", level: int = 1) -> dict[str, Any]:
    """Returns 30 listening + 40 reading questions for TOPIK-I."""
    bank = _load_bank(1)
    listening = bank.get("listening", [])
    reading = bank.get("reading", [])

    # Shuffle with seed (or random) for variety
    rng = random.Random(seed if seed else None)
    
    # We sample 30 L and 40 R, but fallback to len if bank is smaller
    listening_sampled = rng.sample(listening, min(30, len(listening)))
    reading_sampled = rng.sample(reading, min(40, len(reading)))

    # Re-number them 1 to 30, and 1 to 40
    for i, q in enumerate(listening_sampled):
        q["questionNumber"] = i + 1
    for i, q in enumerate(reading_sampled):
        q["questionNumber"] = i + 1

    return {
        "listeningQuestions": listening_sampled,
        "readingQuestions": reading_sampled,
    }


@router.get("/topik-ii/questions")
def get_topik_ii_questions(targetLevel: int = 3, seed: str = "") -> dict[str, Any]:
    """Returns writing prompts + 50 listening + 50 reading questions for TOPIK-II."""
    bank = _load_bank(2)
    listening = bank.get("listening", [])
    reading = bank.get("reading", [])

    rng = random.Random(seed if seed else None)
    listening_sampled = rng.sample(listening, min(50, len(listening)))
    reading_sampled = rng.sample(reading, min(50, len(reading)))

    for i, q in enumerate(listening_sampled):
        q["questionNumber"] = i + 1
    for i, q in enumerate(reading_sampled):
        q["questionNumber"] = i + 1

    return {
        "writingQuestions": WRITING_QUESTIONS_STATIC,
        "listeningQuestions": listening_sampled,
        "readingQuestions": reading_sampled,
    }


@router.post("/topik-i/submit")
def submit_topik_i(body: TopikISubmitRequest) -> dict[str, Any]:
    """Scores a submitted TOPIK-I exam. Returns section scores and level awarded."""
    # Reconstruct the exact same exam they took using the seed
    bank = _load_bank(1)
    rng = random.Random(body.seed if body.seed else None)
    
    listening_qs = rng.sample(bank.get("listening", []), min(30, len(bank.get("listening", []))))
    reading_qs = rng.sample(bank.get("reading", []), min(40, len(bank.get("reading", []))))

    listening_score = _score_mcq(listening_qs, body.answers)
    reading_score = _score_mcq(reading_qs, body.answers)
    total = min(listening_score + reading_score, 200)
    level_awarded = _award_topik_i_level(total)
    xp_gained = level_awarded * 150 if level_awarded > 0 else 50

    return {
        "listeningScore": listening_score,
        "readingScore": reading_score,
        "totalScore": total,
        "levelAwarded": level_awarded,
        "xpGained": xp_gained,
    }


@router.post("/topik-ii/submit")
def submit_topik_ii(body: TopikIISubmitRequest) -> dict[str, Any]:
    """Scores TOPIK-II MCQ and sends Q53+Q54 essays to AI grader."""
    from app.api.v1.endpoints.roadmap import _grade_essay_with_ai

    bank = _load_bank(2)
    rng = random.Random(body.seed if body.seed else None)
    
    listening_qs = rng.sample(bank.get("listening", []), min(50, len(bank.get("listening", []))))
    reading_qs = rng.sample(bank.get("reading", []), min(50, len(bank.get("reading", []))))

    listening_score = _score_mcq(listening_qs, body.mcq_answers)
    reading_score = _score_mcq(reading_qs, body.mcq_answers)

    # Grade Q53 + Q54 essays using AI
    essay_text = (body.writing_answers.get("53", "") + "\n\n" + body.writing_answers.get("54", "")).strip()
    essay_rubric: dict = {}
    writing_score = 0
    if essay_text:
        essay_rubric = _grade_essay_with_ai(essay_text, body.target_level, "TOPIK II 쓰기")
        writing_score = min(essay_rubric.get("totalScore", 0), 100)
    else:
        writing_score = 50  # partial credit for Q51+Q52

    total = min(listening_score + reading_score + writing_score, 300)
    level_awarded = _award_topik_ii_level(total)
    xp_gained = level_awarded * 200 if level_awarded > 0 else 100

    return {
        "listeningScore": listening_score,
        "readingScore": reading_score,
        "writingScore": writing_score,
        "totalScore": total,
        "levelAwarded": level_awarded,
        "xpGained": xp_gained,
        "essayRubric": essay_rubric or None,
    }
