from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Vehicle, VehicleObservation
from backend.app.schemas import VehicleResponse, VehicleObservationResponse

router = APIRouter(prefix="/vehicles", tags=["Vehicle Intelligence"])

@router.get("", response_model=List[VehicleResponse])
def get_vehicles(
    is_flagged: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle)
    if is_flagged is not None:
        query = query.filter(Vehicle.is_flagged == is_flagged)
    return query.all()

@router.get("/observations", response_model=List[VehicleObservationResponse])
def get_vehicle_observations(
    plate_number: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(VehicleObservation).order_by(VehicleObservation.timestamp.desc())
    if plate_number:
        query = query.filter(VehicleObservation.plate_number.ilike(f"%{plate_number}%"))
    return query.limit(limit).all()

@router.get("/{plate_number}/journey")
def get_vehicle_journey(plate_number: str, db: Session = Depends(get_db)):
    obs = db.query(VehicleObservation).filter(
        VehicleObservation.plate_number.ilike(f"%{plate_number}%")
    ).order_by(VehicleObservation.timestamp.asc()).all()

    vehicle = db.query(Vehicle).filter(
        Vehicle.plate_number.ilike(f"%{plate_number}%")
    ).first()

    return {
        "plate_number": plate_number,
        "vehicle_info": {
            "make_model": vehicle.make_model if vehicle else "Unknown",
            "owner": vehicle.registered_owner if vehicle else "Unregistered",
            "is_flagged": vehicle.is_flagged if vehicle else False
        },
        "observations_count": len(obs),
        "journey": [
            {
                "camera_id": o.camera_id,
                "zone_code": o.zone_code,
                "timestamp": o.timestamp.isoformat() if o.timestamp else None,
                "confidence": o.confidence,
                "is_ocr_uncertain": o.is_ocr_uncertain
            }
            for o in obs
        ]
    }
