from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.core.database import get_db
from backend.app.models import Incident, Track, Personnel, Vehicle, Camera, Sensor, SensorEvent

router = APIRouter(prefix="/investigation", tags=["Investigation & Intelligence"])

def parse_search_entities(query: str) -> Dict[str, Any]:
    """
    Transparently extracts structured search entities from natural language queries.
    """
    q_lower = query.lower()
    entities = {
        "raw_query": query,
        "object_type": None,
        "zone_or_location": None,
        "time_window": None,
        "keywords": []
    }

    # Extract object / vehicle hints
    if "truck" in q_lower or "pickup" in q_lower:
        entities["object_type"] = "Pickup Truck / Vehicle"
    elif "car" in q_lower or "bolero" in q_lower or "suv" in q_lower:
        entities["object_type"] = "SUV / Patrol Vehicle"
    elif "person" in q_lower or "intruder" in q_lower or "footstep" in q_lower or "backpack" in q_lower:
        entities["object_type"] = "Person / Foot Patrol"

    # Extract location hints
    if "zone a" in q_lower or "north" in q_lower:
        entities["zone_or_location"] = "Zone A (North Perimeter)"
    elif "zone b" in q_lower or "gate 3" in q_lower or "east gate" in q_lower:
        entities["zone_or_location"] = "Zone B (East Gate / Checkpoint 3)"
    elif "zone c" in q_lower or "desert" in q_lower or "outpost" in q_lower:
        entities["zone_or_location"] = "Zone C (Desert Trail / Outpost 9)"

    # Extract time hints
    if "night" in q_lower or "dusk" in q_lower or "02:00" in q_lower or "dark" in q_lower:
        entities["time_window"] = "Night Shift (20:00 - 06:00 UTC)"
    elif "yesterday" in q_lower or "last night" in q_lower:
        entities["time_window"] = "Past 24 Hours"

    # Tokenized keywords
    entities["keywords"] = [w for w in q_lower.split() if len(w) > 2 and w not in ["the", "and", "near", "with", "from", "for"]]
    return entities

@router.get("/search")
def unified_search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    interpreted = parse_search_entities(q)
    query_str = f"%{q.strip()}%"

    # 1. Search Incidents
    incidents = db.query(Incident).filter(
        or_(
            Incident.incident_code.ilike(query_str),
            Incident.title.ilike(query_str),
            Incident.description.ilike(query_str),
            Incident.zone_code.ilike(query_str),
            Incident.incident_type.ilike(query_str),
            *[Incident.description.ilike(f"%{kw}%") for kw in interpreted["keywords"][:3]]
        )
    ).limit(10).all()

    # 2. Search Tracks
    tracks = db.query(Track).filter(
        or_(
            Track.track_id.ilike(query_str),
            Track.camera_id.ilike(query_str),
            Track.zone_code.ilike(query_str)
        )
    ).limit(10).all()

    # 3. Search Personnel
    personnel = db.query(Personnel).filter(
        or_(
            Personnel.personnel_id.ilike(query_str),
            Personnel.name.ilike(query_str),
            Personnel.unit.ilike(query_str),
            *[Personnel.name.ilike(f"%{kw}%") for kw in interpreted["keywords"][:2]]
        )
    ).limit(10).all()

    # 4. Search Vehicles
    vehicles = db.query(Vehicle).filter(
        or_(
            Vehicle.plate_number.ilike(query_str),
            Vehicle.vehicle_id.ilike(query_str),
            Vehicle.make_model.ilike(query_str),
            Vehicle.registered_owner.ilike(query_str),
            *[Vehicle.make_model.ilike(f"%{kw}%") for kw in interpreted["keywords"][:2]]
        )
    ).limit(10).all()

    return {
        "query": q,
        "interpreted_query": interpreted,
        "total_matches": len(incidents) + len(tracks) + len(personnel) + len(vehicles),
        "results": {

            "incidents": [
                {
                    "id": i.id,
                    "code": i.incident_code,
                    "title": i.title,
                    "priority": i.priority,
                    "status": i.status,
                    "zone": i.zone_code,
                    "timestamp": i.timestamp.isoformat()
                }
                for i in incidents
            ],
            "tracks": [
                {
                    "track_id": t.track_id,
                    "object_class": t.object_class,
                    "camera_id": t.camera_id,
                    "zone_code": t.zone_code,
                    "observation_count": t.observation_count,
                    "last_seen": t.last_seen.isoformat() if t.last_seen else None
                }
                for t in tracks
            ],
            "personnel": [
                {
                    "id": p.personnel_id,
                    "name": p.name,
                    "role": p.role,
                    "unit": p.unit,
                    "status": p.verification_status
                }
                for p in personnel
            ],
            "vehicles": [
                {
                    "plate": v.plate_number,
                    "type": v.vehicle_type,
                    "owner": v.registered_owner,
                    "is_flagged": v.is_flagged
                }
                for v in vehicles
            ]
        }
    }

