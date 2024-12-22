from db_utils import is_user_exist, get_username_by_email
from fastapi import HTTPException, status
from classes import Canvas
import re

def is_valid_password(password: str) -> bool:
    if 4 <= len(password) <= 50:
        #and re.search(r'[0-9]', password)
        #and re.search(r'[A-Z]', password) and re.search(r'[a-z]', password)
        #and re.search(r'[!@#$%^&*_+\-=]', password)):
        return True
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid password")

def is_valid_username(username: str) -> bool:
    if is_user_exist(username=username) is True:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User {username} already exists")
    if 3 <= len(username) <= 20 and username.isalnum():
        return True
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username")

def is_valid_email(email: str) -> bool:
    if not (6 <= len(email) < 255):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email must be between 6 and 255 characters")
    if get_username_by_email(email) is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User with this email already exists")
    if re.search(r"^\S+@\S+\.\S+$", email):
        return True
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email")

def validate_tag(tag: str) -> None:
    if ',' in tag or not (0 < len(tag) < 255):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Tag name must be between 0 and 255 characters and not contain commas")

def validate_canvas(canvas: Canvas) -> None:
    for param_value, param_name in [(canvas.name, 'Canvas name'),(canvas.description, 'Canvas description'),
                                    (canvas.photo, 'Canvas photo')]:
        if param_value and len(param_value) >= 255:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{param_name} too long")
    for tag in canvas.tags:
        validate_tag(tag)
