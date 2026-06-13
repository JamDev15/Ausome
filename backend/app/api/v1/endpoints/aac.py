from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from beanie import PydanticObjectId
from beanie.operators import Or

from app.core.deps import get_current_user
from app.models.user import User
from app.models.aac import AACCategory, AACItem
from app.schemas.aac import (
    AACCategoryCreate, AACCategoryResponse,
    AACItemCreate, AACItemResponse, AACUsageUpdate,
)

router = APIRouter(prefix="/aac", tags=["AAC Communication"])


@router.get("/categories", response_model=List[AACCategoryResponse])
async def list_categories(
    child_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
):
    cid = PydanticObjectId(child_id) if child_id else None
    categories = await AACCategory.find(
        Or(AACCategory.is_default == True, AACCategory.child_id == cid)
    ).sort("position").to_list()

    result = []
    for cat in categories:
        items = await AACItem.find(
            AACItem.category_id == cat.id
        ).sort("-use_count", "position").to_list()

        result.append(AACCategoryResponse(
            id=str(cat.id),
            name=cat.name,
            icon=cat.icon,
            color=cat.color,
            position=cat.position,
            is_default=cat.is_default,
            child_id=str(cat.child_id) if cat.child_id else None,
            items=[
                AACItemResponse(
                    id=str(i.id),
                    category_id=str(i.category_id),
                    label=i.label,
                    image_url=i.image_url,
                    audio_url=i.audio_url,
                    audio_text=i.audio_text,
                    position=i.position,
                    color=i.color,
                    child_id=str(i.child_id) if i.child_id else None,
                    is_favorite=i.is_favorite,
                    use_count=i.use_count,
                )
                for i in items
            ],
        ))
    return result


@router.post("/categories", response_model=AACCategoryResponse, status_code=201)
async def create_category(
    payload: AACCategoryCreate,
    current_user: User = Depends(get_current_user),
):
    category = AACCategory(**payload.model_dump())
    await category.insert()
    return category


@router.get("/items", response_model=List[AACItemResponse])
async def list_items(
    category_id: Optional[str] = Query(None),
    child_id: Optional[str] = Query(None),
    favorites_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
):
    filters = []
    if category_id:
        filters.append(AACItem.category_id == PydanticObjectId(category_id))
    if favorites_only:
        filters.append(AACItem.is_favorite == True)

    query = AACItem.find(*filters) if filters else AACItem.find()
    items = await query.sort("-use_count", "position").to_list()
    return items


@router.post("/items", response_model=AACItemResponse, status_code=201)
async def create_item(
    payload: AACItemCreate,
    current_user: User = Depends(get_current_user),
):
    item = AACItem(**payload.model_dump())
    await item.insert()
    return item


@router.post("/items/use")
async def record_usage(
    payload: AACUsageUpdate,
    current_user: User = Depends(get_current_user),
):
    item = await AACItem.get(PydanticObjectId(payload.item_id))
    if not item:
        raise HTTPException(404, "Item not found")
    item.use_count += 1
    await item.save()
    return {"ok": True}


@router.patch("/items/{item_id}/favorite")
async def toggle_favorite(
    item_id: str,
    current_user: User = Depends(get_current_user),
):
    item = await AACItem.get(PydanticObjectId(item_id))
    if not item:
        raise HTTPException(404, "Item not found")
    item.is_favorite = not item.is_favorite
    await item.save()
    return {"is_favorite": item.is_favorite}
