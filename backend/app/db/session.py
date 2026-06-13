from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings


async def init_db():
    """Initialize MongoDB connection and Beanie ODM."""
    from app.models.user import User, LoginEvent
    from app.models.child_profile import ChildProfile
    from app.models.behavior_log import BehaviorLog
    from app.models.schedule import ScheduleTemplate
    from app.models.aac import AACCategory, AACItem
    from app.models.reward import Reward, RewardTransaction, DailyStreak
    from app.models.goal import Goal, ProgressEntry
    from app.models.note import CaregiverNote
    from app.models.audit_log import AuditLog
    from app.models.ai_conversation import AIConversation, AIMessage
    from app.models.flashcard import Flashcard, FlashcardDeck
    from app.models.task import Task
    from app.models.activity_progress import ActivityProgress
    from app.models.medicine import MedicineReminder, MedicineDose
    from app.models.episode_log import EpisodeLog
    from app.models.password_reset import PasswordResetCode
    from app.models.onboarding import OnboardingSurvey, GeneratedRoutine, GeneratedGoals

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB]

    await init_beanie(
        database=db,
        document_models=[
            User,
            LoginEvent,
            ChildProfile,
            BehaviorLog,
            ScheduleTemplate,
            AACCategory,
            AACItem,
            Reward,
            RewardTransaction,
            DailyStreak,
            Goal,
            ProgressEntry,
            CaregiverNote,
            AuditLog,
            AIConversation,
            AIMessage,
            Flashcard,
            FlashcardDeck,
            Task,
            ActivityProgress,
            MedicineReminder,
            MedicineDose,
            EpisodeLog,
            PasswordResetCode,
            OnboardingSurvey,
            GeneratedRoutine,
            GeneratedGoals,
        ],
    )
