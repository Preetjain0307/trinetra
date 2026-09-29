from datetime import datetime, timezone
import pytest
from backend.app.core.database import SessionLocal
from backend.app.models import SensorEvent, Incident, IncidentStatus
from backend.app.services.fusion_engine import fusion_engine

def test_sensor_correlation_and_deduplication():
    db = SessionLocal()
    try:
        base_time = datetime.now(timezone.utc)
        test_zone = "Zone B"

        # Ingest 1st observation: CCTV
        evt1 = SensorEvent(
            event_id=f"TEST-CCTV-{int(base_time.timestamp())}",
            source_type="CCTV",
            sensor_id="C-01",
            timestamp=base_time,
            zone_code=test_zone,
            event_type="person_detected",
            object_type="PERSON",
            confidence=0.92
        )
        inc1 = fusion_engine.process_sensor_event(db, evt1, auto_commit=True)
        assert inc1 is not None
        assert inc1.id is not None
        first_incident_id = inc1.id

        # Ingest 2nd observation in same zone within 60s: Thermal
        evt2 = SensorEvent(
            event_id=f"TEST-THERMAL-{int(base_time.timestamp())}",
            source_type="THERMAL",
            sensor_id="T-01",
            timestamp=base_time,
            zone_code=test_zone,
            event_type="heat_signature",
            object_type="PERSON",
            confidence=0.89
        )
        inc2 = fusion_engine.process_sensor_event(db, evt2, auto_commit=True)

        # DEDUPLICATION CHECK: Both observations should map to the SAME incident
        assert inc2.id == first_incident_id
        assert len(inc2.contributing_sources) >= 2

        # Clean up test incident
        db.delete(inc2)
        db.commit()

    finally:
        db.close()
