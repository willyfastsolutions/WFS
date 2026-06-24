from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Profile
from app.schemas.schemas import MachineResponse, MachineCreate, MachineUpdate, MachineHourUpdate
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
        # Enforce multi-tenancy for company admins, active machines only
        return machinery_service.get_machinery(db, company_id=current_user.company_id, include_revoked=False)
    else:
        # Superadmin can query all, including revoked ones
        return machinery_service.get_machinery(db, company_id=company_id, include_revoked=True)

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

@router.put("/{machine_id}", response_model=MachineResponse)
def update_machine_route(
    machine_id: str,
    payload: MachineUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    db_machine = machinery_service.get_machine_by_id(db, machine_id)
    if not db_machine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machine not found")
        
    if current_user.role != "superadmin" and db_machine.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Access denied")
        
    updated = machinery_service.update_machine(db, machine_id, payload)
    return updated

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

@router.post("/{machine_id}/reactivate", response_model=MachineResponse)
def reactivate_machine(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Access denied")
        
    db_machine = machinery_service.reactivate_machine(db, machine_id)
    if not db_machine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machine not found")
    return db_machine

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

from pydantic import BaseModel
from typing import Optional
from fastapi.responses import FileResponse
import os

class ReportGenerationPayload(BaseModel):
    name: str
    type: str
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    current_hours: float
    last_maintenance_hours: float
    maintenance_threshold_hours: float
    photo: Optional[str] = None
    company_id: Optional[str] = None
    company_name: Optional[str] = None

@router.post("/{machine_id}/generate-report")
def generate_report(
    machine_id: str,
    payload: ReportGenerationPayload,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin" and payload.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Access denied")
        
    # Ensure the company exists if provided
    from app.models.models import Company, Machine
    if payload.company_id:
        company = db.query(Company).filter(Company.id == payload.company_id).first()
        if not company:
            company = Company(
                id=payload.company_id,
                name=payload.company_name or "Sync B2B Tenant"
            )
            db.add(company)
            db.commit()

    # Get or create/update the machine in the SQLite database to sync details (including the photo!)
    db_machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not db_machine:
        db_machine = Machine(
            id=machine_id,
            company_id=payload.company_id,
            name=payload.name,
            type=payload.type,
            brand=payload.brand,
            model=payload.model,
            serial_number=payload.serial_number,
            current_hours=payload.current_hours,
            last_maintenance_hours=payload.last_maintenance_hours,
            maintenance_threshold_hours=payload.maintenance_threshold_hours,
            photo=payload.photo
        )
        db.add(db_machine)
        db.commit()
        db.refresh(db_machine)
    else:
        # Check permissions on existing machine in db
        if current_user.role != "superadmin" and db_machine.company_id != current_user.company_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Access denied")
        db_machine.name = payload.name
        db_machine.type = payload.type
        db_machine.brand = payload.brand
        db_machine.model = payload.model
        db_machine.serial_number = payload.serial_number
        db_machine.current_hours = payload.current_hours
        db_machine.last_maintenance_hours = payload.last_maintenance_hours
        db_machine.maintenance_threshold_hours = payload.maintenance_threshold_hours
        db_machine.photo = payload.photo
        db.commit()
        db.refresh(db_machine)
        
    comp_name = payload.company_name or "Unknown B2B Tenant"
    if payload.company_id and not payload.company_name:
        company = db.query(Company).filter(Company.id == payload.company_id).first()
        if company:
            comp_name = company.name

    # Generate report path
    report_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reports")
    os.makedirs(report_dir, exist_ok=True)
    report_path = os.path.abspath(os.path.join(report_dir, f"manual_report_{db_machine.serial_number}.pdf"))
    
    # Generate PDF
    from app.services.pdf_generator import generate_machinery_pdf
    try:
        generate_machinery_pdf(
            machine_name=db_machine.name,
            brand=db_machine.brand,
            model=db_machine.model,
            serial=db_machine.serial_number,
            current_hours=db_machine.current_hours,
            last_hours=db_machine.last_maintenance_hours,
            limit_hours=db_machine.maintenance_threshold_hours,
            company_name=comp_name,
            output_path=report_path,
            photo_base64=db_machine.photo
        )
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(ex)}"
        )
        
    if not os.path.exists(report_path):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Report file was not created.")
        
    return FileResponse(
        path=report_path,
        media_type="application/pdf",
        filename=f"report_{db_machine.serial_number}.pdf"
    )

@router.post("/{machine_id}/email-report")
def email_report(
    machine_id: str,
    payload: ReportGenerationPayload,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Generate and email the machinery PDF report to the company admin."""
    if current_user.role != "superadmin" and payload.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Access denied")
    
    from app.models.models import Company, Machine
    
    # Get or create machine in local db (same logic as generate_report)
    if payload.company_id:
        company = db.query(Company).filter(Company.id == payload.company_id).first()
        if not company:
            company = Company(
                id=payload.company_id,
                name=payload.company_name or "Sync B2B Tenant"
            )
            db.add(company)
            db.commit()
    
    db_machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not db_machine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machine not found")
    
    comp_name = payload.company_name or "Unknown B2B Tenant"
    if payload.company_id and not payload.company_name:
        company = db.query(Company).filter(Company.id == payload.company_id).first()
        if company:
            comp_name = company.name
    
    # Generate PDF report
    report_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reports")
    os.makedirs(report_dir, exist_ok=True)
    report_path = os.path.abspath(os.path.join(report_dir, f"email_report_{db_machine.serial_number}.pdf"))
    
    from app.services.pdf_generator import generate_machinery_pdf
    try:
        generate_machinery_pdf(
            machine_name=db_machine.name,
            brand=db_machine.brand,
            model=db_machine.model,
            serial=db_machine.serial_number,
            current_hours=db_machine.current_hours,
            last_hours=db_machine.last_maintenance_hours,
            limit_hours=db_machine.maintenance_threshold_hours,
            company_name=comp_name,
            output_path=report_path,
            photo_base64=db_machine.photo
        )
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(ex)}"
        )
    
    if not os.path.exists(report_path):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Report file was not created.")
    
    # Find the company admin email to send the report to
    admin_profile = db.query(Profile).filter(
        Profile.company_id == payload.company_id,
        Profile.role == "company_admin"
    ).first()
    
    if not admin_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No company admin found for this company. Cannot send email."
        )
    
    from app.services.email_worker import send_report_email
    sent = send_report_email(
        to_email=admin_profile.email,
        machine_name=db_machine.name,
        company_name=comp_name,
        attachment_path=report_path
    )
    
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send the report email."
        )
    
    return {"message": f"Report emailed successfully to {admin_profile.email}", "sent_to": admin_profile.email}
