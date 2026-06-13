import enum
from typing import Optional
from datetime import datetime
from beanie import PydanticObjectId
from app.db.base import BaseDocument


class EpisodeType(str, enum.Enum):
    SEIZURE = "seizure"
    ABSENCE = "absence"       # absence seizure (blank stare)
    EPILEPSY = "epilepsy"
    MELTDOWN = "meltdown"
    PANIC = "panic"
    FEVER = "fever"
    INJURY = "injury"
    OTHER = "other"


class EpisodeSeverity(str, enum.Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"


class EpisodeLog(BaseDocument):
    child_id: PydanticObjectId
    logged_by_id: Optional[PydanticObjectId] = None
    episode_type: EpisodeType
    started_at: datetime
    duration_minutes: Optional[int] = None
    severity: Optional[EpisodeSeverity] = None
    triggers: Optional[str] = None          # what happened before
    symptoms: Optional[str] = None          # what was observed
    intervention: Optional[str] = None     # what helped / was done
    outcome: Optional[str] = None
    emergency_called: bool = False
    notes: Optional[str] = None

    class Settings:
        name = "episode_logs"
        use_state_management = True
