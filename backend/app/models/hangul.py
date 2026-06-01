import uuid
from typing import Optional, TYPE_CHECKING
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base

if TYPE_CHECKING:
    pass


class HangulVocabulary(Base):
    __tablename__ = "hangul_vocabulary"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )  # nullable for global vocab
    word: Mapped[str] = mapped_column(String, index=True)
    syllables: Mapped[str] = mapped_column(String)  # JSON list as string
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())


class UserHangulProgress(Base):
    __tablename__ = "user_hangul_progress"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )
    total_xp: Mapped[float] = mapped_column(Float, default=0)
    average_accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    quizzes_taken: Mapped[float] = mapped_column(Float, default=0)
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), onupdate=func.now())
