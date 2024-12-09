from db_utlls import is_user_exist, raise_error_if_guest, raise_error_if_blocked
from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta, UTC
from db_utlls import get_disabled_status
from passlib.context import CryptContext
from jose.constants import ALGORITHMS
from dotenv import load_dotenv
from pydantic import BaseModel
from jose import JWTError, jwt
from typing import Optional
import os

load_dotenv()

ACCESS_TOKEN_EXPIRE_TIME = 24*60 # Day
REFRESH_TOKEN_EXPIRE_TIME = 7*24*60 # Week
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

class Token(BaseModel):
    token: str

class Tokens(BaseModel):
    token: Optional[str] = None
    refresh_token: Optional[str] = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_jwt_username(token: str | None = Depends(oauth2_scheme)):
    # jwt authentication, checks if user exist and not disabled
    if token is None:
        return None
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                          detail="Could not validate credentials",
                                          headers={"WWW-Authenticate": "Bearer"})
    try:
        # Specifying algorithm name to avoid security vulnerability CVE-2024-33663
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=ALGORITHMS.HS256)
        username: str = payload.get("username")
        expiration: int = payload.get("exp")

        if username is None or expiration is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    # checks if the user exist and connected
    if is_user_exist(username) and get_disabled_status(username) == 0:
        return username
    raise credentials_exception

def check_guest_or_blocked(jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    return jwt_username

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def generate_token(username: str | None, expire_time):
    if username is None:
        return ''
    to_encode = {"username": username}
    expire = datetime.now(UTC) + timedelta(minutes=expire_time)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHMS.HS256)
    return encoded_jwt