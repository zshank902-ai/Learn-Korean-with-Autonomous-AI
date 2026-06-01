import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from cachetools import TTLCache
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.email import SendVerificationResponse, VerifyEmailResponse
from app.services.email import send_verification_email

router = APIRouter()

# Simple in-memory rate limiting for email sending (3 per hour per user_id)
# TTL = 3600 seconds (1 hour). Keys are user_id strings, values are hit counts.
rate_limit_cache: Any = TTLCache(maxsize=10000, ttl=3600)


@router.post("/send-verification", response_model=SendVerificationResponse)
async def send_verification(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already verified"
        )

    user_id_str = str(current_user.id)
    hit_count = rate_limit_cache.get(user_id_str, 0)

    if hit_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Try again later.",
        )

    rate_limit_cache[user_id_str] = hit_count + 1

    # Generate token and expiry
    token = secrets.token_urlsafe(48)
    expires = datetime.now(timezone.utc) + timedelta(hours=24)

    current_user.email_verify_token = token
    current_user.email_verify_token_expires = expires
    db.commit()

    # Call Resend SDK service
    await send_verification_email(current_user.email, token)

    return {"sent": True}


@router.get("/verify", response_model=VerifyEmailResponse)
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email_verify_token == token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token"
        )

    if (
        user.email_verify_token_expires
        and user.email_verify_token_expires < datetime.now(timezone.utc)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Verification token expired"
        )

    user.email_verified = True
    user.email_verify_token = None
    user.email_verify_token_expires = None
    db.commit()

    return {"verified": True, "message": "Email verified successfully"}
