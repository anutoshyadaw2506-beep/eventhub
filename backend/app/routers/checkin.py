from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.core.security import get_current_user
from app.models.models import Profile, Event
from app.schemas.schemas import CheckInRequest, CheckInResponse
from app.services.event_service import validate_and_checkin_ticket

router = APIRouter(prefix="/check-in", tags=["Check-in"])

@router.post("/scan", response_model=CheckInResponse)
async def checkin_ticket_scan(
    payload: CheckInRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Validates a scanned ticket token and records attendance atomically.
    Rejects duplicate scans and invalid tickets.
    """
    event = await db.get(Event, payload.event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    # Authorise: current user must be organiser of this event or an admin
    if event.organiser_id != current_user.id and current_user.role not in ["organiser", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to check in participants for this event"
        )

    registration, attendance = await validate_and_checkin_ticket(
        db=db,
        ticket_token=payload.ticket_token,
        event_id=payload.event_id,
        staff_user_id=current_user.id
    )

    p_name = registration.attendee_name or (registration.user.full_name if registration.user else "Attendee")

    return CheckInResponse(
        success=True,
        message=f"Check-in successful! Welcome {p_name}",
        registration_id=registration.id,
        participant_name=p_name,
        checked_in_at=attendance.checked_in_at,
        is_duplicate=False
    )
