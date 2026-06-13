import enum
from datetime import datetime
from typing import Optional
from beanie import PydanticObjectId, Indexed
from pydantic import Field
from app.db.base import BaseDocument


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    PARENT = "parent"
    THERAPIST = "therapist"
    CAREGIVER = "caregiver"
    CHILD = "child"


class User(BaseDocument):
    email: Indexed(str, unique=True)
    hashed_password: str
    full_name: str
    role: UserRole = UserRole.PARENT
    is_active: bool = True
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    organization: Optional[str] = None
    login_count: int = 0
    last_active_at: Optional[str] = None
    # child accounts log in with username instead of email
    username: Optional[str] = None
    # for CHILD role — points to their ChildProfile
    child_profile_id: Optional[PydanticObjectId] = None
    # parent who created/invited this account
    invited_by_id: Optional[PydanticObjectId] = None
    # Subscription
    plan_chosen: bool = False                              # True once they pick a plan on first open
    subscription_plan: str = "free_trial"                  # "free_trial"|"family"|"family_annual"
    subscription_status: str = "inactive"                  # "trial"|"active"|"expired"|"pending"
    trial_ends_at: Optional[datetime] = None
    subscription_ends_at: Optional[datetime] = None
    paymongo_checkout_session_id: Optional[str] = None
    # onboarding & language
    preferred_language: str = "en"
    onboarding_completed: bool = False
    onboarding_step: int = 0

    class Settings:
        name = "users"
        use_state_management = True

    def __repr__(self) -> str:
        return f"<User {self.email} [{self.role}]>"


class LoginEvent(BaseDocument):
    user_id: PydanticObjectId
    ip_address: Optional[str] = None
    device_info: Optional[str] = None
    platform: Optional[str] = None
    success: bool = True
    failure_reason: Optional[str] = None

    class Settings:
        name = "login_events"
        use_state_management = True
