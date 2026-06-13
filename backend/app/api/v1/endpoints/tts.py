import base64
from fastapi import APIRouter, Depends, Query
from openai import AsyncOpenAI

from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tts", tags=["TTS"])

_client: AsyncOpenAI | None = None


def _get_openai() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


@router.get("/speak")
async def speak(
    text: str = Query(..., max_length=500),
    _: User = Depends(get_current_user),
):
    client = _get_openai()
    response = await client.audio.speech.create(
        model="tts-1",
        voice="nova",
        input=text.strip(),
        speed=0.9,
    )
    audio_b64 = base64.b64encode(response.content).decode()
    return {"audio": audio_b64}
