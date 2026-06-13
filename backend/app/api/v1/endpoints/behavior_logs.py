from typing import List
from collections import Counter
from fastapi import APIRouter, Depends, Query
from beanie import PydanticObjectId

from app.core.deps import get_current_user
from app.models.user import User
from app.models.behavior_log import BehaviorLog
from app.schemas.behavior_log import BehaviorLogCreate, BehaviorLogResponse, BehaviorSummary

router = APIRouter(prefix="/behavior-logs", tags=["Behavior & Emotion Logs"])


@router.post("/", response_model=BehaviorLogResponse, status_code=201)
async def create_log(
    payload: BehaviorLogCreate,
    current_user: User = Depends(get_current_user),
):
    log = BehaviorLog(
        **payload.model_dump(exclude={'child_id'}),
        child_id=PydanticObjectId(payload.child_id),
        logged_by_id=current_user.id,
    )
    await log.insert()
    return log


@router.get("/", response_model=List[BehaviorLogResponse])
async def list_logs(
    child_id: str = Query(...),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    current_user: User = Depends(get_current_user),
):
    logs = await BehaviorLog.find(
        BehaviorLog.child_id == PydanticObjectId(child_id)
    ).sort("-created_at").skip(offset).limit(limit).to_list()
    return logs


@router.get("/summary", response_model=BehaviorSummary)
async def behavior_summary(
    child_id: str = Query(...),
    days: int = Query(30, le=365),
    current_user: User = Depends(get_current_user),
):
    logs = await BehaviorLog.find(
        BehaviorLog.child_id == PydanticObjectId(child_id)
    ).sort("-created_at").limit(500).to_list()

    emotion_counts = Counter(log.emotion for log in logs)
    trigger_counts = Counter(log.trigger for log in logs if log.trigger)

    date_emotion: dict[str, Counter] = {}
    for log in logs:
        date_key = str(log.created_at)[:10]
        if date_key not in date_emotion:
            date_emotion[date_key] = Counter()
        date_emotion[date_key][log.emotion] += 1

    trend = []
    for date_key, counts in sorted(date_emotion.items()):
        for emotion, count in counts.most_common(3):
            trend.append({"date": date_key, "emotion": emotion, "count": count})

    return BehaviorSummary(
        total_logs=len(logs),
        most_common_emotion=emotion_counts.most_common(1)[0][0] if emotion_counts else None,
        most_common_trigger=trigger_counts.most_common(1)[0][0] if trigger_counts else None,
        trend=trend[-30:],
    )
