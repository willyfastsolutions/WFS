from sqlalchemy.orm import Session
from app.models.models import Machine, HourLog
from app.schemas.schemas import MachineCreate
import uuid

def get_machinery(db: Session, company_id: str = None, include_revoked: bool = False):
    query = db.query(Machine)
    if not include_revoked:
        query = query.filter(Machine.revoked == False)
    if company_id:
        query = query.filter(Machine.company_id == company_id)
    return query.all()

def get_machine_by_id(db: Session, machine_id: str):
    return db.query(Machine).filter(Machine.id == machine_id).first()

def add_machine(db: Session, schema: MachineCreate):
    # Fetch default threshold from system settings
    from app.models.models import SystemSetting
    default_threshold = 250.0
    setting = db.query(SystemSetting).filter(SystemSetting.key == "default_maintenance_threshold").first()
    if setting:
        try:
            default_threshold = float(setting.value)
        except Exception:
            pass

    # Enforce guard: initial hours cannot exceed threshold
    if schema.current_hours > default_threshold:
        raise ValueError(f"Initial hours cannot exceed {default_threshold} hours.")
        
    db_machine = Machine(
        id=str(uuid.uuid4()),
        company_id=schema.company_id,
        name=schema.name,
        type=schema.type,
        brand=schema.brand,
        model=schema.model,
        serial_number=schema.serial_number,
        current_hours=schema.current_hours,
        maintenance_threshold_hours=default_threshold,
        last_maintenance_hours=0.0,
        photo=schema.photo
    )
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine

def delete_machine(db: Session, machine_id: str):
    db_machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if db_machine:
        db_machine.revoked = True
        db.commit()
        return True
    return False

def reactivate_machine(db: Session, machine_id: str):
    db_machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if db_machine:
        db_machine.revoked = False
        db.commit()
        return db_machine
    return None

def log_hours(db: Session, machine_id: str, new_hours: float, user_id: str):
    db_machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not db_machine:
        return None
        
    if new_hours < db_machine.current_hours:
        raise ValueError("New hours value cannot be less than current hours.")
        
    db_machine.current_hours = new_hours
    
    db_log = HourLog(
        id=str(uuid.uuid4()),
        machinery_id=machine_id,
        hours=new_hours,
        logged_by=user_id
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_machine)
    return db_machine
