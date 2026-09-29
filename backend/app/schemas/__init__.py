from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH SCHEMAS -----------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: Dict[str, Any]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    mfa_code: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    department: Optional[str] = "Border Security Operations"
    badge_number: Optional[str] = None
    is_active: bool = True
    mfa_enabled: bool = False

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    last_login: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- CAMERA & SENSOR SCHEMAS -----------------
class CameraBase(BaseModel):
    camera_id: str
    name: str
    type: str = "IP CCTV"
    location_name: str
    latitude: float
    longitude: float
    zone_code: str
    source_type: str = "LOCAL_VIDEO"
    source_url: Optional[str] = None
    status: str = "ONLINE"
    fps: float = 25.0
    resolution: str = "1920x1080"
    is_ai_enabled: bool = True
    stream_health: str = "GOOD"

class CameraCreate(CameraBase):
    pass

class CameraResponse(CameraBase):
    id: int
    active_track_count: int
    last_heartbeat: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class SensorBase(BaseModel):
    sensor_id: str
    name: str
    sensor_type: str
    location_name: str
    latitude: float
    longitude: float
    zone_code: str
    status: str = "ONLINE"
    range_meters: float = 250.0
    direction_facing: str = "NE"
    battery_pct: float = 98.0
    firmware_version: str = "v2.4.1-sec"

class SensorResponse(SensorBase):
    id: int
    last_heartbeat: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class SensorEventCreate(BaseModel):
    source_type: str
    sensor_id: str
    zone_code: str
    event_type: str
    object_type: Optional[str] = "UNKNOWN"
    direction: Optional[str] = None
    speed: Optional[float] = None
    range_dist: Optional[float] = None
    confidence: float = 0.85
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    metadata_json: Optional[Dict[str, Any]] = None

class SensorEventResponse(SensorEventCreate):
    id: int
    event_id: str
    timestamp: datetime
    is_processed: bool
    incident_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class NormalizedEvent(BaseModel):
    event_id: str
    source_type: str # CCTV, THERMAL, RADAR, UGS, ACOUSTIC, UAV, ANPR
    source_id: str
    timestamp: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    zone_code: str
    event_type: str
    object_type: Optional[str] = "UNKNOWN"
    direction: Optional[str] = None
    speed: Optional[float] = None
    range_dist: Optional[float] = None
    confidence: float = 0.85
    evidence_reference: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    status: Optional[str] = "INGESTED"


# ----------------- DETECTION & TRACK SCHEMAS -----------------
class DetectionResponse(BaseModel):
    id: int
    detection_id: str
    camera_id: str
    track_id: Optional[str]
    class_name: str
    confidence: float
    bbox: List[float]
    timestamp: datetime
    zone_code: str
    frame_path: Optional[str]
    direction: Optional[str]
    model_version: str

    class Config:
        from_attributes = True

class TrackResponse(BaseModel):
    id: int
    track_id: str
    object_class: str
    camera_id: str
    zone_code: str
    first_seen: datetime
    last_seen: datetime
    observation_count: int
    trajectory: Optional[List[Dict[str, Any]]]
    status: str
    associated_person_id: Optional[str]
    associated_vehicle_id: Optional[str]
    potential_match_notes: Optional[str]

    class Config:
        from_attributes = True

# ----------------- PERSONNEL & VEHICLE SCHEMAS -----------------
class PersonnelResponse(BaseModel):
    id: int
    personnel_id: str
    name: str
    role: str
    unit: str
    photo_url: Optional[str]
    authorized_zones: List[str]
    duty_schedule: str
    assigned_vehicle: Optional[str]
    verification_status: str
    last_verified_at: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True

class VehicleResponse(BaseModel):
    id: int
    vehicle_id: str
    plate_number: str
    vehicle_type: str
    color: str
    make_model: str
    registered_owner: str
    authorized_zones: List[str]
    is_flagged: bool
    notes: Optional[str]

    class Config:
        from_attributes = True

class VehicleObservationResponse(BaseModel):
    id: int
    plate_number: str
    vehicle_type: str
    camera_id: str
    timestamp: datetime
    zone_code: str
    confidence: float
    is_ocr_uncertain: bool
    snapshot_path: Optional[str]

    class Config:
        from_attributes = True

# ----------------- INCIDENT SCHEMAS -----------------
class IncidentTimelineResponse(BaseModel):
    id: int
    timestamp: datetime
    event_type: str
    source_id: str
    source_type: str
    description: str
    evidence_ref: Optional[str]

    class Config:
        from_attributes = True

class EvidenceResponse(BaseModel):
    id: int
    incident_id: int
    file_name: str
    file_path: str
    file_hash: str
    file_type: str
    source_type: str
    source_id: str
    captured_at: datetime
    is_verified: bool

    class Config:
        from_attributes = True

class IncidentResponse(BaseModel):
    id: int
    incident_code: str
    title: str
    timestamp: datetime
    zone_code: str
    location_name: str
    incident_type: str
    priority: str
    status: str
    correlation_score: float
    description: str
    contributing_sources: List[Dict[str, Any]]
    evidence_files: List[Any]
    verified_by: Optional[str]
    verified_at: Optional[datetime]
    dismissed_by: Optional[str]
    dismissed_at: Optional[datetime]
    escalation_notes: Optional[str]
    ai_summary: Optional[str]
    sensor_consistency_status: str
    timeline_entries: List[IncidentTimelineResponse] = []
    evidence_items: List[EvidenceResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class OperatorActionCreate(BaseModel):
    action: str # VERIFY, DISMISS, ESCALATE, ADD_NOTE
    reason: Optional[str] = None
    notes: Optional[str] = None

class AIFeedbackCreate(BaseModel):
    incident_id: Optional[int] = None
    detection_id: Optional[str] = None
    feedback_type: str # CONFIRMED_TRUE_POSITIVE, FALSE_ALERT, NEEDS_REVIEW
    comments: Optional[str] = None

# ----------------- AUDIT & ANALYTICS -----------------
class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    user_email: str
    role: str
    action: str
    resource: str
    resource_id: Optional[str]
    ip_address: str
    status: str
    details: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True

class ZoneResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str]
    risk_level: str
    restricted: bool
    active_hours: str
    polygon_coords: Optional[List[Any]]
    created_at: datetime

    class Config:
        from_attributes = True
