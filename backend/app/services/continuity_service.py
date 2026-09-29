from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models import Camera, Sensor, Incident, IncidentPriority, IncidentStatus

class ContinuityService:
    """
    Surveillance Continuity & Blind-Spot Detection Service
    Monitors camera & sensor heartbeats, stream health, and computes alternative coverage.
    """

    @staticmethod
    def check_system_continuity(db: Session) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        heartbeat_timeout = now - timedelta(seconds=90)

        cameras = db.query(Camera).all()
        sensors = db.query(Sensor).all()

        total_cameras = len(cameras)
        total_sensors = len(sensors)

        offline_cameras = []
        online_cameras = []
        degraded_cameras = []

        def is_expired(hb):
            if not hb:
                return False
            if hb.tzinfo is None:
                hb = hb.replace(tzinfo=timezone.utc)
            return hb < heartbeat_timeout

        for cam in cameras:
            if cam.status == "OFFLINE" or is_expired(cam.last_heartbeat):
                # Find alternative sensors in same zone
                alt_sensors = [s.sensor_id for s in sensors if s.zone_code == cam.zone_code and s.status == "ONLINE"]
                offline_cameras.append({
                    "camera_id": cam.camera_id,
                    "name": cam.name,
                    "zone_code": cam.zone_code,
                    "last_heartbeat": cam.last_heartbeat.isoformat() if cam.last_heartbeat else None,
                    "alternative_coverage": alt_sensors,
                    "coverage_gap_severity": "MODERATE" if alt_sensors else "CRITICAL"
                })
            elif cam.status == "DEGRADED" or cam.stream_health != "GOOD":
                degraded_cameras.append(cam.camera_id)
            else:
                online_cameras.append(cam.camera_id)

        offline_sensors = [s.sensor_id for s in sensors if s.status == "OFFLINE" or is_expired(s.last_heartbeat)]
        online_sensors = [s.sensor_id for s in sensors if s.status == "ONLINE"]

        coverage_percentage = round(((len(online_cameras) + len(online_sensors)) / max(total_cameras + total_sensors, 1)) * 100, 1)

        return {
            "total_cameras": total_cameras,
            "online_cameras_count": len(online_cameras),
            "offline_cameras": offline_cameras,
            "degraded_cameras": degraded_cameras,
            "total_sensors": total_sensors,
            "online_sensors_count": len(online_sensors),
            "offline_sensors": offline_sensors,
            "coverage_health_pct": coverage_percentage,
            "status": "HEALTHY" if coverage_percentage > 85 else ("DEGRADED" if coverage_percentage > 60 else "COMPROMISED")
        }

    @staticmethod
    def trigger_camera_failure(db: Session, camera_id: str, operator_email: str = "system@trinetra.local") -> Dict[str, Any]:
        """
        Simulates camera failure and evaluates immediate blind-spot gap.
        """
        cam = db.query(Camera).filter(Camera.camera_id == camera_id).first()
        if not cam:
            return {"error": f"Camera {camera_id} not found."}

        cam.status = "OFFLINE"
        cam.stream_health = "NO_STREAM"
        
        # Check alternative sensors
        alt_sensors = db.query(Sensor).filter(Sensor.zone_code == cam.zone_code, Sensor.status == "ONLINE").all()
        alt_names = [f"{s.sensor_type} ({s.sensor_id})" for s in alt_sensors]

        # Generate continuity incident
        incident_code = f"INC-SYS-{int(datetime.now().timestamp()) % 10000}"
        incident = Incident(
            incident_code=incident_code,
            title=f"Surveillance Continuity Alert: Camera {cam.camera_id} Offline",
            timestamp=datetime.now(timezone.utc),
            zone_code=cam.zone_code,
            location_name=cam.location_name,
            incident_type="Camera Failure / Coverage Gap",
            priority=IncidentPriority.MEDIUM.value if alt_sensors else IncidentPriority.HIGH.value,
            status=IncidentStatus.NEW.value,
            correlation_score=0.90,
            description=(
                f"Surveillance stream lost on camera {cam.camera_id} ({cam.name}). "
                f"Zone: {cam.zone_code}. "
                f"Alternative coverage status: {', '.join(alt_names) if alt_names else 'NO DIRECT BACKUP - BLIND SPOT CREATED'}."
            ),
            contributing_sources=[{"type": "SYSTEM_HEALTH", "id": cam.camera_id}],
            ai_summary=(
                f"Camera {cam.camera_id} heartbeat missing. Health monitor flagged coverage reduction in {cam.zone_code}. "
                f"Alternative sensors available: {len(alt_sensors)}. Recommend maintenance dispatch."
            )
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)

        return {
            "status": "CAMERA_OFFLINE_TRIGGERED",
            "camera_id": camera_id,
            "zone_code": cam.zone_code,
            "alternative_coverage": alt_names,
            "incident_code": incident.incident_code
        }

continuity_service = ContinuityService()
