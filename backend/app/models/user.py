import enum
import uuid
from datetime import datetime, timezone
from typing import Any, List, Optional

from sqlalchemy import (Boolean, DateTime, ForeignKey, Integer, String, Text,
                        UniqueConstraint)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
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
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(
        String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[Optional[str]
                            ] = mapped_column(String, nullable=True)
    oauth_provider: Mapped[Optional[str]
                           ] = mapped_column(String, nullable=True)
    oauth_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # --- NEW FIELDS FOR ONBOARDING & PROFILE ---
    nickname: Mapped[Optional[str]] = mapped_column(
        String(30), unique=True, nullable=True
    )  # Nullable temporarily for legacy users
    full_name: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    email_verified: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )
    email_verify_token: Mapped[Optional[str]
                               ] = mapped_column(String(64), nullable=True)
    email_verify_token_expires: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True)

    onboarding_done: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )

    password_reset_token: Mapped[Optional[str]
                                 ] = mapped_column(String(64), nullable=True)
    password_reset_expires: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True)

    # --- RELATIONSHIPS ---
    progress: Mapped[Optional["UserProgress"]] = relationship(
        "UserProgress",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    quests: Mapped[List["DailyQuest"]] = relationship(
        "DailyQuest", back_populates="user", cascade="all, delete-orphan"
    )
    learning_profile: Mapped[Optional["UserLearningProfile"]] = relationship(
        "UserLearningProfile",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    topik_progress: Mapped[List["TopikProgress"]] = relationship(
        "TopikProgress", back_populates="user", cascade="all, delete-orphan"
    )


class UserProgress(Base):
    __tablename__ = "user_progress"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    current_topik_level: Mapped[int] = mapped_column(Integer, default=1)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    streak_count: Mapped[int] = mapped_column(Integer, default=0)
    long_term_memory: Mapped[Optional[str]
                             ] = mapped_column(String, nullable=True)
    roadmap_status_json: Mapped[Optional[str]
                                ] = mapped_column(Text, nullable=True)
    last_login: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="progress")


class DailyQuest(Base):
    __tablename__ = "daily_quests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String)
    xp_reward: Mapped[int] = mapped_column(Integer)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    date: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))

    user: Mapped["User"] = relationship("User", back_populates="quests")


class UserLearningProfile(Base):
    __tablename__ = "user_learning_profile"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    experience_level: Mapped[str] = mapped_column(
        String, nullable=False)  # Enum as string
    study_time_per_day: Mapped[str] = mapped_column(
        String, nullable=False)  # Enum as string
    main_goal: Mapped[str] = mapped_column(
        String, nullable=False)  # Enum as string
    took_topik_before: Mapped[bool] = mapped_column(Boolean, nullable=False)
    flashcard_difficulty: Mapped[str] = mapped_column(
        String, nullable=False)  # Enum as string

    raw_answers: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(
        "User", back_populates="learning_profile")


class TopikProgress(Base):
    __tablename__ = "topik_progress"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "topik_level", "module_id", name="uix_user_topik_module"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    topik_level: Mapped[int] = mapped_column(Integer, nullable=False)
    module_id: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(
        String,
        default=TopikStatus.locked.value,
        server_default="'locked'",
        nullable=False,
    )
    progress_percent: Mapped[int] = mapped_column(
        Integer, default=0, server_default="0", nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(
        "User", back_populates="topik_progress")
