from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Profile
from app.schemas.schemas import MaintenanceLogResponse, MaintenanceLogCreate, MaintenanceLogUpdate
from app.routers.auth import get_current_user
from app.services import maintenance as maintenance_service
from app.services import machinery as machinery_service
from fastapi.responses import FileResponse
import os as sys_os
from app.services.pdf_generator_detailed import generate_detailed_maintenance_pdf
from app.services.email_worker import send_report_email
from app.models.models import Company
from app.services.audit import log_audit_action

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
        db_log = maintenance_service.perform_maintenance(db, log, current_user.id)
        
        # Auto-generate detailed PDF & send email to company admin
        try:
            comp_name = "WillyFastSolutions"
            company = db.query(Company).filter(Company.id == db_machine.company_id).first()
            if company:
                comp_name = company.name
                
            report_dir = sys_os.path.join(sys_os.path.dirname(sys_os.path.dirname(sys_os.path.dirname(__file__))), "reports")
            sys_os.makedirs(report_dir, exist_ok=True)
            report_path = sys_os.path.abspath(sys_os.path.join(report_dir, f"maintenance_report_{db_log.id}.pdf"))
            
            mechanic_name = current_user.full_name or current_user.email
            generate_detailed_maintenance_pdf(
                machine=db_machine,
                company_name=comp_name,
                maintenance_log=db_log,
                checklist_results=db_log.checklist_results,
                mechanic_name=mechanic_name,
                output_path=report_path
            )
            
            # Find company admin to email
            from app.models.models import Profile
            admin_profile = db.query(Profile).filter(
                Profile.company_id == db_machine.company_id,
                Profile.role == "company_admin"
            ).first()
            if admin_profile and admin_profile.email:
                send_report_email(
                    to_email=admin_profile.email,
                    machine_name=db_machine.name,
                    company_name=comp_name,
                    attachment_path=report_path
                )
        except Exception as mail_err:
            print(f"[MAINTENANCE] Error generating/sending report email: {mail_err}")
            
        return db_log
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

@router.put("/{id}", response_model=MaintenanceLogResponse)
def update_maintenance_log_endpoint(
    id: str,
    payload: MaintenanceLogUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    from app.models.models import MaintenanceLog, Machine
    db_log = db.query(MaintenanceLog).filter(MaintenanceLog.id == id).first()
    if not db_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance log not found.")
        
    db_machine = db.query(Machine).filter(Machine.id == db_log.machinery_id).first()
    if not db_machine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machine not found.")
        
    if current_user.role != "superadmin" and str(db_machine.company_id) != str(current_user.company_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Access denied.")
        
    updated = maintenance_service.update_maintenance_log(db, id, payload)
    log_audit_action(
        db, 
        action="MAINTENANCE_LOG_UPDATED", 
        user_id=current_user.id, 
        email=current_user.email, 
        details={"log_id": id, "machine_id": db_machine.id, "hours_at_maintenance": updated.hours_at_maintenance}
    )
    return updated

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_maintenance_log(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only superadmins can delete maintenance logs."
        )
        
    success = maintenance_service.delete_maintenance(db, id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance log not found."
        )
    return None

@router.get("/{id}/report")
def download_maintenance_report(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    from app.models.models import MaintenanceLog, Profile
    
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
        
    db_machine = machinery_service.get_machine_by_id(db, log.machinery_id)
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
        
    if current_user.role != "superadmin" and str(db_machine.company_id) != str(current_user.company_id):
        raise HTTPException(status_code=403, detail="Access denied")
        
    comp_name = "WillyFastSolutions"
    company = db.query(Company).filter(Company.id == db_machine.company_id).first()
    if company:
        comp_name = company.name
        
    report_dir = sys_os.path.join(sys_os.path.dirname(sys_os.path.dirname(sys_os.path.dirname(__file__))), "reports")
    sys_os.makedirs(report_dir, exist_ok=True)
    report_path = sys_os.path.abspath(sys_os.path.join(report_dir, f"maintenance_report_{log.id}.pdf"))
    
    mechanic_name = "System"
    mechanic = db.query(Profile).filter(Profile.id == log.performed_by).first()
    if mechanic:
        mechanic_name = mechanic.full_name or mechanic.email
        
    # Always regenerate fresh to ensure latest layout, photos, and edits are reflected
    generate_detailed_maintenance_pdf(
        machine=db_machine,
        company_name=comp_name,
        maintenance_log=log,
        checklist_results=log.checklist_results,
        mechanic_name=mechanic_name,
        output_path=report_path
    )
        
    return FileResponse(
        path=report_path,
        media_type="application/pdf",
        filename=f"maintenance_report_{log.id}.pdf"
    )
