import enum
from typing import Optional
from beanie import PydanticObjectId
from app.db.base import BaseDocument


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class AIConversation(BaseDocument):
    user_id: PydanticObjectId
    child_id: Optional[PydanticObjectId] = None
    title: Optional[str] = None
    is_active: bool = True
    message_count: int = 0

    class Settings:
        name = "ai_conversations"
        use_state_management = True


class AIMessage(BaseDocument):
    conversation_id: PydanticObjectId
    role: MessageRole
    content: str
    is_flagged: bool = False
    flag_reason: Optional[str] = None

    class Settings:
        name = "ai_messages"
        use_state_management = True
