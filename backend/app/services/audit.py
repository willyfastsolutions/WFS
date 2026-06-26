import uuid
import json
from sqlalchemy.orm import Session
from app.models.models import AuditLog

def log_audit_action(db: Session, action: str, user_id: str = None, email: str = None, details: dict = None):
    try:
        details_str = json.dumps(details) if details else None
        db_log = AuditLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            email=email,
            action=action,
            details=details_str
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
    except Exception as ex:
        # Prevent logging errors from crashing the actual business operations
        print(f"[AUDIT LOG SYSTEM ERROR] Failed to write audit log: {str(ex)}")
        db.rollback()
        return None
