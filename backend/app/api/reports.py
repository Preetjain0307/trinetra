from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Incident

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/incident/{incident_id}/download")
def download_incident_report(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Generate professional Markdown / Plaintext dossier report
    report_lines = [
        "=======================================================================",
        "                     TRINETRA BORDER INTELLIGENCE PLATFORM",
        "                     OFFICIAL INCIDENT INVESTIGATION REPORT",
        "=======================================================================",
        f"INCIDENT CODE : {incident.incident_code}",
        f"TIMESTAMP     : {incident.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}",
        f"ZONE / SECTOR : {incident.zone_code} ({incident.location_name})",
        f"SEVERITY      : {incident.priority}",
        f"CURRENT STATUS: {incident.status}",
        f"CORRELATION   : {incident.correlation_score * 100:.1f}% Confidence",
        f"SENSOR STATUS : {incident.sensor_consistency_status}",
        "-----------------------------------------------------------------------",
        "EXECUTIVE SUMMARY:",
        incident.ai_summary or incident.description,
        "-----------------------------------------------------------------------",
        "CONTRIBUTING SENSORS & OBSERVATIONS:",
    ]

    for idx, src in enumerate(incident.contributing_sources or [], 1):
        report_lines.append(f"  [{idx}] Type: {src.get('type')} | ID: {src.get('id')} | Event: {src.get('event_type', 'Detection')}")

    report_lines.extend([
        "-----------------------------------------------------------------------",
        "INCIDENT TIMELINE:",
    ])

    for t in incident.timeline_entries:
        report_lines.append(f"  • {t.timestamp.strftime('%H:%M:%S')} - [{t.source_type} / {t.source_id}] {t.description}")

    report_lines.extend([
        "-----------------------------------------------------------------------",
        "OPERATOR VERIFICATION AUDIT:",
        f"  Verified By : {incident.verified_by or 'Pending Verification'}",
        f"  Verified At : {incident.verified_at.strftime('%Y-%m-%d %H:%M:%S UTC') if incident.verified_at else 'N/A'}",
        f"  Dismissed By: {incident.dismissed_by or 'N/A'}",
        "=======================================================================",
        "Classification: CONFIDENTIAL // SENSOR-AGNOSTIC AI INCIDENT ARCHIVE",
        "TRINETRA Platform - MillenForge Team (SIH26187)"
    ])

    report_content = "\n".join(report_lines)
    return Response(
        content=report_content,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={incident.incident_code}_report.txt"}
    )
