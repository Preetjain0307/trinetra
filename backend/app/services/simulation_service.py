import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models import (
    SensorEvent, Incident, IncidentTimeline, IncidentPriority, IncidentStatus,
    Camera, Sensor, Track, Detection, Zone, Personnel, Vehicle, Evidence
)
from backend.app.services.fusion_engine import fusion_engine
from backend.app.services.continuity_service import continuity_service
from backend.app.services.evidence_service import save_evidence

class SimulationService:
    """
    Simulation & Demo Scenario Runner for TRINETRA
    Supports 4 core reproducible demonstration scenarios, step-by-step playback, and interactive event injection.
    """

    @classmethod
    def reset_scenarios(cls, db: Session) -> Dict[str, Any]:
        """
        Resets active simulated incidents, tracks, and restores camera states for a clean demo run.
        """
        # Delete demo-generated incidents and tracks
        demo_incidents = db.query(Incident).filter(
            Incident.incident_code.in_(["INC-1042", "INC-SYS-001", "INC-CONTRA-001", "INC-ROUTE-001"])
        ).all()
        for inc in demo_incidents:
            db.delete(inc)

        existing_track = db.query(Track).filter(Track.track_id == "P-014").first()
        if existing_track:
            db.delete(existing_track)

        # Restore cameras to ONLINE

        cameras = db.query(Camera).all()
        for cam in cameras:
            cam.status = "ONLINE"
            cam.stream_health = "GOOD"
            cam.last_heartbeat = datetime.now(timezone.utc)

        db.commit()
        return {
            "status": "RESET_SUCCESS",
            "message": "Demo scenarios reset. Cameras restored to ONLINE status."
        }

    @classmethod
    def run_multi_sensor_night_movement_step(cls, db: Session, step: int) -> Dict[str, Any]:
        """
        Step-by-step deterministic executor for the Killer Demo (Scenario 1):
        Step 1: CCTV Optical Detection + Track Creation (C-01)
        Step 2: Corroborating Thermal IR Heat Anomaly (T-01)
        Step 3: Doppler Radar Target Triangulation (R-01)
        Step 4: Seismic Ground Sensor Footstep Pulse (G-04)
        Step 5: Multi-Sensor Deduplication creates INC-1042 with XAI reasoning and SHA-256 evidence.
        """
        base_time = datetime.now(timezone.utc)

        if step == 1:
            # 1. Create CCTV Detection & Track
            det = Detection(
                detection_id=f"DET-{int(base_time.timestamp())}-001",
                camera_id="C-01",
                track_id="P-014",
                class_name="person",
                confidence=0.94,
                bbox=[120.0, 180.0, 190.0, 310.0],
                timestamp=base_time,
                zone_code="Zone B",
                direction="NE",
                model_version="YOLOv8n-Custom-v1.0"
            )
            db.add(det)

            track = db.query(Track).filter(Track.track_id == "P-014").first()
            if not track:
                track = Track(
                    track_id="P-014",
                    object_class="person",
                    camera_id="C-01",
                    zone_code="Zone B",
                    first_seen=base_time,
                    last_seen=base_time,
                    observation_count=1,
                    trajectory=[{"x": 150, "y": 240, "t": base_time.timestamp(), "cam": "C-01"}],
                    status="ACTIVE",
                    potential_match_notes="Unverified night movement across Sector 4 perimeter"
                )
                db.add(track)
            else:
                track.last_seen = base_time
                track.observation_count += 1


            cctv_event = SensorEvent(
                event_id=f"EVT-CCTV-{int(time.time())}-1",
                source_type="CCTV",
                sensor_id="C-01",
                timestamp=base_time,
                zone_code="Zone B",
                event_type="person_detected",
                object_type="PERSON",
                direction="NE",
                confidence=0.94,
                metadata_json={"track_id": "P-014", "bbox": [120, 180, 190, 310]}
            )
            incident = fusion_engine.process_sensor_event(db, cctv_event, auto_commit=True)
            incident.incident_code = "INC-1042"
            incident.title = "Potential Security Incident: Unverified Night Movement in Zone B"
            incident.priority = IncidentPriority.CRITICAL.value
            db.commit()

            return {
                "step": 1,
                "event": "CCTV Optical Detection",
                "source": "C-01 (Zone B North Perimeter)",
                "details": "Person detected with 94% confidence. Track P-014 initialized.",
                "incident_code": incident.incident_code
            }

        elif step == 2:
            thermal_event = SensorEvent(
                event_id=f"EVT-THERMAL-{int(time.time())}-2",
                source_type="THERMAL",
                sensor_id="T-01",
                timestamp=base_time,
                zone_code="Zone B",
                event_type="heat_signature",
                object_type="PERSON",
                direction="NE",
                confidence=0.89,
                metadata_json={"heat_temp_c": 36.8, "delta_ambient": 14.2}
            )
            incident = fusion_engine.process_sensor_event(db, thermal_event, auto_commit=True)
            return {
                "step": 2,
                "event": "Thermal IR Corroboration",
                "source": "T-01 (Long-Range Thermal Imager 1)",
                "details": "Heat signature detected (36.8°C, +14.2°C above ambient). Correlated with Track P-014.",
                "incident_code": incident.incident_code
            }

        elif step == 3:
            radar_event = SensorEvent(
                event_id=f"EVT-RADAR-{int(time.time())}-3",
                source_type="RADAR",
                sensor_id="R-01",
                timestamp=base_time,
                zone_code="Zone B",
                event_type="moving_target",
                object_type="PERSON",
                direction="NE",
                speed=2.1,
                range_dist=145.0,
                confidence=0.91,
                metadata_json={"doppler_shift": 14.5}
            )
            incident = fusion_engine.process_sensor_event(db, radar_event, auto_commit=True)
            return {
                "step": 3,
                "event": "Doppler Radar Triangulation",
                "source": "R-01 (Sector 4 Perimeter Radar)",
                "details": "Moving target tracked at 2.1 m/s, azimuth 48°, range 145m.",
                "incident_code": incident.incident_code
            }

        elif step == 4:
            ugs_event = SensorEvent(
                event_id=f"EVT-UGS-{int(time.time())}-4",
                source_type="UGS",
                sensor_id="G-04",
                timestamp=base_time,
                zone_code="Zone B",
                event_type="ground_movement",
                object_type="PERSON",
                confidence=0.86,
                metadata_json={"seismic_freq_hz": 8.4, "acoustic_db": 42.1}
            )
            incident = fusion_engine.process_sensor_event(db, ugs_event, auto_commit=True)
            return {
                "step": 4,
                "event": "Seismic Ground Sensor Verification",
                "source": "G-04 (Perimeter UGS Node 4)",
                "details": "Footstep vibration waveform confirmed (8.4 Hz). Perimeter crossing correlated.",
                "incident_code": incident.incident_code
            }

        elif step >= 5:
            # Step 5: Save Cryptographic Evidence and finalize explainable incident INC-1042
            incident = db.query(Incident).filter(Incident.incident_code == "INC-1042").first()
            if not incident:
                # Fallback create
                return cls.run_multi_sensor_night_movement_scenario(db)

            save_evidence(
                db=db,
                incident_id=incident.id,
                source_type="CCTV",
                source_id="C-01",
                file_name="cctv_c01_capture_p014.jpg",
                file_type="IMAGE"
            )
            save_evidence(
                db=db,
                incident_id=incident.id,
                source_type="THERMAL",
                source_id="T-01",
                file_name="thermal_t01_signature_p014.jpg",
                file_type="IMAGE"
            )

            incident.ai_summary = (
                "Multi-sensor fusion correlated 4 independent sensor modalities (CCTV, Thermal, Radar, UGS) "
                "in Zone B Restricted Perimeter. High operational attention. Requires Human Operator Verification."
            )
            db.commit()
            db.refresh(incident)

            return {
                "step": 5,
                "event": "Multi-Sensor Correlation & Cryptographic Evidence Package",
                "incident_code": incident.incident_code,
                "contributing_sources": len(incident.contributing_sources or []),
                "correlation_score": incident.correlation_score,
                "evidence_count": len(incident.evidence_items or []),
                "status": "INCIDENT_READY_FOR_OPERATOR_VERIFICATION"
            }

    @classmethod
    def run_multi_sensor_night_movement_scenario(cls, db: Session) -> Dict[str, Any]:
        """
        Executes all 5 steps of the Night Infiltration Scenario end-to-end.
        """
        for s in range(1, 6):
            cls.run_multi_sensor_night_movement_step(db, step=s)
        
        incident = db.query(Incident).filter(Incident.incident_code == "INC-1042").first()
        return {
            "status": "SCENARIO_COMPLETED",
            "scenario": "Multi-Sensor Night Movement in Zone B",
            "incident_id": incident.id if incident else None,
            "incident_code": "INC-1042",
            "priority": "CRITICAL",
            "correlation_score": incident.correlation_score if incident else 0.94,
            "source_count": len(incident.contributing_sources or []) if incident else 4,
            "evidence_count": len(incident.evidence_items or []) if incident else 2
        }

    @classmethod
    def run_camera_failure_scenario(cls, db: Session) -> Dict[str, Any]:
        """
        Scenario 2: Camera Failure and Surveillance Gap
        """
        return continuity_service.trigger_camera_failure(db, camera_id="C-02")

    @classmethod
    def run_sensor_contradiction_scenario(cls, db: Session) -> Dict[str, Any]:
        """
        Scenario 3: Sensor Contradiction
        Radar reports high-speed moving target, but Thermal reports zero heat and CCTV sees clear background.
        """
        base_time = datetime.now(timezone.utc)
        
        radar_event = SensorEvent(
            event_id=f"EVT-RADAR-CONTRA-{int(time.time())}",
            source_type="RADAR",
            sensor_id="R-02",
            timestamp=base_time,
            zone_code="Zone C",
            event_type="moving_target",
            object_type="VEHICLE",
            speed=45.0,
            confidence=0.88,
            metadata_json={"contradiction": True}
        )
        incident = fusion_engine.process_sensor_event(db, radar_event, auto_commit=True)
        incident.incident_code = "INC-CONTRA-001"
        incident.title = "Sensor Contradiction: Radar Anomaly / Optical Mismatch in Zone C"
        incident.description = (
            "Radar R-02 reported high-speed moving target (45 km/h), but thermal camera T-02 and optical CCTV C-03 "
            "detected zero physical signatures in the corresponding sector. Correlation confidence reduced."
        )
        incident.priority = IncidentPriority.LOW.value
        incident.sensor_consistency_status = "CONTRADICTION_FLAGGED"
        incident.correlation_score = 0.28
        db.commit()
        db.refresh(incident)

        return {
            "status": "SCENARIO_COMPLETED",
            "scenario": "Sensor Contradiction",
            "incident_code": incident.incident_code,
            "consistency_status": incident.sensor_consistency_status,
            "correlation_score": incident.correlation_score
        }

    @classmethod
    def run_route_deviation_scenario(cls, db: Session) -> Dict[str, Any]:
        """
        Scenario 4: Route Deviation for Authorized Personnel
        Personnel P-001 (Authorized for Zone A only) is observed entering Zone B.
        """
        base_time = datetime.now(timezone.utc)
        
        cctv_event = SensorEvent(
            event_id=f"EVT-ROUTE-DEV-{int(time.time())}",
            source_type="CCTV",
            sensor_id="C-03",
            timestamp=base_time,
            zone_code="Zone B",
            event_type="person_detected",
            object_type="PERSON",
            confidence=0.92,
            metadata_json={"person_id": "P-001", "name": "Havildar Ramesh Singh"}
        )
        incident = fusion_engine.process_sensor_event(db, cctv_event, auto_commit=True)
        incident.incident_code = "INC-ROUTE-001"
        incident.title = "Route Deviation: Personnel P-001 in Unauthorized Zone B"
        incident.description = (
            "Personnel P-001 (Havildar Ramesh Singh) observed in Zone B. Duty schedule authorizes Zone A patrol corridor only. "
            "Flagged for supervisory review (Non-hostile route check)."
        )
        incident.priority = IncidentPriority.MEDIUM.value
        db.commit()
        db.refresh(incident)

        return {
            "status": "SCENARIO_COMPLETED",
            "scenario": "Route Deviation",
            "incident_code": incident.incident_code,
            "priority": incident.priority
        }

simulation_service = SimulationService()
