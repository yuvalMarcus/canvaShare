from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta, UTC
from db_utlls import get_disabled_status
from passlib.context import CryptContext
from db_utlls import is_user_exist
from dotenv import load_dotenv
from pydantic import BaseModel
from jose import JWTError, jwt
from typing import Optional
import os

load_dotenv()

ACCESS_TOKEN_EXPIRE_MINUTES = 30
API_KEY = os.getenv('API_KEY')
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = "HS256"

class Token(BaseModel):
    token: Optional[str] = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_jwt_username(token: str | None = Depends(oauth2_scheme)):
    # jwt authentication, checks if user exist and not disabled
    if token is None:
        return None
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                          detail="Could not validate credentials.",
                                          headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        expiration: int = payload.get("exp")

        if username is None or expiration is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    if is_user_exist(username):
        if get_disabled_status(username) == 0:
            return username
    raise credentials_exception

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def generate_token(username: str | None):
    if username is None:
        return ''
    to_encode = {"username": username}
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt