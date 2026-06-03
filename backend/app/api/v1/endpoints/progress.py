from app.services.roadmap_service import ROADMAP_STRUCTURE
import uuid
from datetime import datetime, timezone
from typing import Union

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import TopikProgress, TopikStatus, User
from app.schemas.progress import ModuleCompleteRequest, ModuleCompleteResponse
from app.services.gamification_manager import gamification_manager

router = APIRouter()


def _get_level_sequence(level: int) -> list[str]:
    level_data = next((l for l in ROADMAP_STRUCTURE if l["id"] == level), None)
    return [m["id"] for m in level_data["modules"]] if level_data else []


def check_level_complete(db: Session, user_id: Union[str, uuid.UUID], level: int) -> bool:
    """Helper to check if all modules in a level are completed."""
    sequence = _get_level_sequence(level)
    required = len(sequence)
    if required == 0:
        return True
    completed_count = (
        db.query(func.count(TopikProgress.id))
        .filter(
            TopikProgress.user_id == user_id,
            TopikProgress.topik_level == level,
            TopikProgress.status == TopikStatus.completed.value,
        )
        .scalar()
    )

    return completed_count >= required


@router.get("/topik/{level}")
def get_topik_level_progress(
    level: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check lock condition for levels > 1
    if level > 1:
        is_prev_complete = check_level_complete(db, current_user.id, level - 1)
        if not is_prev_complete:
            # Return all modules as locked
            return {
                "level": level,
                "locked": True,
                "modules": [
                    {"module_id": m, "status": "locked"}
                    for m in ["mod1", "mod2", "mod3"]
                ],
            }

    # Fetch existing progress
    progress_records = (
        db.query(TopikProgress)
        .filter(
            TopikProgress.user_id == current_user.id, TopikProgress.topik_level == level
        )
        .all()
    )

    progress_dict = {p.module_id: p.status for p in progress_records}

    # Build response
    modules = []
    sequence = _get_level_sequence(level)

    for i, mod in enumerate(sequence):
        # Unlock all sub-modules by default within an unlocked level
        default_status = "active"
        modules.append(
            {"module_id": mod, "status": progress_dict.get(
                mod, default_status)}
        )

    return {"level": level, "locked": False, "modules": modules}


@router.post("/complete-module", response_model=ModuleCompleteResponse)
def complete_module(
    data: ModuleCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch or create progress record
    progress = (
        db.query(TopikProgress)
        .filter(
            TopikProgress.user_id == current_user.id,
            TopikProgress.topik_level == data.topik_level,
            TopikProgress.module_id == data.module_id,
        )
        .first()
    )

    if not progress:
        progress = TopikProgress(
            user_id=current_user.id,
            topik_level=data.topik_level,
            module_id=data.module_id,
        )
        db.add(progress)

    # Mark as completed
    progress.status = TopikStatus.completed.value
    progress.progress_percent = 100
    progress.completed_at = datetime.now(timezone.utc)
    db.commit()

    # Determine sequence unlocking
    next_unlocked = None
    level_complete = False
    sequence = _get_level_sequence(data.topik_level)

    try:
        current_idx = sequence.index(data.module_id)
        if current_idx + 1 < len(sequence):
            next_unlocked = sequence[current_idx + 1]

            # Create/Update next module to active
            next_prog = (
                db.query(TopikProgress)
                .filter(
                    TopikProgress.user_id == current_user.id,
                    TopikProgress.topik_level == data.topik_level,
                    TopikProgress.module_id == next_unlocked,
                )
                .first()
            )
            if not next_prog:
                next_prog = TopikProgress(
                    user_id=current_user.id,
                    topik_level=data.topik_level,
                    module_id=next_unlocked,
                    status=TopikStatus.active.value,
                )
                db.add(next_prog)
            else:
                if next_prog.status == TopikStatus.locked.value:
                    next_prog.status = TopikStatus.active.value
            db.commit()
        else:
            level_complete = True
    except ValueError:
        # Module not in known sequence
        pass

    # Give XP
    xp_amount = 50
    # Emit to existing gamification system
    gamification_manager.update_stat(current_user.id, "xp", xp_amount)

    return {
        "completed": True,
        "next_unlocked": next_unlocked,
        "level_complete": level_complete,
        "xp_awarded": xp_amount,
    }
