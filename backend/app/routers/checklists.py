from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from typing import List
from app.core.database import get_db
from app.models.models import Profile, ChecklistTemplate, ChecklistItem
from app.schemas.schemas import (
    ChecklistTemplateResponse, ChecklistTemplateCreate,
    ChecklistItemResponse, ChecklistItemCreate
)
from app.routers.auth import get_current_user
import uuid

router = APIRouter(prefix="/checklists", tags=["checklists"])

@router.get("/templates", response_model=List[ChecklistTemplateResponse])
def get_templates(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # Eagerly load checklist items in a single query to prevent N+1 latency
    query = db.query(ChecklistTemplate).options(selectinload(ChecklistTemplate.items))
    if current_user.role == "superadmin":
        return query.all()
    
    # If company admin, return global templates (company_id is null) or company-specific templates
    return query.filter(
        (ChecklistTemplate.company_id == current_user.company_id) | 
        (ChecklistTemplate.company_id == None)
    ).all()

@router.post("/templates", response_model=ChecklistTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    template: ChecklistTemplateCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # Only superadmins and company admins can create templates
    if current_user.role not in ["superadmin", "company_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Insufficient permissions to create templates"
        )
    
    # Superadmin can assign to any company (or null for global), company admin is locked to their company_id
    target_company_id = template.company_id if current_user.role == "superadmin" else current_user.company_id
    
    db_template = ChecklistTemplate(
        id=str(uuid.uuid4()),
        name=template.name,
        description=template.description,
        company_id=target_company_id
    )
    db.add(db_template)
    
    # Add items if provided
    if template.items:
        for item in template.items:
            db_item = ChecklistItem(
                id=str(uuid.uuid4()),
                template_id=db_template.id,
                label=item.label,
                category=item.category
            )
            db.add(db_item)
            
    db.commit()
    db.refresh(db_template)
    return db_template

@router.post("/items", response_model=ChecklistItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    item: ChecklistItemCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # Verify template exists
    template = db.query(ChecklistTemplate).filter(ChecklistTemplate.id == item.template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checklist template not found"
        )
        
    # Verify ownership
    template_company_id = str(template.company_id) if template.company_id else None
    user_company_id = str(current_user.company_id) if current_user.company_id else None
    if current_user.role != "superadmin" and template_company_id != user_company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot add items to templates of another company"
        )
        
    db_item = ChecklistItem(
        id=str(uuid.uuid4()),
        template_id=item.template_id,
        label=item.label,
        category=item.category
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/templates/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    template = db.query(ChecklistTemplate).filter(ChecklistTemplate.id == id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checklist template not found"
        )
        
    # Verify ownership
    template_company_id = str(template.company_id) if template.company_id else None
    user_company_id = str(current_user.company_id) if current_user.company_id else None
    if current_user.role != "superadmin" and template_company_id != user_company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot delete templates of another company"
        )
        
    db.delete(template)
    db.commit()
    return None


@router.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
        
    template = db.query(ChecklistTemplate).filter(ChecklistTemplate.id == item.template_id).first()
    if template:
        if current_user.role != "superadmin" and str(template.company_id) != str(current_user.company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Cannot delete items of another company's template"
            )
            
    db.delete(item)
    db.commit()
    return None