@router.get("/graph")
def get_intelligence_graph(
    focus_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns node and edge graph data for the Border Intelligence Graph visualization.
    """
    nodes = []
    edges = []

    # Add core entities as nodes
    zones = ["Zone A", "Zone B", "Zone C", "Zone D"]
    for z in zones:
        nodes.append({"id": z, "label": z, "type": "ZONE", "group": "zone"})

    cameras = db.query(Camera).all()
    for c in cameras:
        nodes.append({"id": c.camera_id, "label": f"{c.camera_id} ({c.name})", "type": "CAMERA", "group": "camera"})
        edges.append({"source": c.camera_id, "target": c.zone_code, "relation": "LOCATED_IN"})

    sensors = db.query(Sensor).all()
    for s in sensors:
        nodes.append({"id": s.sensor_id, "label": f"{s.sensor_id} ({s.sensor_type})", "type": "SENSOR", "group": "sensor"})
        edges.append({"source": s.sensor_id, "target": s.zone_code, "relation": "COVERS"})

    incidents = db.query(Incident).order_by(Incident.id.desc()).limit(15).all()
    for inc in incidents:
        nodes.append({"id": inc.incident_code, "label": inc.incident_code, "type": "INCIDENT", "priority": inc.priority, "group": "incident"})
        edges.append({"source": inc.incident_code, "target": inc.zone_code, "relation": "OCCURRED_IN"})
        for src in (inc.contributing_sources or []):
            if src.get("id"):
                edges.append({"source": src["id"], "target": inc.incident_code, "relation": "TRIGGERED"})

    tracks = db.query(Track).order_by(Track.id.desc()).limit(10).all()
    for t in tracks:
        nodes.append({"id": t.track_id, "label": t.track_id, "type": "TRACK", "group": "track"})
        edges.append({"source": t.track_id, "target": t.camera_id, "relation": "OBSERVED_BY"})
        edges.append({"source": t.track_id, "target": t.zone_code, "relation": "TRAVERSED"})

    return {
        "nodes": nodes,
        "edges": edges
    }

@router.get("/similar-incidents")
def find_similar_incidents(
    incident_id: int,
    db: Session = Depends(get_db)
):
    target = db.query(Incident).filter(Incident.id == incident_id).first()
    if not target:
        return {"similar": []}

    all_others = db.query(Incident).filter(Incident.id != incident_id).all()
    results = []

    for inc in all_others:
        # Calculate transparent attribute similarity score
        score = 0.0
        if inc.zone_code == target.zone_code:
            score += 0.35
        if inc.incident_type == target.incident_type:
            score += 0.35
        if inc.priority == target.priority:
            score += 0.15
        
        # Source similarity
        t_sources = set(s.get("type", "") for s in (target.contributing_sources or []))
        i_sources = set(s.get("type", "") for s in (inc.contributing_sources or []))
        if t_sources and i_sources:
            overlap = len(t_sources.intersection(i_sources)) / len(t_sources.union(i_sources))
            score += overlap * 0.15

        if score > 0.30:
            results.append({
                "incident_id": inc.id,
                "incident_code": inc.incident_code,
                "title": inc.title,
                "zone_code": inc.zone_code,
                "priority": inc.priority,
                "status": inc.status,
                "timestamp": inc.timestamp.isoformat(),
                "similarity_score": round(score, 2),
                "matched_attributes": [
                    k for k, v in [
                        ("Zone Match", inc.zone_code == target.zone_code),
                        ("Incident Type Match", inc.incident_type == target.incident_type),
                        ("Priority Match", inc.priority == target.priority)
                    ] if v
                ]
            })

    results.sort(key=lambda x: x["similarity_score"], reverse=True)
    return {"target_incident": target.incident_code, "similar": results}
