from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from pydantic import ConfigDict


class UserStats(BaseModel):
    total_xp: int
    current_level: int
    streak_count: int
    last_login: datetime


class Quest(BaseModel):
    id: int
    title: str
    xp_reward: int
    is_completed: bool
    date: datetime


class UserCacheState(BaseModel):
    """
    Pydantic Schema for Redis User Data validation.
    Ensures that data stored in Redis memory is consistent.
    """
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    xp: int
    streak: int
    coins: int
    last_login: str  # ISO Format
