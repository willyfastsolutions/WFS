import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
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
    
    machine = relationship("Machine", back_populates="maintenance_logs")
