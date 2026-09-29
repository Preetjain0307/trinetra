from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.services.simulation_service import simulation_service
from backend.app.services.audit_service import log_action
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/simulation", tags=["Simulation & Demo Scenarios"])

@router.post("/scenario/night-movement")
def trigger_night_movement(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Triggers Scenario 1: Multi-Sensor Night Movement in Zone B (INC-1042) full run.
    """
    res = simulation_service.run_multi_sensor_night_movement_scenario(db)
    log_action(
        db=db,
        user_email=current_user.email,
        role=current_user.role,
        action="DEMO_SCENARIO_TRIGGERED",
        resource="Scenario",
        details={"scenario": "Multi-Sensor Night Movement in Zone B"}
    )
    return res

@router.post("/scenario/night-movement/step")
def trigger_night_movement_step(
    step: int = Query(1, ge=1, le=5),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Executes a specific step of Scenario 1 (Night Movement) for interactive judge presentation.
    """
    res = simulation_service.run_multi_sensor_night_movement_step(db, step=step)
    log_action(
        db=db,
        user_email=current_user.email,
        role=current_user.role,
        action="DEMO_SCENARIO_STEP",
        resource="Scenario",
        details={"scenario": "Night Movement", "step": step}
    )
    return res

@router.post("/reset")
def reset_demo_scenarios(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Resets all simulated incidents and restores camera stream statuses.
    """
    res = simulation_service.reset_scenarios(db)
    log_action(
        db=db,
        user_email=current_user.email,
        role=current_user.role,
        action="DEMO_SCENARIOS_RESET",
        resource="System",
        details={"status": "RESET_SUCCESS"}
    )
    return res


@router.post("/scenario/camera-failure")
def trigger_camera_failure(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Triggers Scenario 2: Camera Failure & Surveillance Gap.
    """
    res = simulation_service.run_camera_failure_scenario(db)
    log_action(
        db=db,
        user_email=current_user.email,
        role=current_user.role,
        action="DEMO_SCENARIO_TRIGGERED",
        resource="Scenario",
        details={"scenario": "Camera Failure & Surveillance Gap"}
    )
    return res

@router.post("/scenario/sensor-contradiction")
def trigger_sensor_contradiction(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Triggers Scenario 3: Sensor Contradiction.
    """
    res = simulation_service.run_sensor_contradiction_scenario(db)
    log_action(
        db=db,
        user_email=current_user.email,
        role=current_user.role,
        action="DEMO_SCENARIO_TRIGGERED",
        resource="Scenario",
        details={"scenario": "Sensor Contradiction"}
    )
    return res

@router.post("/scenario/route-deviation")
def trigger_route_deviation(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Triggers Scenario 4: Route Deviation for Authorized Personnel.
    """
    res = simulation_service.run_route_deviation_scenario(db)
    log_action(
        db=db,
        user_email=current_user.email,
        role=current_user.role,
        action="DEMO_SCENARIO_TRIGGERED",
        resource="Scenario",
        details={"scenario": "Route Deviation"}
    )
    return res
