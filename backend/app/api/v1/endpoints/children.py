import random
import string
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId
import resend

from app.core.config import settings
from app.core.deps import get_current_user, require_admin
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.child_profile import ChildProfile, SensoryProfile
from app.schemas.child_profile import (
    ChildProfileCreate, ChildProfileUpdate, ChildProfileResponse,
    SensoryProfileCreate, SensoryProfileResponse,
    InviteTeamMemberRequest, TeamMember,
)
from app.services.audit_service import log_action

router = APIRouter(prefix="/children", tags=["Child Profiles"])


def _gen_temp_password(length: int = 10) -> str:
    chars = string.ascii_letters + string.digits
    return ''.join(random.choices(chars, k=length))


def _send_invite_email(to_email: str, invitee_name: str, inviter_name: str,
                       child_name: str, role: str, temp_password: str) -> None:
    resend.api_key = settings.RESEND_API_KEY
    role_label = "guardian/caregiver" if role == "caregiver" else "therapist"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
      <h2 style="color:#5B8DEF;">You're invited to Ausome</h2>
      <p>Hi {invitee_name},</p>
      <p><strong>{inviter_name}</strong> has added you as a <strong>{role_label}</strong>
         for <strong>{child_name}</strong> on Ausome — an autism support app.</p>
      <p>Use the credentials below to sign in:</p>
      <div style="background:#F1F5F9;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:4px 0;"><strong>Email:</strong> {to_email}</p>
        <p style="margin:4px 0;"><strong>Temporary password:</strong>
           <span style="font-family:monospace;font-size:18px;">{temp_password}</span></p>
      </div>
      <p style="color:#888;font-size:13px;">Please change your password after first login.</p>
    </div>
    """
    resend.Emails.send({
        "from": f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>",
        "to": [to_email],
        "subject": f"You've been added to {child_name}'s care team on Ausome",
        "html": html,
    })


async def _build_response(child: ChildProfile) -> dict:
    team: List[TeamMember] = []
    all_ids = list(child.caregiver_ids) + list(child.therapist_ids)
    if all_ids:
        members = await User.find({"_id": {"$in": all_ids}}).to_list()
        team = [
            TeamMember(id=str(m.id), full_name=m.full_name, email=m.email, role=m.role)
            for m in members
        ]
    result = child.model_dump()
    result["id"] = str(child.id)
    result["primary_caregiver_id"] = str(child.primary_caregiver_id) if child.primary_caregiver_id else None
    result["user_id"] = str(child.user_id) if child.user_id else None
    result["caregiver_ids"] = [str(i) for i in child.caregiver_ids]
    result["therapist_ids"] = [str(i) for i in child.therapist_ids]
    result["team"] = [m.model_dump() for m in team]
    return result


@router.get("/", response_model=List[ChildProfileResponse])
async def list_children(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.ADMIN:
        children = await ChildProfile.find(ChildProfile.is_active == True).to_list()

    elif current_user.role == UserRole.CHILD:
        if not current_user.child_profile_id:
            return []
        child = await ChildProfile.get(current_user.child_profile_id)
        children = [child] if child and child.is_active else []

    elif current_user.role in (UserRole.CAREGIVER, UserRole.THERAPIST):
        uid = current_user.id
        children = await ChildProfile.find(
            ChildProfile.is_active == True,
            {"$or": [
                {"caregiver_ids": uid},
                {"therapist_ids": uid},
                {"primary_caregiver_id": uid},
            ]},
        ).to_list()

    else:
        children = await ChildProfile.find(
            ChildProfile.primary_caregiver_id == current_user.id,
            ChildProfile.is_active == True,
        ).to_list()

    return [await _build_response(c) for c in children]


@router.post("/", response_model=ChildProfileResponse, status_code=201)
async def create_child(
    payload: ChildProfileCreate,
    current_user: User = Depends(get_current_user),
):
    child_data = payload.model_dump(exclude_none=True, exclude={"child_username", "child_password"})
    child = ChildProfile(**child_data, primary_caregiver_id=current_user.id)
    await child.insert()

    child_user = None
    if payload.child_username and payload.child_password:
        username = payload.child_username.strip().lower()
        existing_user = await User.find_one({"username": username})
        if existing_user:
            # Clean up the child we just created before raising
            await child.delete()
            raise HTTPException(400, f"Username '{username}' is already taken.")
        internal_email = f"child.{username}.{str(child.id)[-6:]}@ausome.internal"
        child_user = User(
            email=internal_email,
            username=username,
            hashed_password=hash_password(payload.child_password),
            full_name=payload.full_name,
            role=UserRole.CHILD,
            child_profile_id=child.id,
            invited_by_id=current_user.id,
        )
        await child_user.insert()
        child.user_id = child_user.id
        await child.save()

    await log_action(
        "child.create", user_id=str(current_user.id),
        resource_type="child_profile", resource_id=str(child.id),
        detail=f"Created profile for {child.full_name}",
    )

    response = await _build_response(child)
    if child_user:
        response["child_username"] = child_user.username
    return response


@router.get("/{child_id}", response_model=ChildProfileResponse)
async def get_child(
    child_id: str,
    current_user: User = Depends(get_current_user),
):
    child = await _get_accessible_child(child_id, current_user)
    return await _build_response(child)


@router.patch("/{child_id}", response_model=ChildProfileResponse)
async def update_child(
    child_id: str,
    payload: ChildProfileUpdate,
    current_user: User = Depends(get_current_user),
):
    child = await _get_accessible_child(child_id, current_user)
    update_data = payload.model_dump(exclude_unset=True, exclude={"child_username", "child_password"})
    for key, value in update_data.items():
        setattr(child, key, value)

    if payload.child_username and payload.child_password:
        if child.user_id:
            # Update existing child account
            child_user = await User.get(child.user_id)
            if child_user:
                child_user.hashed_password = hash_password(payload.child_password)
                child_user.username = payload.child_username.strip().lower()
                await child_user.save()
        else:
            # Create a new child login account for an existing profile
            username = payload.child_username.strip().lower()
            existing_user = await User.find_one({"username": username})
            if existing_user:
                raise HTTPException(400, f"Username '{username}' is already taken.")
            internal_email = f"child.{username}.{str(child.id)[-6:]}@ausome.internal"
            child_user = User(
                email=internal_email,
                username=username,
                hashed_password=hash_password(payload.child_password),
                full_name=child.full_name,
                role=UserRole.CHILD,
                child_profile_id=child.id,
                invited_by_id=current_user.id,
            )
            await child_user.insert()
            child.user_id = child_user.id

    await child.save()
    await log_action(
        "child.update", user_id=str(current_user.id),
        resource_type="child_profile", resource_id=str(child.id),
        changes=update_data,
    )
    return await _build_response(child)


@router.delete("/{child_id}", status_code=204)
async def delete_child(
    child_id: str,
    current_user: User = Depends(require_admin),
):
    child = await ChildProfile.get(PydanticObjectId(child_id))
    if not child:
        raise HTTPException(404, "Child profile not found")
    child.is_active = False
    await child.save()
    await log_action("child.archive", user_id=str(current_user.id), resource_id=child_id)


@router.put("/{child_id}/sensory", response_model=SensoryProfileResponse)
async def upsert_sensory_profile(
    child_id: str,
    payload: SensoryProfileCreate,
    current_user: User = Depends(get_current_user),
):
    child = await _get_accessible_child(child_id, current_user)
    child.sensory_profile = SensoryProfile(**payload.model_dump())
    await child.save()
    await log_action("child.sensory.update", user_id=str(current_user.id), resource_id=child_id)
    return child.sensory_profile


@router.post("/{child_id}/team", status_code=201)
async def invite_team_member(
    child_id: str,
    payload: InviteTeamMemberRequest,
    current_user: User = Depends(get_current_user),
):
    child = await _get_accessible_child(child_id, current_user)
    role = payload.role.lower()
    if role not in ("caregiver", "therapist"):
        raise HTTPException(400, "Role must be 'caregiver' or 'therapist'")

    existing = await User.find_one(User.email == payload.email)
    temp_password = None

    if existing:
        team_user = existing
    else:
        temp_password = _gen_temp_password()
        team_user = User(
            email=payload.email,
            hashed_password=hash_password(temp_password),
            full_name=payload.full_name,
            role=UserRole(role),
            invited_by_id=current_user.id,
        )
        await team_user.insert()

    uid = team_user.id
    if role == "caregiver":
        if uid not in child.caregiver_ids:
            child.caregiver_ids.append(uid)
    else:
        if uid not in child.therapist_ids:
            child.therapist_ids.append(uid)
    await child.save()

    if temp_password:
        try:
            _send_invite_email(
                to_email=payload.email,
                invitee_name=payload.full_name.split()[0],
                inviter_name=current_user.full_name,
                child_name=child.full_name,
                role=role,
                temp_password=temp_password,
            )
        except Exception:
            pass

    await log_action("child.team.invite", user_id=str(current_user.id),
                     resource_id=child_id, detail=f"Invited {payload.email} as {role}")

    return {
        "id": str(team_user.id),
        "full_name": team_user.full_name,
        "email": team_user.email,
        "role": team_user.role,
        "is_new_account": temp_password is not None,
    }


@router.delete("/{child_id}/team/{member_id}", status_code=204)
async def remove_team_member(
    child_id: str,
    member_id: str,
    current_user: User = Depends(get_current_user),
):
    child = await _get_accessible_child(child_id, current_user)
    mid = PydanticObjectId(member_id)
    child.caregiver_ids = [i for i in child.caregiver_ids if i != mid]
    child.therapist_ids = [i for i in child.therapist_ids if i != mid]
    await child.save()


async def _get_accessible_child(child_id: str, user: User) -> ChildProfile:
    try:
        child = await ChildProfile.get(PydanticObjectId(child_id))
    except Exception:
        child = None

    if not child or not child.is_active:
        raise HTTPException(404, "Child profile not found")

    if user.role == UserRole.ADMIN:
        return child
    if child.primary_caregiver_id == user.id:
        return child
    if user.id in child.caregiver_ids:
        return child
    if user.id in child.therapist_ids:
        return child
    if user.role == UserRole.CHILD and child.user_id == user.id:
        return child

    raise HTTPException(403, "Access denied")
