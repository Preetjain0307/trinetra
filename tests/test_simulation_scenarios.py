import pytest
from backend.app.core.database import SessionLocal
from backend.app.services.simulation_service import simulation_service
from backend.app.models import Incident, Camera

def test_simulation_scenarios_execution():
    db = SessionLocal()
    try:
        # 1. Reset
        reset_res = simulation_service.reset_scenarios(db)
        assert reset_res["status"] == "RESET_SUCCESS"

        # 2. Scenario 1 (Night Infiltration)
        scen1 = simulation_service.run_multi_sensor_night_movement_scenario(db)
        assert scen1["status"] == "SCENARIO_COMPLETED"
        assert scen1["incident_code"] == "INC-1042"
        assert scen1["source_count"] >= 4

        # 3. Scenario 2 (Camera Failure)
        scen2 = simulation_service.run_camera_failure_scenario(db)
        assert scen2["status"] == "CAMERA_OFFLINE_TRIGGERED"
        cam = db.query(Camera).filter(Camera.camera_id == "C-02").first()
        assert cam.status == "OFFLINE"

        # 4. Scenario 3 (Contradiction)
        scen3 = simulation_service.run_sensor_contradiction_scenario(db)
        assert scen3["status"] == "SCENARIO_COMPLETED"
        assert scen3["consistency_status"] == "CONTRADICTION_FLAGGED"

        # 5. Scenario 4 (Route Deviation)
        scen4 = simulation_service.run_route_deviation_scenario(db)
        assert scen4["status"] == "SCENARIO_COMPLETED"

        # Final Clean Reset
        simulation_service.reset_scenarios(db)
    finally:
        db.close()
