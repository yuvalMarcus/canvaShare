from db_utlls import is_user_exist, get_username_by_email
from fastapi import HTTPException, status
import re

def is_valid_password(password):
    if password is not None and 4 <= len(password) <= 50:
        #and re.search(r'[0-9]', password)
        #and re.search(r'[A-Z]', password) and re.search(r'[a-z]', password)
        #and re.search(r'[!@#$%^&*_+\-=]', password)):
        return True
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid password")

def is_valid_username(username):
    if is_user_exist(username) is True:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User {username} already exists")
    if 3 <= len(username) <= 20 and username.isalnum():
        return True
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username")

def is_valid_email(email):
    if get_username_by_email(email) is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User with this email already exists")
    if email is not None and re.search(r"^\S+@\S+\.\S+$", email):
        return True
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email")