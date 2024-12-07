from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from fastapi import APIRouter,Depends
from auth import get_jwt_username,check_guest_or_blocked
from db_utlls import *
from psycopg2 import Error

router = APIRouter(prefix="/tag")

class Tag(BaseModel):
    id: Optional[UUID] = None
    name: str

class TagResponse(BaseModel):
    name: str

@router.get("",response_model=TagResponse)
def get_tags(jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_blocked(jwt_username)
    tags = get_tags()
    return tags

@router.get("/{tag_id}",response_model=TagResponse)
def get_tags(tag_id: int, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_blocked(jwt_username)
    tag = get_tag_by_id(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

@router.post("",status_code=status.HTTP_201_CREATED)
def create_tag(tag_name:str, jwt_username: str | None = Depends(check_guest_or_blocked)):
    try:
        insert_tag(tag_name)
        return {"message": f"tag {tag_name} was created"}
    except Error as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail= f"Database error: {e}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail= f"Error creating tag: {e}")











