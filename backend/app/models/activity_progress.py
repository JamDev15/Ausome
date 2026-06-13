from typing import Dict, List, Optional
from datetime import datetime
from beanie import PydanticObjectId
from app.db.base import BaseDocument


class ActivityProgress(BaseDocument):
    child_id: PydanticObjectId
    activity_type: str  # counting | alphabet | colors | shapes | connect | drawing
    completed_stages: List[int] = []
    total_sessions: int = 0
    high_scores: Dict[str, int] = {}  # "stage_1" -> best score
    last_played_at: Optional[datetime] = None

    class Settings:
        name = "activity_progress"
        use_state_management = True
