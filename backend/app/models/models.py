import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    maintenance_threshold = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    profiles = relationship("Profile", back_populates="company", cascade="all, delete-orphan")
    machinery = relationship("Machine", back_populates="company", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    role = Column(String(50), nullable=False)  # 'superadmin' or 'company_admin'
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    must_change_password = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    company = relationship("Company", back_populates="profiles")

class Machine(Base):
    __tablename__ = "machinery"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # 'forklift', 'excavator', 'skid_steer_loader'
    brand = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    serial_number = Column(String(100), nullable=True)
    current_hours = Column(Float, default=0.0, nullable=False)
    maintenance_threshold_hours = Column(Float, default=250.0, nullable=False)
    last_maintenance_hours = Column(Float, default=0.0, nullable=False)
    photo = Column(Text, nullable=True)
    warning_sent = Column(Boolean, default=False, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    company = relationship("Company", back_populates="machinery")
    hour_logs = relationship("HourLog", back_populates="machine", cascade="all, delete-orphan")
    maintenance_logs = relationship("MaintenanceLog", back_populates="machine", cascade="all, delete-orphan")

class HourLog(Base):
    __tablename__ = "hour_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    machinery_id = Column(String(36), ForeignKey("machinery.id", ondelete="CASCADE"), nullable=False)
    hours = Column(Float, nullable=False)
    logged_by = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    machine = relationship("Machine", back_populates="hour_logs")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    machinery_id = Column(String(36), ForeignKey("machinery.id", ondelete="CASCADE"), nullable=False)
    performed_by = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    performed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    hours_at_maintenance = Column(Float, nullable=False)
    
    # Routine Services Checklist
    oil_change = Column(Boolean, default=False, nullable=False)
    oil_filter_change = Column(Boolean, default=False, nullable=False)
    air_filter_change = Column(Boolean, default=False, nullable=False)
    spark_glow_plugs_change = Column(Boolean, default=False, nullable=False)
    
    # Safety Checklist
    safety_battery = Column(Boolean, default=False, nullable=False)
    safety_lights = Column(Boolean, default=False, nullable=False)
    safety_horn = Column(Boolean, default=False, nullable=False)
    safety_ignition = Column(Boolean, default=False, nullable=False)
    safety_fuel = Column(Boolean, default=False, nullable=False)
    safety_tires = Column(Boolean, default=False, nullable=False)
    
    notes = Column(Text, nullable=True)
    reset_physical_horometer = Column(Boolean, default=False, nullable=False)
    
    machine = relationship("Machine", back_populates="maintenance_logs")
    checklist_results = relationship("MaintenanceChecklistResult", back_populates="maintenance_log", cascade="all, delete-orphan")

class ChecklistTemplate(Base):
    __tablename__ = "checklist_templates"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    company = relationship("Company")
    items = relationship("ChecklistItem", back_populates="template", cascade="all, delete-orphan")

class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    template_id = Column(String(36), ForeignKey("checklist_templates.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(255), nullable=False)
    category = Column(String(50), default="routine", nullable=False)  # 'routine', 'safety', 'specific'
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    template = relationship("ChecklistTemplate", back_populates="items")
    results = relationship("MaintenanceChecklistResult", back_populates="item", cascade="all, delete-orphan")

class MaintenanceChecklistResult(Base):
    __tablename__ = "maintenance_checklist_results"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    maintenance_log_id = Column(String(36), ForeignKey("maintenance_logs.id", ondelete="CASCADE"), nullable=False)
    checklist_item_id = Column(String(36), ForeignKey("checklist_items.id", ondelete="CASCADE"), nullable=False)
    passed = Column(Boolean, default=False, nullable=False)
    
    maintenance_log = relationship("MaintenanceLog", back_populates="checklist_results")
    item = relationship("ChecklistItem", back_populates="results")

class SystemSetting(Base):
    __tablename__ = "system_settings"
    
    key = Column(String(50), primary_key=True)
    value = Column(String(255), nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True)
    email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)  # e.g. 'LOGIN_SUCCESS', 'RESET_PASSWORD'
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
