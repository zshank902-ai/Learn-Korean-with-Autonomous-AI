"""
roadmap_service.py
Principal Architect: TOPIK Roadmap Module Registry & Progression Engine.
All 42 module definitions (6 levels × 7 modules) stored as frozen Python constants.
Progression logic reads/writes from Redis.
"""

from __future__ import annotations

from typing import Any, Union
import uuid

from app.core.redis_client import get_redis

# ─────────────────────────────────────────────
# MODULE REGISTRY — 42 modules, all 6 levels
# ─────────────────────────────────────────────

ROADMAP_STRUCTURE: list[dict[str, Any]] = [
    {
        "id": 1,
        "level_num": 1,
        "title": "TOPIK I — Level 1",
        "subtitle": "Survival Beginner",
        "color": "#10B981",
        "target_vocab": 800,
        "exam_type": "TOPIK-I",
        "pass_score": 80,
        "max_score": 200,
        "sections": [
            {"name": "Listening", "questions": 30, "time_min": 40},
            {"name": "Reading", "questions": 40, "time_min": 60},
        ],
        "xp_reward": 500,
        "modules": [
            {
                "id": "hangul-basics",
                "title": "한글 Basics",
                "icon": "📝",
                "type": "playground",
                "xp": 100,
                "description": "Master the 40 basic characters, pronunciation rules, and stroke order in the Playground.",
                "prerequisite": None,
            },
            {
                "id": "l1_vocabulary",
                "title": "Vocabulary 800",
                "icon": "📖",
                "type": "flashcard",
                "xp": 120,
                "description": "800 thematic words with romanization. Numbers, colors, family, food, etc.",
                "prerequisite": None,
            },
            {
                "id": "l1_grammar",
                "title": "Basic Grammar",
                "icon": "✏️",
                "type": "grammar_drill",
                "xp": 130,
                "description": "Basic particles + endings (이/가, 을/를, 은/는, -아요/어요).",
                "prerequisite": None,
            },
            {
                "id": "l1_listening",
                "title": "Listening",
                "icon": "🎧",
                "type": "audio_task",
                "xp": 150,
                "description": "Simple single-voice dialogues, greetings, commands, and numbers.",
                "prerequisite": None,
            },
            {
                "id": "l1_reading",
                "title": "Reading",
                "icon": "📰",
                "type": "mcq",
                "xp": 150,
                "description": "Signs, labels, and menus with visual context.",
                "prerequisite": None,
            },
            {
                "id": "l1_writing",
                "title": "Writing",
                "icon": "✍️",
                "type": "essay",
                "xp": 150,
                "description": "Trace, copy, and label tasks.",
                "prerequisite": None,
            },
            {
                "id": "l1_mock",
                "title": "Mock Exam",
                "icon": "🏆",
                "type": "mock_exam",
                "xp": 300,
                "description": "Full TOPIK-I simulation.",
                "prerequisite": None,
            },
        ],
    },
    {
        "id": 2,
        "level_num": 2,
        "title": "TOPIK I — Level 2",
        "subtitle": "Elementary",
        "color": "#3B82F6",
        "target_vocab": 1500,
        "exam_type": "TOPIK-I",
        "pass_score": 140,
        "max_score": 200,
        "sections": [
            {"name": "Listening", "questions": 30, "time_min": 40},
            {"name": "Reading", "questions": 40, "time_min": 60},
        ],
        "xp_reward": 700,
        "modules": [
            {
                "id": "l2_vocabulary",
                "title": "Vocabulary 1500",
                "icon": "📖",
                "type": "flashcard",
                "xp": 150,
                "description": "1,500 words, picture-book style.",
                "prerequisite": None,
            },
            {
                "id": "l2_grammar",
                "title": "Grammar",
                "icon": "✏️",
                "type": "grammar_drill",
                "xp": 160,
                "description": "Connectives intro (하지만, 그래서) and simple sentence chaining.",
                "prerequisite": None,
            },
            {
                "id": "l2_listening",
                "title": "Listening",
                "icon": "🎧",
                "type": "audio_task",
                "xp": 160,
                "description": "2-person dialogues.",
                "prerequisite": None,
            },
            {
                "id": "l2_reading",
                "title": "Reading",
                "icon": "📰",
                "type": "mcq",
                "xp": 160,
                "description": "Short texts, diary entries, texts.",
                "prerequisite": None,
            },
            {
                "id": "l2_writing",
                "title": "Writing",
                "icon": "✍️",
                "type": "essay",
                "xp": 160,
                "description": "Fill-in-the-blank and word cards.",
                "prerequisite": None,
            },
            {
                "id": "l2_mock",
                "title": "Mock Exam",
                "icon": "🏆",
                "type": "mock_exam",
                "xp": 400,
                "description": "TOPIK-I mock targeting 140pts.",
                "prerequisite": None,
            },
        ],
    },
    {
        "id": 3,
        "level_num": 3,
        "title": "TOPIK II — Level 3",
        "subtitle": "Intermediate",
        "color": "#F59E0B",
        "target_vocab": 3000,
        "exam_type": "TOPIK-II",
        "pass_score": 120,
        "max_score": 300,
        "sections": [
            {"name": "Writing", "questions": 4, "time_min": 70},
            {"name": "Listening", "questions": 50, "time_min": 60},
            {"name": "Reading", "questions": 50, "time_min": 70},
        ],
        "xp_reward": 900,
        "modules": [
            {
                "id": "l3_vocabulary",
                "title": "Vocabulary 3000",
                "icon": "📖",
                "type": "flashcard",
                "xp": 180,
                "description": "3,000 words, Sino-Korean roots intro.",
                "prerequisite": None,
            },
            {
                "id": "l3_grammar",
                "title": "Grammar",
                "icon": "✏️",
                "type": "grammar_drill",
                "xp": 190,
                "description": "Intermediate patterns.",
                "prerequisite": None,
            },
            {
                "id": "l3_listening",
                "title": "Listening",
                "icon": "🎧",
                "type": "audio_task",
                "xp": 180,
                "description": "Extended, multi-speaker audio.",
                "prerequisite": None,
            },
            {
                "id": "l3_reading",
                "title": "Reading",
                "icon": "📰",
                "type": "mcq",
                "xp": 180,
                "description": "Structured articles, news, brochures.",
                "prerequisite": None,
            },
            {
                "id": "l3_writing",
                "title": "Writing",
                "icon": "✍️",
                "type": "essay",
                "xp": 180,
                "description": "Paragraph writing.",
                "prerequisite": None,
            },
            {
                "id": "l3_mock",
                "title": "Mock Exam",
                "icon": "🏆",
                "type": "mock_exam",
                "xp": 500,
                "description": "TOPIK-II mock targeting 120pts.",
                "prerequisite": None,
            },
        ],
    },
    {
        "id": 4,
        "level_num": 4,
        "title": "TOPIK II — Level 4",
        "subtitle": "Upper-Intermediate",
        "color": "#8B5CF6",
        "target_vocab": 5000,
        "exam_type": "TOPIK-II",
        "pass_score": 150,
        "max_score": 300,
        "sections": [
            {"name": "Writing", "questions": 4, "time_min": 70},
            {"name": "Listening", "questions": 50, "time_min": 60},
            {"name": "Reading", "questions": 50, "time_min": 70},
        ],
        "xp_reward": 1200,
        "modules": [
            {
                "id": "l4_vocabulary",
                "title": "Vocabulary 5000",
                "icon": "📖",
                "type": "flashcard",
                "xp": 220,
                "description": "5,000 words, formal/informal pairs.",
                "prerequisite": None,
            },
            {
                "id": "l4_grammar",
                "title": "Grammar",
                "icon": "✏️",
                "type": "grammar_drill",
                "xp": 240,
                "description": "Advanced patterns + full honorifics.",
                "prerequisite": None,
            },
            {
                "id": "l4_listening",
                "title": "Listening",
                "icon": "🎧",
                "type": "audio_task",
                "xp": 220,
                "description": "Authentic dialogues.",
                "prerequisite": None,
            },
            {
                "id": "l4_reading",
                "title": "Reading",
                "icon": "📰",
                "type": "mcq",
                "xp": 220,
                "description": "Opinion pieces, reports.",
                "prerequisite": None,
            },
            {
                "id": "l4_writing",
                "title": "Writing",
                "icon": "✍️",
                "type": "essay",
                "xp": 250,
                "description": "Essay writing, TOPIK II prep.",
                "prerequisite": None,
            },
            {
                "id": "l4_mock",
                "title": "Mock Exam",
                "icon": "🏆",
                "type": "mock_exam",
                "xp": 600,
                "description": "TOPIK-II mock targeting 150pts.",
                "prerequisite": None,
            },
        ],
    },
    {
        "id": 5,
        "level_num": 5,
        "title": "TOPIK II — Level 5",
        "subtitle": "Advanced",
        "color": "#EF4444",
        "target_vocab": 8000,
        "exam_type": "TOPIK-II",
        "pass_score": 190,
        "max_score": 300,
        "sections": [
            {"name": "Writing", "questions": 4, "time_min": 70},
            {"name": "Listening", "questions": 50, "time_min": 60},
            {"name": "Reading", "questions": 50, "time_min": 70},
        ],
        "xp_reward": 1500,
        "modules": [
            {
                "id": "l5_vocabulary",
                "title": "Vocabulary 8000",
                "icon": "📖",
                "type": "flashcard",
                "xp": 300,
                "description": "8,000 words, academic register.",
                "prerequisite": None,
            },
            {
                "id": "l5_grammar",
                "title": "Grammar",
                "icon": "✏️",
                "type": "grammar_drill",
                "xp": 320,
                "description": "Complex patterns + nominalisations.",
                "prerequisite": None,
            },
            {
                "id": "l5_listening",
                "title": "Listening",
                "icon": "🎧",
                "type": "audio_task",
                "xp": 300,
                "description": "Academic lectures.",
                "prerequisite": None,
            },
            {
                "id": "l5_reading",
                "title": "Reading",
                "icon": "📰",
                "type": "mcq",
                "xp": 300,
                "description": "Academic papers, literary texts.",
                "prerequisite": None,
            },
            {
                "id": "l5_writing",
                "title": "Writing",
                "icon": "✍️",
                "type": "essay",
                "xp": 350,
                "description": "TOPIK 53 & 54 tasks.",
                "prerequisite": None,
            },
            {
                "id": "l5_mock",
                "title": "Mock Exam",
                "icon": "🏆",
                "type": "mock_exam",
                "xp": 800,
                "description": "TOPIK-II mock targeting 190pts.",
                "prerequisite": None,
            },
        ],
    },
    {
        "id": 6,
        "level_num": 6,
        "title": "TOPIK II — Level 6",
        "subtitle": "Mastery",
        "color": "#111827",
        "target_vocab": 10000,
        "exam_type": "TOPIK-II",
        "pass_score": 230,
        "max_score": 300,
        "sections": [
            {"name": "Writing", "questions": 4, "time_min": 70},
            {"name": "Listening", "questions": 50, "time_min": 60},
            {"name": "Reading", "questions": 50, "time_min": 70},
        ],
        "xp_reward": 2000,
        "modules": [
            {
                "id": "l6_vocabulary",
                "title": "Vocabulary 10000+",
                "icon": "📖",
                "type": "flashcard",
                "xp": 400,
                "description": "10,000+ words, classical Korean.",
                "prerequisite": None,
            },
            {
                "id": "l6_grammar",
                "title": "Grammar",
                "icon": "✏️",
                "type": "grammar_drill",
                "xp": 420,
                "description": "Literary + rhetorical patterns.",
                "prerequisite": None,
            },
            {
                "id": "l6_listening",
                "title": "Listening",
                "icon": "🎧",
                "type": "audio_task",
                "xp": 400,
                "description": "Debates, legal, specialist.",
                "prerequisite": None,
            },
            {
                "id": "l6_reading",
                "title": "Reading",
                "icon": "📰",
                "type": "mcq",
                "xp": 400,
                "description": "Classical, literary, critical reading.",
                "prerequisite": None,
            },
            {
                "id": "l6_writing",
                "title": "Writing",
                "icon": "✍️",
                "type": "essay",
                "xp": 500,
                "description": "Mastery essays, full TOPIK II.",
                "prerequisite": None,
            },
            {
                "id": "l6_mock",
                "title": "Mock Exam",
                "icon": "🏆",
                "type": "mock_exam",
                "xp": 1000,
                "description": "TOPIK-II mock targeting 230pts.",
                "prerequisite": None,
            },
        ],
    },
]


