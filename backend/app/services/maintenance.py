from sqlalchemy.orm import Session
from app.models.models import MaintenanceLog, Machine
from app.schemas.schemas import MaintenanceLogCreate
import uuid

def perform_maintenance(db: Session, schema: MaintenanceLogCreate, user_id: str):
    db_machine = db.query(Machine).filter(Machine.id == schema.machinery_id).first()
    if not db_machine:
        return None
        
    if schema.hours_at_maintenance < db_machine.last_maintenance_hours:
        raise ValueError("Hours at maintenance cannot be less than last maintenance hours.")
        
    # Create the maintenance audit record
    db_log = MaintenanceLog(
        id=str(uuid.uuid4()),
        machinery_id=schema.machinery_id,
        performed_by=user_id,
        hours_at_maintenance=schema.hours_at_maintenance,
        oil_change=schema.oil_change,
        oil_filter_change=schema.oil_filter_change,
        air_filter_change=schema.air_filter_change,
        spark_glow_plugs_change=schema.spark_glow_plugs_change,
        safety_battery=schema.safety_battery,
        safety_lights=schema.safety_lights,
        safety_horn=schema.safety_horn,
        safety_ignition=schema.safety_ignition,
        safety_fuel=schema.safety_fuel,
        safety_tires=schema.safety_tires,
        notes=schema.notes,
        reset_physical_horometer=schema.reset_physical_horometer
    )
    db.add(db_log)
    
    # Process dynamic checklist results if provided
    if schema.checklist_results:
        from app.models.models import MaintenanceChecklistResult
        for res in schema.checklist_results:
            db_res = MaintenanceChecklistResult(
                id=str(uuid.uuid4()),
                maintenance_log_id=db_log.id,
                checklist_item_id=res.checklist_item_id,
                passed=res.passed
            )
            db.add(db_res)
            
    # Reset telemetry interval or reset physical horometer back to 0.0
    if schema.reset_physical_horometer:
        db_machine.current_hours = 0.0
        db_machine.last_maintenance_hours = 0.0
        # Log the reset in HourLog
        from app.models.models import HourLog
        db_hour_log = HourLog(
            id=str(uuid.uuid4()),
            machinery_id=schema.machinery_id,
            hours=0.0,
            logged_by=user_id
        )
        db.add(db_hour_log)
    else:
        db_machine.last_maintenance_hours = schema.hours_at_maintenance
        if db_machine.current_hours < schema.hours_at_maintenance:
            db_machine.current_hours = schema.hours_at_maintenance
            # Log the updated hours in HourLog to keep telemetry history consistent
            from app.models.models import HourLog
            db_hour_log = HourLog(
                id=str(uuid.uuid4()),
                machinery_id=schema.machinery_id,
                hours=schema.hours_at_maintenance,
                logged_by=user_id
            )
            db.add(db_hour_log)
        
    db_machine.warning_sent = False
    
    db.commit()
    db.refresh(db_log)
    return db_log

def get_maintenance_logs(db: Session, company_id: str = None):
    query = db.query(MaintenanceLog).join(Machine)
    if company_id:
        query = query.filter(Machine.company_id == company_id)
    # Return sorted by performance date descending
    return query.order_by(MaintenanceLog.performed_at.desc()).all()

def delete_maintenance(db: Session, log_id: str):
    db_log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not db_log:
        return False
        
    machine_id = db_log.machinery_id
    
    # Delete the log
    db.delete(db_log)
    db.flush()
    
    # Recalculate last maintenance hours for the machine
    db_machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if db_machine:
        latest_remaining = db.query(MaintenanceLog)\
            .filter(MaintenanceLog.machinery_id == machine_id)\
            .order_by(MaintenanceLog.performed_at.desc())\
            .first()
            
        if latest_remaining:
            db_machine.last_maintenance_hours = latest_remaining.hours_at_maintenance
        else:
            db_machine.last_maintenance_hours = 0.0
            
        # Update warning sent status
        from app.models.models import Company
        company = db.query(Company).filter(Company.id == db_machine.company_id).first()
        threshold = 250.0
        if company and company.maintenance_threshold is not None:
            threshold = company.maintenance_threshold
        elif db_machine.maintenance_threshold_hours is not None:
            threshold = db_machine.maintenance_threshold_hours
            
        hours_since_pm = db_machine.current_hours - db_machine.last_maintenance_hours
        db_machine.warning_sent = hours_since_pm >= threshold
        
    db.commit()
    return True
