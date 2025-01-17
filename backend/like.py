from typing import Optional
from fastapi import APIRouter, Depends
from models import Like, Likes
from auth import check_guest_or_blocked
from db.paints import get_paint_user_id
from db.utils import raise_error_if_blocked
from db.likes import like_or_unlike_paint, get_likes

router = APIRouter(prefix="/like")
ID_COL_IN_LIKES = 0
PAINT_ID_COL_IN_LIKES = 1
USER_ID_COL_IN_LIKES = 2

@router.post('')
def like_endpoint(like_obj: Like, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    paint_id = like_obj.paint_id
    raise_error_if_blocked(get_paint_user_id(paint_id)) # Cannot like a blocked creator's paint.
    like_or_unlike_paint(paint_id=paint_id, user_id=jwt_user_id, like_flag=True)
    return {}

@router.delete('/{like_id}')
def unlike_endpoint(like_id: int, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    like_or_unlike_paint(like_id=like_id, user_id=jwt_user_id, like_flag=False)
    return {}

@router.get('', response_model=Likes)
def get_likes_endpoint(paint_id: Optional[int] = None, user_id: Optional[int] = None) -> Likes:
    results = []
    for like_obj in get_likes(paint_id, user_id):
        results.append({"id": like_obj[ID_COL_IN_LIKES],
                        "paint_id": like_obj[PAINT_ID_COL_IN_LIKES],
                        "user_id": like_obj[USER_ID_COL_IN_LIKES]})
    return {"results": results}
