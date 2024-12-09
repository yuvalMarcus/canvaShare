from auth import get_jwt_username,check_guest_or_blocked
from fastapi import APIRouter,Depends
from typing import List, Optional
from pydantic import BaseModel
from db_utlls import *

router = APIRouter(prefix="/tag")

class Tag(BaseModel):
    id: Optional[int] = None
    name: str

class Tags(BaseModel):
    tags: List[Tag]

@router.get("", response_model=Tags)
def get_tags(jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_blocked(jwt_username)
    return {'tags': get_tags_from_db()}

@router.get("/{tag_id}", response_model=Tag)
def get_tag(tag_id: int, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_blocked(jwt_username)
    tag = get_tag_by_id(tag_id)
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    return {'id': tag[0], 'name': tag[1]}

@router.post("", response_model=Tag,status_code=status.HTTP_201_CREATED)
def create_tag(tag: Tag, _: str | None = Depends(check_guest_or_blocked)):
    is_valid_tag(tag.name)
    tag = insert_tag(tag.name)
    return {'id': tag[0], 'name': tag[1]}