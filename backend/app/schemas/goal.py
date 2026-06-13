from typing import Any, Optional, List
from datetime import datetime
from pydantic import BaseModel, field_validator
from app.models.goal import GoalDomain, GoalStatus


class ProgressEntryCreate(BaseModel):
    goal_id: str
    child_id: str
    percentage: float
    trials_attempted: Optional[int] = None
    trials_successful: Optional[int] = None
    prompt_level: Optional[str] = None
    notes: Optional[str] = None
    session_date: Optional[str] = None


class ProgressEntryResponse(ProgressEntryCreate):
    id: str
    logged_by_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator('id', 'goal_id', 'child_id', 'logged_by_id', mode='before')
    @classmethod
    def coerce_objectid(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None


class GoalCreate(BaseModel):
    child_id: str
    title: str
    description: Optional[str] = None
    domain: GoalDomain
    baseline: Optional[str] = None
    target: Optional[str] = None
    measurement_method: Optional[str] = None
    frequency: Optional[str] = None
    target_date: Optional[str] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[GoalStatus] = None
    target: Optional[str] = None
    current_percentage: Optional[float] = None
    mastered_date: Optional[str] = None


class GoalResponse(GoalCreate):
    id: str
    status: GoalStatus
    current_percentage: float
    mastered_date: Optional[str] = None
    created_at: datetime
    progress_entries: List[ProgressEntryResponse] = []

    model_config = {"from_attributes": True}

    @field_validator('id', 'child_id', mode='before')
    @classmethod
    def coerce_objectid(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None
