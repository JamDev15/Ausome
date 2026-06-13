from datetime import datetime, timezone, timedelta
from beanie import Document


class PasswordResetCode(Document):
    email: str
    code: str
    expires_at: datetime
    used: bool = False

    class Settings:
        name = "password_reset_codes"

    @classmethod
    def create(cls, email: str, code: str) -> "PasswordResetCode":
        return cls(
            email=email,
            code=code,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
        )

    def is_valid(self) -> bool:
        return not self.used and datetime.now(timezone.utc) < self.expires_at.replace(tzinfo=timezone.utc)
