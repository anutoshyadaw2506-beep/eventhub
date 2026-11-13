import os
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_JWKS_URL: str
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    PROJECT_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"

    # Email & SMTP Settings (100% Free via Gmail SMTP or Resend)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = ""
    SMTP_USE_TLS: bool = True
    RESEND_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

@lru_cache()
def get_settings() -> Settings:
    return Settings()
