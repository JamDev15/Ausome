import enum
from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from app.db.base import BaseDocument


class RoutineType(str, enum.Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    CUSTOM = "custom"


class ScheduleItem(BaseModel):
    """Embedded document inside ScheduleTemplate."""
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    position: int = 0
    duration_minutes: Optional[int] = None
    is_completed: bool = False
    completed_at: Optional[str] = None


class ScheduleTemplate(BaseDocument):
    child_id: PydanticObjectId
    created_by_id: Optional[PydanticObjectId] = None
    title: str
    routine_type: RoutineType
    description: Optional[str] = None
    is_active: bool = True
    is_recurring: bool = True
    days_of_week: Optional[List[int]] = None  # [0=Mon..6=Sun]
    color: Optional[str] = None
    items: List[ScheduleItem] = Field(default_factory=list)

    class Settings:
        name = "schedule_templates"
        use_state_management = True

    def __repr__(self) -> str:
        return f"<ScheduleTemplate {self.title}>"
