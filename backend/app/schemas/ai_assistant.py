from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # user | assistant
    content: str


class ChatRequest(BaseModel):
    message: str
    child_id: Optional[str] = None
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    disclaimer: str = (
        "This tool provides educational support and caregiver guidance only. "
        "It is not a replacement for licensed medical or therapeutic care."
    )


class ConversationResponse(BaseModel):
    id: str
    title: Optional[str] = None
    message_count: int
    created_at: datetime
    messages: List[ChatMessage] = []

    model_config = {"from_attributes": True}
