from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Profile, Company
from app.schemas.schemas import CompanyResponse, CompanyCreate, AuthActionRequest
from app.routers.auth import get_current_user
from app.services.auth import verify_password
import uuid

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
