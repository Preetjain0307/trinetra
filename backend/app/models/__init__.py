from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class UserRole(str, enum.Enum):
    OPERATOR = "Operator"
    INVESTIGATOR = "Investigator"
    SUPERVISOR = "Supervisor"
    SECURITY_ADMIN = "Security Admin"
    SYSTEM_ADMIN = "System Admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.OPERATOR.value, nullable=False)
    department = Column(String(100), default="Border Security Operations")
    badge_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    mfa_enabled = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=utcnow, index=True)
    user_email = Column(String(255), index=True)
    role = Column(String(50))
    action = Column(String(100), index=True) # e.g., LOGIN, INCIDENT_VERIFIED, EVIDENCE_EXPORTED
    resource = Column(String(100)) # e.g., Incident, Camera, User
    resource_id = Column(String(100), nullable=True)
    ip_address = Column(String(45), default="127.0.0.1")
    status = Column(String(20), default="SUCCESS") # SUCCESS, FAILURE, WARNING
    details = Column(JSON, nullable=True)

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False) # Zone A, Zone B, etc.
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    risk_level = Column(String(20), default="NORMAL") # NORMAL, ELEVATED, HIGH
    restricted = Column(Boolean, default=False)
    active_hours = Column(String(100), default="24x7") # e.g. "06:00-22:00"
    polygon_coords = Column(JSON, nullable=True) # GeoJSON coordinates
    baseline_hourly_activity = Column(JSON, nullable=True) # Average events by hour
    created_at = Column(DateTime, default=utcnow)

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String(50), unique=True, index=True, nullable=False) # C-01, C-02, etc.
    name = Column(String(100), nullable=False)
    type = Column(String(50), default="IP CCTV") # IP CCTV, PTZ, Thermal CCTV, ANPR
    location_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    zone_code = Column(String(20), ForeignKey("zones.code"), index=True, nullable=False)
    source_type = Column(String(30), default="LOCAL_VIDEO") # LOCAL_VIDEO, RTSP, WEBCAM, SIMULATED
    source_url = Column(String(500), nullable=True)
    status = Column(String(20), default="ONLINE", index=True) # ONLINE, OFFLINE, DEGRADED
    fps = Column(Float, default=25.0)
    resolution = Column(String(30), default="1920x1080")
    is_ai_enabled = Column(Boolean, default=True)
    last_heartbeat = Column(DateTime, default=utcnow)
    stream_health = Column(String(20), default="GOOD") # GOOD, UNSTABLE, NO_STREAM
    active_track_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), unique=True, index=True, nullable=False) # T-01, R-01, G-01, U-01
    name = Column(String(100), nullable=False)
    sensor_type = Column(String(50), index=True, nullable=False) # THERMAL, RADAR, UGS, UAV, ANPR
    location_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    zone_code = Column(String(20), ForeignKey("zones.code"), index=True, nullable=False)
    status = Column(String(20), default="ONLINE", index=True) # ONLINE, OFFLINE, DEGRADED, CALIBRATING
    range_meters = Column(Float, default=250.0)
    direction_facing = Column(String(20), default="NE")
    battery_pct = Column(Float, default=98.0)
    last_heartbeat = Column(DateTime, default=utcnow)
    firmware_version = Column(String(50), default="v2.4.1-sec")
    created_at = Column(DateTime, default=utcnow)

class SensorEvent(Base):
    __tablename__ = "sensor_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(100), unique=True, index=True)
    source_type = Column(String(50), index=True, nullable=False) # CCTV, THERMAL, RADAR, UGS, UAV, ANPR
    sensor_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=utcnow, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    zone_code = Column(String(20), index=True, nullable=False)
    event_type = Column(String(100), nullable=False) # heat_signature, moving_target, ground_movement, person_detected, etc.
    object_type = Column(String(50), default="UNKNOWN") # PERSON, VEHICLE, ANIMAL, OBJECT, UNKNOWN
    direction = Column(String(20), nullable=True)
    speed = Column(Float, nullable=True)
    range_dist = Column(Float, nullable=True)
    confidence = Column(Float, default=0.85)
    metadata_json = Column(JSON, nullable=True)
    evidence_reference = Column(String(500), nullable=True)
    is_processed = Column(Boolean, default=False)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(String(100), unique=True, index=True)
    camera_id = Column(String(50), index=True, nullable=False)
    track_id = Column(String(50), index=True, nullable=True)
    class_name = Column(String(50), index=True, nullable=False) # person, car, motorcycle, bus, truck
    confidence = Column(Float, nullable=False)
    bbox = Column(JSON, nullable=False) # [x1, y1, x2, y2]
    timestamp = Column(DateTime, default=utcnow, index=True)
    zone_code = Column(String(20), index=True, nullable=False)
    frame_path = Column(String(500), nullable=True)
    direction = Column(String(20), nullable=True)
    model_version = Column(String(50), default="YOLOv8n-Custom-v1.0")
    created_at = Column(DateTime, default=utcnow)

class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(String(50), unique=True, index=True, nullable=False) # P-014, V-008
    object_class = Column(String(50), nullable=False) # person, vehicle
    camera_id = Column(String(50), index=True, nullable=False)
    zone_code = Column(String(20), index=True, nullable=False)
    first_seen = Column(DateTime, default=utcnow)
    last_seen = Column(DateTime, default=utcnow)
    observation_count = Column(Integer, default=1)
    trajectory = Column(JSON, nullable=True) # list of [{x, y, t, cam}]
    status = Column(String(30), default="ACTIVE") # ACTIVE, LOST, IDENTIFIED, CORRELATED
    associated_person_id = Column(String(50), nullable=True)
    associated_vehicle_id = Column(String(50), nullable=True)
    potential_match_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

