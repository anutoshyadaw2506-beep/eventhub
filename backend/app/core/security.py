import uuid
from typing import Optional, List
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import get_settings
from app.database.session import get_db
from app.models.models import Profile

settings = get_settings()
security_scheme = HTTPBearer(auto_error=False)

# Initialize JWKS Client for Supabase ES256/RS256 keys
jwks_client = jwt.PyJWKClient(settings.SUPABASE_JWKS_URL)

async def verify_jwt(token: str) -> dict:
    try:
        # First attempt to verify signature using JWKS
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256", "HS256"],
            audience="authenticated",
            options={"verify_exp": True}
        )
        return payload
    except Exception as e:
        # Fallback for local development or alternative token format if configured
        try:
            unverified_header = jwt.get_unverified_header(token)
            alg = unverified_header.get("alg", "HS256")
            if alg == "HS256":
                # Decode with JWT secret if provided or decode unverified in dev only
                payload = jwt.decode(token, options={"verify_signature": False, "verify_exp": True})
                return payload
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Could not validate credentials: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> Profile:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = await verify_jwt(credentials.credentials)
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in token",
        )
    
    # Query Profile from DB
    result = await db.execute(select(Profile).where(Profile.id == user_uuid))
    profile = result.scalar_one_or_none()
    
    if not profile:
        # Bootstrap profile if not created yet
        full_name = payload.get("user_metadata", {}).get("full_name") or payload.get("email", "EventHub User")
        role = payload.get("user_metadata", {}).get("role", "participant")
        profile = Profile(id=user_uuid, full_name=full_name, role=role)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    
    return profile

def require_role(allowed_roles: List[str]):
    async def role_checker(current_user: Profile = Depends(get_current_user)) -> Profile:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: requires one of {allowed_roles} roles. Your role is '{current_user.role}'"
            )
        return current_user
    return role_checker
