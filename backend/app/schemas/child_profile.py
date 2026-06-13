from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator
from app.models.child_profile import CommunicationLevel, SupportLevel


class SensoryProfileCreate(BaseModel):
    sound_sensitivity: Optional[str] = None
    light_sensitivity: Optional[str] = None
    touch_sensitivity: Optional[str] = None
    smell_sensitivity: Optional[str] = None
    taste_sensitivity: Optional[str] = None
    vestibular_notes: Optional[str] = None
    proprioception_notes: Optional[str] = None
    preferred_textures: Optional[str] = None
    avoided_environments: Optional[str] = None
    sensory_tools: Optional[str] = None


class SensoryProfileResponse(SensoryProfileCreate):
    id: str
    model_config = {"from_attributes": True}


class TeamMember(BaseModel):
    id: str
    full_name: str
    email: str
    role: str


class ChildProfileCreate(BaseModel):
    full_name: str
    nickname: Optional[str] = None
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    photo_url: Optional[str] = None
    diagnosis_summary: Optional[str] = None
    asd_support_level: Optional[SupportLevel] = None
    communication_level: Optional[CommunicationLevel] = None
    diagnosis_date: Optional[str] = None
    diagnosing_professional: Optional[str] = None
    toileting_status: Optional[str] = None
    sleep_notes: Optional[str] = None
    motor_skill_notes: Optional[str] = None
    food_preferences: Optional[str] = None
    food_restrictions: Optional[str] = None
    medications: Optional[str] = None
    triggers: Optional[str] = None
    calming_strategies: Optional[str] = None
    behavior_notes: Optional[str] = None
    preferred_rewards: Optional[str] = None
    strengths_interests: Optional[str] = None
    therapy_goals: Optional[str] = None
    therapist_notes: Optional[str] = None
    current_therapies: Optional[str] = None
    school_name: Optional[str] = None
    teacher_name: Optional[str] = None
    school_notes: Optional[str] = None
    iep_goals: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    custom_tags: Optional[List[str]] = None
    # child login credentials (optional — creates child User account)
    child_username: Optional[str] = None
    child_password: Optional[str] = None


class ChildProfileUpdate(ChildProfileCreate):
    full_name: Optional[str] = None
    child_username: Optional[str] = None
    child_password: Optional[str] = None


class ChildProfileResponse(ChildProfileCreate):
    id: str
    primary_caregiver_id: Optional[str] = None
    user_id: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    sensory_profile: Optional[SensoryProfileResponse] = None
    team: List[TeamMember] = []

    @field_validator('id', 'primary_caregiver_id', 'user_id', mode='before')
    @classmethod
    def coerce_objectid(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None

    model_config = {"from_attributes": True}


class InviteTeamMemberRequest(BaseModel):
    email: EmailStr
    full_name: str
    role: str   # "caregiver" or "therapist"
