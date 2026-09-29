from datetime import datetime, timezone
import pytest
from backend.app.core.database import SessionLocal
from backend.app.models import SensorEvent, Incident
from backend.app.services.fusion_engine import fusion_engine

def test_sensor_contradiction_handling():
    db = SessionLocal()
    try:
        base_time = datetime.now(timezone.utc)
        
        # Radar detects moving target with contradiction flag
        evt = SensorEvent(
            event_id=f"TEST-CONTRA-{int(base_time.timestamp())}",
            source_type="RADAR",
            sensor_id="R-02",
            timestamp=base_time,
            zone_code="Zone C",
            event_type="moving_target",
            object_type="VEHICLE",
            confidence=0.85,
            metadata_json={"contradiction": True}
        )
        inc = fusion_engine.process_sensor_event(db, evt, auto_commit=True)

        assert inc.sensor_consistency_status == "CONTRADICTION_FLAGGED"
        assert inc.correlation_score < 0.50 # Attenuated confidence due to lack of corroboration

        # Clean up
        db.delete(inc)
        db.commit()
    finally:
        db.close()
