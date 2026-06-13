from typing import Optional
from beanie import PydanticObjectId
from app.db.base import BaseDocument


class AuditLog(BaseDocument):
    user_id: Optional[PydanticObjectId] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    detail: Optional[str] = None
    ip_address: Optional[str] = None
    changes: Optional[dict] = None

    class Settings:
        name = "audit_logs"
        use_state_management = True

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} by {self.user_id}>"
