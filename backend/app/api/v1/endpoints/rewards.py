from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from beanie import PydanticObjectId

from app.core.deps import get_current_user
from app.models.user import User
from app.models.reward import Reward, RewardTransaction, DailyStreak
from app.schemas.reward import (
    RewardCreate, RewardResponse,
    RewardTransactionCreate, RewardTransactionResponse,
    TokenBalanceResponse,
)

router = APIRouter(prefix="/rewards", tags=["Rewards & Tokens"])


@router.get("/", response_model=List[RewardResponse])
async def list_rewards(
    child_id: str = Query(...),
    current_user: User = Depends(get_current_user),
):
    rewards = await Reward.find(
        Reward.child_id == PydanticObjectId(child_id),
        Reward.is_active == True,
    ).to_list()
    return rewards


@router.post("/", response_model=RewardResponse, status_code=201)
async def create_reward(
    payload: RewardCreate,
    current_user: User = Depends(get_current_user),
):
    reward = Reward(**payload.model_dump(), created_by_id=current_user.id)
    await reward.insert()
    return reward


@router.post("/transactions", response_model=RewardTransactionResponse, status_code=201)
async def add_transaction(
    payload: RewardTransactionCreate,
    current_user: User = Depends(get_current_user),
):
    tx = RewardTransaction(**payload.model_dump(), logged_by_id=current_user.id)
    await tx.insert()

    cid = PydanticObjectId(payload.child_id) if isinstance(payload.child_id, str) else payload.child_id
    streak = await DailyStreak.find_one(DailyStreak.child_id == cid)
    today = datetime.now(timezone.utc).date().isoformat()

    if not streak:
        streak = DailyStreak(child_id=cid)

    if payload.token_delta > 0:
        streak.total_tokens_earned = (streak.total_tokens_earned or 0) + payload.token_delta
        if streak.last_activity_date != today:
            streak.current_streak = (streak.current_streak or 0) + 1
            streak.last_activity_date = today
            if streak.current_streak > (streak.longest_streak or 0):
                streak.longest_streak = streak.current_streak
    elif payload.token_delta < 0:
        streak.total_tokens_redeemed = (streak.total_tokens_redeemed or 0) + abs(payload.token_delta)

    await streak.save()
    return tx


@router.get("/balance", response_model=TokenBalanceResponse)
async def get_balance(
    child_id: str = Query(...),
    current_user: User = Depends(get_current_user),
):
    cid = PydanticObjectId(child_id)
    transactions = await RewardTransaction.find(
        RewardTransaction.child_id == cid
    ).to_list()
    balance = sum(tx.token_delta for tx in transactions)

    streak = await DailyStreak.find_one(DailyStreak.child_id == cid)

    return TokenBalanceResponse(
        child_id=child_id,
        current_balance=balance,
        current_streak=streak.current_streak if streak else 0,
        longest_streak=streak.longest_streak if streak else 0,
        total_earned=streak.total_tokens_earned if streak else 0,
        total_redeemed=streak.total_tokens_redeemed if streak else 0,
    )
