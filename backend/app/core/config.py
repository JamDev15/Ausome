from functools import lru_cache
from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Ausome"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "changeme-use-openssl-rand-hex-32"

    # MongoDB
    MONGODB_URL: str = "mongodb://eboyapp:eboyapp_secret@localhost:27017/eboyapp?authSource=admin"
    MONGODB_DB: str = "eboyapp"

    # Redis
    REDIS_URL: str = "redis://:redis_secret@localhost:6379/0"

    # JWT
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Email (Resend)
    RESEND_API_KEY: str = ""
    EMAILS_FROM_EMAIL: str = "onboarding@resend.dev"
    EMAILS_FROM_NAME: str = "Ausome"

    # AI
    OPENAI_API_KEY: Optional[str] = None
    AI_ENABLED: bool = False
    AI_MODEL: str = "gpt-4o"

    # Media
    MEDIA_BASE_URL: str = "http://localhost:8000/media"
    MAX_UPLOAD_SIZE_MB: int = 10

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "exp://localhost:8081",
    ]

    # Admin bootstrap
    FIRST_ADMIN_EMAIL: str = "admin@ausome.app"
    FIRST_ADMIN_PASSWORD: str = "Admin123!"

    # PayMongo
    PAYMONGO_SECRET_KEY: str = ""
    PAYMONGO_WEBHOOK_SECRET: str = ""
    PAYMONGO_SUCCESS_URL: str = "https://ausome.app/payment/success"
    PAYMONGO_CANCEL_URL: str = "https://ausome.app/payment/cancel"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            import json
            return json.loads(v)
        return v


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
