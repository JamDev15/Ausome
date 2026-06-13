from typing import Optional
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    # accepts email OR username (child accounts don't have real email)
    login: str
    password: str
    device_info: str | None = None
    platform: str | None = None


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "parent"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    full_name: str
    child_profile_id: Optional[str] = None   # set for CHILD role accounts
    preferred_language: str = "en"
    onboarding_completed: bool = False
    plan_chosen: bool = False
    subscription_plan: str = "free_trial"
    subscription_status: str = "inactive"
    trial_ends_at: Optional[str] = None
    subscription_ends_at: Optional[str] = None
    is_full_access: bool = False


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str
