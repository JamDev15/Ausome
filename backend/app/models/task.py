import enum
from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from app.db.base import BaseDocument


class TaskDomain(str, enum.Enum):
    HYGIENE = "hygiene"
    DRESSING = "dressing"
    EATING = "eating"
    TOILETING = "toileting"
    CLEANING = "cleaning"
    COMMUNICATION = "communication"
    SOCIAL = "social"
    ACADEMIC = "academic"
    LEISURE = "leisure"
    SAFETY = "safety"
    CUSTOM = "custom"


class PromptLevel(str, enum.Enum):
    INDEPENDENT = "independent"
    VERBAL = "verbal"
    GESTURAL = "gestural"
    MODEL = "model"
    PARTIAL_PHYSICAL = "partial_physical"
    FULL_PHYSICAL = "full_physical"


class TaskStep(BaseModel):
    """Embedded step inside Task."""
    title: str
    instruction: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    position: int = 0


class Task(BaseDocument):
    child_id: Optional[PydanticObjectId] = None
    created_by_id: Optional[PydanticObjectId] = None
    title: str
    description: Optional[str] = None
    domain: TaskDomain
    image_url: Optional[str] = None
    is_template: bool = False
    is_active: bool = True
    token_reward: int = 1
    steps: List[TaskStep] = Field(default_factory=list)

    class Settings:
        name = "tasks"
        use_state_management = True

    def __repr__(self) -> str:
        return f"<Task {self.title}>"


class TaskCompletion(BaseDocument):
    task_id: PydanticObjectId
    child_id: PydanticObjectId
    logged_by_id: Optional[PydanticObjectId] = None
    prompt_level: Optional[PromptLevel] = None
    steps_completed: int = 0
    total_steps: int = 0
    notes: Optional[str] = None
    tokens_earned: int = 0

    class Settings:
        name = "task_completions"
        use_state_management = True
