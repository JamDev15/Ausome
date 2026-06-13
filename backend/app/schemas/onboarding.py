from typing import Optional, List
from pydantic import BaseModel


class LanguageRequest(BaseModel):
    language: str   # "en" | "tl"


class SurveyPayload(BaseModel):
    child_name: Optional[str] = None
    child_age: Optional[int] = None
    diagnosis_year: Optional[int] = None
    communication_level: Optional[str] = None
    challenges: List[str] = []
    strengths: List[str] = []
    strengths_freetext: Optional[str] = None
    wake_time: Optional[str] = None
    school_start: Optional[str] = None
    school_end: Optional[str] = None
    bedtime: Optional[str] = None
    screen_time: Optional[str] = None
    parent_goals: List[str] = []
    support_system: List[str] = []
    current_step: int = 0


class RoutineBlockOut(BaseModel):
    time_range: str
    activity_key: str
    duration_minutes: int
    category: str
    tip_key: str
    why_key: str
    icon_key: str


class ParentGoalOut(BaseModel):
    goal_key: str
    order: int
    frequency: str
    target_days: int


class OnboardingCompleteResponse(BaseModel):
    routine: List[RoutineBlockOut]
    goals: List[ParentGoalOut]
    child_id: Optional[str] = None
