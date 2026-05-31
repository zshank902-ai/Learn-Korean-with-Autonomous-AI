from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserLearningProfile, FlashcardDifficulty
from app.api.v1.endpoints.auth import get_current_user
from app.schemas.onboarding import OnboardingAnalyzeRequest, OnboardingAnalyzeResponse, OnboardingStatusResponse
from app.services.ai_analyzer import analyze_quiz_answers

router = APIRouter()

@router.post("/analyze", response_model=OnboardingAnalyzeResponse)
async def analyze_onboarding(
    data: OnboardingAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.onboarding_done:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Onboarding already completed.")

    # Call Groq LLM
    ai_result = await analyze_quiz_answers(data.quiz_answers)
    
    # Extract data with fallbacks
    difficulty = ai_result.get("flashcard_difficulty", "medium")
    reasoning = ai_result.get("reasoning", "Analyzed successfully.")
    
    # Validate Enum
    if difficulty not in ["easy", "medium", "hard"]:
        difficulty = "medium"

    profile = db.query(UserLearningProfile).filter(UserLearningProfile.user_id == current_user.id).first()
    
    # Defaults for other non-null fields since the quiz_answers is a freeform JSON dict.
    # In a full app, we would parse these out of the raw_answers.
    exp_lvl = data.quiz_answers.get("experience_level", "none")
    study_time = data.quiz_answers.get("study_time_per_day", "15min")
    goal = data.quiz_answers.get("main_goal", "travel")
    took_topik = data.quiz_answers.get("took_topik_before", False)

    if profile:
        profile.raw_answers = data.quiz_answers
        profile.flashcard_difficulty = difficulty
        profile.experience_level = exp_lvl
        profile.study_time_per_day = study_time
        profile.main_goal = goal
        profile.took_topik_before = took_topik
    else:
        profile = UserLearningProfile(
            user_id=current_user.id,
            experience_level=exp_lvl,
            study_time_per_day=study_time,
            main_goal=goal,
            took_topik_before=took_topik,
            flashcard_difficulty=difficulty,
            raw_answers=data.quiz_answers
        )
        db.add(profile)

    current_user.onboarding_done = True
    db.commit()

    return {"difficulty": difficulty, "reasoning": reasoning}

@router.get("/status", response_model=OnboardingStatusResponse)
def get_onboarding_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(UserLearningProfile).filter(UserLearningProfile.user_id == current_user.id).first()
    
    return {
        "onboarding_done": current_user.onboarding_done,
        "learning_profile": {
            "flashcard_difficulty": profile.flashcard_difficulty,
            "raw_answers": profile.raw_answers
        } if profile else None
    }
