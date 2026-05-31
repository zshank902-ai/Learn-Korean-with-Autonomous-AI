from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, ConfigDict
from app.db.session import get_db
from app.models.user import User, UserProgress
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from typing import Optional
import re
import requests


router = APIRouter()

# Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


class SocialLoginInput(BaseModel):
    code: str
    redirect_uri: Optional[str] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check existing user
    user = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Initialize UserProgress
    progress = UserProgress(
        user_id=db_user.id,
        current_topik_level=1,
        total_xp=0,
        streak_count=0
    )
    db.add(progress)
    db.commit()

    # Generate Token
    access_token = create_access_token(subject=str(db_user.id))
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if not user or not user.hashed_password or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}

from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


# Helper to generate unique username
def generate_unique_username(db: Session, base_username: str) -> str:
    # Retain alphanumeric and underscores/hyphens
    cleaned = re.sub(r'[^a-zA-Z0-9_\-]', '', base_username)
    if not cleaned:
        cleaned = "user"
    
    username = cleaned
    counter = 1
    while db.query(User).filter(User.username == username).first() is not None:
        username = f"{cleaned}{counter}"
        counter += 1
    return username


# Helper to create/link and retrieve social users
def handle_social_user(db: Session, provider: str, oauth_id: str, email: str, base_username: str) -> dict:
    # 1. Look up by provider + ID
    user = db.query(User).filter(User.oauth_provider == provider, User.oauth_id == oauth_id).first()
    
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
            unique_username = generate_unique_username(db, base_username)
            user = User(
                username=unique_username,
                email=email,
                oauth_provider=provider,
                oauth_id=oauth_id,
                hashed_password=None,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Seed user progress
            progress = UserProgress(
                user_id=user.id,
                current_topik_level=1,
                total_xp=0,
                streak_count=0
            )
            db.add(progress)
            db.commit()

    # 4. Issue standard JWT token
    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/google", response_model=Token)
def google_login(social_in: SocialLoginInput, db: Session = Depends(get_db)):
    code = social_in.code
    
    # Real Google OAuth Authorization Code Exchange
    redirect_uri = social_in.redirect_uri or "http://localhost:3000/login/callback/google"
    try:
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code"
        }
        res = requests.post(token_url, data=token_data, timeout=15)
        if res.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google token exchange failed: {res.text}"
            )
        
        tokens = res.json()
        access_token = tokens.get("access_token")
        
        # Request user info
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        userinfo_res = requests.get(userinfo_url, headers=headers, timeout=15)
        if userinfo_res.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google userinfo request failed"
            )
            
        userinfo = userinfo_res.json()
        google_id = userinfo.get("sub")
        email = userinfo.get("email")
        name = userinfo.get("name") or (email.split("@")[0] if email else "GoogleUser")
        
        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to retrieve key user details from Google"
            )
            
        return handle_social_user(db, "google", google_id, email, name)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error during Google Authentication: {str(e)}"
        )


@router.post("/github", response_model=Token)
def github_login(social_in: SocialLoginInput, db: Session = Depends(get_db)):
    code = social_in.code
    
    # Real GitHub OAuth Authorization Code Exchange
    try:
        token_url = "https://github.com/login/oauth/access_token"
        headers = {"Accept": "application/json"}
        token_data = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": social_in.redirect_uri
        }
        res = requests.post(token_url, data=token_data, headers=headers, timeout=15)
        if res.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"GitHub token exchange failed: {res.text}"
            )
            
        tokens = res.json()
        access_token = tokens.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to obtain access token from GitHub: {tokens.get('error_description', tokens.get('error', 'unknown error'))}"
            )
            
        # Get user profile
        user_url = "https://api.github.com/user"
        user_headers = {
            "Authorization": f"Bearer {access_token}",
            "User-Agent": "K-Mastery-Auth-API"
        }
        user_res = requests.get(user_url, headers=user_headers, timeout=15)
        if user_res.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub user profile request failed"
            )
            
        user_profile = user_res.json()
        github_id = str(user_profile.get("id"))
        username = user_profile.get("login")
        email = user_profile.get("email")
        
        # If email is not public, fetch all emails using OAuth scope user:email
        if not email:
            emails_url = "https://api.github.com/user/emails"
            emails_res = requests.get(emails_url, headers=user_headers, timeout=15)
            if emails_res.status_code == 200:
                emails = emails_res.json()
                primary_email = next((e.get("email") for e in emails if e.get("primary")), None)
                if not primary_email:
                    primary_email = next((e.get("email") for e in emails), None)
                email = primary_email
                
        if not email:
            email = f"{username}@github.user"
            
        return handle_social_user(db, "github", github_id, email, username)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error during GitHub Authentication: {str(e)}"
        )

