from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.models.models import PublicReview
from app.schemas.schemas import ReviewCreate, ReviewResponse, ReviewSummaryResponse

router = APIRouter(prefix="/reviews", tags=["Public Reviews"])

@router.get("/", response_model=ReviewSummaryResponse)
def get_public_reviews(db: Session = Depends(get_db)):
    """Fetch public verified reviews and overall rating metrics."""
    reviews = (
        db.query(PublicReview)
        .filter(PublicReview.approved == True)
        .order_by(PublicReview.created_at.desc())
        .limit(50)
        .all()
    )
    
    total = len(reviews)
    if total == 0:
        return ReviewSummaryResponse(average_rating=5.0, total_reviews=0, reviews=[])
    
    avg_rating = round(sum(r.rating for r in reviews) / total, 1)
    
    return ReviewSummaryResponse(
        average_rating=avg_rating,
        total_reviews=total,
        reviews=reviews
    )

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_public_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    """Allow customers to submit a service review."""
    # Validate rating boundaries
    if payload.rating < 1 or payload.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be an integer between 1 and 5 stars."
        )
    
    if len(payload.author_name.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Author name is required."
        )

    if len(payload.comment.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review comment must be at least 5 characters."
        )

    db_review = PublicReview(
        author_name=payload.author_name.strip(),
        company_name=payload.company_name.strip() if payload.company_name else None,
        rating=payload.rating,
        comment=payload.comment.strip(),
        service_type=payload.service_type or "Forklift Maintenance",
        location=payload.location or "Queens, NY",
        approved=True
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review
