import enum
import uuid
from typing import Optional, List, Any

from sqlalchemy import JSON, Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class ModuleType(str, enum.Enum):
    HANGUL = "hangul"
    VOCABULARY = "vocabulary"
    GRAMMAR = "grammar"
    READING = "reading"


class TopikLevel(Base):
    __tablename__ = "topik_levels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    level_num: Mapped[int] = mapped_column(
        Integer, unique=True, index=True)  # 1 to 6
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)

    modules: Mapped[List["CourseModule"]] = relationship(
        "CourseModule", back_populates="level")


class CourseModule(Base):
    __tablename__ = "course_modules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    level_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("topik_levels.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String)
    # hangul, vocabulary, grammar, reading
    type: Mapped[str] = mapped_column(String)

    level: Mapped["TopikLevel"] = relationship(
        "TopikLevel", back_populates="modules")
    lessons: Mapped[List["Lesson"]] = relationship(
        "Lesson", back_populates="module")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    module_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("course_modules.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String)
    order: Mapped[int] = mapped_column(Integer)
    content: Mapped[Any] = mapped_column(JSON)  # Storing flexible lesson data
    xp_reward: Mapped[int] = mapped_column(Integer, default=20)

    module: Mapped["CourseModule"] = relationship(
        "CourseModule", back_populates="lessons")
    user_progress: Mapped[List["UserLessonProgress"]] = relationship(
        "UserLessonProgress", back_populates="lesson")


class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    lesson_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("lessons.id", ondelete="CASCADE"))
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    score: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True)  # For quizzes

    lesson: Mapped["Lesson"] = relationship(
        "Lesson", back_populates="user_progress")
