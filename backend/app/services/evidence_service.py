import hashlib
import os
import shutil
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.models import Evidence

def compute_sha256(file_path: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def save_evidence(
    db: Session,
    incident_id: int,
    source_type: str,
    source_id: str,
    file_name: str,
    raw_bytes: bytes = None,
    existing_file_path: str = None,
    file_type: str = "IMAGE"
) -> Evidence:
    os.makedirs(settings.EVIDENCE_DIR, exist_ok=True)
    target_path = os.path.join(settings.EVIDENCE_DIR, f"{incident_id}_{int(datetime.now().timestamp())}_{file_name}")

    if existing_file_path and os.path.exists(existing_file_path):
        shutil.copy2(existing_file_path, target_path)
    elif raw_bytes:
        with open(target_path, "wb") as f:
            f.write(raw_bytes)
    else:
        # Create placeholder evidence file if none provided
        with open(target_path, "w") as f:
            f.write(f"TRINETRA Cryptographic Evidence Tag\nIncident ID: {incident_id}\nSource: {source_type}/{source_id}\nTimestamp: {datetime.now(timezone.utc).isoformat()}")

    file_hash = compute_sha256(target_path)

    evidence = Evidence(
        incident_id=incident_id,
        file_name=file_name,
        file_path=target_path.replace("\\", "/"),
        file_hash=file_hash,
        file_type=file_type,
        source_type=source_type,
        source_id=source_id,
        captured_at=datetime.now(timezone.utc),
        is_verified=True
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    return evidence

def verify_evidence_hash(evidence: Evidence) -> dict:
    if not os.path.exists(evidence.file_path):
        return {
            "is_valid": False,
            "status": "FILE_MISSING",
            "stored_hash": evidence.file_hash,
            "current_hash": None,
            "message": "Physical evidence file is missing from storage."
        }
    current_hash = compute_sha256(evidence.file_path)
    is_valid = (current_hash == evidence.file_hash)
    return {
        "is_valid": is_valid,
        "status": "VERIFIED_TAMPER_FREE" if is_valid else "INTEGRITY_COMPROMISED",
        "stored_hash": evidence.file_hash,
        "current_hash": current_hash,
        "message": "Cryptographic SHA-256 integrity match verified." if is_valid else "Hash mismatch! Evidence may have been altered."
    }
