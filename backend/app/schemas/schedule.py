from typing import Any, Optional, List
from datetime import datetime
from pydantic import BaseModel, field_validator
from app.models.schedule import RoutineType


class ScheduleItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    position: int = 0
    duration_minutes: Optional[int] = None


class ScheduleItemUpdate(ScheduleItemCreate):
    title: Optional[str] = None
    is_completed: Optional[bool] = None
    completed_at: Optional[str] = None


class ScheduleItemResponse(ScheduleItemCreate):
    id: Optional[str] = None
    is_completed: bool = False
    completed_at: Optional[str] = None
    template_id: Optional[str] = None

    model_config = {"from_attributes": True}

    @field_validator('id', 'template_id', mode='before')
    @classmethod
    def coerce_objectid(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None


class ScheduleTemplateCreate(BaseModel):
    child_id: str
    title: str
    routine_type: RoutineType
    description: Optional[str] = None
    is_recurring: bool = True
    days_of_week: Optional[List[int]] = None
    color: Optional[str] = None
    items: List[ScheduleItemCreate] = []


class ScheduleTemplateResponse(BaseModel):
    id: str
    child_id: str
    title: str
    routine_type: RoutineType
    description: Optional[str] = None
    is_active: bool
    is_recurring: bool
    days_of_week: Optional[List[int]] = None
    color: Optional[str] = None
    created_at: datetime
    items: List[ScheduleItemResponse] = []

    model_config = {"from_attributes": True}

    @field_validator('id', 'child_id', mode='before')
    @classmethod
    def coerce_objectid(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None
