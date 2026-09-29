from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Incident, IncidentStatus, IncidentPriority, IncidentTimeline, OperatorAction, AIFeedback
from backend.app.schemas import IncidentResponse, OperatorActionCreate, AIFeedbackCreate
from backend.app.api.deps import get_current_user
from backend.app.services.audit_service import log_action

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    priority: Optional[str] = None,
    status: Optional[str] = None,
    zone: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Incident).order_by(Incident.timestamp.desc())
    if priority and priority != "ALL":
        query = query.filter(Incident.priority == priority.upper())
    if status and status != "ALL":
        query = query.filter(Incident.status == status.upper())
    if zone and zone != "ALL":
        query = query.filter(Incident.zone_code == zone)
    return query.limit(limit).all()

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("/{incident_id}/verify")
def verify_incident(
    incident_id: int,
    action_data: OperatorActionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = IncidentStatus.VERIFIED.value
    incident.verified_by = current_user.email
    incident.verified_at = datetime.now(timezone.utc)

    # Record Operator Action
    action_log = OperatorAction(
        incident_id=incident.id,
        operator_email=current_user.email,
        action="VERIFY",
        reason=action_data.reason or "Confirmed threat signature / protocol verification",
        notes=action_data.notes
    )
    db.add(action_log)

    # Add Timeline Event
    timeline = IncidentTimeline(
        incident_id=incident.id,
        timestamp=datetime.now(timezone.utc),
        event_type="HUMAN_VERIFICATION",
        source_id=current_user.email,
        source_type="OPERATOR",
        description=f"Incident verified by {current_user.full_name} ({current_user.role}). Reason: {action_data.reason or 'Confirmed'}"
    )
    db.add(timeline)
    db.commit()

    log_action(
        db=db,
        user_email=current_user.email,
        role=current_user.role,
        action="INCIDENT_VERIFIED",
        resource="Incident",
        resource_id=str(incident.id),
        details={"incident_code": incident.incident_code, "reason": action_data.reason}
    )

    return {"status": "SUCCESS", "incident_status": incident.status, "verified_by": current_user.email}

@router.post("/{incident_id}/dismiss")
def dismiss_incident(
    incident_id: int,
    action_data: OperatorActionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = IncidentStatus.DISMISSED.value
    incident.dismissed_by = current_user.email
    incident.dismissed_at = datetime.now(timezone.utc)

    action_log = OperatorAction(
        incident_id=incident.id,
        operator_email=current_user.email,
        action="DISMISS",
        reason=action_data.reason or "Non-threatening event / False trigger",
        notes=action_data.notes
    )
    db.add(action_log)

    timeline = IncidentTimeline(
        incident_id=incident.id,
        timestamp=datetime.now(timezone.utc),
        event_type="OPERATOR_DISMISSAL",
        source_id=current_user.email,
        source_type="OPERATOR",
        description=f"Incident dismissed by {current_user.full_name}. Reason: {action_data.reason or 'Dismissed'}"
    )
    db.add(timeline)
    db.commit()

    log_action(
        db=db,
        user_email=current_user.email,
        role=current_user.role,
        action="INCIDENT_DISMISSED",
        resource="Incident",
        resource_id=str(incident.id),
        details={"incident_code": incident.incident_code, "reason": action_data.reason}
    )

    return {"status": "SUCCESS", "incident_status": incident.status}

@router.post("/{incident_id}/escalate")
def escalate_incident(
    incident_id: int,
    action_data: OperatorActionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = IncidentStatus.ESCALATED.value
    incident.priority = IncidentPriority.CRITICAL.value
    incident.escalation_notes = action_data.notes or action_data.reason

    action_log = OperatorAction(
        incident_id=incident.id,
        operator_email=current_user.email,
        action="ESCALATE",
        reason=action_data.reason or "Escalated to Tactical Quick Reaction Team (QRT)",
        notes=action_data.notes
    )
    db.add(action_log)

    timeline = IncidentTimeline(
        incident_id=incident.id,
        timestamp=datetime.now(timezone.utc),
        event_type="TACTICAL_ESCALATION",
        source_id=current_user.email,
        source_type="SUPERVISOR",
        description=f"Incident escalated to QRT by {current_user.full_name}. Reason: {action_data.reason or 'Tactical Alert'}"
    )
    db.add(timeline)
    db.commit()

    log_action(
        db=db,
        user_email=current_user.email,
        role=current_user.role,
        action="INCIDENT_ESCALATED",
        resource="Incident",
        resource_id=str(incident.id),
        details={"incident_code": incident.incident_code, "priority": incident.priority}
    )

    return {"status": "SUCCESS", "incident_status": incident.status, "priority": incident.priority}

@router.post("/{incident_id}/feedback")
def submit_ai_feedback(
    incident_id: int,
    feedback: AIFeedbackCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    ai_fb = AIFeedback(
        incident_id=incident_id,
        detection_id=feedback.detection_id,
        feedback_type=feedback.feedback_type,
        operator_email=current_user.email,
        comments=feedback.comments
    )
    db.add(ai_fb)
    db.commit()
    return {"status": "FEEDBACK_LOGGED", "feedback_type": feedback.feedback_type}
