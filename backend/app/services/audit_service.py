from typing import Optional
from beanie import PydanticObjectId
from app.models.audit_log import AuditLog


async def log_action(
    action: str,
    user_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    detail: Optional[str] = None,
    ip_address: Optional[str] = None,
    changes: Optional[dict] = None,
) -> None:
    """Record an audit trail entry. Fire-and-forget — errors are silenced."""
    try:
        uid = PydanticObjectId(user_id) if user_id else None
        entry = AuditLog(
            user_id=uid,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            detail=detail,
            ip_address=ip_address,
            changes=changes,
        )
        await entry.insert()
    except Exception:
        pass
