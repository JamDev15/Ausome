from typing import Optional
from fastapi import APIRouter, Depends, Query
from beanie import PydanticObjectId
from beanie.operators import Or

from app.core.deps import get_current_user
from app.models.user import User
from app.models.flashcard import FlashcardDeck

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])


@router.get("/sets")
async def list_sets(
    child_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
):
    cid = PydanticObjectId(child_id) if child_id else None
    decks = await FlashcardDeck.find(
        Or(FlashcardDeck.is_default == True, FlashcardDeck.child_id == cid)
    ).to_list()

    return [
        {
            "id": str(deck.id),
            "title": deck.title,
            "description": deck.description,
            "category": deck.category,
            "color": deck.color,
            "is_default": deck.is_default,
            "cards": [
                {
                    "word": c.word,
                    "description": c.description,
                    "example": c.example,
                    "audio_text": c.audio_text,
                    "image_url": c.image_url,
                    "position": c.position,
                }
                for c in sorted(deck.cards, key=lambda x: x.position)
            ],
        }
        for deck in decks
    ]
