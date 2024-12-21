
from auth import get_jwt_user_id,check_guest_or_blocked
from fastapi import APIRouter,Depends

from canvas import get_canvas
from classes import Tags, Tag
from db_utils import *

router = APIRouter(prefix="/tag")

@router.get("", response_model=Tags)
def get_tags(jwt_user_id: int | None = Depends(get_jwt_user_id)) -> Tags:
    raise_error_if_blocked(jwt_user_id)
    return {'tags': get_tags_from_db()}

@router.get("/{tag_id}", response_model=Tag)
def get_tag(tag_id: int, jwt_user_id: int | None = Depends(get_jwt_user_id)) -> Tag:
    raise_error_if_blocked(jwt_user_id)
    tag = get_tag_by_id(tag_id)
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    return {'id': tag[0], 'name': tag[1]}

@router.post("", response_model=Tag)
def create_tag(tag: Tag, _: int = Depends(check_guest_or_blocked)) -> Tag:
    raise_error_if_invalid_tag(tag.name)
    tag.id, tag.name = insert_tag(tag.name)
    return tag

@router.delete('/{tad_id}', response_model=None)
def delete_tag(tag_id: int, jwt_user_id: int = Depends(check_guest_or_blocked)) -> None:
    if not (is_admin(jwt_user_id)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User in not permitted to delete tag")
    delete_tag(tag_id)