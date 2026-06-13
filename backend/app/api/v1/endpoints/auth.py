from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from beanie import PydanticObjectId
from pydantic import BaseModel
import random
import resend

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
)
from app.models.user import User, UserRole, LoginEvent
from app.models.password_reset import PasswordResetCode
from app.schemas.auth import (
    LoginRequest, RegisterRequest, TokenResponse,
    RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest,
)
from app.services.audit_service import log_action

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _user_is_full_access(user) -> bool:
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    if user.subscription_status == "trial" and user.trial_ends_at:
        te = user.trial_ends_at
        if te.tzinfo is None:
            te = te.replace(tzinfo=timezone.utc)
        return now <= te
    if user.subscription_status == "active" and user.subscription_ends_at:
        se = user.subscription_ends_at
        if se.tzinfo is None:
            se = se.replace(tzinfo=timezone.utc)
        return now <= se
    return False


def _send_reset_email(to_email: str, code: str, name: str) -> None:
    resend.api_key = settings.RESEND_API_KEY
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
      <h2 style="color:#5B8DEF;">Reset your Ausome password</h2>
      <p>Hi {name},</p>
      <p>Enter the code below in the app to reset your password. It expires in <strong>30 minutes</strong>.</p>
      <div style="margin:32px 0;text-align:center;">
        <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#1E293B;background:#F1F5F9;padding:16px 28px;border-radius:12px;">
          {code}
        </span>
      </div>
      <p style="color:#888;font-size:13px;">Open the Ausome app and enter this code on the Reset Password screen.</p>
      <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    resend.Emails.send({
        "from": f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>",
        "to": [to_email],
        "subject": f"{code} is your Ausome reset code",
        "html": html,
    })


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    payload: RegisterRequest,
    request: Request,
):
    existing = await User.find_one(User.email == payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        role = UserRole(payload.role)
    except ValueError:
        role = UserRole.PARENT

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=role,
    )
    await user.insert()

    await log_action(
        "user.register", user_id=str(user.id),
        resource_type="user", resource_id=str(user.id),
        ip_address=request.client.host if request.client else None,
    )

    from datetime import timedelta
    user.plan_chosen = False  # will be set when they pick a plan
    user.subscription_status = "inactive"
    # (no save needed, just set defaults)

    return TokenResponse(
        access_token=create_access_token(str(user.id), {"role": user.role}),
        refresh_token=create_refresh_token(str(user.id)),
        user_id=str(user.id),
        role=user.role,
        full_name=user.full_name,
        preferred_language=user.preferred_language,
        onboarding_completed=user.onboarding_completed,
        plan_chosen=user.plan_chosen,
        subscription_plan=user.subscription_plan,
        subscription_status=user.subscription_status,
        trial_ends_at=user.trial_ends_at.isoformat() if user.trial_ends_at else None,
        subscription_ends_at=user.subscription_ends_at.isoformat() if user.subscription_ends_at else None,
        is_full_access=_user_is_full_access(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    request: Request,
):
    # Support both email and username login
    login_value = payload.login.strip().lower()
    if "@" in login_value:
        user = await User.find_one({"email": login_value})
    else:
        user = await User.find_one({"username": login_value})
    client_ip = request.client.host if request.client else None
    success = bool(user and verify_password(payload.password, user.hashed_password))

    if not success:
        if user:
            event = LoginEvent(
                user_id=user.id,
                ip_address=client_ip,
                device_info=payload.device_info,
                platform=payload.platform,
                success=False,
                failure_reason="invalid_credentials",
            )
            await event.insert()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    user.login_count = (user.login_count or 0) + 1
    user.last_active_at = datetime.now(timezone.utc).isoformat()
    await user.save()

    # Auto-grant existing users who already have child profiles
    if not user.plan_chosen:
        from datetime import timedelta
        from app.models.child_profile import ChildProfile
        child_count = await ChildProfile.find(
            ChildProfile.primary_caregiver_id == user.id,
            ChildProfile.is_active == True
        ).count()
        if child_count > 0:
            user.plan_chosen = True
            user.subscription_plan = "family"
            user.subscription_status = "active"
            user.subscription_ends_at = datetime.now(timezone.utc) + timedelta(days=365)
            await user.save()

    event = LoginEvent(
        user_id=user.id,
        ip_address=client_ip,
        device_info=payload.device_info,
        platform=payload.platform,
        success=True,
    )
    await event.insert()

    await log_action("user.login", user_id=str(user.id), ip_address=client_ip)

    child_profile_id = str(user.child_profile_id) if user.child_profile_id else None
    return TokenResponse(
        access_token=create_access_token(str(user.id), {"role": user.role}),
        refresh_token=create_refresh_token(str(user.id)),
        user_id=str(user.id),
        role=user.role,
        full_name=user.full_name,
        child_profile_id=child_profile_id,
        preferred_language=user.preferred_language,
        onboarding_completed=user.onboarding_completed,
        plan_chosen=user.plan_chosen,
        subscription_plan=user.subscription_plan,
        subscription_status=user.subscription_status,
        trial_ends_at=user.trial_ends_at.isoformat() if user.trial_ends_at else None,
        subscription_ends_at=user.subscription_ends_at.isoformat() if user.subscription_ends_at else None,
        is_full_access=_user_is_full_access(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest):
    decoded = decode_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    try:
        user = await User.get(PydanticObjectId(decoded["sub"]))
    except Exception:
        user = None

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    child_profile_id = str(user.child_profile_id) if user.child_profile_id else None
    return TokenResponse(
        access_token=create_access_token(str(user.id), {"role": user.role}),
        refresh_token=create_refresh_token(str(user.id)),
        user_id=str(user.id),
        role=user.role,
        full_name=user.full_name,
        child_profile_id=child_profile_id,
        preferred_language=user.preferred_language,
        onboarding_completed=user.onboarding_completed,
        plan_chosen=user.plan_chosen,
        subscription_plan=user.subscription_plan,
        subscription_status=user.subscription_status,
        trial_ends_at=user.trial_ends_at.isoformat() if user.trial_ends_at else None,
        subscription_ends_at=user.subscription_ends_at.isoformat() if user.subscription_ends_at else None,
        is_full_access=_user_is_full_access(user),
    )


@router.post("/forgot-password", status_code=202)
async def forgot_password(payload: ForgotPasswordRequest):
    user = await User.find_one(User.email == payload.email)
    if user:
        code = str(random.randint(100000, 999999))
        reset = PasswordResetCode.create(email=payload.email, code=code)
        await reset.insert()
        try:
            _send_reset_email(payload.email, code, user.full_name.split()[0])
        except Exception:
            pass
        await log_action("user.forgot_password", user_id=str(user.id))
    return {"detail": "If that email exists, a 6-digit code has been sent."}


@router.post("/reset-password", status_code=200)
async def reset_password(payload: ResetPasswordRequest):
    record = await PasswordResetCode.find_one(
        PasswordResetCode.email == payload.email,
        PasswordResetCode.code == payload.code,
        PasswordResetCode.used == False,
    )
    if not record or not record.is_valid():
        raise HTTPException(status_code=400, detail="Invalid or expired code.")

    user = await User.find_one(User.email == payload.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")

    user.hashed_password = hash_password(payload.new_password)
    await user.save()

    record.used = True
    await record.save()

    await log_action("user.reset_password", user_id=str(user.id))
    return {"detail": "Password updated successfully."}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "avatar_url": current_user.avatar_url,
        "phone": current_user.phone,
        "is_active": current_user.is_active,
    }


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.patch("/me")
async def update_me(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.phone is not None:
        current_user.phone = payload.phone.strip() or None
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url or None
    await current_user.save()
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "avatar_url": current_user.avatar_url,
        "phone": current_user.phone,
        "is_active": current_user.is_active,
    }


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")
    current_user.hashed_password = hash_password(payload.new_password)
    await current_user.save()
    await log_action("user.change_password", user_id=str(current_user.id))
    return {"detail": "Password changed successfully."}
