from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from beanie import PydanticObjectId

from app.core.deps import get_current_user
from app.models.user import User
from app.models.goal import Goal, ProgressEntry
from app.schemas.goal import (
    GoalCreate, GoalUpdate, GoalResponse,
    ProgressEntryCreate, ProgressEntryResponse,
)
from app.services.audit_service import log_action

router = APIRouter(prefix="/goals", tags=["Goals & Progress"])


@router.get("/", response_model=List[GoalResponse])
async def list_goals(
    child_id: str = Query(...),
    current_user: User = Depends(get_current_user),
):
    goals = await Goal.find(
        Goal.child_id == PydanticObjectId(child_id)
    ).sort("-created_at").to_list()
    return goals


@router.post("/", response_model=GoalResponse, status_code=201)
async def create_goal(
    payload: GoalCreate,
    current_user: User = Depends(get_current_user),
):
    goal = Goal(**payload.model_dump(), created_by_id=current_user.id)
    await goal.insert()
    await log_action("goal.create", user_id=str(current_user.id), resource_id=str(goal.id))
    return goal


@router.patch("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: str,
    payload: GoalUpdate,
    current_user: User = Depends(get_current_user),
):
    goal = await Goal.get(PydanticObjectId(goal_id))
    if not goal:
        raise HTTPException(404, "Goal not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, key, value)
    await goal.save()
    return goal


@router.post("/progress", response_model=ProgressEntryResponse, status_code=201)
async def add_progress(
    payload: ProgressEntryCreate,
    current_user: User = Depends(get_current_user),
):
    entry = ProgressEntry(**payload.model_dump(), logged_by_id=current_user.id)
    await entry.insert()

    goal = await Goal.get(PydanticObjectId(payload.goal_id))
    if goal:
        goal.current_percentage = payload.percentage
        await goal.save()

    return entry
