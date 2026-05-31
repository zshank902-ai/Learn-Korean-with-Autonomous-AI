from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base
from datetime import datetime, timezone
import uuid

class VocabItem(Base):
    __tablename__ = "vocab_items"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, index=True) # Korean word
    meaning = Column(String) # English/Hindi meaning
    pronunciation = Column(String) # Romaji/Hangul guide
    audio_path = Column(String, nullable=True)
    level_id = Column(Integer, ForeignKey("topik_levels.id", ondelete="CASCADE"))

    user_progress = relationship("UserVocabProgress", back_populates="vocab_item")

class UserVocabProgress(Base):
    __tablename__ = "user_vocab_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    vocab_id = Column(Integer, ForeignKey("vocab_items.id", ondelete="CASCADE"))
    
    # SM-2 Algorithm Fields
    ease_factor = Column(Float, default=2.5) # Initial Ease Factor
    interval = Column(Integer, default=0) # Days until next review
    repetitions = Column(Integer, default=0) # Consecutive correct answers
    
    last_reviewed = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    next_review = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    vocab_item = relationship("VocabItem", back_populates="user_progress")
