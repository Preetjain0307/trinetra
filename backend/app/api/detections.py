from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Detection, Track
from backend.app.schemas import DetectionResponse, TrackResponse

router = APIRouter(prefix="/detections", tags=["Detections & Tracking"])

@router.get("", response_model=List[DetectionResponse])
def get_detections(
    camera_id: Optional[str] = None,
    class_name: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Detection).order_by(Detection.id.desc())
    if camera_id:
        query = query.filter(Detection.camera_id == camera_id)
    if class_name:
        query = query.filter(Detection.class_name == class_name)
    return query.limit(limit).all()

@router.get("/tracks", response_model=List[TrackResponse])
def get_tracks(
    camera_id: Optional[str] = None,
    zone_code: Optional[str] = None,
    status: Optional[str] = "ACTIVE",
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Track).order_by(Track.last_seen.desc())
    if camera_id:
        query = query.filter(Track.camera_id == camera_id)
    if zone_code:
        query = query.filter(Track.zone_code == zone_code)
    if status and status != "ALL":
        query = query.filter(Track.status == status)
    return query.limit(limit).all()

@router.get("/tracks/{track_id}", response_model=TrackResponse)
def get_track(track_id: str, db: Session = Depends(get_db)):
    track = db.query(Track).filter(Track.track_id == track_id).first()
    if not track:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Track not found")
    return track
