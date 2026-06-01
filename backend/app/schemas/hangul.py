from typing import List

from pydantic import BaseModel


class LookupResponse(BaseModel):
    word: str
    romanization: str
    meaning: str
    example: str
    difficulty: int


class VocabularyCreate(BaseModel):
    word: str
    syllables: List[str]


class VocabularyResponse(BaseModel):
    saved: bool
    total_words: int


class ProgressUpdate(BaseModel):
    xp_earned: int
    accuracy: float
    mode: str
