import enum
from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from app.db.base import BaseDocument


class CommunicationLevel(str, enum.Enum):
    NONVERBAL = "nonverbal"
    EMERGING_VERBAL = "emerging_verbal"
    FUNCTIONAL_VERBAL = "functional_verbal"
    CONVERSATIONAL = "conversational"
    AAC_DEPENDENT = "aac_dependent"


class SupportLevel(str, enum.Enum):
    LEVEL_1 = "level_1"
    LEVEL_2 = "level_2"
    LEVEL_3 = "level_3"


class SensoryProfile(BaseModel):
    """Embedded document inside ChildProfile."""
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


class ChildPreference(BaseModel):
    """Embedded document inside ChildProfile."""
    category: str
    item: str
    preference_type: str = "like"  # like / dislike


class ChildProfile(BaseDocument):
    primary_caregiver_id: Optional[PydanticObjectId] = None
    full_name: str
    nickname: Optional[str] = None
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    photo_url: Optional[str] = None

    # Diagnosis
    diagnosis_summary: Optional[str] = None
    asd_support_level: Optional[SupportLevel] = None
    communication_level: Optional[CommunicationLevel] = None
    diagnosis_date: Optional[str] = None
    diagnosing_professional: Optional[str] = None

    # Daily living
    toileting_status: Optional[str] = None
    sleep_notes: Optional[str] = None
    motor_skill_notes: Optional[str] = None
    food_preferences: Optional[str] = None
    food_restrictions: Optional[str] = None
    medications: Optional[str] = None

    # Behavior
    triggers: Optional[str] = None
    calming_strategies: Optional[str] = None
    behavior_notes: Optional[str] = None
    preferred_rewards: Optional[str] = None
    strengths_interests: Optional[str] = None

    # Therapy
    therapy_goals: Optional[str] = None
    therapist_notes: Optional[str] = None
    current_therapies: Optional[str] = None

    # School
    school_name: Optional[str] = None
    teacher_name: Optional[str] = None
    school_notes: Optional[str] = None
    iep_goals: Optional[str] = None

    # Emergency
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None

    # Embedded sub-documents
    sensory_profile: Optional[SensoryProfile] = None
    preferences: List[ChildPreference] = Field(default_factory=list)

    # Linked user accounts
    user_id: Optional[PydanticObjectId] = None                            # child's own login
    caregiver_ids: List[PydanticObjectId] = Field(default_factory=list)   # guardian accounts
    therapist_ids: List[PydanticObjectId] = Field(default_factory=list)   # therapist accounts

    # Meta
    custom_tags: List[str] = Field(default_factory=list)
    is_active: bool = True

    class Settings:
        name = "child_profiles"
        use_state_management = True

    def __repr__(self) -> str:
        return f"<ChildProfile {self.full_name}>"
