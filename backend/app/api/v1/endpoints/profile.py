from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.security import get_password_hash, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import (NicknameCheckResponse, PasswordChangeRequest,
                                 PasswordChangeResponse, ProfileUpdate)

router = APIRouter()


@router.patch("/", response_model=dict)
def update_profile(
    update_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if (
        update_data.nickname is not None
        and update_data.nickname != current_user.nickname
    ):
        existing = db.query(User).filter(
            User.nickname == update_data.nickname).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Nickname already taken"
            )
        current_user.nickname = update_data.nickname

    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name

    if update_data.avatar_url is not None:
        current_user.avatar_url = update_data.avatar_url

    db.commit()
    db.refresh(current_user)

    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "nickname": current_user.nickname,
        "full_name": current_user.full_name,
        "avatar_url": current_user.avatar_url,
        "email_verified": current_user.email_verified,
        "onboarding_done": current_user.onboarding_done,
    }


@router.get("/check-nickname", response_model=NicknameCheckResponse)
def check_nickname(
    nickname: str,
    db: Session = Depends(get_db),
    # Require auth as requested
    current_user: User = Depends(get_current_user),
):
    if not nickname:
        return {"available": False, "message": "Nickname is required"}

    existing = db.query(User).filter(User.nickname == nickname).first()
    if existing:
        if existing.id == current_user.id:
            return {"available": True, "message": "This is your current nickname"}
        return {"available": False, "message": "Nickname is already taken"}

    return {"available": True, "message": "Nickname is available"}


@router.post("/change-password", response_model=PasswordChangeResponse)
def change_password(
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User signed up via social login. Password cannot be changed here.",
        )

    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect current password",
        )

    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()

    return {"success": True, "message": "Password updated successfully"}
