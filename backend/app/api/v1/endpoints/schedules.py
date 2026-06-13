from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from beanie import PydanticObjectId

from app.core.deps import get_current_user
from app.models.user import User
from app.models.schedule import ScheduleTemplate, ScheduleItem
from app.schemas.schedule import (
    ScheduleTemplateCreate, ScheduleTemplateResponse,
    ScheduleItemUpdate, ScheduleItemResponse,
)
from app.services.audit_service import log_action

router = APIRouter(prefix="/schedules", tags=["Visual Schedules"])


@router.get("/", response_model=List[ScheduleTemplateResponse])
async def list_schedules(
    child_id: str = Query(...),
    current_user: User = Depends(get_current_user),
):
    schedules = await ScheduleTemplate.find(
        ScheduleTemplate.child_id == PydanticObjectId(child_id),
        ScheduleTemplate.is_active == True,
    ).sort("routine_type").to_list()
    return schedules


@router.post("/", response_model=ScheduleTemplateResponse, status_code=201)
async def create_schedule(
    payload: ScheduleTemplateCreate,
    current_user: User = Depends(get_current_user),
):
    items = [
        ScheduleItem(**item.model_dump(), position=idx)
        for idx, item in enumerate(payload.items)
    ]
    template = ScheduleTemplate(
        **payload.model_dump(exclude={"items"}),
        created_by_id=current_user.id,
        items=items,
        child_id=PydanticObjectId(payload.child_id) if isinstance(payload.child_id, str) else payload.child_id,
    )
    await template.insert()
    await log_action("schedule.create", user_id=str(current_user.id), resource_id=str(template.id))
    return template


@router.patch("/items/{template_id}/{item_index}", response_model=ScheduleItemResponse)
async def update_item(
    template_id: str,
    item_index: int,
    payload: ScheduleItemUpdate,
    current_user: User = Depends(get_current_user),
):
    template = await ScheduleTemplate.get(PydanticObjectId(template_id))
    if not template or item_index >= len(template.items):
        raise HTTPException(404, "Schedule item not found")

    item = template.items[item_index]
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    await template.save()
    return item


@router.delete("/{template_id}", status_code=204)
async def delete_schedule(
    template_id: str,
    current_user: User = Depends(get_current_user),
):
    template = await ScheduleTemplate.get(PydanticObjectId(template_id))
    if not template:
        raise HTTPException(404, "Schedule not found")
    template.is_active = False
    await template.save()
