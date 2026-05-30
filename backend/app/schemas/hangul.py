from pydantic import BaseModel
from typing import List

class LookupResponse(BaseModel):
    word: str
    romanization: str
    meaning: str
    example: str
    difficulty: int

class VocabularyCreate(BaseModel):
    user_id: str
    word: str
    syllables: List[str]

class VocabularyResponse(BaseModel):
    saved: bool
    total_words: int

class ProgressUpdate(BaseModel):
    user_id: str
    xp_earned: int
    accuracy: float
    mode: str
