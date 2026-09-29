from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Camera
from backend.app.schemas import CameraResponse, CameraCreate
from backend.app.api.deps import get_current_user
from backend.app.services.audit_service import log_action

router = APIRouter(prefix="/cameras", tags=["Cameras"])

@router.get("", response_model=List[CameraResponse])
def get_cameras(
    zone: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Camera)
    if zone:
        query = query.filter(Camera.zone_code == zone)
    if status:
        query = query.filter(Camera.status == status)
    return query.all()

@router.get("/{camera_id}", response_model=CameraResponse)
def get_camera(camera_id: str, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    return cam

@router.post("/{camera_id}/heartbeat")
def record_heartbeat(camera_id: str, fps: Optional[float] = 25.0, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    cam.last_heartbeat = datetime.now(timezone.utc)
    cam.status = "ONLINE"
    cam.fps = fps
    cam.stream_health = "GOOD"
    db.commit()
    return {"status": "HEARTBEAT_RECORDED", "camera_id": camera_id}

@router.post("/{camera_id}/toggle-status")
def toggle_camera_status(
    camera_id: str,
    new_status: str = Query(..., enum=["ONLINE", "OFFLINE", "DEGRADED"]),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    cam = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    old_status = cam.status
    cam.status = new_status
    if new_status == "OFFLINE":
        cam.stream_health = "NO_STREAM"
    db.commit()

    log_action(
        db=db,
        user_email=current_user.email,
        role=current_user.role,
        action="CAMERA_STATUS_MODIFIED",
        resource="Camera",
        resource_id=camera_id,
        details={"old_status": old_status, "new_status": new_status}
    )
    return {"status": "SUCCESS", "camera_id": camera_id, "new_status": new_status}
