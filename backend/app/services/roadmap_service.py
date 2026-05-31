"""
roadmap_service.py
Principal Architect: TOPIK Roadmap Module Registry & Progression Engine.
All 42 module definitions (6 levels × 7 modules) stored as frozen Python constants.
Progression logic reads/writes from Redis.
"""
from __future__ import annotations
from typing import Any
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
                "id": "l1_vocab800",
                "title": "Vocabulary 800",
                "icon": "📖",
                "type": "flashcard",
                "xp": 120,
                "description": "Numbers, colors, family, food, time, days, weather — 800 words with SRS.",
                "prerequisite": None,
            },
            {
                "id": "l1_grammar",
                "title": "Basic Grammar",
                "icon": "✏️",
                "type": "grammar_drill",
                "xp": 130,
                "description": "Particles (이/가, 을/를, 은/는, 에, 에서), present/past tense, negation, -고. ~40 patterns.",
                "prerequisite": None,
            },
            {
                "id": "l1_conversations",
                "title": "Survival Conversations",
                "icon": "💬",
                "type": "audio_task",
                "xp": 110,
                "description": "6 scenarios: greeting, shopping, food, directions, transport, numbers.",
                "prerequisite": None,
            },
            {
                "id": "l1_listening",
                "title": "Listening Practice",
                "icon": "🎧",
                "type": "mcq",
                "xp": 150,
                "description": "30 MCQ, slow clear speech, everyday dialogues, image matching.",
                "prerequisite": None,
            },
            {
                "id": "l1_reading",
                "title": "Reading Practice",
                "icon": "📰",
                "type": "mcq",
                "xp": 150,
                "description": "40 MCQ, functional texts: signs, menus, schedules, ads, short diary.",
                "prerequisite": None,
            },
            {
                "id": "l1_mock",
                "title": "Mock Exam",
                "icon": "🏆",
                "type": "mock_exam",
                "xp": 300,
                "description": "Full 100-min TOPIK-I simulation. Auto-score, weak area analysis, AI study plan.",
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
        "target_vocab": 2000,
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
                "id": "l2_vocab2000",
                "title": "Vocabulary 2000",
                "icon": "📖",
                "type": "flashcard",
                "xp": 150,
                "description": "Hobbies, emotions, jobs, transport, health, sports, seasons. Hanja roots introduced.",
                "prerequisite": None,
            },
            {
                "id": "l2_connectors",
                "title": "Connectors & Grammar",
                "icon": "🔗",
                "type": "grammar_drill",
                "xp": 160,
                "description": "-아서/어서, -(으)면, -지만, -(으)려고, -는데, -때, -기 전에/후에, -거나, -(으)면서. ~40 new patterns.",
                "prerequisite": None,
            },
            {
                "id": "l2_speech_levels",
                "title": "Speech Levels",
                "icon": "🎭",
                "type": "grammar_drill",
                "xp": 140,
                "description": "존댓말 vs 반말. Formal polite (-습니다), informal polite (-아요/어요), casual (-아/어). Honorifics.",
                "prerequisite": None,
            },
            {
                "id": "l2_public",
                "title": "Public Facilities",
                "icon": "🏦",
                "type": "audio_task",
                "xp": 120,
                "description": "Bank, hospital, post office, library, subway vocabulary and dialogues.",
                "prerequisite": None,
            },
            {
                "id": "l2_listening",
                "title": "Listening Practice",
                "icon": "🎧",
                "type": "mcq",
                "xp": 160,
                "description": "30 MCQ, moderate pace, phone calls, store/restaurant, light news.",
                "prerequisite": None,
            },
            {
                "id": "l2_reading",
                "title": "Reading Practice",
                "icon": "📰",
                "type": "mcq",
                "xp": 160,
                "description": "40 MCQ, paragraph texts (diary/letter/email), inference, sentence ordering.",
                "prerequisite": None,
            },
            {
                "id": "l2_mock",
                "title": "Mock Exam",
                "icon": "🏆",
                "type": "mock_exam",
                "xp": 400,
                "description": "TOPIK-I mock targeting 140pts. L3 readiness predictor AI output.",
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
                "id": "l3_vocab3000",
                "title": "Vocabulary 3000",
                "icon": "📖",
                "type": "flashcard",
                "xp": 180,
                "description": "Social topics, culture, media, environment, relationships, psychology, news terms.",
                "prerequisite": None,
            },
            {
                "id": "l3_grammar",
                "title": "Intermediate Grammar",
                "icon": "✏️",
                "type": "grammar_drill",
                "xp": 200,
                "description": "-(으)ㄴ/는 것, -(으)ㄹ 것 같다, -아/어 보다, -(으)ㄴ 적이 있다, -(으)ㄹ 수 있다/없다. ~80 total patterns.",
                "prerequisite": None,
            },
            {
                "id": "l3_writing_intro",
                "title": "Writing Introduction",
                "icon": "📝",
                "type": "essay",
                "xp": 220,
                "description": "TOPIK-II Q1-Q2 sentence completion. Q3 200-300 char essay. AI scoring + rewrite suggestions.",
                "prerequisite": None,
            },
            {
                "id": "l3_social",
                "title": "Social & Cultural Topics",
                "icon": "🌏",
                "type": "mcq",
                "xp": 180,
                "description": "8 clusters: Korean culture, lifestyle, environment, health, travel, technology, education, relationships.",
                "prerequisite": None,
            },
            {
                "id": "l3_listening",
                "title": "Listening Practice",
                "icon": "🎧",
                "type": "mcq",
                "xp": 200,
                "description": "50 MCQ, native speed, multi-speaker, attitude inference, short news clips.",
                "prerequisite": None,
            },
            {
                "id": "l3_reading",
                "title": "Reading Practice",
                "icon": "📰",
                "type": "mcq",
                "xp": 200,
                "description": "50 MCQ, social/cultural articles, graph+text, logical sentence insertion, best title.",
                "prerequisite": None,
            },
            {
                "id": "l3_mock",
                "title": "Mock Exam",
                "icon": "🏆",
                "type": "mock_exam",
                "xp": 500,
                "description": "Full 180-min TOPIK-II sim. AI grades Q3 essay on grammar, content, structure.",
                "prerequisite": None,
            },
        ],
    },
    {
        "id": 4,
        "level_num": 4,
        "title": "TOPIK II — Level 4",
        "subtitle": "Upper Intermediate",
        "color": "#EF4444",
        "target_vocab": 5000,
        "exam_type": "TOPIK-II",
        "pass_score": 150,
        "max_score": 300,
        "sections": [
            {"name": "Writing", "questions": 4, "time_min": 70},
            {"name": "Listening", "questions": 50, "time_min": 60},
            {"name": "Reading", "questions": 50, "time_min": 70},
        ],
        "xp_reward": 1100,
        "modules": [
            {
                "id": "l4_vocab5000",
                "title": "Vocabulary 5000",
                "icon": "📖",
                "type": "flashcard",
                "xp": 200,
                "description": "News/media, academic, business, politics, economics, abstract concepts, basic proverbs (속담).",
                "prerequisite": None,
            },
            {
                "id": "l4_complex_grammar",
                "title": "Complex Grammar L4",
                "icon": "✏️",
                "type": "grammar_drill",
                "xp": 230,
                "description": "-(으)ㄹ수록, -는 반면에, -에 따라(서), -(으)ㄹ 뿐만 아니라, -에도 불구하고, -을 통해(서).",
                "prerequisite": None,
            },
            {
                "id": "l4_news",
                "title": "News & Current Affairs",
                "icon": "📡",
                "type": "mcq",
                "xp": 200,
                "description": "Adapted news articles, radio clips, passive constructions, formal endings, reported speech.",
                "prerequisite": None,
            },
            {
                "id": "l4_professional",
                "title": "Professional Korean",
                "icon": "💼",
                "type": "audio_task",
                "xp": 210,
                "description": "Work emails, meeting expressions, job interview vocab, formal reports, 문어체.",
                "prerequisite": None,
            },
            {
                "id": "l4_opinion_writing",
                "title": "Opinion Writing",
                "icon": "📝",
                "type": "essay",
                "xp": 260,
                "description": "TOPIK-II Q3+Q4 structure: thesis-evidence-counterargument-conclusion. AI essay structure analyzer.",
                "prerequisite": None,
            },
            {
                "id": "l4_listening",
                "title": "Listening Practice",
                "icon": "🎧",
                "type": "mcq",
                "xp": 240,
                "description": "50 MCQ, interviews, discussions, abstract topics, expressing opinions.",
                "prerequisite": None,
            },
            {
                "id": "l4_mock",
                "title": "Mock Exam",
                "icon": "🏆",
                "type": "mock_exam",
                "xp": 600,
                "description": "180-min sim. AI grades on 4 rubrics. Graph description tasks.",
                "prerequisite": None,
            },
        ],
    },
    {
        "id": 5,
        "level_num": 5,
        "title": "TOPIK II — Level 5",
        "subtitle": "Advanced",
        "color": "#8B5CF6",
        "target_vocab": 5000,
        "exam_type": "TOPIK-II",
        "pass_score": 190,
        "max_score": 300,
        "sections": [
            {"name": "Writing", "questions": 4, "time_min": 70},
            {"name": "Listening", "questions": 50, "time_min": 60},
            {"name": "Reading", "questions": 50, "time_min": 70},
        ],
        "xp_reward": 1400,
        "modules": [
            {
                "id": "l5_academic_vocab",
                "title": "Academic Vocabulary",
                "icon": "🎓",
                "type": "flashcard",
                "xp": 250,
                "description": "Politics/law, economics/finance, science/tech, philosophy/ethics. 사자성어 30+, 속담 30+.",
                "prerequisite": None,
            },
            {
                "id": "l5_advanced_grammar",
                "title": "Advanced Grammar L5",
                "icon": "✏️",
                "type": "grammar_drill",
                "xp": 280,
                "description": "-(으)ㄹ 나위가 없다, -(으)ㄹ 지경이다, -고자 하다, -는 한, -(으)ㄹ 따름이다.",
                "prerequisite": None,
            },
            {
                "id": "l5_long_essay",
                "title": "Long Essay Writing",
                "icon": "📝",
                "type": "essay",
                "xp": 320,
                "description": "TOPIK-II Q4 600-700 chars. Social issues. 주장→근거1→근거2→반론→결론. 4-rubric AI scoring.",
                "prerequisite": None,
            },
            {
                "id": "l5_academic_reading",
                "title": "Academic Reading",
                "icon": "📰",
                "type": "mcq",
                "xp": 280,
                "description": "600-900 char academic articles. Tone inference, argument structure ID, evaluating logic.",
                "prerequisite": None,
            },
            {
                "id": "l5_complex_listening",
                "title": "Complex Listening",
                "icon": "🎧",
                "type": "mcq",
                "xp": 280,
                "description": "50 MCQ, academic lectures, panel discussions, documentaries, figurative/idiomatic speech.",
                "prerequisite": None,
            },
            {
                "id": "l5_mock",
                "title": "Mock Exam",
                "icon": "🏆",
                "type": "mock_exam",
                "xp": 800,
                "description": "180-min sim, 190pt target. 4-rubric AI essay grader, model answer generation.",
                "prerequisite": None,
            },
        ],
    },
    {
        "id": 6,
        "level_num": 6,
        "title": "TOPIK II — Level 6",
        "subtitle": "Near-Native Mastery",
        "color": "#EC4899",
        "target_vocab": 6000,
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
                "id": "l6_native_vocab",
                "title": "Native Vocabulary",
                "icon": "🌟",
                "type": "flashcard",
                "xp": 350,
                "description": "Literary, legal, medical/scientific, philosophical. 사자성어 60+, 속담 50+, 관용구.",
                "prerequisite": None,
            },
            {
                "id": "l6_mastery_grammar",
                "title": "Mastery Grammar L6",
                "icon": "✏️",
                "type": "grammar_drill",
                "xp": 380,
                "description": "-(으)련만, -건대, -(으)ㄹ진대, -거니와, -(으)리라, -노라. Legal passives. Near-identical disambiguation.",
                "prerequisite": None,
            },
            {
                "id": "l6_critical_essay",
                "title": "Critical Essay Writing",
                "icon": "📝",
                "type": "essay",
                "xp": 420,
                "description": "TOPIK-II Q4, complex philosophical/social issues. Multi-perspective. AI: native-benchmark comparison.",
                "prerequisite": None,
            },
            {
                "id": "l6_literary",
                "title": "Literary Texts",
                "icon": "📚",
                "type": "mcq",
                "xp": 360,
                "description": "Adapted Korean novels, philosophical arguments, policy papers. Rhetorical device analysis.",
                "prerequisite": None,
            },
            {
                "id": "l6_expert_listening",
                "title": "Expert Listening",
                "icon": "🎧",
                "type": "mcq",
                "xp": 360,
                "description": "50 MCQ, rapid debate, irony/satire, understatement, cultural presuppositions.",
                "prerequisite": None,
            },
            {
                "id": "l6_mock",
                "title": "Mock Exam",
                "icon": "🏆",
                "type": "mock_exam",
                "xp": 1000,
                "description": "180-min sim, 230pt target. Native-speaker benchmark comparison. Certificate readiness report.",
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


def get_user_progress(user_id: str) -> dict[str, str]:
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
            (k.decode() if isinstance(k, bytes) else k): (v.decode() if isinstance(v, bytes) else v)
            for k, v in raw.items()
        }
    else:
        # Cache miss. Try to restore from PostgreSQL
        try:
            from app.db.session import SessionLocal
            from app.models.user import UserProgress
            import json
            
            db = SessionLocal()
            db_progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
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


