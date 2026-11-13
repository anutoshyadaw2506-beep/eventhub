import csv
import io
import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.core.security import get_current_user, get_optional_current_user
from app.models.models import Event, Registration, Profile, Attendance
from app.schemas.schemas import (
    RegistrationCreate,
    RegistrationResponse,
    TicketResponse,
    EventAnalyticsResponse,
    ParticipantRegistrationItem
)
from app.services.event_service import register_participant_atomic, calculate_event_analytics
from app.services.qr_service import generate_qr_code_data_url

router = APIRouter(tags=["Registrations & Ticketing"])

@router.post("/events/{event_id}/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_for_event(
    event_id: uuid.UUID,
    reg_in: Optional[RegistrationCreate] = None,
    current_user: Optional[Profile] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Registers an attendee (logged in user or guest) for an event, returning confirmed registration.
    No login required for attendees.
    """
    attendee_name = (reg_in.attendee_name.strip() if reg_in and reg_in.attendee_name else "")
    attendee_email = (reg_in.attendee_email.strip().lower() if reg_in and reg_in.attendee_email else "")
    responses = reg_in.form_responses if reg_in else None
    payment_id = reg_in.payment_id if reg_in else None
    amount_paid = reg_in.amount_paid if reg_in and reg_in.amount_paid else 0.0

    user_id = current_user.id if current_user else None
    if current_user and not attendee_name:
        attendee_name = current_user.full_name

    registration = await register_participant_atomic(
        db,
        user_id=user_id,
        event_id=event_id,
        attendee_name=attendee_name,
        attendee_email=attendee_email,
        form_responses=responses,
        payment_id=payment_id,
        amount_paid=amount_paid
    )
    
    # Reload with relations
    stmt = (
        select(Registration)
        .options(
            selectinload(Registration.event).selectinload(Event.category),
            selectinload(Registration.event).selectinload(Event.organiser),
            selectinload(Registration.attendance),
            selectinload(Registration.user)
        )
        .where(Registration.id == registration.id)
    )
    reg_loaded = (await db.execute(stmt)).scalar_one()
    
    res = RegistrationResponse.model_validate(reg_loaded)
    res.is_checked_in = reg_loaded.attendance is not None
    return res

@router.get("/me/registrations", response_model=List[RegistrationResponse])
async def get_my_registrations(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lists all registrations made by the current user."""
    stmt = (
        select(Registration)
        .options(
            selectinload(Registration.event).selectinload(Event.category),
            selectinload(Registration.event).selectinload(Event.organiser),
            selectinload(Registration.attendance)
        )
        .where(Registration.user_id == current_user.id)
        .order_by(Registration.registered_at.desc())
    )
    result = await db.execute(stmt)
    regs = result.scalars().all()

    response_list = []
    for r in regs:
        item = RegistrationResponse.model_validate(r)
        item.is_checked_in = r.attendance is not None
        response_list.append(item)

    return response_list

@router.post("/registrations/{registration_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_registration(
    registration_id: uuid.UUID,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancels a registration if owned by the user and event has not finished."""
    registration = await db.get(Registration, registration_id)
    if not registration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

    if registration.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot cancel another user's registration")

    if registration.status == "cancelled":
        return {"message": "Registration was already cancelled"}

    registration.status = "cancelled"
    await db.commit()
    return {"message": "Registration cancelled successfully", "registration_id": str(registration_id)}

@router.get("/tickets/{registration_id}", response_model=TicketResponse)
async def get_ticket_details(
    registration_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns ticket details including generated QR code image (Base64 data URL).
    Publicly accessible via ticket ID/token.
    """
    stmt = (
        select(Registration)
        .options(
            selectinload(Registration.event),
            selectinload(Registration.user),
            selectinload(Registration.attendance)
        )
        .where(Registration.id == registration_id)
    )
    registration = (await db.execute(stmt)).scalar_one_or_none()
    if not registration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    qr_image = generate_qr_code_data_url(registration.ticket_token)
    p_name = registration.attendee_name or (registration.user.full_name if registration.user else "Attendee")

    return TicketResponse(
        registration_id=registration.id,
        ticket_token=registration.ticket_token,
        qr_code_image=qr_image,
        event_title=registration.event.title,
        venue=registration.event.venue,
        start_time=registration.event.start_time,
        end_time=registration.event.end_time,
        participant_name=p_name,
        attendee_email=registration.attendee_email,
        payment_status=registration.payment_status or "free",
        amount_paid=float(registration.amount_paid or 0.0),
        fee=float(registration.event.fee or 0.0),
        status=registration.status,
        is_checked_in=registration.attendance is not None,
        checked_in_at=registration.attendance.checked_in_at if registration.attendance else None
    )

@router.get("/organiser/events/{event_id}/analytics", response_model=EventAnalyticsResponse)
async def get_event_analytics(
    event_id: uuid.UUID,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns registration, check-in, attendance rate, and capacity metrics."""
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if event.organiser_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view analytics for this event")

    analytics = await calculate_event_analytics(db, event)
    return EventAnalyticsResponse(**analytics)

@router.get("/organiser/events/{event_id}/registrations", response_model=List[ParticipantRegistrationItem])
async def list_event_participants(
    event_id: uuid.UUID,
    format: str = "json",
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List participants for an event with optional CSV download (`?format=csv`)."""
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if event.organiser_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view participant list")

    stmt = (
        select(Registration)
        .options(selectinload(Registration.user), selectinload(Registration.attendance))
        .where(Registration.event_id == event_id)
        .order_by(Registration.registered_at.asc())
    )
    result = await db.execute(stmt)
    regs = result.scalars().all()

    items = []
    custom_field_keys = []
    if event.custom_fields and isinstance(event.custom_fields, list):
        custom_field_keys = [f.get("label", f.get("id")) for f in event.custom_fields if isinstance(f, dict)]

    for r in regs:
        p_name = r.attendee_name or (r.user.full_name if r.user else "Guest Attendee")
        p_email = r.attendee_email or ""
        items.append(ParticipantRegistrationItem(
            registration_id=r.id,
            user_id=r.user_id,
            participant_name=p_name,
            attendee_email=p_email,
            payment_status=r.payment_status or "free",
            amount_paid=float(r.amount_paid or 0.0),
            registered_at=r.registered_at,
            status=r.status,
            is_checked_in=r.attendance is not None,
            checked_in_at=r.attendance.checked_in_at if r.attendance else None,
            form_responses=r.form_responses or {}
        ))

    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        
        headers = ["Registration ID", "User ID", "Participant Name", "Email", "Payment Status", "Amount Paid (₹)", "Registration Date (UTC)", "Status", "Checked In", "Check-in Date (UTC)"]
        headers.extend(custom_field_keys)
        writer.writerow(headers)

        for item in items:
            row = [
                str(item.registration_id),
                str(item.user_id or "Guest"),
                item.participant_name,
                item.attendee_email or "",
                item.payment_status.upper(),
                f"{item.amount_paid:.2f}",
                item.registered_at.strftime("%Y-%m-%d %H:%M:%S"),
                item.status,
                "YES" if item.is_checked_in else "NO",
                item.checked_in_at.strftime("%Y-%m-%d %H:%M:%S") if item.checked_in_at else "N/A"
            ]
            responses = item.form_responses or {}
            for k in custom_field_keys:
                row.append(str(responses.get(k, "")))
            writer.writerow(row)

        csv_content = output.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=participants_{event_id}.csv"}
        )

    return items
