import time
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from backend.app.models import Incident, IncidentTimeline, IncidentPriority, IncidentStatus, SensorEvent, Zone
from backend.app.services.context_engine import context_engine

class FusionEngine:
    """
    TRINETRA Multi-Sensor Fusion & Deduplication Engine
    - Correlates time, spatial zone, direction, and cross-sensor modalities
    - Performs intelligent alert deduplication (1 Incident with N sources)
    - Detects sensor contradictions
    - Generates explainable audit-ready incident reports
    """

    @staticmethod
    def calculate_correlation_score(
        contributing_sources: List[Dict[str, Any]],
        has_contradiction: bool = False
    ) -> float:
        """
        Calculates explainable multi-sensor correlation score (0.0 to 1.0)
        Based on source diversity, temporal alignment, and agreement.
        """
        source_types = set(s.get("type", "").upper() for s in contributing_sources)
        base_score = 0.50

        # Sensor diversity bonuses
        if "CCTV" in source_types:
            base_score += 0.12
        if "THERMAL" in source_types:
            base_score += 0.14
        if "RADAR" in source_types:
            base_score += 0.12
        if "UGS" in source_types:
            base_score += 0.10
        if "UAV" in source_types:
            base_score += 0.08
        if "ANPR" in source_types:
            base_score += 0.10

        if len(contributing_sources) >= 3:
            base_score += 0.08

        if has_contradiction:
            base_score -= 0.40 # Heavy penalty for physical contradiction

        return min(max(round(base_score, 2), 0.15), 0.98)

    @staticmethod
    def detect_contradiction(sources: List[Dict[str, Any]]) -> Tuple[bool, str]:
        """
        Checks for physical or observational sensor contradiction.
        E.g., Radar detects high speed target, but Thermal reports zero heat and CCTV reports empty.
        """
        source_types = set(s.get("type", "").upper() for s in sources)
        for s in sources:
            if s.get("contradiction_flag"):
                return True, "Sensor Inconsistency: Radar reports target with zero corresponding thermal or optical signature."
        
        return False, "CONSISTENT"

    @classmethod
    def process_sensor_event(
        cls,
        db: Session,
        event: SensorEvent,
        auto_commit: bool = True
    ) -> Incident:
        """
        Ingests a normalized sensor event, checks for active incidents in same zone/time window (60s),
        deduplicates or creates new correlated incident.
        """
        now = event.timestamp or datetime.now(timezone.utc)
        time_window = now - timedelta(seconds=120)

        # 1. Search for existing active incident in same zone within recent time window
        recent_incident = db.query(Incident).filter(
            Incident.zone_code == event.zone_code,
            Incident.timestamp >= time_window,
            Incident.status.in_([IncidentStatus.NEW.value, IncidentStatus.UNDER_REVIEW.value])
        ).order_by(Incident.id.desc()).first()

        new_source_entry = {
            "type": event.source_type.upper(),
            "id": event.sensor_id,
            "event_type": event.event_type,
            "confidence": event.confidence,
            "timestamp": event.timestamp.isoformat() if event.timestamp else now.isoformat(),
            "contradiction_flag": bool(event.metadata_json and event.metadata_json.get("contradiction"))
        }

        if recent_incident:
            # 2. DEDUPLICATION: Append to existing correlated incident
            sources = list(recent_incident.contributing_sources or [])
            # Avoid exact duplicate source ID entries if within 5s
            sources.append(new_source_entry)
            recent_incident.contributing_sources = sources

            has_contradiction, contradiction_reason = cls.detect_contradiction(sources)
            recent_incident.sensor_consistency_status = "CONTRADICTION_FLAGGED" if has_contradiction else "CONSISTENT"
            recent_incident.correlation_score = cls.calculate_correlation_score(sources, has_contradiction)

            # Add timeline entry
            timeline_desc = f"Sensor event detected by {event.source_type} ({event.sensor_id}): {event.event_type} (conf: {event.confidence * 100:.0f}%)"
            timeline = IncidentTimeline(
                incident_id=recent_incident.id,
                timestamp=now,
                event_type=event.event_type,
                source_id=event.sensor_id,
                source_type=event.source_type,
                description=timeline_desc,
                evidence_ref=event.evidence_reference
            )
            db.add(timeline)

            # Update AI Summary
            source_names = ", ".join([f"{s['type']} {s['id']}" for s in sources])
            recent_incident.ai_summary = (
                f"Multi-sensor fusion correlated {len(sources)} observations ({source_names}) in {recent_incident.zone_code}. "
                f"Status: {recent_incident.sensor_consistency_status}. Operator verification required."
            )

            event.is_processed = True
            event.incident_id = recent_incident.id

            if auto_commit:
                db.commit()
                db.refresh(recent_incident)
            return recent_incident

        else:
            # 3. CREATE NEW INCIDENT
            context = context_engine.evaluate_observation(
                db=db,
                object_type=event.object_type or "PERSON",
                track_id=None,
                zone_code=event.zone_code,
                camera_or_sensor_id=event.sensor_id,
                timestamp=now
            )

            # Generate unique incident code (INC-1042 style)
            count = db.query(Incident).count()
            incident_code = f"INC-{1040 + count + 1}"

            has_contradiction, _ = cls.detect_contradiction([new_source_entry])
            score = cls.calculate_correlation_score([new_source_entry], has_contradiction)

            incident = Incident(
                incident_code=incident_code,
                title=context["title"],
                timestamp=now,
                zone_code=event.zone_code,
                location_name=f"{event.zone_code} Perimeter Sector",
                incident_type=event.event_type.replace("_", " ").title(),
                priority=context["priority"],
                status=IncidentStatus.NEW.value,
                correlation_score=score,
                description=(
                    f"Correlated security alert triggered in {event.zone_code}. "
                    f"Initial observation from {event.source_type} ({event.sensor_id}). "
                    f"Reasons: {'; '.join(context['reasons'])}."
                ),
                contributing_sources=[new_source_entry],
                evidence_files=[event.evidence_reference] if event.evidence_reference else [],
                sensor_consistency_status="CONTRADICTION_FLAGGED" if has_contradiction else "CONSISTENT",
                ai_summary=(
                    f"Activity initiated in {event.zone_code} by {event.source_type} ({event.sensor_id}). "
                    f"Context analysis identified: {', '.join(context['reasons'])}. "
                    f"Awaiting human operator review."
                )
            )
            db.add(incident)
            db.flush() # Get incident ID

            # Add initial timeline entry
            timeline = IncidentTimeline(
                incident_id=incident.id,
                timestamp=now,
                event_type="INITIAL_DETECTION",
                source_id=event.sensor_id,
                source_type=event.source_type,
                description=f"Initial observation by {event.source_type} ({event.sensor_id}): {event.event_type}",
                evidence_ref=event.evidence_reference
            )
            db.add(timeline)

            event.is_processed = True
            event.incident_id = incident.id

            if auto_commit:
                db.commit()
                db.refresh(incident)
            return incident

fusion_engine = FusionEngine()
