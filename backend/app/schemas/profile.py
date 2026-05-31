from pydantic import BaseModel, Field, field_validator
from typing import Optional
import re

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None

    @field_validator('nickname')
    @classmethod
    def validate_nickname(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not re.match(r'^[a-zA-Z0-9_]{3,30}$', v):
                raise ValueError('Nickname must be 3-30 characters long and contain only alphanumeric characters and underscores')
        return v

class NicknameCheckResponse(BaseModel):
    available: bool
    message: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v

class PasswordChangeResponse(BaseModel):
    success: bool
    message: str
