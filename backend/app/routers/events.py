import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.core.security import get_current_user, require_role
from app.models.models import Event, Category, Profile, Registration
from app.schemas.schemas import (
    EventCreate,
    EventUpdate,
    EventResponse,
    CategoryResponse,
)

router = APIRouter(tags=["Events"])

@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """List all event categories."""
    result = await db.execute(select(Category).order_by(Category.name))
    return result.scalars().all()

@router.get("/events", response_model=List[EventResponse])
async def list_events(
    search: Optional[str] = Query(None, description="Search in title or description"),
    category_slug: Optional[str] = Query(None, description="Filter by category slug"),
    venue: Optional[str] = Query(None, description="Filter by venue"),
    status_filter: Optional[str] = Query("published", description="Filter by status (default: published)"),
    db: AsyncSession = Depends(get_db)
):
    """List events matching optional search, category, venue, and status filters."""
    query = (
        select(Event)
        .options(selectinload(Event.category), selectinload(Event.organiser))
        .order_by(Event.start_time.asc())
    )

    conditions = []
    if status_filter:
        conditions.append(Event.status == status_filter)

    if search:
        search_pattern = f"%{search}%"
        conditions.append(or_(Event.title.ilike(search_pattern), Event.description.ilike(search_pattern)))

    if category_slug:
        query = query.join(Event.category)
        conditions.append(Category.slug == category_slug)

    if venue:
        conditions.append(Event.venue.ilike(f"%{venue}%"))

    if conditions:
        query = query.where(and_(*conditions))

    result = await db.execute(query)
    events = result.scalars().all()

    # Populate registered_count for each event
    response_list = []
    for event in events:
        count_stmt = select(func.count(Registration.id)).where(
            and_(Registration.event_id == event.id, Registration.status == "confirmed")
        )
        reg_count = (await db.execute(count_stmt)).scalar() or 0
        
        event_dict = EventResponse.model_validate(event)
        event_dict.registered_count = reg_count
        response_list.append(event_dict)

    return response_list

@router.get("/events/me/organised", response_model=List[EventResponse])
async def list_my_organised_events(
    current_user: Profile = Depends(require_role(["organiser", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """List events created by the logged-in organiser."""
    query = (
        select(Event)
        .options(selectinload(Event.category), selectinload(Event.organiser))
        .where(Event.organiser_id == current_user.id)
        .order_by(Event.created_at.desc())
    )
    result = await db.execute(query)
    events = result.scalars().all()

    response_list = []
    for event in events:
        count_stmt = select(func.count(Registration.id)).where(
            and_(Registration.event_id == event.id, Registration.status == "confirmed")
        )
        reg_count = (await db.execute(count_stmt)).scalar() or 0
        
        event_dict = EventResponse.model_validate(event)
        event_dict.registered_count = reg_count
        response_list.append(event_dict)

    return response_list

@router.get("/events/{id}", response_model=EventResponse)
async def get_event_detail(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Fetch event details by ID."""
    stmt = (
        select(Event)
        .options(selectinload(Event.category), selectinload(Event.organiser))
        .where(Event.id == id)
    )
    result = await db.execute(stmt)
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    count_stmt = select(func.count(Registration.id)).where(
        and_(Registration.event_id == event.id, Registration.status == "confirmed")
    )
    reg_count = (await db.execute(count_stmt)).scalar() or 0

    res = EventResponse.model_validate(event)
    res.registered_count = reg_count
    return res

@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_in: EventCreate,
    current_user: Profile = Depends(require_role(["organiser", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Create a new event in draft status (Organiser only)."""
    if event_in.end_time <= event_in.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event end time must be after start time"
        )

    event = Event(
        **event_in.model_dump(),
        organiser_id=current_user.id,
        status="draft"
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)

    stmt = select(Event).options(selectinload(Event.category), selectinload(Event.organiser)).where(Event.id == event.id)
    created_event = (await db.execute(stmt)).scalar_one()
    return EventResponse.model_validate(created_event)

@router.patch("/events/{id}", response_model=EventResponse)
async def update_event(
    id: uuid.UUID,
    event_update: EventUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update event details (Owner or Admin only)."""
    event = await db.get(Event, id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if event.organiser_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this event")

    update_data = event_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)

    await db.commit()
    await db.refresh(event)

    stmt = select(Event).options(selectinload(Event.category), selectinload(Event.organiser)).where(Event.id == event.id)
    updated = (await db.execute(stmt)).scalar_one()
    return EventResponse.model_validate(updated)

@router.post("/events/{id}/publish", response_model=EventResponse)
async def publish_event(
    id: uuid.UUID,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Publish a draft event (Owner or Admin only)."""
    event = await db.get(Event, id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if event.organiser_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to publish this event")

    event.status = "published"
    await db.commit()
    await db.refresh(event)

    stmt = select(Event).options(selectinload(Event.category), selectinload(Event.organiser)).where(Event.id == event.id)
    return EventResponse.model_validate((await db.execute(stmt)).scalar_one())

@router.delete("/events/{id}", status_code=status.HTTP_200_OK)
async def delete_event(
    id: uuid.UUID,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel or delete an event (Owner or Admin only)."""
    event = await db.get(Event, id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if event.organiser_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this event")

    event.status = "cancelled"
    await db.commit()
    return {"message": "Event successfully cancelled", "event_id": str(id)}
