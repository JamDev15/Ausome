import enum
from typing import Optional
from beanie import PydanticObjectId
from app.db.base import BaseDocument


class RewardType(str, enum.Enum):
    ACTIVITY = "activity"
    ITEM = "item"
    PRIVILEGE = "privilege"
    PRAISE = "praise"
    SCREEN_TIME = "screen_time"
    CUSTOM = "custom"


class Reward(BaseDocument):
    child_id: PydanticObjectId
    created_by_id: Optional[PydanticObjectId] = None
    title: str
    description: Optional[str] = None
    reward_type: RewardType
    token_cost: int = 5
    image_url: Optional[str] = None
    is_active: bool = True

    class Settings:
        name = "rewards"
        use_state_management = True


class RewardTransaction(BaseDocument):
    child_id: PydanticObjectId
    reward_id: Optional[PydanticObjectId] = None
    logged_by_id: Optional[PydanticObjectId] = None
    token_delta: int  # positive = earned, negative = redeemed
    reason: Optional[str] = None
    source: str = "task"

    class Settings:
        name = "reward_transactions"
        use_state_management = True


class DailyStreak(BaseDocument):
    child_id: PydanticObjectId
    current_streak: int = 0
    longest_streak: int = 0
    last_activity_date: Optional[str] = None
    total_tokens_earned: int = 0
    total_tokens_redeemed: int = 0

    class Settings:
        name = "daily_streaks"
        use_state_management = True
