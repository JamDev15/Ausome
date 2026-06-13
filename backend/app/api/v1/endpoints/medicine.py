from datetime import datetime, timezone, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.models.user import User
from app.models.medicine import MedicineReminder, MedicineDose

router = APIRouter(prefix="/medicine", tags=["Medicine"])


# ── Schemas ──────────────────────────────────────────────────────────────────
class MedicineCreate(BaseModel):
    child_id: str
    name: str
    dosage: str
    frequency: str
    times: List[str] = []
    color: Optional[str] = None
    notes: Optional[str] = None


class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    times: Optional[List[str]] = None
    color: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class MarkTakenBody(BaseModel):
    child_id: str
    medicine_id: str
    notes: Optional[str] = None


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.get("/{child_id}")
async def list_medicines(
    child_id: str,
    current_user: User = Depends(get_current_user),
):
    meds = await MedicineReminder.find(
        MedicineReminder.child_id == PydanticObjectId(child_id),
        MedicineReminder.is_active == True,
    ).sort("name").to_list()

    # find today's doses
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    doses_today = await MedicineDose.find(
        MedicineDose.child_id == PydanticObjectId(child_id),
        MedicineDose.taken_at >= today_start,
    ).to_list()
    taken_ids = {str(d.medicine_id) for d in doses_today}

    return [
        {
            "id": str(m.id),
            "name": m.name,
            "dosage": m.dosage,
            "frequency": m.frequency,
            "times": m.times,
            "color": m.color,
            "notes": m.notes,
            "taken_today": str(m.id) in taken_ids,
            "created_at": m.created_at.isoformat(),
        }
        for m in meds
    ]


@router.post("/")
async def create_medicine(
    body: MedicineCreate,
    current_user: User = Depends(get_current_user),
):
    med = MedicineReminder(
        child_id=PydanticObjectId(body.child_id),
        name=body.name,
        dosage=body.dosage,
        frequency=body.frequency,
        times=body.times,
        color=body.color,
        notes=body.notes,
    )
    await med.insert()
    return {"id": str(med.id), "name": med.name}


@router.patch("/{medicine_id}")
async def update_medicine(
    medicine_id: str,
    body: MedicineUpdate,
    current_user: User = Depends(get_current_user),
):
    med = await MedicineReminder.get(PydanticObjectId(medicine_id))
    if not med:
        raise HTTPException(404, "Medicine not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(med, k, v)
    await med.save()
    return {"ok": True}


@router.delete("/{medicine_id}")
async def delete_medicine(
    medicine_id: str,
    current_user: User = Depends(get_current_user),
):
    med = await MedicineReminder.get(PydanticObjectId(medicine_id))
    if not med:
        raise HTTPException(404, "Medicine not found")
    med.is_active = False
    await med.save()
    return {"ok": True}


@router.post("/dose/mark-taken")
async def mark_taken(
    body: MarkTakenBody,
    current_user: User = Depends(get_current_user),
):
    med = await MedicineReminder.get(PydanticObjectId(body.medicine_id))
    if not med:
        raise HTTPException(404, "Medicine not found")
    dose = MedicineDose(
        child_id=PydanticObjectId(body.child_id),
        medicine_id=med.id,
        medicine_name=med.name,
        taken_at=datetime.now(timezone.utc),
        notes=body.notes,
        logged_by_id=current_user.id,
    )
    await dose.insert()
    return {"ok": True, "taken_at": dose.taken_at.isoformat()}


@router.get("/{child_id}/doses/history")
async def dose_history(
    child_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
):
    doses = await MedicineDose.find(
        MedicineDose.child_id == PydanticObjectId(child_id),
    ).sort("-taken_at").limit(limit).to_list()
    return [
        {
            "id": str(d.id),
            "medicine_name": d.medicine_name,
            "taken_at": d.taken_at.isoformat(),
            "notes": d.notes,
        }
        for d in doses
    ]
