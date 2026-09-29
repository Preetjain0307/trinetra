from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Personnel, Track, Incident
from backend.app.schemas import PersonnelResponse

router = APIRouter(prefix="/personnel", tags=["Personnel Intelligence"])

@router.get("", response_model=List[PersonnelResponse])
def get_personnel(
    verification_status: Optional[str] = None,
    unit: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Personnel)
    if verification_status:
        query = query.filter(Personnel.verification_status == verification_status)
    if unit:
        query = query.filter(Personnel.unit == unit)
    return query.all()

@router.get("/{personnel_id}", response_model=PersonnelResponse)
def get_personnel_by_id(personnel_id: str, db: Session = Depends(get_db)):
    person = db.query(Personnel).filter(Personnel.personnel_id == personnel_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Personnel not found")
    return person

@router.get("/{personnel_id}/journey")
def get_personnel_journey(personnel_id: str, db: Session = Depends(get_db)):
    person = db.query(Personnel).filter(Personnel.personnel_id == personnel_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Personnel not found")

    # Fetch correlated tracks or observations
    tracks = db.query(Track).filter(Track.associated_person_id == personnel_id).all()
    journey_points = []
    for t in tracks:
        journey_points.append({
            "camera_id": t.camera_id,
            "zone_code": t.zone_code,
            "first_seen": t.first_seen.isoformat() if t.first_seen else None,
            "last_seen": t.last_seen.isoformat() if t.last_seen else None,
            "observation_count": t.observation_count
        })

    return {
        "personnel_id": person.personnel_id,
        "name": person.name,
        "authorized_zones": person.authorized_zones,
        "verification_status": person.verification_status,
        "journey": journey_points
    }
