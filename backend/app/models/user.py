from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)
    oauth_provider = Column(String, nullable=True)
    oauth_id = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    progress = relationship("UserProgress", back_populates="user", uselist=False)
    quests = relationship("DailyQuest", back_populates="user")

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    current_topik_level = Column(Integer, default=1)
    total_xp = Column(Integer, default=0)
    streak_count = Column(Integer, default=0)
    long_term_memory = Column(String, nullable=True)
    last_login = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="progress")

class DailyQuest(Base):
    __tablename__ = "daily_quests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    xp_reward = Column(Integer)
    is_completed = Column(Boolean, default=False)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="quests")
