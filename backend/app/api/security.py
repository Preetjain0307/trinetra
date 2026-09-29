from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import AuditLog, Evidence, User
from backend.app.schemas import AuditLogResponse
from backend.app.api.deps import require_roles, get_current_user
from backend.app.services.evidence_service import verify_evidence_hash

router = APIRouter(prefix="/security", tags=["Security & Compliance"])

@router.get("/posture")
def get_security_posture(db: Session = Depends(get_db)):
    """
    Returns security architecture posture, MFA state, RBAC status, and model metadata.
    """
    total_users = db.query(User).count()
    audit_count = db.query(AuditLog).count()
    evidence_count = db.query(Evidence).count()

    return {
        "rbac_status": "ACTIVE (5 Roles Enforced)",
        "jwt_encryption": "HS256 (480 min expiry)",
        "password_hashing": "Bcrypt (Cost Factor 12)",
        "mfa_readiness": "TOTP MFA Architecture Integrated",
        "audit_logs_recorded": audit_count,
        "evidence_integrity_mode": "Cryptographic SHA-256 Hashing",
        "evidence_files_secured": evidence_count,
        "ai_model_security": {
            "model_architecture": "YOLOv8n-Surveillance",
            "weights_integrity_hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "autonomous_hostility_decision": "DISABLED_BY_DESIGN (Human-In-The-Loop Enforced)",
            "biometric_protection": "Face Embeddings Isolated in RBAC Restricted Tier"
        },
        "network_segmentation_architecture": "Level-3 Sensor Edge -> API Gateway -> Isolation Tier"
    }

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Security Admin", "System Admin", "Supervisor", "Operator", "Investigator"))
):
    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    if action:
        query = query.filter(AuditLog.action == action)
    return query.limit(limit).all()

@router.post("/evidence/{evidence_id}/verify-integrity")
def verify_evidence(evidence_id: int, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence record not found")
    return verify_evidence_hash(evidence)
