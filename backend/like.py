from fastapi import APIRouter
from classes import Like, Likes
from db_utils import *
from auth import *

router = APIRouter(prefix="/like")

@router.post('', response_model=Like)
def like(like_obj: Like, jwt_user_id: int = Depends(check_guest_or_blocked)) -> Like:
    canvas_id = like_obj.canvas_id
    raise_error_if_blocked(get_canvas_user_id(canvas_id)) # Cannot like a blocked creator's canvas.
    like_or_unlike_canvas(canvas_id, jwt_user_id, like_flag=True)
    return {"canvas_id": canvas_id, "likes": get_num_of_likes(canvas_id)}

@router.delete('', response_model=Like)
def unlike(like_obj: Like, jwt_user_id: int = Depends(check_guest_or_blocked)) -> Like:
    canvas_id = like_obj.canvas_id
    raise_error_if_blocked(get_canvas_user_id(canvas_id)) # Cannot unlike a blocked creator's canvas.
    like_or_unlike_canvas(canvas_id, jwt_user_id, like_flag=False)
    return {"canvas_id": canvas_id, "likes": get_num_of_likes(canvas_id)}

@router.get('', response_model=Likes)
def get_canvases_likes_number(canvas_id: Optional[int] = None) -> Likes:
    if canvas_id:
        get_canvas_from_db(canvas_id)  # checks if canvas exist
        return {"results": [{"canvas_id": canvas_id, "likes": get_num_of_likes(canvas_id)}]}
    else:
        results = []
        for canvas in get_canvases_likes():
            results.append({"canvas_id": canvas[0], "likes": canvas[1]})
        return {"results": results}