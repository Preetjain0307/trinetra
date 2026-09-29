from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.models import Personnel, Vehicle, Zone, Geofence

class ContextEngine:
    @staticmethod
    def evaluate_observation(
        db: Session,
        object_type: str,
        track_id: Optional[str],
        zone_code: str,
        camera_or_sensor_id: str,
        timestamp: Optional[datetime] = None,
        associated_person_id: Optional[str] = None,
        associated_vehicle_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluates contextual factors: WHO, WHERE, WHEN, WHAT, AUTHORIZATION, ROUTE
        Returns structured explainable context output.
        """
        if timestamp is None:
            timestamp = datetime.now(timezone.utc)

        current_hour = timestamp.hour
        is_night_time = (current_hour >= 21 or current_hour < 6)

        # 1. Zone Verification
        zone = db.query(Zone).filter(Zone.code == zone_code).first()
        is_restricted_zone = zone.restricted if zone else ("Zone B" in zone_code)

        # 2. Identity & Duty Verification
        identity_status = "UNVERIFIED" # VERIFIED, UNVERIFIED, POTENTIAL_MATCH, UNKNOWN
        person_details = None
        vehicle_details = None
        authorization_status = "UNAUTHORIZED_ZONE"
        reasons = []

        if associated_person_id:
            person = db.query(Personnel).filter(Personnel.personnel_id == associated_person_id).first()
            if person:
                person_details = {
                    "id": person.personnel_id,
                    "name": person.name,
                    "unit": person.unit,
                    "role": person.role,
                    "authorized_zones": person.authorized_zones or []
                }
                identity_status = person.verification_status
                if zone_code in (person.authorized_zones or []):
                    authorization_status = "AUTHORIZED_ZONE"
                else:
                    authorization_status = "UNAUTHORIZED_ZONE"
                    reasons.append(f"Personnel {person.name} ({person.personnel_id}) observed outside authorized zones ({', '.join(person.authorized_zones or [])})")

        if associated_vehicle_id:
            vehicle = db.query(Vehicle).filter(
                (Vehicle.vehicle_id == associated_vehicle_id) | (Vehicle.plate_number == associated_vehicle_id)
            ).first()
            if vehicle:
                vehicle_details = {
                    "id": vehicle.vehicle_id,
                    "plate": vehicle.plate_number,
                    "type": vehicle.vehicle_type,
                    "owner": vehicle.registered_owner
                }
                if vehicle.is_flagged:
                    reasons.append(f"Vehicle {vehicle.plate_number} is flagged on security watch list.")

        # If no explicit identity matched
        if not associated_person_id and not associated_vehicle_id:
            identity_status = "UNVERIFIED"
            reasons.append("Entity identity is currently unverified across personnel database")

        # 3. Time & Environment Context
        if is_night_time:
            reasons.append(f"Movement observed during high-alert night hours ({current_hour:02d}:00 UTC)")

        # 4. Zone Restriction Context
        if is_restricted_zone:
            reasons.append(f"Entity detected inside configured restricted zone ({zone_code})")

        # 5. Determine Priority and Attention Level
        if is_restricted_zone and identity_status != "VERIFIED" and is_night_time:
            priority = "CRITICAL"
            attention_level = "HIGH_ATTENTION"
            title = f"Unverified Night Movement in Restricted {zone_code}"
        elif is_restricted_zone and identity_status != "VERIFIED":
            priority = "HIGH"
            attention_level = "HIGH_ATTENTION"
            title = f"Unverified Intrusion Alert in {zone_code}"
        elif authorization_status == "UNAUTHORIZED_ZONE":
            priority = "HIGH"
            attention_level = "ELEVATED_ATTENTION"
            title = f"Route Deviation / Unauthorized Zone Entry in {zone_code}"
        elif is_night_time:
            priority = "MEDIUM"
            attention_level = "ELEVATED_ATTENTION"
            title = f"Off-Hours Movement Observed in {zone_code}"
        else:
            priority = "LOW"
            attention_level = "NORMAL"
            title = f"Routine Surveillance Observation in {zone_code}"

        return {
            "title": title,
            "priority": priority,
            "operational_attention": attention_level,
            "identity_status": identity_status,
            "authorization_status": authorization_status,
            "is_restricted_zone": is_restricted_zone,
            "is_night_time": is_night_time,
            "reasons": reasons,
            "person_details": person_details,
            "vehicle_details": vehicle_details,
            "evaluation_timestamp": timestamp.isoformat()
        }

context_engine = ContextEngine()
