from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class HangulVocabulary(Base):
    __tablename__ = "hangul_vocabulary"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) # References users table in production
    word = Column(String, index=True)
    syllables = Column(String) # JSON list as string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserHangulProgress(Base):
    __tablename__ = "user_hangul_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True)
    total_xp = Column(Integer, default=0)
    average_accuracy = Column(Float, default=0.0)
    quizzes_taken = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
