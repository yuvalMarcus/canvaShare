from fastapi import APIRouter
from classes import Like, Likes
from db_utils import *
from auth import *

router = APIRouter(prefix="/like")

@router.post('')
def like(like_obj: Like, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    canvas_id = like_obj.canvas_id
    raise_error_if_blocked(get_canvas_user_id(canvas_id)) # Cannot like a blocked creator's canvas.
    like_or_unlike_canvas(canvas_id=canvas_id, user_id=jwt_user_id, like_flag=True)
    return {}

@router.delete('/{like_id}')
def unlike(like_id: int, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    like_or_unlike_canvas(like_id=like_id, user_id=jwt_user_id, like_flag=False)
    return {}

@router.get('', response_model=Likes)
def get_canvases_likes_number(canvas_id: Optional[int] = None, user_id: Optional[int] = None) -> Likes:
    results = []
    for like_obj in get_canvases_likes(canvas_id, user_id):
        results.append({"id": like_obj[0], "canvas_id": like_obj[1], "user_id": like_obj[2]})
    return {"results": results}