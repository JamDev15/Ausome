from typing import Optional, List
from datetime import datetime, timezone
from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from app.db.base import BaseDocument


class RoutineBlock(BaseModel):
    time_range: str           # "07:00-07:30"
    activity_key: str         # "routine.morning_wake"
    duration_minutes: int
    category: str             # "morning"|"midday"|"afternoon"|"evening"
    tip_key: str              # "tips.visual_schedule_tip"
    why_key: str              # "why.predictable_start"
    icon_key: str             # Ionicons name, language-independent


class GeneratedRoutine(BaseDocument):
    user_id: PydanticObjectId
    child_id: PydanticObjectId
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    child_age: Optional[int] = None
    communication_level: Optional[str] = None
    blocks: List[RoutineBlock] = Field(default_factory=list)

    class Settings:
        name = "generated_routines"


class ParentGoal(BaseModel):
    goal_key: str             # "improve_sleep_routine"
    order: int                # 1-3
    frequency: str
    target_days: int = 30


class GeneratedGoals(BaseDocument):
    user_id: PydanticObjectId
    child_id: PydanticObjectId
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    goals: List[ParentGoal] = Field(default_factory=list)

    class Settings:
        name = "generated_goals"


class OnboardingSurvey(BaseDocument):
    user_id: PydanticObjectId
    child_id: Optional[PydanticObjectId] = None
    current_step: int = 0
    completed: bool = False
    completed_at: Optional[datetime] = None

    # Step responses (language-independent data)
    child_name: Optional[str] = None
    child_age: Optional[int] = None
    diagnosis_year: Optional[int] = None
    communication_level: Optional[str] = None    # "nonverbal"|"minimal"|"verbal"|"fluent"|"aac"
    challenges: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    strengths_freetext: Optional[str] = None
    wake_time: Optional[str] = None              # "HH:MM"
    school_start: Optional[str] = None
    school_end: Optional[str] = None
    bedtime: Optional[str] = None
    screen_time: Optional[str] = None           # "none"|"30min"|"1h"|"2h"|"more"
    parent_goals: List[str] = Field(default_factory=list)
    support_system: List[str] = Field(default_factory=list)

    class Settings:
        name = "onboarding_surveys"
