from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    must_change_password: bool = False

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    company_id: Optional[str] = None
    user_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# Company Schemas
class CompanyBase(BaseModel):
    name: str
    maintenance_threshold: Optional[float] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: str
    active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class AuthActionRequest(BaseModel):
    password: str

# Profile Schemas
class ProfileBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: str
    company_id: Optional[str] = None

class ProfileCreate(ProfileBase):
    password: Optional[str] = None

class ProfileUpdate(BaseModel):
    email: str
    role: str
    full_name: Optional[str] = None
    password: Optional[str] = None
    resend_invite: Optional[bool] = False

class ProfileResponse(ProfileBase):
    id: str
    must_change_password: bool = False
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
    maintenance_threshold_hours: Optional[float] = None

class MachineUpdate(BaseModel):
    name: str
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    photo: Optional[str] = None
    company_id: Optional[str] = None
    current_hours: Optional[float] = None
    last_maintenance_hours: Optional[float] = None
    maintenance_threshold_hours: Optional[float] = None

class MachineHourUpdate(BaseModel):
    hours: float

class MachineResponse(MachineBase):
    id: str
    company_id: str
    revoked: bool
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
class ChecklistResultCreate(BaseModel):
    checklist_item_id: str
    passed: bool
    photo_data: Optional[str] = None

class ChecklistResultResponse(BaseModel):
    id: str
    maintenance_log_id: str
    checklist_item_id: str
    passed: bool
    photo_data: Optional[str] = None
    
    class Config:
        from_attributes = True

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
    reset_physical_horometer: bool = False
    checklist_results: Optional[List[ChecklistResultCreate]] = None

class MaintenanceLogUpdate(BaseModel):
    hours_at_maintenance: Optional[float] = None
    notes: Optional[str] = None
    performed_at: Optional[datetime] = None

class MaintenanceLogResponse(BaseModel):
    id: str
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
    reset_physical_horometer: bool = False
    performed_by: Optional[str] = None
    performed_at: datetime
    checklist_results: List[ChecklistResultResponse] = []
    
    class Config:
        from_attributes = True

# Checklist Schemas
class ChecklistItemBase(BaseModel):
    label: str
    category: str = "routine"

class ChecklistItemCreate(ChecklistItemBase):
    template_id: str

class ChecklistItemResponse(ChecklistItemBase):
    id: str
    template_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChecklistTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None

class ChecklistTemplateCreate(ChecklistTemplateBase):
    company_id: Optional[str] = None
    items: Optional[List[ChecklistItemBase]] = None

class ChecklistTemplateResponse(ChecklistTemplateBase):
    id: str
    company_id: Optional[str] = None
    items: List[ChecklistItemResponse] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

# SystemSettings Schemas
class SystemSettingsUpdate(BaseModel):
    scan_interval_seconds: int
    default_maintenance_threshold: float
    scan_mode: str = "interval"
    scan_daily_time: str = "12:00"

class SystemSettingsResponse(BaseModel):
    scan_interval_seconds: int
    default_maintenance_threshold: float
    scan_mode: str
    scan_daily_time: str

# Quote Request Schemas
class QuoteRequestCreate(BaseModel):
    full_name: str
    email: str
    company_name: str
    message: str

class QuoteRequestResponse(BaseModel):
    id: str
    full_name: str
    email: str
    company_name: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True