def start_module(user_id: str, module_id: str) -> dict[str, Any]:
    """Marks a module as in_progress in Redis."""
    redis = get_redis()
    key = f"roadmap:progress:{user_id}"
    redis.hset(key, module_id, "in_progress")
    module = get_module(module_id)
    return {"sessionId": f"{user_id}_{module_id}", "module": module}


def complete_module(user_id: str, module_id: str, score: int) -> dict[str, Any]:
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
    score_entry = json.dumps({"score": score, "timestamp": datetime.now(timezone.utc).isoformat()})
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
                current_status = current_status.decode() if isinstance(current_status, bytes) else current_status
                if not current_status or current_status == "locked":
                    redis.hset(progress_key, mod["id"], "available")
                    newly_unlocked.append(mod["id"])

    # Calculate level progress for this level
    level_id = module_def.get("level_id", 1) if module_def else 1
    level_modules = [m["id"] for lvl in ROADMAP_STRUCTURE if lvl["id"] == level_id for m in lvl["modules"]]
    completed_count = sum(
        1 for mid in level_modules
        if (redis.hget(progress_key, mid) or b"").decode() == "completed"
    )
    level_progress = int((completed_count / len(level_modules)) * 100) if level_modules else 0

    return {
        "xpGained": xp_gained,
        "newlyUnlocked": newly_unlocked,
        "levelProgress": level_progress,
    }
