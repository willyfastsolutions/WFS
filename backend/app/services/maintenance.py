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
    else:
        db_machine.last_maintenance_hours = schema.hours_at_maintenance
        
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
