from datetime import datetime, timezone
import pytest
from backend.app.schemas import NormalizedEvent, SensorEventCreate

def test_normalized_event_creation():
    now = datetime.now(timezone.utc)
    event = NormalizedEvent(
        event_id="EVT-TEST-001",
        source_type="CCTV",
        source_id="C-01",
        timestamp=now,
        zone_code="Zone B",
        event_type="person_detected",
        object_type="PERSON",
        confidence=0.94,
        direction="NE"
    )
    assert event.event_id == "EVT-TEST-001"
    assert event.source_type == "CCTV"
    assert event.confidence == 0.94
    assert event.status == "INGESTED"

def test_sensor_event_validation():
    data = {
        "source_type": "RADAR",
        "sensor_id": "R-01",
        "zone_code": "Zone B",
        "event_type": "moving_target",
        "speed": 3.4,
        "confidence": 0.88
    }
    schema = SensorEventCreate(**data)
    assert schema.source_type == "RADAR"
    assert schema.speed == 3.4
    assert schema.confidence == 0.88
