from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Profile, SystemSetting
from app.schemas.schemas import SystemSettingsResponse, SystemSettingsUpdate
from app.routers.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/", response_model=SystemSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only superadmins can access agent configurations."
        )
        
    scan_interval = 86400
    default_threshold = 250.0
    
    scan_setting = db.query(SystemSetting).filter(SystemSetting.key == "scan_interval_seconds").first()
    if scan_setting:
        try:
            scan_interval = int(scan_setting.value)
        except ValueError:
            pass
        
    threshold_setting = db.query(SystemSetting).filter(SystemSetting.key == "default_maintenance_threshold").first()
    if threshold_setting:
        try:
            default_threshold = float(threshold_setting.value)
        except ValueError:
            pass
        
    return SystemSettingsResponse(
        scan_interval_seconds=scan_interval,
        default_maintenance_threshold=default_threshold
    )

@router.post("/", response_model=SystemSettingsResponse)
def update_settings(
    payload: SystemSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only superadmins can update agent configurations."
        )
        
    scan_setting = db.query(SystemSetting).filter(SystemSetting.key == "scan_interval_seconds").first()
    if not scan_setting:
        scan_setting = SystemSetting(key="scan_interval_seconds", value=str(payload.scan_interval_seconds))
        db.add(scan_setting)
    else:
        scan_setting.value = str(payload.scan_interval_seconds)
        
    threshold_setting = db.query(SystemSetting).filter(SystemSetting.key == "default_maintenance_threshold").first()
    if not threshold_setting:
        threshold_setting = SystemSetting(key="default_maintenance_threshold", value=str(payload.default_maintenance_threshold))
        db.add(threshold_setting)
    else:
        threshold_setting.value = str(payload.default_maintenance_threshold)
        
    db.commit()
    
    return SystemSettingsResponse(
        scan_interval_seconds=payload.scan_interval_seconds,
        default_maintenance_threshold=payload.default_maintenance_threshold
    )
