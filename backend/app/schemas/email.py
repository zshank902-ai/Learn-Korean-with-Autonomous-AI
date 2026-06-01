from pydantic import BaseModel


class SendVerificationResponse(BaseModel):
    sent: bool


class VerifyEmailResponse(BaseModel):
    verified: bool
    message: str
