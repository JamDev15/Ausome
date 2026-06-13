from datetime import datetime, timezone
from beanie import Document
from pydantic import Field


class BaseDocument(Document):
    """Base class for all Beanie documents with timestamps."""

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    async def save(self, *args, **kwargs):
        self.updated_at = datetime.now(timezone.utc)
        return await super().save(*args, **kwargs)

    class Settings:
        use_state_management = True