class Personnel(Base):
    __tablename__ = "personnel"

    id = Column(Integer, primary_key=True, index=True)
    personnel_id = Column(String(50), unique=True, index=True, nullable=False) # P-001, P-002
    name = Column(String(150), nullable=False)
    role = Column(String(100), default="Patrol Guard")
    unit = Column(String(100), default="Border Security Force Sector 4")
    photo_url = Column(String(500), nullable=True)
    authorized_zones = Column(JSON, default=["Zone A", "Zone B"])
    duty_schedule = Column(String(100), default="06:00 - 18:00")
    assigned_vehicle = Column(String(50), nullable=True)
    verification_status = Column(String(30), default="VERIFIED") # VERIFIED, UNVERIFIED, SUSPENDED
    last_verified_at = Column(DateTime, default=utcnow)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String(50), unique=True, index=True, nullable=False) # V-001
    plate_number = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_type = Column(String(50), default="Patrol SUV") # SUV, Truck, Patrol Car, Motorcycle
    color = Column(String(30), default="Olive Green")
    make_model = Column(String(100), default="Tata Safari Storme GS800")
    registered_owner = Column(String(150), default="Border Guard Logistics Dept")
    authorized_zones = Column(JSON, default=["Zone A", "Zone B", "Zone C"])
    is_flagged = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

class VehicleObservation(Base):
    __tablename__ = "vehicle_observations"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(50), index=True, nullable=False)
    vehicle_type = Column(String(50), default="car")
    camera_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=utcnow, index=True)
    zone_code = Column(String(20), index=True, nullable=False)
    confidence = Column(Float, default=0.92)
    is_ocr_uncertain = Column(Boolean, default=False)
    snapshot_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utcnow)

class IncidentPriority(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFORMATIONAL = "INFORMATIONAL"

class IncidentStatus(str, enum.Enum):
    NEW = "NEW"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    DISMISSED = "DISMISSED"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String(50), unique=True, index=True, nullable=False) # INC-1042
    title = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=utcnow, index=True)
    zone_code = Column(String(20), ForeignKey("zones.code"), index=True, nullable=False)
    location_name = Column(String(150), nullable=False)
    incident_type = Column(String(100), index=True, nullable=False) # Unverified Night Movement, Route Deviation, Camera Failure, etc.
    priority = Column(String(30), default=IncidentPriority.HIGH.value, index=True)
    status = Column(String(30), default=IncidentStatus.NEW.value, index=True)
    correlation_score = Column(Float, default=0.88)
    description = Column(Text, nullable=False)
    contributing_sources = Column(JSON, default=[]) # e.g. [{"type": "CCTV", "id": "C-01"}, {"type": "THERMAL", "id": "T-01"}]
    evidence_files = Column(JSON, default=[])
    verified_by = Column(String(255), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    dismissed_by = Column(String(255), nullable=True)
    dismissed_at = Column(DateTime, nullable=True)
    escalation_notes = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    sensor_consistency_status = Column(String(50), default="CONSISTENT") # CONSISTENT, CONTRADICTION_FLAGGED, PARTIAL
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    timeline_entries = relationship("IncidentTimeline", back_populates="incident", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="incident", cascade="all, delete-orphan")

class IncidentTimeline(Base):
    __tablename__ = "incident_timelines"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    timestamp = Column(DateTime, default=utcnow, index=True)
    event_type = Column(String(100), nullable=False)
    source_id = Column(String(50), nullable=False) # C-01, T-01, Operator, etc.
    source_type = Column(String(50), nullable=False) # CCTV, THERMAL, RADAR, UGS, HUMAN
    description = Column(Text, nullable=False)
    evidence_ref = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    incident = relationship("Incident", back_populates="timeline_entries")

class OperatorAction(Base):
    __tablename__ = "operator_actions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    operator_email = Column(String(255), nullable=False)
    action = Column(String(50), nullable=False) # VERIFY, DISMISS, ESCALATE, ADD_NOTE
    reason = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utcnow, index=True)

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=False) # SHA-256
    file_type = Column(String(50), default="IMAGE") # IMAGE, VIDEO, SENSOR_LOG
    source_type = Column(String(50), nullable=False) # CCTV, THERMAL, RADAR, UGS
    source_id = Column(String(50), nullable=False)
    captured_at = Column(DateTime, default=utcnow)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    incident = relationship("Incident", back_populates="evidence_items")

class AIFeedback(Base):
    __tablename__ = "ai_feedback"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    detection_id = Column(String(100), nullable=True)
    feedback_type = Column(String(50), nullable=False) # CONFIRMED_TRUE_POSITIVE, FALSE_ALERT, NEEDS_REVIEW
    operator_email = Column(String(255), nullable=False)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

class Geofence(Base):
    __tablename__ = "geofences"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    zone_code = Column(String(20), ForeignKey("zones.code"), nullable=False)
    fence_type = Column(String(50), default="RESTRICTED_ZONE") # RESTRICTED_ZONE, TEMPORARY_ZONE, PATROL_CORRIDOR, HIGH_ATTENTION
    geometry_geojson = Column(JSON, nullable=False)
    valid_from = Column(DateTime, nullable=True)
    valid_to = Column(DateTime, nullable=True)
    priority = Column(String(20), default="HIGH")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
