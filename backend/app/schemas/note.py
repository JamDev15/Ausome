from typing import Any, Optional, List
from datetime import datetime
from pydantic import BaseModel, field_validator


class NoteCreate(BaseModel):
    child_id: str
    title: Optional[str] = None
    content: str
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    session_date: Optional[str] = None
    is_pinned: bool = False


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_pinned: Optional[bool] = None


class NoteResponse(NoteCreate):
    id: str
    author_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_validator('id', 'child_id', 'author_id', mode='before')
    @classmethod
    def coerce_objectid(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None
