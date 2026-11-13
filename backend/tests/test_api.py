import pytest
import uuid
from datetime import datetime, timedelta, timezone
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
from fastapi import HTTPException

from app.main import app
from app.database.session import Base
from app.models.models import Profile, Event, Registration, Attendance
from app.services.event_service import (
    register_participant_atomic,
    validate_and_checkin_ticket,
    calculate_event_analytics
)

import pytest_asyncio

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_unauthenticated_access_returns_401():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/auth/me")
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_atomic_registration_and_duplicate_prevention(db_session: AsyncSession):
    organiser = Profile(id=uuid.uuid4(), full_name="Organizer Alice", role="organiser")
    participant = Profile(id=uuid.uuid4(), full_name="Participant Bob", role="participant")
    db_session.add_all([organiser, participant])
    await db_session.commit()

    event = Event(
        id=uuid.uuid4(),
        organiser_id=organiser.id,
        title="AI Hackathon 2026",
        description="A great hackathon",
        venue="Campus Hall A",
        start_time=datetime.now(timezone.utc) + timedelta(days=2),
        end_time=datetime.now(timezone.utc) + timedelta(days=3),
        capacity=1,
        registration_deadline=datetime.now(timezone.utc) + timedelta(days=1),
        fee=0.00,
        status="published"
    )
    db_session.add(event)
    await db_session.commit()

    # 1. First registration should succeed
    reg = await register_participant_atomic(db_session, participant.id, event.id)
    assert reg.status == "confirmed"
    assert reg.ticket_token.startswith("TK-")

    # 2. Second registration by same participant should fail with duplicate error
    with pytest.raises(HTTPException) as exc_info:
        await register_participant_atomic(db_session, participant.id, event.id)
    assert exc_info.value.status_code == 400
    assert "already registered" in exc_info.value.detail

@pytest.mark.asyncio
async def test_capacity_rejection(db_session: AsyncSession):
    organiser = Profile(id=uuid.uuid4(), full_name="Org", role="organiser")
    p1 = Profile(id=uuid.uuid4(), full_name="P1", role="participant")
    p2 = Profile(id=uuid.uuid4(), full_name="P2", role="participant")
    db_session.add_all([organiser, p1, p2])
    await db_session.commit()

    event = Event(
        id=uuid.uuid4(),
        organiser_id=organiser.id,
        title="Limited Workshop",
        description="Only 1 seat",
        venue="Lab 101",
        start_time=datetime.now(timezone.utc) + timedelta(days=2),
        end_time=datetime.now(timezone.utc) + timedelta(days=3),
        capacity=1,
        registration_deadline=datetime.now(timezone.utc) + timedelta(days=1),
        fee=0.00,
        status="published"
    )
    db_session.add(event)
    await db_session.commit()

    # First participant fills capacity
    await register_participant_atomic(db_session, p1.id, event.id)

    # Second participant should be rejected due to capacity limit
    with pytest.raises(HTTPException) as exc_info:
        await register_participant_atomic(db_session, p2.id, event.id)
    assert exc_info.value.status_code == 400
    assert "capacity" in exc_info.value.detail.lower()

@pytest.mark.asyncio
async def test_qr_checkin_and_duplicate_scan_rejection(db_session: AsyncSession):
    organiser = Profile(id=uuid.uuid4(), full_name="Org", role="organiser")
    participant = Profile(id=uuid.uuid4(), full_name="Participant", role="participant")
    db_session.add_all([organiser, participant])
    await db_session.commit()

    event = Event(
        id=uuid.uuid4(),
        organiser_id=organiser.id,
        title="Checkin Test Event",
        description="Desc",
        venue="Main Auditorium",
        start_time=datetime.now(timezone.utc) + timedelta(days=1),
        end_time=datetime.now(timezone.utc) + timedelta(days=1, hours=2),
        capacity=50,
        registration_deadline=datetime.now(timezone.utc) + timedelta(hours=12),
        fee=0.00,
        status="published"
    )
    db_session.add(event)
    await db_session.commit()

    reg = await register_participant_atomic(db_session, participant.id, event.id)

    # First scan succeeds
    reg_checked, attendance = await validate_and_checkin_ticket(
        db_session,
        ticket_token=reg.ticket_token,
        event_id=event.id,
        staff_user_id=organiser.id
    )
    assert attendance.checked_in_by == organiser.id
    assert attendance.registration_id == reg.id

    # Second scan MUST be rejected (HTTP 409 Conflict)
    with pytest.raises(HTTPException) as exc_info:
        await validate_and_checkin_ticket(
            db_session,
            ticket_token=reg.ticket_token,
            event_id=event.id,
            staff_user_id=organiser.id
        )
    assert exc_info.value.status_code == 409
    assert "already checked in" in exc_info.value.detail

