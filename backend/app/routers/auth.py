from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Profile, Company
from app.schemas.schemas import LoginRequest, Token, ForgotPasswordRequest, ResetPasswordRequest
from app.services.auth import (
    verify_password,
    create_access_token,
    decode_access_token,
    create_password_reset_token,
    verify_password_reset_token,
    get_password_hash
)
from app.services.email_worker import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Profile:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("email")
    if email is None:
        raise credentials_exception
    user = db.query(Profile).filter(Profile.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Profile).filter(Profile.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Check if user's company is active
    if user.company_id:
        company = db.query(Company).filter(Company.id == user.company_id).first()
        if company and not company.active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your company account has been deactivated. Please contact support."
            )
            
    access_token = create_access_token(
        data={
            "email": user.email, 
            "role": user.role, 
            "company_id": user.company_id, 
            "user_id": user.id
        }
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # 1. Look up user by email
    user = db.query(Profile).filter(Profile.email == request.email).first()
    
    # 2. Return success anyway (to prevent username enumeration) but actually send email only if user exists
    if not user:
        return {"message": "If the email is registered, a password reset link has been sent."}
        
    # Check if user's company is active before allowing reset
    if user.company_id:
        company = db.query(Company).filter(Company.id == user.company_id).first()
        if company and not company.active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your company account is deactivated. Cannot perform password recovery."
            )
            
    # 3. Generate token
    token = create_password_reset_token(user.email)
    
    # 4. Dispatch email
    sent = send_password_reset_email(user.email, token)
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error sending recovery email. Please try again later."
        )
        
    return {"message": "If the email is registered, a password reset link has been sent."}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    # 1. Verify token
    email = verify_password_reset_token(request.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
        
    # 2. Find user
    user = db.query(Profile).filter(Profile.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    # Check if user's company is active before resetting
    if user.company_id:
        company = db.query(Company).filter(Company.id == user.company_id).first()
        if company and not company.active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your company account is deactivated. Cannot perform password reset."
            )
            
    # 3. Update password hash
    user.password_hash = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password reset successfully. You can now log in with your new password."}
