from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import Field
from app.db.base import BaseDocument


class CaregiverNote(BaseDocument):
    child_id: PydanticObjectId
    author_id: PydanticObjectId
    title: Optional[str] = None
    content: str
    category: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    session_date: Optional[str] = None
    is_pinned: bool = False

    class Settings:
        name = "caregiver_notes"
        use_state_management = True

    def __repr__(self) -> str:
        return f"<CaregiverNote by {self.author_id} for child {self.child_id}>"
