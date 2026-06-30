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
    scan_mode = "interval"
    scan_daily_time = "12:00"
    
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
            
    mode_setting = db.query(SystemSetting).filter(SystemSetting.key == "scan_mode").first()
    if mode_setting:
        scan_mode = mode_setting.value
        
    daily_setting = db.query(SystemSetting).filter(SystemSetting.key == "scan_daily_time").first()
    if daily_setting:
        scan_daily_time = daily_setting.value
        
    return SystemSettingsResponse(
        scan_interval_seconds=scan_interval,
        default_maintenance_threshold=default_threshold,
        scan_mode=scan_mode,
        scan_daily_time=scan_daily_time
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
        
    mode_setting = db.query(SystemSetting).filter(SystemSetting.key == "scan_mode").first()
    if not mode_setting:
        mode_setting = SystemSetting(key="scan_mode", value=payload.scan_mode)
        db.add(mode_setting)
    else:
        mode_setting.value = payload.scan_mode
        
    daily_setting = db.query(SystemSetting).filter(SystemSetting.key == "scan_daily_time").first()
    if not daily_setting:
        daily_setting = SystemSetting(key="scan_daily_time", value=payload.scan_daily_time)
        db.add(daily_setting)
    else:
        daily_setting.value = payload.scan_daily_time
        
    db.commit()
    
    # Signal background daemon to wake up and reschedule immediately
    try:
        from app.services.audit_worker import settings_changed_event
        settings_changed_event.set()
    except Exception as ex:
        print(f"[SETTINGS API] Failed to signal background daemon: {ex}")
    
    return SystemSettingsResponse(
        scan_interval_seconds=payload.scan_interval_seconds,
        default_maintenance_threshold=payload.default_maintenance_threshold,
        scan_mode=payload.scan_mode,
        scan_daily_time=payload.scan_daily_time
    )


@router.post("/trigger-scan")
def trigger_agent_scan(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only superadmins can trigger manual agent scans."
        )
    from app.services.audit_worker import run_audit_cycle
    try:
        results = run_audit_cycle()
        return {
            "status": "success", 
            "message": "Manual telemetry scan completed. Warning flags and reports updated.",
            "results": results
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error running manual audit scan: {str(e)}"
        )

