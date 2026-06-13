import enum
from typing import Optional
from beanie import PydanticObjectId
from app.db.base import BaseDocument


class GoalDomain(str, enum.Enum):
    SPEECH = "speech"
    OT = "ot"
    BEHAVIOR = "behavior"
    SENSORY = "sensory"
    TOILETING = "toileting"
    LIFE_SKILLS = "life_skills"
    SOCIAL = "social"
    ACADEMIC = "academic"
    COMMUNICATION = "communication"
    MOTOR = "motor"
    CUSTOM = "custom"


class GoalStatus(str, enum.Enum):
    ACTIVE = "active"
    MASTERED = "mastered"
    ON_HOLD = "on_hold"
    DISCONTINUED = "discontinued"


class Goal(BaseDocument):
    child_id: PydanticObjectId
    created_by_id: Optional[PydanticObjectId] = None
    title: str
    description: Optional[str] = None
    domain: GoalDomain
    status: GoalStatus = GoalStatus.ACTIVE
    baseline: Optional[str] = None
    target: Optional[str] = None
    measurement_method: Optional[str] = None
    frequency: Optional[str] = None
    target_date: Optional[str] = None
    mastered_date: Optional[str] = None
    current_percentage: float = 0.0

    class Settings:
        name = "goals"
        use_state_management = True

    def __repr__(self) -> str:
        return f"<Goal {self.title[:40]}>"


class ProgressEntry(BaseDocument):
    goal_id: PydanticObjectId
    child_id: PydanticObjectId
    logged_by_id: Optional[PydanticObjectId] = None
    percentage: float
    trials_attempted: Optional[int] = None
    trials_successful: Optional[int] = None
    prompt_level: Optional[str] = None
    notes: Optional[str] = None
    session_date: Optional[str] = None

    class Settings:
        name = "progress_entries"
        use_state_management = True
