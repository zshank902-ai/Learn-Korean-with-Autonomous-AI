"""
roadmap.py
All 7 TOPIK Roadmap API endpoints.
"""
from __future__ import annotations

import json
import uuid
import requests
import os
import urllib.parse
from typing import Any
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

from app.services import roadmap_service
from app.core.redis_client import get_redis

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:latest")

DEFAULT_USER_ID = 1  # Demo mode until OAuth is live

# ─── Pydantic Schemas ────────────────────────────────────────────────────────

class CompleteModuleRequest(BaseModel):
    score: int = 0
    user_id: int = DEFAULT_USER_ID

class EssayGradeRequest(BaseModel):
    essay: str
    level: int
    prompt_hint: str = ""
    user_id: int = DEFAULT_USER_ID

class MockSubmitRequest(BaseModel):
    answers: dict[str, Any]
    user_id: int = DEFAULT_USER_ID

# ─── Helper: Essay Grader via Groq → Ollama fallback ─────────────────────────

def _grade_essay_with_ai(essay: str, level: int, prompt_hint: str) -> dict[str, Any]:
    strictness = "very strict" if level >= 5 else "moderately strict"
    system_prompt = (
        "You are a certified TOPIK examiner. Grade the following Korean essay "
        f"{strictness}. Return ONLY valid JSON, no markdown: "
        '{"totalScore": number, "rubricScores": {"content": number, '
        '"structure": number, "vocabulary": number, "grammar": number}, '
        '"feedback": string, "modelAnswer": string}. '
        "Each rubric is out of 25 points."
    )
    user_message = f"Level: TOPIK {level}\nPrompt: {prompt_hint}\n\nEssay:\n{essay}"

    # Try Groq first
    if GROQ_API_KEY:
        try:
            response = requests.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.3,
                    "max_tokens": 512,
                },
                timeout=15,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return json.loads(content)
        except Exception:
            pass  # Fall through to Ollama

    # Ollama fallback
    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": f"{system_prompt}\n\n{user_message}",
                "stream": False,
                "format": "json",
            },
            timeout=30,
        )
        response.raise_for_status()
        return json.loads(response.json().get("response", "{}"))
    except Exception:
        pass

    # Hard fallback — never show raw error to user
    return {
        "totalScore": 0,
        "rubricScores": {"content": 0, "structure": 0, "vocabulary": 0, "grammar": 0},
        "feedback": "AI grader is temporarily unavailable. Please try again in a moment.",
        "modelAnswer": "",
    }


def _generate_questions_with_ai(module_id: str, module_type: str, level: int, count: int = 10) -> list[dict]:
    """Generates TOPIK-style questions via Groq, cached in Redis for 30 days."""
    redis = get_redis()
    cache_key = f"roadmap:questions:{module_id}:page1"
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)

    system_prompt = (
        "You are a certified TOPIK exam question writer. "
        f"Generate {count} authentic TOPIK Level {level} {module_type} questions in Korean. "
        "Return ONLY valid JSON array: "
        '[{"question": string, "options": [string, string, string, string], "correct": 0, "explanation": string}]. '
        "Questions must be realistic, culturally accurate, and match official TOPIK difficulty."
    )

    questions: list[dict] = []
    if GROQ_API_KEY:
        try:
            response = requests.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": GROQ_MODEL,
                    "messages": [{"role": "user", "content": system_prompt}],
                    "temperature": 0.5,
                    "max_tokens": 1500,
                },
                timeout=20,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            # Extract JSON array from response
            start = content.find("[")
            end = content.rfind("]") + 1
            if start != -1 and end > start:
                questions = json.loads(content[start:end])
        except Exception:
            pass

    # Fallback sample questions if AI fails
    if not questions:
        questions = [
            {
                "question": f"[Level {level}] Sample question {i+1}. Answer coming soon.",
                "options": ["보기 1", "보기 2", "보기 3", "보기 4"],
                "correct": 0,
                "explanation": "This question will be generated once the AI service is available.",
            }
            for i in range(count)
        ]

    # Cache for 30 days (2,592,000 seconds)
    redis.setex(cache_key, 2592000, json.dumps(questions, ensure_ascii=False))
    return questions


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("")
def get_roadmap() -> dict[str, Any]:
    """Returns the full static TOPIK module structure."""
    return {"levels": roadmap_service.get_level_structure()}


@router.get("/progress/{user_id}")
def get_progress(user_id: int) -> dict[str, Any]:
    """Returns per-module progress statuses and total XP for a user."""
    module_statuses = roadmap_service.get_user_progress(user_id)
    completed_modules = [mid for mid, status in module_statuses.items() if status == "completed"]

    # Calculate total XP from completed modules
    total_xp = sum(
        roadmap_service.get_module(mid).get("xp", 0)
        for mid in completed_modules
        if roadmap_service.get_module(mid)
    )

    return {
        "moduleStatuses": module_statuses,
        "completedModules": completed_modules,
        "totalXP": total_xp,
    }


@router.post("/module/{module_id}/start")
def start_module(module_id: str, user_id: int = DEFAULT_USER_ID) -> dict[str, Any]:
    """Marks a module as in_progress and returns session info."""
    module = roadmap_service.get_module(module_id)
    if not module:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found")

    # Verify module is available for this user
    statuses = roadmap_service.get_user_progress(user_id)
    status = statuses.get(module_id, "locked")
    if status == "locked":
        raise HTTPException(status_code=403, detail="Module is locked. Complete prerequisites first.")

    return roadmap_service.start_module(user_id, module_id)


