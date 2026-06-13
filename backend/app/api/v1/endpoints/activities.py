from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends
from beanie import PydanticObjectId
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.models.user import User
from app.models.activity_progress import ActivityProgress

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.get("/{child_id}/progress")
async def get_progress(
    child_id: str,
    current_user: User = Depends(get_current_user),
):
    records = await ActivityProgress.find(
        ActivityProgress.child_id == PydanticObjectId(child_id)
    ).to_list()

    return {
        r.activity_type: {
            "completed_stages": r.completed_stages,
            "total_sessions": r.total_sessions,
            "high_scores": r.high_scores,
            "last_played_at": r.last_played_at.isoformat() if r.last_played_at else None,
        }
        for r in records
    }


class CompleteStageBody(BaseModel):
    child_id: str
    activity_type: str
    stage: int
    score: Optional[int] = None


@router.post("/progress/complete")
async def complete_stage(
    body: CompleteStageBody,
    current_user: User = Depends(get_current_user),
):
    child_oid = PydanticObjectId(body.child_id)
    record = await ActivityProgress.find_one(
        ActivityProgress.child_id == child_oid,
        ActivityProgress.activity_type == body.activity_type,
    )

    if not record:
        record = ActivityProgress(child_id=child_oid, activity_type=body.activity_type)
        await record.insert()

    if body.stage not in record.completed_stages:
        record.completed_stages.append(body.stage)
        record.completed_stages.sort()

    record.total_sessions += 1
    record.last_played_at = datetime.now(timezone.utc)

    if body.score is not None:
        key = f"stage_{body.stage}"
        record.high_scores[key] = max(record.high_scores.get(key, 0), body.score)

    await record.save()
    return {"ok": True, "completed_stages": record.completed_stages}
