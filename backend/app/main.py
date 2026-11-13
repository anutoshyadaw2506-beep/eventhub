from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.routers import auth, events, registrations, checkin

settings = get_settings()

app = FastAPI(
    title="EventHub API",
    description="Full-stack Event Management Platform with Supabase Authentication and QR-Based Attendance",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"] if settings.PROJECT_ENV == "development" else settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api/v1
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(events.router, prefix=API_PREFIX)
app.include_router(registrations.router, prefix=API_PREFIX)
app.include_router(checkin.router, prefix=API_PREFIX)

@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "EventHub FastAPI Backend",
        "environment": settings.PROJECT_ENV
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to EventHub API",
        "docs": "/docs",
        "version": "1.0.0"
    }
