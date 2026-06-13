from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from beanie import PydanticObjectId

from app.core.deps import get_current_user
from app.models.user import User
from app.models.note import CaregiverNote
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter(prefix="/notes", tags=["Caregiver Notes"])


@router.get("/", response_model=List[NoteResponse])
async def list_notes(
    child_id: str = Query(...),
    category: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_user),
):
    filters = [CaregiverNote.child_id == PydanticObjectId(child_id)]
    if category:
        filters.append(CaregiverNote.category == category)

    notes = await CaregiverNote.find(*filters).sort(
        -CaregiverNote.is_pinned, -CaregiverNote.created_at
    ).limit(limit).to_list()
    return notes


@router.post("/", response_model=NoteResponse, status_code=201)
async def create_note(
    payload: NoteCreate,
    current_user: User = Depends(get_current_user),
):
    note = CaregiverNote(**payload.model_dump(), author_id=current_user.id)
    await note.insert()
    return note


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    payload: NoteUpdate,
    current_user: User = Depends(get_current_user),
):
    note = await CaregiverNote.find_one(
        CaregiverNote.id == PydanticObjectId(note_id),
        CaregiverNote.author_id == current_user.id,
    )
    if not note:
        raise HTTPException(404, "Note not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(note, key, value)
    await note.save()
    return note


@router.delete("/{note_id}", status_code=204)
async def delete_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
):
    note = await CaregiverNote.find_one(
        CaregiverNote.id == PydanticObjectId(note_id),
        CaregiverNote.author_id == current_user.id,
    )
    if not note:
        raise HTTPException(404, "Note not found")
    await note.delete()
