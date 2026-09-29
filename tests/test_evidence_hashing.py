import os
import hashlib
from datetime import datetime, timezone
import pytest
from backend.app.core.database import SessionLocal
from backend.app.services.evidence_service import compute_sha256, save_evidence, verify_evidence_hash
from backend.app.models import Incident

def test_cryptographic_evidence_sha256_verification():
    db = SessionLocal()
    try:
        # Get or create an incident
        inc = db.query(Incident).first()
        if not inc:
            inc = Incident(
                incident_code="INC-TEST-EVID",
                title="Test Incident for Evidence Verification",
                zone_code="Zone B",
                location_name="Zone B Test Sector",
                incident_type="Test",
                description="Test"
            )
            db.add(inc)
            db.commit()
            db.refresh(inc)

        evidence = save_evidence(
            db=db,
            incident_id=inc.id,
            source_type="CCTV",
            source_id="C-01",
            file_name="test_cctv_frame.jpg",
            raw_bytes=b"TRINETRA_AUTHENTIC_FRAME_BYTE_PAYLOAD_2026",
            file_type="IMAGE"
        )

        assert evidence.file_hash is not None
        assert len(evidence.file_hash) == 64 # SHA-256 is 64 hex characters

        # Verification check
        result = verify_evidence_hash(evidence)
        assert result["is_valid"] is True
        assert result["status"] == "VERIFIED_TAMPER_FREE"

        # Tamper simulation test
        with open(evidence.file_path, "wb") as f:
            f.write(b"TAMPERED_MODIFIED_BYTE_CONTENT")

        tamper_result = verify_evidence_hash(evidence)
        assert tamper_result["is_valid"] is False
        assert tamper_result["status"] == "INTEGRITY_COMPROMISED"

        # Clean up
        if os.path.exists(evidence.file_path):
            os.remove(evidence.file_path)
        db.delete(evidence)
        db.commit()
    finally:
        db.close()
