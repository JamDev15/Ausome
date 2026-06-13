from typing import Any, Optional, List
from datetime import datetime
from pydantic import BaseModel, field_validator
from app.models.behavior_log import EmotionType, BehaviorSeverity


class BehaviorLogCreate(BaseModel):
    child_id: str
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


class BehaviorLogResponse(BehaviorLogCreate):
    id: str
    logged_by_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator('id', 'child_id', 'logged_by_id', mode='before')
    @classmethod
    def coerce_objectid(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None


class BehaviorTrendPoint(BaseModel):
    date: str
    emotion: str
    count: int


class BehaviorSummary(BaseModel):
    total_logs: int
    most_common_emotion: Optional[str] = None
    most_common_trigger: Optional[str] = None
    trend: List[BehaviorTrendPoint] = []