# Flat lookup for O(1) module resolution
_MODULE_LOOKUP: dict[str, dict[str, Any]] = {
    mod["id"]: {**mod, "level_id": level["id"], "level_color": level["color"]}
    for level in ROADMAP_STRUCTURE
    for mod in level["modules"]
}


def get_level_structure() -> list[dict[str, Any]]:
    """Returns the full roadmap structure (static)."""
    return ROADMAP_STRUCTURE


def get_module(module_id: str) -> dict[str, Any] | None:
    """Returns a single module definition by ID."""
    return _MODULE_LOOKUP.get(module_id)


def get_user_progress(user_id: Union[str, uuid.UUID]) -> dict[str, str]:
    """
    Reads all module statuses for a user from Redis.
    Returns dict mapping module_id -> status string.
    Since prerequisites have been decoupled, all unstarted modules default to 'available'.
    """
    redis = get_redis()
    key = f"roadmap:progress:{user_id}"
    raw = redis.hgetall(key)

    progress = {}
    if raw:
        progress = {
            (k.decode() if isinstance(k, bytes) else k): (
                v.decode() if isinstance(v, bytes) else v
            )
            for k, v in raw.items()
        }
    else:
        # Cache miss. Try to restore from PostgreSQL
        try:
            import json

            from app.db.session import SessionLocal
            from app.models.user import UserProgress

            db = SessionLocal()
            db_progress = (
                db.query(UserProgress).filter(
                    UserProgress.user_id == user_id).first()
            )
            if db_progress and db_progress.roadmap_status_json:
                progress = json.loads(db_progress.roadmap_status_json)
                # Repopulate Redis cache
                if progress:
                    redis.hset(key, mapping=progress)
            db.close()
        except Exception as e:
            print(f"Error restoring roadmap progress from DB: {e}")

    # Ensure EVERY module in the roadmap defaults to "available" if not present
    for level in ROADMAP_STRUCTURE:
        for mod in level["modules"]:
            mod_id = mod["id"]
            if mod_id not in progress or progress[mod_id] == "locked":
                progress[mod_id] = "available"
                # Optionally write it back to Redis to keep it in sync, but it's not strictly necessary.

    return progress


