import enum
from typing import Optional
from beanie import PydanticObjectId
from app.db.base import BaseDocument


class EmotionType(str, enum.Enum):
    CALM = "calm"
    HAPPY = "happy"
    OVERWHELMED = "overwhelmed"
    CRYING = "crying"
    MELTDOWN = "meltdown"
    REPETITIVE_BEHAVIOR = "repetitive_behavior"
    REFUSING_FOOD = "refusing_food"
    ENERGETIC = "energetic"
    SLEEPY = "sleepy"
    DYSREGULATED = "dysregulated"
    ANXIOUS = "anxious"
    FRUSTRATED = "frustrated"
    EXCITED = "excited"
    CONFUSED = "confused"


class BehaviorSeverity(str, enum.Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"


class BehaviorLog(BaseDocument):
    child_id: PydanticObjectId
    logged_by_id: Optional[PydanticObjectId] = None

    emotion: EmotionType
    severity: Optional[BehaviorSeverity] = None

    location: Optional[str] = None
    trigger: Optional[str] = None
    behavior_description: Optional[str] = None
    intervention_used: Optional[str] = None
    outcome: Optional[str] = None
    notes: Optional[str] = None
    duration_minutes: Optional[int] = None
    event_time: Optional[str] = None

    class Settings:
        name = "behavior_logs"
        use_state_management = True

    def __repr__(self) -> str:
        return f"<BehaviorLog {self.emotion} for child {self.child_id}>"
