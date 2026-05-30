from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Enum, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum

class ModuleType(str, enum.Enum):
    HANGUL = "hangul"
    VOCABULARY = "vocabulary"
    GRAMMAR = "grammar"
    READING = "reading"

class TopikLevel(Base):
    __tablename__ = "topik_levels"

    id = Column(Integer, primary_key=True, index=True)
    level_num = Column(Integer, unique=True, index=True) # 1 to 6
    title = Column(String)
    description = Column(String)

    modules = relationship("CourseModule", back_populates="level")

class CourseModule(Base):
    __tablename__ = "course_modules"

    id = Column(Integer, primary_key=True, index=True)
    level_id = Column(Integer, ForeignKey("topik_levels.id"))
    title = Column(String)
    type = Column(String) # hangul, vocabulary, grammar, reading

    level = relationship("TopikLevel", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("course_modules.id"))
    title = Column(String)
    order = Column(Integer)
    content = Column(JSON) # Storing flexible lesson data (slides, questions, etc.)
    xp_reward = Column(Integer, default=20)

    module = relationship("CourseModule", back_populates="lessons")
    user_progress = relationship("UserLessonProgress", back_populates="lesson")

class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    is_completed = Column(Boolean, default=False)
    score = Column(Integer, nullable=True) # For quizzes

    lesson = relationship("Lesson", back_populates="user_progress")
