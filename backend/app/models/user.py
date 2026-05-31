import enum
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.session import Base

# --- ENUMS ---
class ExperienceLevel(str, enum.Enum):
    none = "none"
    beginner = "beginner"
    intermediate = "intermediate"

class StudyTime(str, enum.Enum):
    five_min = "5min"
    fifteen_min = "15min"
    thirty_min_plus = "30min_plus"

class MainGoal(str, enum.Enum):
    travel = "travel"
    kdrama = "kdrama"
    topik_exam = "topik_exam"
    work = "work"

class FlashcardDifficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class TopikStatus(str, enum.Enum):
    locked = "locked"
    active = "active"
    completed = "completed"

# --- MODELS ---
class User(Base):
    __tablename__ = "users"

    # UUID Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    oauth_provider = Column(String, nullable=True)
    oauth_id = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # --- NEW FIELDS FOR ONBOARDING & PROFILE ---
    nickname = Column(String(30), unique=True, nullable=True) # Nullable temporarily for legacy users
    full_name = Column(String(100), nullable=True)
    avatar_url = Column(String, nullable=True)
    
    email_verified = Column(Boolean, default=False, server_default="false", nullable=False)
    email_verify_token = Column(String(64), nullable=True)
    email_verify_token_expires = Column(DateTime(timezone=True), nullable=True)
    
    onboarding_done = Column(Boolean, default=False, server_default="false", nullable=False)
    
    password_reset_token = Column(String(64), nullable=True)
    password_reset_expires = Column(DateTime(timezone=True), nullable=True)

    # --- RELATIONSHIPS ---
    progress = relationship("UserProgress", back_populates="user", uselist=False, cascade="all, delete-orphan")
    quests = relationship("DailyQuest", back_populates="user", cascade="all, delete-orphan")
    learning_profile = relationship("UserLearningProfile", back_populates="user", cascade="all, delete-orphan", uselist=False)
    topik_progress = relationship("TopikProgress", back_populates="user", cascade="all, delete-orphan")

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    current_topik_level = Column(Integer, default=1)
    total_xp = Column(Integer, default=0)
    streak_count = Column(Integer, default=0)
    long_term_memory = Column(String, nullable=True)
    roadmap_status_json = Column(Text, nullable=True)
    last_login = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="progress")

class DailyQuest(Base):
    __tablename__ = "daily_quests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    xp_reward = Column(Integer)
    is_completed = Column(Boolean, default=False)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))

    user = relationship("User", back_populates="quests")

class UserLearningProfile(Base):
    __tablename__ = "user_learning_profile"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    experience_level = Column(String, nullable=False) # Enum as string
    study_time_per_day = Column(String, nullable=False) # Enum as string
    main_goal = Column(String, nullable=False) # Enum as string
    took_topik_before = Column(Boolean, nullable=False)
    flashcard_difficulty = Column(String, nullable=False) # Enum as string
    
    raw_answers = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="learning_profile")

class TopikProgress(Base):
    __tablename__ = "topik_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "topik_level", "module_id", name="uix_user_topik_module"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    topik_level = Column(Integer, nullable=False)
    module_id = Column(String(50), nullable=False)
    status = Column(String, default=TopikStatus.locked.value, server_default="'locked'", nullable=False)
    progress_percent = Column(Integer, default=0, server_default="0", nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="topik_progress")
