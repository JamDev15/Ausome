from typing import Optional, List
from pydantic import BaseModel


class AACItemCreate(BaseModel):
    category_id: str
    label: str
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    audio_text: Optional[str] = None
    position: int = 0
    color: Optional[str] = None
    child_id: Optional[str] = None


class AACItemResponse(AACItemCreate):
    id: str
    is_favorite: bool
    use_count: int

    model_config = {"from_attributes": True}


class AACCategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    position: int = 0
    child_id: Optional[str] = None


class AACCategoryResponse(AACCategoryCreate):
    id: str
    is_default: bool
    items: List[AACItemResponse] = []

    model_config = {"from_attributes": True}


class AACUsageUpdate(BaseModel):
    item_id: str
