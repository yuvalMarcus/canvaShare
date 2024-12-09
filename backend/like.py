from fastapi import APIRouter
from db_utlls import *
from auth import *
from uuid import UUID
from typing import List

router = APIRouter(prefix="/like")

class Like(BaseModel):
    canvas_id: UUID
    likes: Optional[int] = None

class Likes(BaseModel):
    results: List[Like]

@router.post('', response_model=Like)
def like(like_obj: Like, jwt_username: str = Depends(check_guest_or_blocked)):
    canvas_id = str(like_obj.canvas_id)
    raise_error_if_blocked(get_canvas_username(canvas_id)) # Cannot like a blocked creator's canvas.
    like_or_unlike_canvas(canvas_id, jwt_username, like=True)
    return {"canvas_id": canvas_id, "likes": get_num_of_likes(canvas_id)}

@router.delete('', response_model=Like)
def unlike(like_obj: Like, jwt_username: str = Depends(check_guest_or_blocked)):
    canvas_id = str(like_obj.canvas_id)
    raise_error_if_blocked(get_canvas_username(canvas_id)) # Cannot unlike a blocked creator's canvas.
    like_or_unlike_canvas(canvas_id, jwt_username, like=False)
    return {"canvas_id": canvas_id, "likes": get_num_of_likes(canvas_id)}

@router.get('', response_model=Likes)
def get_canvases_likes_number(canvas_id: Optional[UUID] = None):
    if canvas_id:
        canvas_id = str(canvas_id)
        get_canvas_from_db(canvas_id)  # checks if canvas exist
        return {"results": [{"canvas_id": canvas_id, "likes": get_num_of_likes(canvas_id)}]}
    else:
        results = []
        for canvas in get_canvases_likes():
            results.append({"canvas_id": canvas[0], "likes": canvas[1]})
        return {"results": results}