@router.post("/module/{module_id}/complete")
def complete_module(module_id: str, body: CompleteModuleRequest) -> dict[str, Any]:
    """Marks module completed, awards XP, unlocks next module."""
    module = roadmap_service.get_module(module_id)
    if not module:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found")

    return roadmap_service.complete_module(body.user_id, module_id, body.score)


@router.post("/essay/grade")
def grade_essay(body: EssayGradeRequest) -> dict[str, Any]:
    """Grades a Korean essay using Groq (Ollama fallback). Returns 4-rubric JSON."""
    if not body.essay.strip():
        raise HTTPException(status_code=400, detail="Essay text cannot be empty.")
    return _grade_essay_with_ai(body.essay, body.level, body.prompt_hint)


@router.get("/mock/{level_id}/generate")
def generate_mock_exam(level_id: int) -> dict[str, Any]:
    """Generates a full TOPIK mock exam structure for a given level."""
    levels = roadmap_service.get_level_structure()
    level = next((lvl for lvl in levels if lvl["id"] == level_id), None)
    if not level:
        raise HTTPException(status_code=404, detail=f"Level {level_id} not found")

    exam_id = str(uuid.uuid4())
    redis = get_redis()
    exam_type = level["exam_type"]

    config = {
        "examId": exam_id,
        "levelId": level_id,
        "examType": exam_type,
        "sections": level["sections"],
        "passScore": level["pass_score"],
        "maxScore": level["max_score"],
        "totalTimeMin": sum(s["time_min"] for s in level["sections"]),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    # Cache exam for 3 hours
    redis.setex(f"roadmap:mock:{exam_id}", 10800, json.dumps(config))

    # Generate or fetch sample questions for listening/reading sections
    questions: dict[str, Any] = {}
    for section in level["sections"]:
        section_type = section["name"].lower()
        if section_type in ("listening", "reading"):
            module_id = f"l{level_id}_{section_type}"
            questions[section_type] = _generate_questions_with_ai(
                module_id, section_type, level_id, min(section["questions"], 10)
            )

    return {"examId": exam_id, "config": config, "questions": questions}


@router.post("/mock/{exam_id}/submit")
def submit_mock_exam(exam_id: str, body: MockSubmitRequest) -> dict[str, Any]:
    """Scores a submitted mock exam and returns results with weak area analysis."""
    redis = get_redis()
    cached = redis.get(f"roadmap:mock:{exam_id}")
    if not cached:
        raise HTTPException(status_code=404, detail="Exam session expired or not found. Please generate a new exam.")

    config = json.loads(cached)
    answers = body.answers

    # Calculate section scores from submitted answers
    section_scores: dict[str, int] = {}
    total_correct = 0

    for section_name, section_answers in answers.items():
        if isinstance(section_answers, dict):
            correct = sum(1 for q_id, ans in section_answers.items() if ans.get("correct", False))
            section_scores[section_name] = correct
            total_correct += correct

    # Score: scale to max_score based on correct ratio
    total_questions = sum(s["questions"] for s in config["sections"] if s["name"].lower() != "writing")
    score_ratio = total_correct / total_questions if total_questions > 0 else 0
    total_score = int(score_ratio * config["maxScore"] * 0.8)  # 80% from MCQ portion

    # Writing score if provided
    writing_score = answers.get("writing", {}).get("totalScore", 0)
    total_score += int(writing_score * 0.2 * (config["maxScore"] / 100))

    total_score = min(total_score, config["maxScore"])
    passed = total_score >= config["passScore"]

    # Identify weak areas
    weak_areas = [
        section for section, score in section_scores.items()
        if total_questions > 0 and score / max(total_questions // len(section_scores), 1) < 0.6
    ]

    return {
        "totalScore": total_score,
        "passed": passed,
        "sectionScores": section_scores,
        "weakAreas": weak_areas,
        "passScore": config["passScore"],
        "maxScore": config["maxScore"],
        "readinessPercent": min(int((total_score / config["passScore"]) * 100), 100),
    }


@router.get("/module/{module_id}/questions")
def get_module_questions(module_id: str, page: int = 1) -> dict[str, Any]:
    """Paginated question fetcher for any module (10 per page)."""
    module = roadmap_service.get_module(module_id)
    if not module:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found")

    m_type = module.get("type", "mcq")
    level = module.get("level_id", 1)

    # Bypass AI for MCQ to provide massive 100-question practice sets instantly
    if m_type == "mcq":
        import random
        import os
        bank_type = "listening" if "listening" in module_id.lower() else "reading"
        path = f"app/data/topik_{1 if level <= 2 else 2}_bank.json"
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                bank = json.load(f)
                pool = bank.get(bank_type, [])
                if pool:
                    selected = random.sample(pool, min(100, len(pool)))
                    mapped = []
                    for q in selected:
                        mapped.append({
                            "question": q.get("questionText", ""),
                            "options": q.get("options", ["보기1", "보기2", "보기3", "보기4"]),
                            "correct": q.get("correctAnswer", 0),
                            "explanation": q.get("explanation", ""),
                        })
                    return {"moduleId": module_id, "page": page, "questions": mapped, "total": len(mapped)}

    # For other module types, fallback to AI generation
    questions = _generate_questions_with_ai(
        module_id, m_type, level, 10
    )
    return {"moduleId": module_id, "page": page, "questions": questions, "total": len(questions)}


@router.get("/tts")
def proxy_tts(text: str):
    """Proxies Google TTS to bypass browser CORB/CORS blocks."""
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q={urllib.parse.quote(text)}"
    try:
        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=5)
        res.raise_for_status()
        return Response(content=res.content, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail="TTS proxy failed")
