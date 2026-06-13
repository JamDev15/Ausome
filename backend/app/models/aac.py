from typing import Optional
from beanie import PydanticObjectId
from app.db.base import BaseDocument


class AACCategory(BaseDocument):
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    position: int = 0
    is_default: bool = False
    child_id: Optional[PydanticObjectId] = None  # None = global default

    class Settings:
        name = "aac_categories"
        use_state_management = True

    def __repr__(self) -> str:
        return f"<AACCategory {self.name}>"


class AACItem(BaseDocument):
    category_id: PydanticObjectId
    label: str
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    audio_text: Optional[str] = None
    position: int = 0
    is_favorite: bool = False
    use_count: int = 0
    color: Optional[str] = None
    child_id: Optional[PydanticObjectId] = None  # None = global

    class Settings:
        name = "aac_items"
        use_state_management = True

    def __repr__(self) -> str:
        return f"<AACItem {self.label}>"
