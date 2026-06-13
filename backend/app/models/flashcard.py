from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from app.db.base import BaseDocument


class FlashcardCard(BaseModel):
    """Embedded card inside FlashcardDeck."""
    word: str
    description: Optional[str] = None
    example: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    audio_text: Optional[str] = None
    position: int = 0


class FlashcardDeck(BaseDocument):
    title: str
    description: Optional[str] = None
    category: str  # emotions, objects, routines, etc.
    icon: Optional[str] = None
    color: Optional[str] = None
    is_default: bool = False
    child_id: Optional[PydanticObjectId] = None
    created_by_id: Optional[PydanticObjectId] = None
    cards: List[FlashcardCard] = Field(default_factory=list)

    class Settings:
        name = "flashcard_decks"
        use_state_management = True

    def __repr__(self) -> str:
        return f"<FlashcardDeck {self.title}>"


# Keep Flashcard as a standalone document too for individual card queries
class Flashcard(BaseDocument):
    deck_id: PydanticObjectId
    word: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    audio_text: Optional[str] = None
    position: int = 0

    class Settings:
        name = "flashcards"
        use_state_management = True
