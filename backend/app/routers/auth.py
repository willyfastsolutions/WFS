from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import re
from app.core.database import get_db
from app.models.models import Profile, Company
from app.schemas.schemas import LoginRequest, Token, ForgotPasswordRequest, ResetPasswordRequest, AuthActionRequest
from app.services.auth import (
    verify_password,
    create_access_token,
    decode_access_token,
    create_password_reset_token,
    verify_password_reset_token,
    get_password_hash
)
from app.services.email_worker import send_password_reset_email
from app.services.rate_limiter import login_limiter
from app.services.audit import log_audit_action

def validate_password_strength(password: str):
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )
    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter."
        )
    if not re.search(r"[0-9]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number."
        )
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one special character."
        )

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
def login(request: LoginRequest, fastapi_request: Request, db: Session = Depends(get_db)):
    ip = fastapi_request.client.host if fastapi_request.client else "unknown"
    if login_limiter.is_rate_limited(ip):
        log_audit_action(db, action="LOGIN_RATE_LIMITED", email=request.email, details={"ip": ip})
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again in 1 minute."
        )

    user = db.query(Profile).filter(Profile.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        log_audit_action(db, action="LOGIN_FAILED", email=request.email, details={"ip": ip})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Check if user's company is active
    if user.company_id:
        company = db.query(Company).filter(Company.id == user.company_id).first()
        if company and not company.active:
            log_audit_action(db, action="LOGIN_FAILED_COMPANY_DEACTIVATED", user_id=user.id, email=user.email, details={"ip": ip, "company_id": user.company_id})
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
    log_audit_action(db, action="LOGIN_SUCCESS", user_id=user.id, email=user.email, details={"ip": ip})
    return {"access_token": access_token, "token_type": "bearer", "must_change_password": user.must_change_password}

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
    token = create_password_reset_token(user.email, user.password_hash)
    
    # 4. Dispatch email
    sent = send_password_reset_email(user.email, token)
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error sending recovery email. Please try again later."
        )
        
    log_audit_action(db, action="PASSWORD_RESET_REQUESTED", user_id=user.id, email=user.email)
    return {"message": "If the email is registered, a password reset link has been sent."}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    # 1. Verify token
    email = verify_password_reset_token(request.token, db)
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
            
    # Validate password complexity
    validate_password_strength(request.new_password)
            
    # 3. Update password hash
    user.password_hash = get_password_hash(request.new_password)
    db.commit()
    
    log_audit_action(db, action="PASSWORD_RESET_SUCCESS", user_id=user.id, email=user.email)
    return {"message": "Password reset successfully. You can now log in with your new password."}

@router.post("/force-change-password")
def force_change_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Endpoint for users who must change their temporary password on first login."""
    # Decode the token to get the user
    payload = decode_access_token(request.token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token."
        )
    
    email = payload.get("email")
    user = db.query(Profile).filter(Profile.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    # Validate password complexity
    validate_password_strength(request.new_password)
    
    user.password_hash = get_password_hash(request.new_password)
    user.must_change_password = False
    db.commit()
    
    # Generate a fresh token so the user can proceed
    access_token = create_access_token(
        data={
            "email": user.email,
            "role": user.role,
            "company_id": user.company_id,
            "user_id": user.id
        }
    )
    log_audit_action(db, action="FORCE_PASSWORD_CHANGE_SUCCESS", user_id=user.id, email=user.email)
    return {"access_token": access_token, "token_type": "bearer", "must_change_password": False, "message": "Password updated successfully."}


@router.post("/verify-password")
def verify_user_password(
    request: AuthActionRequest,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Securely verifies the current user's password before critical actions (e.g. deletion)."""
    if not verify_password(request.password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password confirmation."
        )
    return {"valid": True}