@pytest.mark.asyncio
async def test_event_analytics_calculation(db_session: AsyncSession):
    organiser = Profile(id=uuid.uuid4(), full_name="Org", role="organiser")
    p1 = Profile(id=uuid.uuid4(), full_name="P1", role="participant")
    p2 = Profile(id=uuid.uuid4(), full_name="P2", role="participant")
    db_session.add_all([organiser, p1, p2])
    await db_session.commit()

    event = Event(
        id=uuid.uuid4(),
        organiser_id=organiser.id,
        title="Analytics Event",
        description="Desc",
        venue="Auditorium B",
        start_time=datetime.now(timezone.utc) + timedelta(days=1),
        end_time=datetime.now(timezone.utc) + timedelta(days=1, hours=3),
        capacity=10,
        registration_deadline=datetime.now(timezone.utc) + timedelta(hours=12),
        fee=0.00,
        status="published"
    )
    db_session.add(event)
    await db_session.commit()

    # 2 registrations
    reg1 = await register_participant_atomic(db_session, p1.id, event.id)
    await register_participant_atomic(db_session, p2.id, event.id)

    # Check in only p1
    await validate_and_checkin_ticket(db_session, reg1.ticket_token, event.id, organiser.id)

    analytics = await calculate_event_analytics(db_session, event)
    assert analytics["registrations"] == 2
    assert analytics["checked_in"] == 1
    assert analytics["no_shows"] == 1
    assert analytics["attendance_rate"] == 50.0
    assert analytics["capacity_utilisation"] == 20.0

@pytest.mark.asyncio
async def test_guest_registration_without_login_and_payment(db_session: AsyncSession):
    organiser = Profile(id=uuid.uuid4(), full_name="Event Host", role="organiser")
    db_session.add(organiser)
    await db_session.commit()

    event = Event(
        id=uuid.uuid4(),
        organiser_id=organiser.id,
        title="Premium Workshop 2026",
        description="Exclusive training",
        venue="Lab 404",
        start_time=datetime.now(timezone.utc) + timedelta(days=2),
        end_time=datetime.now(timezone.utc) + timedelta(days=2, hours=4),
        capacity=5,
        registration_deadline=datetime.now(timezone.utc) + timedelta(days=1),
        fee=499.00,
        status="published"
    )
    db_session.add(event)
    await db_session.commit()

    # Guest registers with name, email and payment - NO user_id required
    guest_reg = await register_participant_atomic(
        db=db_session,
        user_id=None,
        event_id=event.id,
        attendee_name="Guest Alex",
        attendee_email="alex.guest@example.com",
        form_responses={"Phone": "+919876543210"},
        payment_id="pay_mock_12345",
        amount_paid=499.00
    )

    assert guest_reg.status == "confirmed"
    assert guest_reg.user_id is None
    assert guest_reg.attendee_name == "Guest Alex"
    assert guest_reg.attendee_email == "alex.guest@example.com"
    assert guest_reg.payment_status == "paid"
    assert float(guest_reg.amount_paid) == 499.00
    assert guest_reg.ticket_token.startswith("TK-")

    # Check that check-in works seamlessly for guest
    reg_checked, att = await validate_and_checkin_ticket(
        db=db_session,
        ticket_token=guest_reg.ticket_token,
        event_id=event.id,
        staff_user_id=organiser.id
    )
    assert att is not None
    assert reg_checked.id == guest_reg.id

def test_ticket_email_generation_and_preview_saving():
    import os
    from app.services.email_service import send_ticket_confirmation_email
    test_id = str(uuid.uuid4())
    send_ticket_confirmation_email(
        to_email="test.attendee@example.com",
        attendee_name="Test Attendee",
        event_title="Tech Summit 2026",
        event_date="Saturday, March 15, 2026 at 10:00 AM",
        event_location="Convention Hall A",
        registration_id=test_id,
        ticket_token="TK-testtoken1234567890",
    )
    preview_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sent_emails", f"ticket_{test_id[:8]}_test.attendee_at_example.com.html")
    assert os.path.exists(preview_file)
    with open(preview_file, "r", encoding="utf-8") as f:
        content = f.read()
    assert "Tech Summit 2026" in content
    assert "Test Attendee" in content
    assert "data:image/png;base64," in content
    # Clean up test file
    os.remove(preview_file)
