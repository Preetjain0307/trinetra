from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Sensor, SensorEvent
from backend.app.schemas import SensorResponse, SensorEventResponse, SensorEventCreate
from backend.app.api.deps import get_current_user
from backend.app.services.fusion_engine import fusion_engine
from backend.app.services.audit_service import log_action

router = APIRouter(prefix="/sensors", tags=["Sensors"])

@router.get("", response_model=List[SensorResponse])
def get_sensors(
    sensor_type: Optional[str] = None,
    zone: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Sensor)
    if sensor_type:
        query = query.filter(Sensor.sensor_type == sensor_type.upper())
    if zone:
        query = query.filter(Sensor.zone_code == zone)
    return query.all()

@router.get("/events", response_model=List[SensorEventResponse])
def get_sensor_events(
    limit: int = 50,
    zone: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SensorEvent).order_by(SensorEvent.id.desc())
    if zone:
        query = query.filter(SensorEvent.zone_code == zone)
    return query.limit(limit).all()

@router.post("/events", response_model=SensorEventResponse)
def ingest_sensor_event(
    event_in: SensorEventCreate,
    db: Session = Depends(get_db)
):
    """
    Ingests any arbitrary sensor event (CCTV, THERMAL, RADAR, UGS, UAV, ANPR)
    and passes it directly to the Multi-Sensor Fusion Engine.
    """
    event = SensorEvent(
        event_id=f"EVT-{event_in.source_type.upper()}-{int(datetime.now().timestamp())}",
        source_type=event_in.source_type.upper(),
        sensor_id=event_in.sensor_id,
        timestamp=datetime.now(timezone.utc),
        zone_code=event_in.zone_code,
        event_type=event_in.event_type,
        object_type=event_in.object_type or "UNKNOWN",
        direction=event_in.direction,
        speed=event_in.speed,
        range_dist=event_in.range_dist,
        confidence=event_in.confidence,
        metadata_json=event_in.metadata_json or {}
    )
    db.add(event)
    db.flush()

    # Pass through Fusion Engine
    incident = fusion_engine.process_sensor_event(db, event, auto_commit=True)

    return event
