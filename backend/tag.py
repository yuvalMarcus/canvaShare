from auth import get_jwt_user_id,check_guest_or_blocked
from fastapi import APIRouter, Depends, HTTPException, status
from models import Tags, Tag
from db.tags import get_tags, get_tag_by_id, insert_tag, delete_tag
from db.admin import is_admin
from db.utils import raise_error_if_blocked

router = APIRouter(prefix="/tag")

@router.get("", response_model=Tags)
def get_tags_endpoint(jwt_user_id: int | None = Depends(get_jwt_user_id)) -> Tags:
    raise_error_if_blocked(jwt_user_id)
    return {'tags': get_tags()}

@router.get("/{tag_id}", response_model=Tag)
def get_tag_endpoint(tag_id: int, jwt_user_id: int | None = Depends(get_jwt_user_id)) -> Tag:
    raise_error_if_blocked(jwt_user_id)
    tag = get_tag_by_id(tag_id)
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    return {'id': tag[0], 'name': tag[1]}

@router.post("")
def create_tag_endpoint(tag: Tag, _: int = Depends(check_guest_or_blocked)) -> dict:
    insert_tag(tag.name)
    return {}

@router.delete('/{tag_id}')
def delete_tag_endpoint(tag_id: int, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    if is_admin(jwt_user_id):
        delete_tag(tag_id)
        return {}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
