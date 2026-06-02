import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

file_path = "app/api/v1/endpoints/vocab.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_endpoint = """
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta

class FlashcardReview(BaseModel):
    vocab_id: int
    quality: int  # 0-5 scale (SM-2)

@router.post("/flashcards/review")
def review_flashcard(
    review: FlashcardReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    progress = db.query(UserVocabProgress).filter(
        UserVocabProgress.user_id == current_user.id,
        UserVocabProgress.vocab_id == review.vocab_id
    ).first()

    if not progress:
        progress = UserVocabProgress(
            user_id=current_user.id,
            vocab_id=review.vocab_id,
            ease_factor=2.5,
            interval=0,
            repetitions=0,
            last_reviewed=datetime.now(timezone.utc),
            next_review=datetime.now(timezone.utc)
        )
        db.add(progress)

    # SM-2 Algorithm implementation
    if review.quality >= 3:
        if progress.repetitions == 0:
            progress.interval = 1
        elif progress.repetitions == 1:
            progress.interval = 6
        else:
            progress.interval = round(progress.interval * progress.ease_factor)
        progress.repetitions += 1
    else:
        progress.repetitions = 0
        progress.interval = 1

    progress.ease_factor = progress.ease_factor + (0.1 - (5 - review.quality) * (0.08 + (5 - review.quality) * 0.02))
    if progress.ease_factor < 1.3:
        progress.ease_factor = 1.3

    progress.last_reviewed = datetime.now(timezone.utc)
    progress.next_review = datetime.now(timezone.utc) + timedelta(days=progress.interval)

    db.commit()
    
    return {"status": "success", "interval": progress.interval, "next_review": progress.next_review}
"""

if "/flashcards/review" not in content:
    with open(file_path, "a", encoding="utf-8") as f:
        f.write("\n" + new_endpoint + "\n")
    print("Added review endpoint to vocab.py.")
else:
    print("Review endpoint already exists.")
