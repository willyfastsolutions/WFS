from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Profile
from app.schemas.schemas import MachineResponse, MachineCreate, MachineHourUpdate
from app.routers.auth import get_current_user
from app.services import machinery as machinery_service

router = APIRouter(prefix="/machinery", tags=["machinery"])

@router.get("/", response_model=List[MachineResponse])
def read_machinery(
    company_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin":
        # Enforce multi-tenancy for company admins
        return machinery_service.get_machinery(db, company_id=current_user.company_id)
    else:
        # Superadmin can query all or filter by target company
        return machinery_service.get_machinery(db, company_id=company_id)

@router.post("/", response_model=MachineResponse, status_code=status.HTTP_201_CREATED)
def create_machine(
    machine: MachineCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # Tenant Admin cannot register machinery for other companies
    if current_user.role != "superadmin" and machine.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot register machinery for another tenant."
        )
    try:
        return machinery_service.add_machine(db, machine)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{machine_id}")
def delete_machine(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    db_machine = machinery_service.get_machine_by_id(db, machine_id)
    if not db_machine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machine not found")
        
    if current_user.role != "superadmin" and db_machine.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Access denied")
        
    machinery_service.delete_machine(db, machine_id)
    return {"message": "Machine revoked successfully"}

@router.post("/{machine_id}/hours", response_model=MachineResponse)
def update_hours(
    machine_id: str,
    payload: MachineHourUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    db_machine = machinery_service.get_machine_by_id(db, machine_id)
    if not db_machine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machine not found")
        
    if current_user.role != "superadmin" and db_machine.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Access denied")
        
    try:
        updated = machinery_service.log_hours(db, machine_id, payload.hours, current_user.id)
        if not updated:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to log hours")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