def start_module(user_id: Union[str, uuid.UUID], module_id: str) -> dict[str, Any]:
    """Marks a module as in_progress in Redis."""
    redis = get_redis()
    key = f"roadmap:progress:{user_id}"
    redis.hset(key, module_id, "in_progress")
    module = get_module(module_id)
    return {"sessionId": f"{user_id}_{module_id}", "module": module}


def complete_module(user_id: Union[str, uuid.UUID], module_id: str, score: int) -> dict[str, Any]:
    """
    Marks module as completed, saves score, awards XP, and unlocks next module.
    Returns xpGained, newlyUnlocked, levelProgress.
    """
    redis = get_redis()
    progress_key = f"roadmap:progress:{user_id}"
    score_key = f"roadmap:scores:{user_id}:{module_id}"

    # Mark this module completed
    redis.hset(progress_key, module_id, "completed")

    # Save score history
    import json
    from datetime import datetime, timezone

    score_entry = json.dumps(
        {"score": score, "timestamp": datetime.now(timezone.utc).isoformat()}
    )
    redis.lpush(score_key, score_entry)
    redis.ltrim(score_key, 0, 9)  # Keep last 10 scores

    # Find next module to unlock
    module_def = get_module(module_id)
    xp_gained = module_def.get("xp", 50) if module_def else 50
    newly_unlocked: list[str] = []

    for level in ROADMAP_STRUCTURE:
        for mod in level["modules"]:
            if mod.get("prerequisite") == module_id:
                current_status = redis.hget(progress_key, mod["id"])
                current_status = (
                    current_status.decode()
                    if isinstance(current_status, bytes)
                    else current_status
                )
                if not current_status or current_status == "locked":
                    redis.hset(progress_key, mod["id"], "available")
                    newly_unlocked.append(mod["id"])

    # Calculate level progress for this level
    level_id = module_def.get("level_id", 1) if module_def else 1
    level_modules = [
        m["id"]
        for lvl in ROADMAP_STRUCTURE
        if lvl["id"] == level_id
        for m in lvl["modules"]
    ]
    completed_count = sum(
        1
        for mid in level_modules
        if (redis.hget(progress_key, mid) or b"").decode() == "completed"
    )
    level_progress = (
        int((completed_count / len(level_modules)) * 100) if level_modules else 0
    )

    return {
        "xpGained": xp_gained,
        "newlyUnlocked": newly_unlocked,
        "levelProgress": level_progress,
    }
