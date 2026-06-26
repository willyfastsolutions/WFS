import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

from sqlalchemy.orm import Session

def create_password_reset_token(email: str, password_hash: str) -> str:
    # Include the last 10 characters of the current password hash in the payload.
    # If the user resets their password, the hash changes and this token becomes invalid.
    return create_access_token(
        data={"sub": email, "action": "password_reset", "pwh": password_hash[-10:]},
        expires_delta=timedelta(minutes=15)
    )

def verify_password_reset_token(token: str, db: Session) -> Optional[str]:
    payload = decode_access_token(token)
    if payload and payload.get("action") == "password_reset":
        email = payload.get("sub")
        pwh_in_token = payload.get("pwh")
        if not email or not pwh_in_token:
            return None
        
        # Look up the user in the database to check their current password hash
        from app.models.models import Profile
        user = db.query(Profile).filter(Profile.email == email).first()
        if user and user.password_hash[-10:] == pwh_in_token:
            return email
    return None
