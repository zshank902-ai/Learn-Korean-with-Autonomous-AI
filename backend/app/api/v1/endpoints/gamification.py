from pydantic import BaseModel
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import DailyQuest, User, UserProgress
from app.schemas.gamification import Quest, UserStats
from app.services.gamification_manager import gamification_manager

router = APIRouter()


@router.get("/stats", response_model=UserStats)
def get_user_stats(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    progress = (
        db.query(UserProgress).filter(
            UserProgress.user_id == current_user.id).first()
    )

    if not progress:
        progress = UserProgress(
            user_id=current_user.id, current_topik_level=1, total_xp=0, streak_count=0
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)

    return {
        "total_xp": progress.total_xp,
        "current_level": progress.current_topik_level,
        "streak_count": progress.streak_count,
        "last_login": (
            progress.last_login.isoformat()
            if progress.last_login
            else datetime.now(timezone.utc).isoformat()
        ),
    }


@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    """
    Optimized leaderboard retrieval using the cache-native manager.
    """
    return gamification_manager.get_leaderboard_mock(limit)


class XPRequest(BaseModel):
    amount: int


@router.post("/xp")
async def add_xp(request: XPRequest, current_user: User = Depends(get_current_user)):
    """
    Adds XP to the user's account and calculates if a level up occurred.
    """
    new_xp = gamification_manager.update_stat(
        current_user.id, "xp", request.amount)

    # Calculate level based on K-Mastery formula (5000 XP per level)
    new_level = (new_xp // 5000) + 1

    current_stats = gamification_manager.get_user_stats(current_user.id)
    current_level = int(current_stats.get("level", 1))

    leveled_up = False
    if new_level > current_level:
        gamification_manager.redis.hset(
            gamification_manager._get_user_key(
                current_user.id), "level", new_level
        )
        leveled_up = True

    return {
        "status": "success",
        "xp": new_xp,
        "level": new_level,
        "leveled_up": leveled_up,
        "xp_added": request.amount,
    }


class LevelUpRequest(BaseModel):
    pass


@router.post("/level-up")
def user_level_up(
    request: LevelUpRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Permanently increments the user's TOPIK level after passing the AI Examiner test.
    """
    progress = (
        db.query(UserProgress).filter(
            UserProgress.user_id == current_user.id).first()
    )
    if not progress:
        raise HTTPException(status_code=404, detail="User progress not found")

    if progress.current_topik_level < 6:
        progress.current_topik_level += 1
        db.commit()
        db.refresh(progress)

    return {
        "status": "success",
        "new_level": progress.current_topik_level,
        "message": f"Successfully leveled up to TOPIK Level {progress.current_topik_level}!",
    }


@router.post("/quest/complete")
async def complete_quest(
    quest_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Optimized quest completion with buffered XP updates.
    """
    gamification_manager.update_stat(
        user_id=current_user.id, field="xp", amount=100)

    return {
        "status": "success",
        "xp_gained": 100,
        "message": "Quest completed! XP has been buffered for synchronization.",
    }


@router.get("/quests", response_model=List[Quest])
def get_daily_quests(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    quests = db.query(DailyQuest).filter(
        DailyQuest.user_id == current_user.id).all()

    if not quests:
        seeded_quests = [
            DailyQuest(
                title="Scan 3 Street Signs",
                xp_reward=50,
                is_completed=False,
                user_id=current_user.id,
            ),
            DailyQuest(
                title="Speak for 5 Minutes",
                xp_reward=100,
                is_completed=False,
                user_id=current_user.id,
            ),
            DailyQuest(
                title="Listen to Gukje Market Dialogue",
                xp_reward=30,
                is_completed=True,
                user_id=current_user.id,
            ),
        ]
        db.add_all(seeded_quests)
        db.commit()

        for q in seeded_quests:
            db.refresh(q)

        quests = seeded_quests

    # Format dates correctly for Pydantic Schema mapping
    formatted_quests = []
    for q in quests:
        formatted_quests.append(
            {
                "id": q.id,
                "title": q.title,
                "xp_reward": q.xp_reward,
                "is_completed": q.is_completed,
                "date": (
                    q.date.isoformat()
                    if q.date
                    else datetime.now(timezone.utc).isoformat()
                ),
            }
        )

    return formatted_quests
