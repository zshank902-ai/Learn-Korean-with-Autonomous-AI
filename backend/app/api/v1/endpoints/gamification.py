from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserProgress, DailyQuest
from app.schemas.gamification import UserStats, Quest
from app.services.gamification_manager import gamification_manager
from typing import List
from datetime import datetime, timezone

router = APIRouter()

@router.get("/stats", response_model=UserStats)
def get_user_stats(db: Session = Depends(get_db)):
    # Fetch the first user's progress
    progress = db.query(UserProgress).first()
    
    if not progress:
        # Seed dummy user if database is completely empty
        new_user = User(username="BusanKing", email="test@test.com", hashed_password="hashed")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        progress = UserProgress(
            user_id=new_user.id, 
            current_topik_level=2, 
            total_xp=2450, 
            streak_count=12
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
    
    return {
        "total_xp": progress.total_xp,
        "current_level": progress.current_topik_level,
        "streak_count": progress.streak_count,
        "last_login": progress.last_login.isoformat() if progress.last_login else datetime.now(timezone.utc).isoformat()
    }

@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    """
    Optimized leaderboard retrieval using the cache-native manager.
    """
    return gamification_manager.get_leaderboard_mock(limit)

from pydantic import BaseModel

class XPRequest(BaseModel):
    amount: int
    user_id: int = 1

@router.post("/xp")
async def add_xp(request: XPRequest):
    """
    Adds XP to the user's account and calculates if a level up occurred.
    """
    new_xp = gamification_manager.update_stat(request.user_id, "xp", request.amount)
    
    # Calculate level based on K-Mastery formula (5000 XP per level)
    new_level = (new_xp // 5000) + 1
    
    current_stats = gamification_manager.get_user_stats(request.user_id)
    current_level = int(current_stats.get("level", 1))
    
    leveled_up = False
    if new_level > current_level:
        gamification_manager.redis.hset(gamification_manager._get_user_key(request.user_id), "level", new_level)
        leveled_up = True
        
    return {
        "status": "success",
        "xp": new_xp,
        "level": new_level,
        "leveled_up": leveled_up,
        "xp_added": request.amount
    }

class LevelUpRequest(BaseModel):
    user_id: int = 1

@router.post("/level-up")
def user_level_up(request: LevelUpRequest, db: Session = Depends(get_db)):
    """
    Permanently increments the user's TOPIK level after passing the AI Examiner test.
    """
    progress = db.query(UserProgress).filter(UserProgress.user_id == request.user_id).first()
    if not progress:
        raise HTTPException(status_code=404, detail="User progress not found")
        
    if progress.current_topik_level < 6:
        progress.current_topik_level += 1
        db.commit()
        db.refresh(progress)
        
    return {
        "status": "success",
        "new_level": progress.current_topik_level,
        "message": f"Successfully leveled up to TOPIK Level {progress.current_topik_level}!"
    }

@router.post("/quest/complete")
async def complete_quest(quest_id: int, db: Session = Depends(get_db)):
    """
    Optimized quest completion with buffered XP updates.
    """
    # Find user ID 1 (default seeded user)
    gamification_manager.update_stat(user_id=1, field="xp", amount=100)
    
    return {
        "status": "success",
        "xp_gained": 100,
        "message": "Quest completed! XP has been buffered for synchronization."
    }

@router.get("/quests", response_model=List[Quest])
def get_daily_quests(db: Session = Depends(get_db)):
    quests = db.query(DailyQuest).all()
    
    if not quests:
        # Seed dummy quests if database is empty
        user = db.query(User).first()
        user_id = user.id if user else 1
        
        seeded_quests = [
            DailyQuest(title="Scan 3 Street Signs", xp_reward=50, is_completed=False, user_id=user_id),
            DailyQuest(title="Speak for 5 Minutes", xp_reward=100, is_completed=False, user_id=user_id),
            DailyQuest(title="Listen to Gukje Market Dialogue", xp_reward=30, is_completed=True, user_id=user_id),
        ]
        db.add_all(seeded_quests)
        db.commit()
        
        for q in seeded_quests:
            db.refresh(q)
            
        quests = seeded_quests
    
    # Format dates correctly for Pydantic Schema mapping
    formatted_quests = []
    for q in quests:
        formatted_quests.append({
            "id": q.id,
            "title": q.title,
            "xp_reward": q.xp_reward,
            "is_completed": q.is_completed,
            "date": q.date.isoformat() if q.date else datetime.now(timezone.utc).isoformat()
        })
        
    return formatted_quests
