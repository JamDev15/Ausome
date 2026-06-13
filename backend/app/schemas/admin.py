from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class AdminOverview(BaseModel):
    total_users: int
    active_users: int
    total_children: int
    total_behavior_logs: int
    total_goals: int
    logins_today: int
    logins_this_week: int
    most_used_feature: Optional[str] = None


class UserActivityRow(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    login_count: int
    last_active_at: Optional[str] = None
    created_at: datetime
    linked_children: int = 0

    model_config = {"from_attributes": True}


class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    detail: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportData(BaseModel):
    label: str
    value: int


class AdminReport(BaseModel):
    behavior_trends: List[ReportData] = []
    routine_completion_rate: float = 0.0
    top_aac_items: List[ReportData] = []
    active_goals_by_domain: List[ReportData] = []
    tokens_earned_weekly: List[ReportData] = []
