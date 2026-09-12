from sqlalchemy.orm import Session
from app.models.models import Machine, HourLog
from app.schemas.schemas import MachineCreate, MachineUpdate
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
    from app.models.models import SystemSetting, Company
    
    # Priority 1: Check target company's configured maintenance threshold
    target_threshold = None
    if schema.company_id:
        company = db.query(Company).filter(Company.id == schema.company_id).first()
        if company and company.maintenance_threshold is not None and float(company.maintenance_threshold) > 0:
            target_threshold = float(company.maintenance_threshold)
            
    # Priority 2: Check schema provided threshold if passed specifically
    if target_threshold is None and schema.maintenance_threshold_hours is not None and float(schema.maintenance_threshold_hours) > 0:
        target_threshold = float(schema.maintenance_threshold_hours)
        
    # Priority 3: Fallback to system setting or default 250.0
    if target_threshold is None:
        default_threshold = 250.0
        setting = db.query(SystemSetting).filter(SystemSetting.key == "default_maintenance_threshold").first()
        if setting:
            try:
                default_threshold = float(setting.value)
            except Exception:
                pass
        target_threshold = default_threshold

    db_machine = Machine(
        id=str(uuid.uuid4()),
        company_id=schema.company_id,
        name=schema.name,
        type=schema.type,
        brand=schema.brand,
        model=schema.model,
        serial_number=schema.serial_number,
        current_hours=schema.current_hours,
        maintenance_threshold_hours=target_threshold,
        last_maintenance_hours=schema.current_hours,
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

def hard_delete_machine(db: Session, machine_id: str):
    db_machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if db_machine:
        db.delete(db_machine)
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

def update_machine(db: Session, machine_id: str, schema: MachineUpdate):
    db_machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not db_machine:
        return None
        
    db_machine.name = schema.name
    if schema.brand is not None:
        db_machine.brand = schema.brand
    if schema.model is not None:
        db_machine.model = schema.model
    if schema.serial_number is not None:
        db_machine.serial_number = schema.serial_number
    if schema.photo is not None:
        db_machine.photo = schema.photo
    if schema.company_id is not None:
        db_machine.company_id = schema.company_id
        
    db.commit()
    db.refresh(db_machine)
    return db_machine
