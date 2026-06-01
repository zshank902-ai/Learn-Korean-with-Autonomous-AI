import uuid
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    pass


class VocabItem(Base):
    __tablename__ = "vocab_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    word: Mapped[str] = mapped_column(String, index=True)  # Korean word
    meaning: Mapped[str] = mapped_column(String)  # English/Hindi meaning
    pronunciation: Mapped[str] = mapped_column(String)  # Romaji/Hangul guide
    audio_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    level_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("topik_levels.id", ondelete="CASCADE"))

    user_progress: Mapped[List["UserVocabProgress"]] = relationship(
        "UserVocabProgress", back_populates="vocab_item")


class UserVocabProgress(Base):
    __tablename__ = "user_vocab_progress"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    vocab_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("vocab_items.id", ondelete="CASCADE"))

    # SM-2 Algorithm Fields
    ease_factor: Mapped[float] = mapped_column(
        Float, default=2.5)  # Initial Ease Factor
    interval: Mapped[int] = mapped_column(
        Integer, default=0)  # Days until next review
    repetitions: Mapped[int] = mapped_column(
        Integer, default=0)  # Consecutive correct answers

    last_reviewed: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    next_review: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))

    vocab_item: Mapped["VocabItem"] = relationship(
        "VocabItem", back_populates="user_progress")
