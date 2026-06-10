from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    company_id: Optional[str] = None
    user_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

# Company Schemas
class CompanyBase(BaseModel):
    name: str

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Profile Schemas
class ProfileBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: str
    company_id: Optional[str] = None

class ProfileCreate(ProfileBase):
    password: str

class ProfileResponse(ProfileBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Machine Schemas
class MachineBase(BaseModel):
    name: str
    type: str
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    current_hours: float = 0.0
    maintenance_threshold_hours: float = 250.0
    last_maintenance_hours: float = 0.0
    photo: Optional[str] = None

class MachineCreate(BaseModel):
    name: str
    type: str  # 'forklift', 'excavator', 'skid_steer_loader'
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    current_hours: float = 0.0
    company_id: str  # Target B2B company
    photo: Optional[str] = None

class MachineHourUpdate(BaseModel):
    hours: float

class MachineResponse(MachineBase):
    id: str
    company_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# HourLog Schemas
class HourLogCreate(BaseModel):
    hours: float

class HourLogResponse(BaseModel):
    id: str
    machinery_id: str
    hours: float
    logged_by: Optional[str]
    logged_at: datetime
    
    class Config:
        from_attributes = True

# MaintenanceLog Schemas
class MaintenanceLogCreate(BaseModel):
    machinery_id: str
    hours_at_maintenance: float
    oil_change: bool = False
    oil_filter_change: bool = False
    air_filter_change: bool = False
    spark_glow_plugs_change: bool = False
    safety_battery: bool = False
    safety_lights: bool = False
    safety_horn: bool = False
    safety_ignition: bool = False
    safety_fuel: bool = False
    safety_tires: bool = False
    notes: Optional[str] = None

class MaintenanceLogResponse(MaintenanceLogCreate):
    id: str
    performed_by: Optional[str]
    performed_at: datetime
    
    class Config:
        from_attributes = True
