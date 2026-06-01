from app.core.security import ALGORITHM, SECRET_KEY
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
import re
from typing import Optional
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (create_access_token, get_password_hash,
                               verify_password)
from app.db.session import get_db
from app.models.user import User, UserProgress

router = APIRouter()


# Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nickname: Optional[str] = None
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class SocialLoginInput(BaseModel):
    code: str
    redirect_uri: Optional[str] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    nickname: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    email_verified: bool
    onboarding_done: bool


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check existing user
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    if user_in.nickname:
        nickname_check = (
            db.query(User).filter(User.nickname == user_in.nickname).first()
        )
        if nickname_check:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Nickname already taken"
            )

    # Create new user
    hashed_password = get_password_hash(user_in.password)

    import random
    import string

    verify_code = "".join(random.choices(string.digits, k=6))
    print(
        f"\\n{'='*40}\\nEMAIL VERIFICATION MOCK\\nTo: {user_in.email}\\nCode: {verify_code}\\n{'='*40}\\n"
    )

    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        nickname=user_in.nickname,
        full_name=user_in.full_name,
        email_verify_token=verify_code,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Initialize UserProgress
    progress = UserProgress(
        user_id=db_user.id, current_topik_level=1, total_xp=0, streak_count=0
    )
    db.add(progress)
    db.commit()

    # Generate Token
    access_token = create_access_token(subject=str(db_user.id))
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if (
        not user
        or not user.hashed_password
        or not verify_password(user_in.password, user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


# Helper to generate unique nickname
def generate_unique_nickname(db: Session, base_name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_\-]", "", base_name)
    if not cleaned:
        cleaned = "user"

    nickname = cleaned
    counter = 1
    while db.query(User).filter(User.nickname == nickname).first() is not None:
        nickname = f"{cleaned}{counter}"
        counter += 1
    return nickname


# Helper to create/link and retrieve social users
def handle_social_user(
    db: Session, provider: str, oauth_id: str, email: str, base_name: str
) -> dict:
    # 1. Look up by provider + ID
    user = (
        db.query(User)
        .filter(User.oauth_provider == provider, User.oauth_id == oauth_id)
        .first()
    )

    if not user:
        # 2. Look up by email to automatically link accounts
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.oauth_provider = provider
            user.oauth_id = oauth_id
            db.commit()
            db.refresh(user)
        else:
            # 3. Create a new user account
            unique_nickname = generate_unique_nickname(db, base_name)
            user = User(
                nickname=unique_nickname,
                full_name=base_name,
                email=email,
                email_verified=True,  # Social logins are trusted
                oauth_provider=provider,
                oauth_id=oauth_id,
                hashed_password=None,
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Seed user progress
            progress = UserProgress(
                user_id=user.id, current_topik_level=1, total_xp=0, streak_count=0
            )
            db.add(progress)
            db.commit()

    # 4. Issue standard JWT token
    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/google", response_model=Token)
async def google_login(social_in: SocialLoginInput, db: Session = Depends(get_db)):
    code = social_in.code

    # Real Google OAuth Authorization Code Exchange
    redirect_uri = (
        social_in.redirect_uri or "http://localhost:3000/login/callback/google"
    )
    try:
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }

        async with httpx.AsyncClient() as client:
            res = await client.post(token_url, data=token_data, timeout=15.0)
            if res.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Google token exchange failed: {res.text}",
                )

            tokens = res.json()
            access_token = tokens.get("access_token")

            # Request user info
            userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            userinfo_res = await client.get(userinfo_url, headers=headers, timeout=15.0)
            if userinfo_res.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Google userinfo request failed",
                )

            userinfo = userinfo_res.json()
            google_id = userinfo.get("sub")
            email = userinfo.get("email")
            name = userinfo.get("name") or (
                email.split("@")[0] if email else "GoogleUser"
            )

            if not google_id or not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to retrieve key user details from Google",
                )

            return handle_social_user(db, "google", google_id, email, name)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error during Google Authentication: {str(e)}",
        )


@router.post("/github", response_model=Token)
async def github_login(social_in: SocialLoginInput, db: Session = Depends(get_db)):
    code = social_in.code

    # Real GitHub OAuth Authorization Code Exchange
    try:
        token_url = "https://github.com/login/oauth/access_token"
        headers = {"Accept": "application/json"}
        token_data = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": social_in.redirect_uri,
        }

        async with httpx.AsyncClient() as client:
            res = await client.post(
                token_url, data=token_data, headers=headers, timeout=15.0
            )
            if res.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"GitHub token exchange failed: {res.text}",
                )

            tokens = res.json()
            access_token = tokens.get("access_token")
            if not access_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to obtain access token from GitHub: {tokens.get('error_description', tokens.get('error', 'unknown error'))}",
                )

            # Get user profile
            user_url = "https://api.github.com/user"
            user_headers = {
                "Authorization": f"Bearer {access_token}",
                "User-Agent": "K-Mastery-Auth-API",
            }
            user_res = await client.get(user_url, headers=user_headers, timeout=15.0)
            if user_res.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="GitHub user profile request failed",
                )

            user_profile = user_res.json()
            github_id = str(user_profile.get("id"))
            github_login_name = user_profile.get("login")
            email = user_profile.get("email")

            # If email is not public, fetch all emails using OAuth scope user:email
            if not email:
                emails_url = "https://api.github.com/user/emails"
                emails_res = await client.get(
                    emails_url, headers=user_headers, timeout=15.0
                )
                if emails_res.status_code == 200:
                    emails = emails_res.json()
                    primary_email = next(
                        (e.get("email")
                         for e in emails if e.get("primary")), None
                    )
                    if not primary_email:
                        primary_email = next((e.get("email")
                                             for e in emails), None)
                    email = primary_email

            if not email:
                email = f"{github_login_name}@github.user"

            return handle_social_user(db, "github", github_id, email, github_login_name)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error during GitHub Authentication: {str(e)}",
        )
