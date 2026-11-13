from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.core.security import get_current_user
from app.models.models import Profile
from app.schemas.schemas import ProfileResponse, ProfileRegisterRequest, ProfileUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/me", response_model=ProfileResponse)
async def get_current_user_profile(
    current_user: Profile = Depends(get_current_user)
):
    """Returns the authenticated user's profile and assigned role."""
    return current_user

@router.post("/register", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def register_profile(
    req: ProfileRegisterRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Optional bootstrap endpoint to initialize or update profile fields after Supabase signup."""
    current_user.full_name = req.full_name
    if req.role in ["participant", "organiser"]:
        current_user.role = req.role
    if req.avatar_url:
        current_user.avatar_url = req.avatar_url
    
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.patch("/me", response_model=ProfileResponse)
async def update_profile(
    req: ProfileUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates the user's name or avatar URL."""
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url
    
    await db.commit()
    await db.refresh(current_user)
    return current_user
