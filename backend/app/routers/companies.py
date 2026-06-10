from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Profile, Company
from app.schemas.schemas import CompanyResponse, CompanyCreate
from app.routers.auth import get_current_user
import uuid

router = APIRouter(prefix="/companies", tags=["companies"])

@router.get("/", response_model=List[CompanyResponse])
def read_companies(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # Retrieve all registered companies
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
        name=company.name
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company
