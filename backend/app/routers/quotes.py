from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import QuoteRequest
from app.schemas.schemas import QuoteRequestCreate, QuoteRequestResponse
from app.services.rate_limiter import quote_limiter
from app.services.email_worker import send_quote_request_email
from datetime import datetime, timedelta

router = APIRouter(prefix="/quotes", tags=["quotes"])

@router.post("", response_model=QuoteRequestResponse, status_code=status.HTTP_201_CREATED)
def create_quote_request(payload: QuoteRequestCreate, request: Request, db: Session = Depends(get_db)):
    # 1. Extract IP address to apply rate limit
    ip = request.client.host if request.client else "unknown"
    
    # 2. Check rate limit per IP
    if quote_limiter.is_rate_limited(ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many quote requests from this IP. Please wait 5 minutes before submitting again."
        )
        
    # 3. Check rate limit per email in DB (max 1 quote request per 5 minutes per email)
    five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
    existing_recent = db.query(QuoteRequest).filter(
        QuoteRequest.email == payload.email,
        QuoteRequest.created_at >= five_minutes_ago
    ).first()
    
    if existing_recent:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="A quote request with this email was recently submitted. Please wait 5 minutes."
        )
        
    # 4. Save to Database
    db_request = QuoteRequest(
        full_name=payload.full_name,
        email=payload.email,
        company_name=payload.company_name,
        message=payload.message,
        ip_address=ip
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    # 5. Send notification email to admin@willyfastsolutions.com
    send_quote_request_email(
        full_name=payload.full_name,
        email=payload.email,
        company_name=payload.company_name,
        message=payload.message
    )
    
    return db_request
