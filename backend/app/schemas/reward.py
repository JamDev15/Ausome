from typing import Any, Optional
from datetime import datetime
from pydantic import BaseModel, field_validator
from app.models.reward import RewardType


class RewardCreate(BaseModel):
    child_id: str
    title: str
    description: Optional[str] = None
    reward_type: RewardType
    token_cost: int = 5
    image_url: Optional[str] = None


class RewardResponse(RewardCreate):
    id: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator('id', 'child_id', mode='before')
    @classmethod
    def coerce_objectid(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None


class RewardTransactionCreate(BaseModel):
    child_id: str
    reward_id: Optional[str] = None
    token_delta: int
    reason: Optional[str] = None
    source: str = "task"


class RewardTransactionResponse(RewardTransactionCreate):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator('id', 'child_id', 'reward_id', mode='before')
    @classmethod
    def coerce_objectid(cls, v: Any) -> Optional[str]:
        return str(v) if v is not None else None


class TokenBalanceResponse(BaseModel):
    child_id: str
    current_balance: int
    current_streak: int
    longest_streak: int
    total_earned: int
    total_redeemed: int
