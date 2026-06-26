from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Profile, Company
from app.schemas.schemas import CompanyResponse, CompanyCreate, AuthActionRequest, ProfileCreate, ProfileResponse, ProfileUpdate
from app.routers.auth import get_current_user
from app.services.auth import verify_password, get_password_hash
import uuid
import secrets
import string
from app.services.email_worker import send_welcome_email

router = APIRouter(prefix="/companies", tags=["companies"])

@router.get("/", response_model=List[CompanyResponse])
def read_companies(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # Retrieve all registered companies (only for superadmin)
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only superadmins can list all B2B companies"
        )
    return db.query(Company).all()

@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # Authorization: Only superadmins can create B2B companies
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only superadmins can register B2B companies"
        )
        
    # Check if company already exists
    exists = db.query(Company).filter(Company.name == company.name).first()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A B2B company with this name is already registered."
        )
        
    db_company = Company(
        id=str(uuid.uuid4()),
        name=company.name,
        active=True
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.patch("/{company_id}/toggle-active", response_model=CompanyResponse)
def toggle_company_active(
    company_id: str,
    request: AuthActionRequest,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # Authorization check
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only superadmins can change company status"
        )
    
    # Password verification
    if not verify_password(request.password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password confirmation"
        )
        
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="B2B Company not found"
        )
        
    db_company.active = not db_company.active
    db.commit()
    db.refresh(db_company)
    return db_company

@router.post("/{company_id}/delete", status_code=status.HTTP_200_OK)
def delete_company_post(
    company_id: str,
    request: AuthActionRequest,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # We provide this POST endpoint to avoid HTTP DELETE request body compatibility issues
    return delete_company(company_id=company_id, request=request, db=db, current_user=current_user)

@router.delete("/{company_id}", status_code=status.HTTP_200_OK)
def delete_company(
    company_id: str,
    request: AuthActionRequest,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # Authorization check
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only superadmins can delete B2B companies"
        )
    
    # Password verification
    if not verify_password(request.password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password confirmation"
        )
        
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="B2B Company not found"
        )
        
    # Delete from database (Cascades automatically to machines, users, etc.)
    db.delete(db_company)
    db.commit()
    return {"message": "B2B Company and all associated accounts/machines deleted successfully"}

# --- B2B USER MANAGEMENT ENDPOINTS ---

@router.get("/{company_id}/users", response_model=List[ProfileResponse])
def get_company_users(
    company_id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only superadmins can manage company users"
        )
    return db.query(Profile).filter(Profile.company_id == company_id).all()

@router.post("/{company_id}/users", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_company_user(
    company_id: str,
    payload: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only superadmins can manage company users"
        )
        
    # Check if email is already in use
    exists = db.query(Profile).filter(Profile.email == payload.email).first()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email is already registered."
        )
    
    # Get company name for the welcome email
    company = db.query(Company).filter(Company.id == company_id).first()
    company_name = company.name if company else "WillyFastSolutions"
    
    # Auto-generate a secure temporary password
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    temp_password = ''.join(secrets.choice(alphabet) for _ in range(12))
        
    db_profile = Profile(
        id=str(uuid.uuid4()),
        company_id=company_id,
        role=payload.role,
        full_name=payload.full_name,
        email=payload.email,
        password_hash=get_password_hash(temp_password),
        must_change_password=True
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    
    # Send welcome email with temporary password
    send_welcome_email(
        to_email=payload.email,
        full_name=payload.full_name or payload.email,
        temp_password=temp_password,
        company_name=company_name
    )
    
    return db_profile

@router.put("/users/{user_id}", response_model=ProfileResponse)
def update_company_user(
    user_id: str,
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only superadmins can manage company users"
        )
        
    db_profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    # Check if email is already taken by another user
    email_exists = db.query(Profile).filter(Profile.email == payload.email, Profile.id != user_id).first()
    if email_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email is already registered."
        )
        
    db_profile.email = payload.email
    db_profile.role = payload.role
    db_profile.full_name = payload.full_name
    if payload.password:
        db_profile.password_hash = get_password_hash(payload.password)
        
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
def delete_company_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only superadmins can manage company users"
        )
        
    db_profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    db.delete(db_profile)
    db.commit()
    return {"message": "User profile deleted successfully"}

@router.get("/{company_id}", response_model=CompanyResponse)
def get_company_by_id(
    company_id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role != "superadmin" and current_user.company_id != company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only query details of your own company."
        )
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return db_company

