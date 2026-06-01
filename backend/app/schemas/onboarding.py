from typing import Any, Dict, Optional

from pydantic import BaseModel


class OnboardingAnalyzeRequest(BaseModel):
    # Strict specification based on requirements:
    # "Body: exact quiz answers"
    quiz_answers: Dict[str, Any]


class OnboardingAnalyzeResponse(BaseModel):
    difficulty: str
    reasoning: str


class OnboardingStatusResponse(BaseModel):
    onboarding_done: bool
    learning_profile: Optional[Dict[str, Any]] = None
