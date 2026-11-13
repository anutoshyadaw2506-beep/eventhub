import os
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_JWKS_URL: str
    CORS_ORIGINS: str = "*"
    PROJECT_ENV: str = "production"
    FRONTEND_URL: str = "https://eventhub-delta-two.vercel.app"

    @property
    def resolved_frontend_url(self) -> str:
        vercel_prod = os.getenv("VERCEL_PROJECT_PRODUCTION_URL")
        if vercel_prod:
            return f"https://{vercel_prod}".rstrip("/")
        vercel_url = os.getenv("VERCEL_URL")
        if vercel_url:
            return f"https://{vercel_url}".rstrip("/")
        if self.PROJECT_ENV == "production" or not self.FRONTEND_URL or "localhost" in self.FRONTEND_URL:
            return "https://eventhub-delta-two.vercel.app"
        return self.FRONTEND_URL.rstrip("/")

    # Email & SMTP Settings (100% Free via Brevo, Gmail SMTP or Resend)
    SMTP_HOST: str = "smtp-relay.brevo.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = ""
    SMTP_USE_TLS: bool = True
    RESEND_API_KEY: str = ""
    BREVO_API_KEY: str = ""
    BREVO_SENDER_EMAIL: str = "anutosh.yadaw2506@gmail.com"

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
