from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.models.user import User
from app.models.episode_log import EpisodeLog, EpisodeType, EpisodeSeverity

router = APIRouter(prefix="/episodes", tags=["Episodes"])


class EpisodeCreate(BaseModel):
    child_id: str
    episode_type: EpisodeType
    started_at: Optional[str] = None   # ISO string; defaults to now
    duration_minutes: Optional[int] = None
    severity: Optional[EpisodeSeverity] = None
    triggers: Optional[str] = None
    symptoms: Optional[str] = None
    intervention: Optional[str] = None
    outcome: Optional[str] = None
    emergency_called: bool = False
    notes: Optional[str] = None


class EpisodeUpdate(BaseModel):
    episode_type: Optional[EpisodeType] = None
    started_at: Optional[str] = None
    duration_minutes: Optional[int] = None
    severity: Optional[EpisodeSeverity] = None
    triggers: Optional[str] = None
    symptoms: Optional[str] = None
    intervention: Optional[str] = None
    outcome: Optional[str] = None
    emergency_called: Optional[bool] = None
    notes: Optional[str] = None


@router.get("/{child_id}")
async def list_episodes(
    child_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
):
    eps = await EpisodeLog.find(
        EpisodeLog.child_id == PydanticObjectId(child_id),
    ).sort("-started_at").limit(limit).to_list()

    return [
        {
            "id": str(e.id),
            "episode_type": e.episode_type,
            "started_at": e.started_at.isoformat(),
            "duration_minutes": e.duration_minutes,
            "severity": e.severity,
            "triggers": e.triggers,
            "symptoms": e.symptoms,
            "intervention": e.intervention,
            "outcome": e.outcome,
            "emergency_called": e.emergency_called,
            "notes": e.notes,
            "created_at": e.created_at.isoformat(),
        }
        for e in eps
    ]


@router.post("/", status_code=201)
async def log_episode(
    body: EpisodeCreate,
    current_user: User = Depends(get_current_user),
):
    started = (
        datetime.fromisoformat(body.started_at)
        if body.started_at
        else datetime.now(timezone.utc)
    )
    ep = EpisodeLog(
        child_id=PydanticObjectId(body.child_id),
        logged_by_id=current_user.id,
        episode_type=body.episode_type,
        started_at=started,
        duration_minutes=body.duration_minutes,
        severity=body.severity,
        triggers=body.triggers,
        symptoms=body.symptoms,
        intervention=body.intervention,
        outcome=body.outcome,
        emergency_called=body.emergency_called,
        notes=body.notes,
    )
    await ep.insert()
    return {"id": str(ep.id), "started_at": ep.started_at.isoformat()}


@router.patch("/{episode_id}")
async def update_episode(
    episode_id: str,
    body: EpisodeUpdate,
    current_user: User = Depends(get_current_user),
):
    ep = await EpisodeLog.get(PydanticObjectId(episode_id))
    if not ep:
        raise HTTPException(404, "Episode not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        if k == "started_at" and v:
            setattr(ep, k, datetime.fromisoformat(v))
        elif v is not None:
            setattr(ep, k, v)
    await ep.save()
    return {"ok": True}


@router.delete("/{episode_id}")
async def delete_episode(
    episode_id: str,
    current_user: User = Depends(get_current_user),
):
    ep = await EpisodeLog.get(PydanticObjectId(episode_id))
    if not ep:
        raise HTTPException(404, "Episode not found")
    await ep.delete()
    return {"ok": True}
