from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId

from app.core.deps import get_current_user
from app.models.user import User
from app.models.child_profile import ChildProfile
from app.models.onboarding import OnboardingSurvey, GeneratedRoutine, GeneratedGoals
from app.schemas.onboarding import (
    LanguageRequest, SurveyPayload,
    RoutineBlockOut, ParentGoalOut, OnboardingCompleteResponse,
)
from app.services.routine_generator import generate_routine
from app.services.goals_generator import generate_goals

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.post("/language", status_code=200)
async def set_language(
    payload: LanguageRequest,
    current_user: User = Depends(get_current_user),
):
    if payload.language not in ("en", "tl"):
        raise HTTPException(400, "language must be 'en' or 'tl'")
    current_user.preferred_language = payload.language
    await current_user.save()
    return {"preferred_language": current_user.preferred_language}


@router.post("/survey", status_code=200)
async def save_survey(
    payload: SurveyPayload,
    current_user: User = Depends(get_current_user),
):
    """Upsert partial or full survey progress."""
    survey = await OnboardingSurvey.find_one({"user_id": current_user.id})
    if not survey:
        survey = OnboardingSurvey(user_id=current_user.id)

    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(survey, field, val)

    await survey.save()
    return {"saved": True, "current_step": survey.current_step}


@router.get("/survey", status_code=200)
async def get_survey(current_user: User = Depends(get_current_user)):
    """Fetch saved survey progress for resume."""
    survey = await OnboardingSurvey.find_one({"user_id": current_user.id})
    if not survey:
        return {}
    return survey.model_dump()


@router.post("/complete", response_model=OnboardingCompleteResponse)
async def complete_onboarding(
    current_user: User = Depends(get_current_user),
):
    """Finalize survey, generate routine + goals, mark user onboarding done."""
    survey = await OnboardingSurvey.find_one({"user_id": current_user.id})
    if not survey:
        raise HTTPException(400, "No survey found. Complete the survey first.")

    # Create or update ChildProfile from survey data
    child = None
    if survey.child_id:
        child = await ChildProfile.get(survey.child_id)

    if not child and survey.child_name:
        child = ChildProfile(
            primary_caregiver_id=current_user.id,
            full_name=survey.child_name,
            age=survey.child_age,
        )
        await child.insert()
        survey.child_id = child.id
        await survey.save()

    child_id = child.id if child else None

    # Generate routine
    routine_blocks = generate_routine(
        child_age=survey.child_age,
        communication_level=survey.communication_level,
        challenges=survey.challenges,
        strengths=survey.strengths,
        wake_time=survey.wake_time or "07:00",
        school_start=survey.school_start,
        school_end=survey.school_end,
        bedtime=survey.bedtime or "20:00",
    )

    # Persist generated routine
    existing_routine = await GeneratedRoutine.find_one({"user_id": current_user.id})
    if existing_routine:
        existing_routine.blocks = routine_blocks
        existing_routine.child_age = survey.child_age
        existing_routine.communication_level = survey.communication_level
        existing_routine.generated_at = datetime.now(timezone.utc)
        if child_id:
            existing_routine.child_id = child_id
        await existing_routine.save()
    elif child_id:
        await GeneratedRoutine(
            user_id=current_user.id,
            child_id=child_id,
            child_age=survey.child_age,
            communication_level=survey.communication_level,
            blocks=routine_blocks,
        ).insert()

    # Generate goals
    goal_list = generate_goals(
        parent_goals=survey.parent_goals,
        challenges=survey.challenges,
        communication_level=survey.communication_level,
    )

    # Persist generated goals
    existing_goals = await GeneratedGoals.find_one({"user_id": current_user.id})
    if existing_goals:
        existing_goals.goals = goal_list
        existing_goals.generated_at = datetime.now(timezone.utc)
        if child_id:
            existing_goals.child_id = child_id
        await existing_goals.save()
    elif child_id:
        await GeneratedGoals(
            user_id=current_user.id,
            child_id=child_id,
            goals=goal_list,
        ).insert()

    # Mark survey and user done
    survey.completed = True
    survey.completed_at = datetime.now(timezone.utc)
    await survey.save()

    current_user.onboarding_completed = True
    await current_user.save()

    return OnboardingCompleteResponse(
        routine=[RoutineBlockOut(**b.model_dump()) for b in routine_blocks],
        goals=[ParentGoalOut(**g.model_dump()) for g in goal_list],
        child_id=str(child_id) if child_id else None,
    )


@router.get("/routine", response_model=List[RoutineBlockOut])
async def get_routine(
    child_id: str | None = None,
    current_user: User = Depends(get_current_user),
):
    if child_id:
        try:
            cid = PydanticObjectId(child_id)
        except Exception:
            return []
        routine = await GeneratedRoutine.find_one({"child_id": cid})
    else:
        routine = await GeneratedRoutine.find_one({"user_id": current_user.id})
    if not routine:
        return []
    return [RoutineBlockOut(**b.model_dump()) for b in routine.blocks]


@router.get("/goals", response_model=List[ParentGoalOut])
async def get_goals(
    child_id: str | None = None,
    current_user: User = Depends(get_current_user),
):
    if child_id:
        try:
            cid = PydanticObjectId(child_id)
        except Exception:
            return []
        goals = await GeneratedGoals.find_one({"child_id": cid})
    else:
        goals = await GeneratedGoals.find_one({"user_id": current_user.id})
    if not goals:
        return []
    return [ParentGoalOut(**g.model_dump()) for g in goals.goals]
