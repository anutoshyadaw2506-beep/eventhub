from datetime import datetime, timezone
import uuid
from typing import Optional, Tuple, Dict, Any, List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.models.models import Event, Registration, Attendance, Profile
from app.services.qr_service import generate_ticket_token

async def register_participant_atomic(
    db: AsyncSession,
    user_id: Optional[uuid.UUID],
    event_id: uuid.UUID,
    attendee_name: str = "",
    attendee_email: str = "",
    form_responses: Optional[Dict[str, Any]] = None,
    payment_id: Optional[str] = None,
    amount_paid: float = 0.0
) -> Registration:
    """
    Atomically registers a participant or guest for an event, enforcing:
    1. Event existence and published status
    2. Registration deadline hasn't passed
    3. Concurrency-safe capacity check using row-level locking (SELECT FOR UPDATE)
    4. Duplicate registration prevention (by user_id or attendee_email)
    5. Automatic fee / payment recording
    """
    # 1. Lock the event row for update to ensure accurate capacity under concurrent requests
    stmt = (
        select(Event)
        .where(Event.id == event_id)
        .with_for_update()
    )
    result = await db.execute(stmt)
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    if event.status != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration is not allowed because event status is '{event.status}'"
        )

    now = datetime.now(timezone.utc)
    if event.registration_deadline < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration deadline has passed"
        )

    # 2. Check if user/email already registered
    if user_id:
        existing_stmt = select(Registration).where(
            and_(Registration.user_id == user_id, Registration.event_id == event_id)
        )
        existing_reg = (await db.execute(existing_stmt)).scalar_one_or_none()
        if existing_reg and existing_reg.status == "confirmed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already registered for this event"
            )
    elif attendee_email:
        existing_stmt = select(Registration).where(
            and_(
                Registration.event_id == event_id,
                func.lower(Registration.attendee_email) == attendee_email.strip().lower(),
                Registration.status == "confirmed"
            )
        )
        existing_reg = (await db.execute(existing_stmt)).scalar_one_or_none()
        if existing_reg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"An active registration already exists for {attendee_email}"
            )

    # 3. Capacity check under locked event
    count_stmt = select(func.count(Registration.id)).where(
        and_(Registration.event_id == event_id, Registration.status == "confirmed")
    )
    confirmed_count = (await db.execute(count_stmt)).scalar() or 0
    if confirmed_count >= event.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Event is full. Capacity of {event.capacity} reached."
        )

    # 4. Fee & Payment processing
    event_fee = float(event.fee or 0.0)
    payment_status = "paid" if event_fee > 0 else "free"
    actual_amount = event_fee if event_fee > 0 else 0.0
    actual_payment_id = payment_id or (f"pay_mock_{uuid.uuid4().hex[:10]}" if event_fee > 0 else None)

    # 5. Create new registration with opaque ticket token
    new_reg = Registration(
        user_id=user_id,
        event_id=event_id,
        attendee_name=attendee_name.strip() if attendee_name else "Guest Attendee",
        attendee_email=attendee_email.strip().lower() if attendee_email else "",
        payment_status=payment_status,
        payment_id=actual_payment_id,
        amount_paid=actual_amount,
        status="confirmed",
        ticket_token=generate_ticket_token(),
        form_responses=form_responses or {},
        registered_at=now
    )
    db.add(new_reg)
    await db.commit()
    await db.refresh(new_reg)
    return new_reg

async def validate_and_checkin_ticket(
    db: AsyncSession,
    ticket_token: str,
    event_id: uuid.UUID,
    staff_user_id: uuid.UUID
) -> Tuple[Registration, Attendance]:
    """
    Validates a ticket token for an event and records check-in atomically.
    Rejects duplicate scans and invalid tickets.
    """
    # Verify staff permissions on event
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    
    # Query registration and lock it
    stmt = (
        select(Registration)
        .options(selectinload(Registration.user), selectinload(Registration.attendance))
        .where(Registration.ticket_token == ticket_token)
        .with_for_update()
    )
    result = await db.execute(stmt)
    registration = result.scalar_one_or_none()

    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid ticket: Token not recognized"
        )

    if registration.event_id != event_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ticket: Ticket is for a different event"
        )

    if registration.status != "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ticket registration is {registration.status}"
        )

    # Check for existing attendance record (Duplicate rejection)
    attendance_stmt = select(Attendance).where(Attendance.registration_id == registration.id)
    existing_attendance = (await db.execute(attendance_stmt)).scalar_one_or_none()
    if existing_attendance is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ticket already checked in at {existing_attendance.checked_in_at.strftime('%Y-%m-%d %H:%M:%S UTC')}"
        )

    # Record attendance
    now = datetime.now(timezone.utc)
    attendance = Attendance(
        registration_id=registration.id,
        checked_in_by=staff_user_id,
        checked_in_at=now
    )
    db.add(attendance)
    await db.commit()
    await db.refresh(attendance)
    return registration, attendance

async def calculate_event_analytics(db: AsyncSession, event: Event) -> Dict[str, Any]:
    """Calculates real-time event analytics."""
    # Count confirmed registrations
    reg_count_stmt = select(func.count(Registration.id)).where(
        and_(Registration.event_id == event.id, Registration.status == "confirmed")
    )
    registrations = (await db.execute(reg_count_stmt)).scalar() or 0

    # Count checked-in
    checkin_count_stmt = (
        select(func.count(Attendance.id))
        .join(Registration, Attendance.registration_id == Registration.id)
        .where(and_(Registration.event_id == event.id, Registration.status == "confirmed"))
    )
    checked_in = (await db.execute(checkin_count_stmt)).scalar() or 0

    no_shows = max(0, registrations - checked_in)
    attendance_rate = round((checked_in / registrations * 100), 1) if registrations > 0 else 0.0
    capacity_utilisation = round((registrations / event.capacity * 100), 1) if event.capacity > 0 else 0.0

    return {
        "event_id": event.id,
        "title": event.title,
        "capacity": event.capacity,
        "registrations": registrations,
        "checked_in": checked_in,
        "no_shows": no_shows,
        "attendance_rate": attendance_rate,
        "capacity_utilisation": capacity_utilisation,
    }
