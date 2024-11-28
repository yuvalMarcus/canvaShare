from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter

tags_metadata = [

]

router = APIRouter(prefix="/user",tags=["user"])

class User(BaseModel):
    username: str
    password: Optional[str] = None
    email: Optional[str] = None
    tags: Optional[List[str]] = None
    is_blocked: Optional[bool] = False
    is_deleted: Optional[bool] = False
    is_admin: Optional[bool] = False
    is_super_admin: Optional[bool] = False
    profile_photo: Optional[str] = None
    cover_photo: Optional[str] = None
    about: Optional[str] = None

# Routes endpoints to here , prefix is /user so endpoints start from what's after /user .
# for example /user/{user_id} would just be /{user_id}

