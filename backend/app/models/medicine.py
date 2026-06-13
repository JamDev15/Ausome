from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId
from app.db.base import BaseDocument


class MedicineReminder(BaseDocument):
    child_id: PydanticObjectId
    name: str
    dosage: str
    frequency: str                  # "Once daily", "Twice daily", etc.
    times: List[str] = []           # ["08:00", "20:00"]
    color: Optional[str] = None     # visual pill colour
    notes: Optional[str] = None
    is_active: bool = True

    class Settings:
        name = "medicine_reminders"
        use_state_management = True


class MedicineDose(BaseDocument):
    child_id: PydanticObjectId
    medicine_id: PydanticObjectId
    medicine_name: str              # denormalised for display
    taken_at: datetime
    notes: Optional[str] = None
    logged_by_id: Optional[PydanticObjectId] = None

    class Settings:
        name = "medicine_doses"
        use_state_management = True
