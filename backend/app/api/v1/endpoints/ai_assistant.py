from typing import List
from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId

from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.ai_conversation import AIConversation, AIMessage, MessageRole
from app.schemas.ai_assistant import ChatRequest, ChatResponse, ConversationResponse
from app.services.ai_service import get_ai_response, DISCLAIMER

router = APIRouter(prefix="/ai", tags=["AI Caregiver Support"])

CAREGIVER_ROLES = {UserRole.ADMIN, UserRole.PARENT, UserRole.THERAPIST, UserRole.CAREGIVER}


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in CAREGIVER_ROLES:
        raise HTTPException(403, "AI assistant is for caregivers only")

    conversation: AIConversation | None = None
    if payload.conversation_id:
        try:
            conversation = await AIConversation.find_one(
                AIConversation.id == PydanticObjectId(payload.conversation_id),
                AIConversation.user_id == current_user.id,
            )
        except Exception:
            conversation = None

    if not conversation:
        cid = PydanticObjectId(payload.child_id) if payload.child_id else None
        conversation = AIConversation(
            user_id=current_user.id,
            child_id=cid,
            title=payload.message[:60],
        )
        await conversation.insert()

    history_msgs = await AIMessage.find(
        AIMessage.conversation_id == conversation.id
    ).sort("created_at").limit(20).to_list()
    history = [{"role": msg.role.value, "content": msg.content} for msg in history_msgs]

    user_msg = AIMessage(
        conversation_id=conversation.id,
        role=MessageRole.USER,
        content=payload.message,
    )
    await user_msg.insert()

    ai_text = await get_ai_response(payload.message, history)

    ai_msg = AIMessage(
        conversation_id=conversation.id,
        role=MessageRole.ASSISTANT,
        content=ai_text,
    )
    await ai_msg.insert()

    conversation.message_count = (conversation.message_count or 0) + 2
    await conversation.save()

    return ChatResponse(
        conversation_id=str(conversation.id),
        message=ai_text,
        disclaimer=DISCLAIMER,
    )


@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(current_user: User = Depends(get_current_user)):
    convos = await AIConversation.find(
        AIConversation.user_id == current_user.id,
        AIConversation.is_active == True,
    ).sort("-created_at").limit(20).to_list()
    return convos
