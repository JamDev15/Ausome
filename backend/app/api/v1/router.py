from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, children, behavior_logs, schedules,
    aac, rewards, goals, notes, admin, ai_assistant,
    flashcards, tasks, activities, medicine, episodes, tts,
    onboarding, subscription,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(onboarding.router)
api_router.include_router(children.router)
api_router.include_router(behavior_logs.router)
api_router.include_router(schedules.router)
api_router.include_router(aac.router)
api_router.include_router(rewards.router)
api_router.include_router(goals.router)
api_router.include_router(notes.router)
api_router.include_router(admin.router)
api_router.include_router(ai_assistant.router)
api_router.include_router(flashcards.router)
api_router.include_router(tasks.router)
api_router.include_router(activities.router)
api_router.include_router(medicine.router)
api_router.include_router(episodes.router)
api_router.include_router(tts.router)
api_router.include_router(subscription.router)
