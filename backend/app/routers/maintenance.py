from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Profile
from app.schemas.schemas import MaintenanceLogResponse, MaintenanceLogCreate
from app.routers.auth import get_current_user
from app.services import maintenance as maintenance_service
from app.services import machinery as machinery_service

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.post("/", response_model=MaintenanceLogResponse, status_code=status.HTTP_201_CREATED)
def record_maintenance(
    log: MaintenanceLogCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    db_machine = machinery_service.get_machine_by_id(db, log.machinery_id)
    if not db_machine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machine not found")
        
    machine_company_id = str(db_machine.company_id) if db_machine.company_id else None
    user_company_id = str(current_user.company_id) if current_user.company_id else None
    if current_user.role != "superadmin" and machine_company_id != user_company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Access denied")
        
    try:
        return maintenance_service.perform_maintenance(db, log, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/logs", response_model=List[MaintenanceLogResponse])
def read_maintenance_logs(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin":
        return maintenance_service.get_maintenance_logs(db, company_id=current_user.company_id)
    else:
        return maintenance_service.get_maintenance_logs(db)
