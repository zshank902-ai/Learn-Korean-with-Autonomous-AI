from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid

class HangulVocabulary(Base):
    __tablename__ = "hangul_vocabulary"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=True) # nullable for global vocab
    word = Column(String, index=True)
    syllables = Column(String) # JSON list as string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserHangulProgress(Base):
    __tablename__ = "user_hangul_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    total_xp = Column(Float, default=0)
    average_accuracy = Column(Float, default=0.0)
    quizzes_taken = Column(Float, default=0) # using float just in case for older data or changing to integer
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
