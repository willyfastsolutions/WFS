from sqlalchemy.orm import Session
from app.models.models import Machine, HourLog
from app.schemas.schemas import MachineCreate
import uuid

def get_machinery(db: Session, company_id: str = None):
    query = db.query(Machine)
    if company_id:
        query = query.filter(Machine.company_id == company_id)
    return query.all()

def get_machine_by_id(db: Session, machine_id: str):
    return db.query(Machine).filter(Machine.id == machine_id).first()

def add_machine(db: Session, schema: MachineCreate):
    # Enforce guard: initial hours cannot exceed 250
    if schema.current_hours > 250.0:
        raise ValueError("Initial hours cannot exceed 250 hours.")
        
    db_machine = Machine(
        id=str(uuid.uuid4()),
        company_id=schema.company_id,
        name=schema.name,
        type=schema.type,
        brand=schema.brand,
        model=schema.model,
        serial_number=schema.serial_number,
        current_hours=schema.current_hours,
        maintenance_threshold_hours=250.0,
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
        db.delete(db_machine)
        db.commit()
        return True
    return False

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
