import uuid
from sqlalchemy import Column, String, Text, Integer, Numeric, DateTime, ForeignKey, BigInteger, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="participant") # participant, organiser, admin
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    events_organised = relationship("Event", back_populates="organiser", cascade="all, delete-orphan")
    registrations = relationship("Registration", back_populates="user", cascade="all, delete-orphan")

class Category(Base):
    __tablename__ = "categories"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)

    events = relationship("Event", back_populates="category")

class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organiser_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(BigInteger, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    venue = Column(String, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    capacity = Column(Integer, nullable=False)
    registration_deadline = Column(DateTime(timezone=True), nullable=False)
    fee = Column(Numeric(10, 2), nullable=False, default=0.00)
    banner_url = Column(String, nullable=True)
    status = Column(String, nullable=False, default="draft") # draft, published, closed, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    organiser = relationship("Profile", back_populates="events_organised")
    category = relationship("Category", back_populates="events")
    registrations = relationship("Registration", back_populates="event", cascade="all, delete-orphan")

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False, default="confirmed") # confirmed, cancelled
    ticket_token = Column(String, unique=True, nullable=False, index=True)
    registered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("Profile", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")
    attendance = relationship("Attendance", back_populates="registration", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("user_id", "event_id", name="uq_user_event_registration"),
    )

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    registration_id = Column(UUID(as_uuid=True), ForeignKey("registrations.id", ondelete="CASCADE"), unique=True, nullable=False)
    checked_in_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    checked_in_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    registration = relationship("Registration", back_populates="attendance")
    checked_by = relationship("Profile")
