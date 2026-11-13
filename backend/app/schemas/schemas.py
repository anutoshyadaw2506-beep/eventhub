from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

# Profile Schemas
class ProfileBase(BaseModel):
    full_name: str
    role: str = "participant"
    avatar_url: Optional[str] = None

class ProfileRegisterRequest(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

# Category Schemas
class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    model_config = ConfigDict(from_attributes=True)

# Event Schemas
class EventBase(BaseModel):
    title: str
    description: str
    venue: str
    start_time: datetime
    end_time: datetime
    capacity: int = Field(gt=0)
    registration_deadline: datetime
    fee: Decimal = Decimal("0.00")
    banner_url: Optional[str] = None
    category_id: Optional[int] = None
    custom_fields: Optional[List[Dict[str, Any]]] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    capacity: Optional[int] = Field(default=None, gt=0)
    registration_deadline: Optional[datetime] = None
    fee: Optional[Decimal] = None
    banner_url: Optional[str] = None
    category_id: Optional[int] = None
    custom_fields: Optional[List[Dict[str, Any]]] = None
    status: Optional[str] = None

class EventResponse(EventBase):
    id: UUID
    organiser_id: UUID
    status: str
    created_at: datetime
    category: Optional[CategoryResponse] = None
    organiser: Optional[ProfileResponse] = None
    registered_count: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)

# Registration & Ticket Schemas
class RegistrationCreate(BaseModel):
    form_responses: Optional[Dict[str, Any]] = None

class RegistrationResponse(BaseModel):
    id: UUID
    user_id: UUID
    event_id: UUID
    status: str
    registered_at: datetime
    form_responses: Optional[Dict[str, Any]] = None
    event: Optional[EventResponse] = None
    is_checked_in: bool = False
    model_config = ConfigDict(from_attributes=True)

class TicketResponse(BaseModel):
    registration_id: UUID
    ticket_token: str
    qr_code_image: str  # Base64 encoded data URI
    event_title: str
    venue: str
    start_time: datetime
    end_time: datetime
    participant_name: str
    status: str
    is_checked_in: bool
    checked_in_at: Optional[datetime] = None

# Check-in Schemas
class CheckInRequest(BaseModel):
    ticket_token: str
    event_id: UUID

class CheckInResponse(BaseModel):
    success: bool
    message: str
    registration_id: Optional[UUID] = None
    participant_name: Optional[str] = None
    checked_in_at: Optional[datetime] = None
    is_duplicate: bool = False

# Analytics Schemas
class EventAnalyticsResponse(BaseModel):
    event_id: UUID
    title: str
    capacity: int
    registrations: int
    checked_in: int
    no_shows: int
    attendance_rate: float
    capacity_utilisation: float

class ParticipantRegistrationItem(BaseModel):
    registration_id: UUID
    user_id: UUID
    participant_name: str
    registered_at: datetime
    status: str
    is_checked_in: bool
    checked_in_at: Optional[datetime] = None
    form_responses: Optional[Dict[str, Any]] = None
