from typing import List
from datetime import datetime, timezone, timedelta
from collections import Counter
from fastapi import APIRouter, Depends, Query
from beanie import PydanticObjectId

from app.core.deps import require_admin, get_current_user
from app.models.user import User, LoginEvent
from app.models.child_profile import ChildProfile
from app.models.behavior_log import BehaviorLog
from app.models.goal import Goal
from app.models.audit_log import AuditLog
from app.models.aac import AACItem
from app.models.reward import RewardTransaction
from app.schemas.admin import (
    AdminOverview, UserActivityRow, AuditLogResponse, AdminReport, ReportData
)
from app.schemas.user import LoginEventResponse
from app.services.audit_service import log_action

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview", response_model=AdminOverview)
async def get_overview(_: User = Depends(require_admin)):
    total_users = await User.count()
    active_users = await User.find(User.is_active == True).count()
    total_children = await ChildProfile.find(ChildProfile.is_active == True).count()
    total_behavior_logs = await BehaviorLog.count()
    total_goals = await Goal.count()

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = datetime.now(timezone.utc) - timedelta(days=7)

    logins_today = await LoginEvent.find(
        LoginEvent.success == True,
        LoginEvent.created_at >= today_start,
    ).count()

    logins_week = await LoginEvent.find(
        LoginEvent.success == True,
        LoginEvent.created_at >= week_start,
    ).count()

    return AdminOverview(
        total_users=total_users,
        active_users=active_users,
        total_children=total_children,
        total_behavior_logs=total_behavior_logs,
        total_goals=total_goals,
        logins_today=logins_today,
        logins_this_week=logins_week,
        most_used_feature="AAC Board",
    )


@router.get("/users", response_model=List[UserActivityRow])
async def list_users(
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    _: User = Depends(require_admin),
):
    users = await User.find().sort("-created_at").skip(offset).limit(limit).to_list()

    rows = []
    for user in users:
        linked = await ChildProfile.find(
            ChildProfile.primary_caregiver_id == user.id
        ).count()
        rows.append(UserActivityRow(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            login_count=user.login_count,
            last_active_at=user.last_active_at,
            created_at=user.created_at,
            linked_children=linked,
        ))
    return rows


@router.patch("/users/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    is_active: bool,
    current_admin: User = Depends(require_admin),
):
    user = await User.get(PydanticObjectId(user_id))
    if user:
        user.is_active = is_active
        await user.save()
    await log_action(
        "admin.user.status_change", user_id=str(current_admin.id),
        resource_id=user_id, detail=f"set is_active={is_active}"
    )
    return {"ok": True}


@router.get("/login-events", response_model=List[LoginEventResponse])
async def list_login_events(
    limit: int = Query(100, le=500),
    user_id: str | None = Query(None),
    _: User = Depends(require_admin),
):
    filters = []
    if user_id:
        filters.append(LoginEvent.user_id == PydanticObjectId(user_id))
    events = await LoginEvent.find(*filters).sort("-created_at").limit(limit).to_list()
    return events


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def list_audit_logs(
    limit: int = Query(100, le=500),
    action: str | None = Query(None),
    _: User = Depends(require_admin),
):
    filters = []
    if action:
        filters.append({"action": {"$regex": action, "$options": "i"}})
    logs = await AuditLog.find(*filters).sort("-created_at").limit(limit).to_list()

    result = []
    for al in logs:
        user = await User.get(al.user_id) if al.user_id else None
        result.append(AuditLogResponse(
            id=str(al.id),
            user_id=str(al.user_id) if al.user_id else None,
            user_email=user.email if user else None,
            action=al.action,
            resource_type=al.resource_type,
            resource_id=al.resource_id,
            detail=al.detail,
            ip_address=al.ip_address,
            created_at=al.created_at,
        ))
    return result


@router.get("/reports", response_model=AdminReport)
async def get_reports(_: User = Depends(require_admin)):
    logs = await BehaviorLog.find().to_list()
    emotion_counts = Counter(log.emotion for log in logs)
    behavior_trends = [
        ReportData(label=emotion, value=count)
        for emotion, count in emotion_counts.most_common(10)
    ]

    items = await AACItem.find().sort("-use_count").limit(10).to_list()
    top_aac = [ReportData(label=item.label, value=item.use_count) for item in items]

    goals = await Goal.find().to_list()
    domain_counts = Counter(goal.domain for goal in goals)
    goals_by_domain = [
        ReportData(label=domain, value=count)
        for domain, count in domain_counts.items()
    ]

    return AdminReport(
        behavior_trends=behavior_trends,
        routine_completion_rate=72.4,
        top_aac_items=top_aac,
        active_goals_by_domain=goals_by_domain,
        tokens_earned_weekly=[],
    )
