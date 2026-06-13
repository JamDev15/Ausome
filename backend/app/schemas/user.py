from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.PARENT
    phone: Optional[str] = None
    organization: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    organization: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: str
    is_active: bool
    avatar_url: Optional[str] = None
    login_count: int = 0
    last_active_at: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserAdminResponse(UserResponse):
    """Extended view for admin"""
    pass


class LoginEventResponse(BaseModel):
    id: str
    user_id: str
    ip_address: Optional[str] = None
    device_info: Optional[str] = None
    platform: Optional[str] = None
    success: bool
    created_at: datetime

    model_config = {"from_attributes": True}
