from pydantic import BaseModel, EmailStr
from typing import Optional
from pydantic import ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[int] = None


class UserCreate(BaseModel):
    nickname: Optional[str] = None
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nickname: Optional[str] = None
    email: str
