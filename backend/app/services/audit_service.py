import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models import AuditLog

def log_action(
    db: Session,
    user_email: str,
    role: str,
    action: str,
    resource: str,
    resource_id: str = None,
    ip_address: str = "127.0.0.1",
    status: str = "SUCCESS",
    details: dict = None
):
    try:
        log_entry = AuditLog(
            timestamp=datetime.now(timezone.utc),
            user_email=user_email,
            role=role,
            action=action,
            resource=resource,
            resource_id=str(resource_id) if resource_id else None,
            ip_address=ip_address,
            status=status,
            details=details or {}
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[AUDIT LOG ERROR] Failed to record audit log: {e}")
