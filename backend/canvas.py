from auth import get_jwt_username, generate_token, Token
from fastapi import APIRouter, Depends
from typing import Optional, List
from pydantic import BaseModel
from pathlib import Path
from db_utlls import *
from uuid import UUID
import random
import time
import json

tags_metadata = [
    {
        "name": "get_canvases_by_filters",
        "description": "Get list of canvases by filters.<br>"
                       "The filters can be username, canvas name, tags.<br>"
                       "The results can be sorted by likes.<br>"
                       "In every request (page) the maximum results is 50.<br>"
                       "To get the rest of results you need to request specific page."
    },
    {
        "name": "like_canvas",
        "description": "Like a canvas or remove like from canvas."
    }
]

router = APIRouter(prefix="/canvas",tags=["canvas"])


class Canvas(BaseModel):
    id: Optional[UUID] = None
    username: Optional[str] = None
    name: str
    tags: Optional[List[str]] = None
    is_public: bool = False
    create_date: Optional[int] = None
    edit_date: Optional[int] = None
    data: str
    likes: Optional[int] = None

class CanvasesResponse(BaseModel):
    canvases: List[Canvas]
    token: Optional[str] = None
    
class LikesResponse(BaseModel):
    likes: int
    token: Optional[str] = None
    
    
@router.get("/{canvas_id}", response_model=CanvasesResponse)
def get_canvas(canvas_id: UUID, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_blocked(jwt_username)
    canvas_id = str(canvas_id)
    canvas = dict()
    (canvas["id"], canvas["username"], canvas["name"] , canvas["is_public"], canvas["create_date"],
     canvas["edit_date"], canvas["likes"]) = get_canvas_from_db(canvas_id)
    canvas["tags"] = get_tags(canvas_id)

    is_jwt_admin = is_admin(jwt_username)
    if is_jwt_admin is False:
        # If the creator of the canvas is blocked, then their canvas is also blocked from viewing.
        # Only administrators can see blocked canvases.
        raise_error_if_blocked(canvas["username"])

    # If canvas is private (draft), only creator, editors and admins should get it
    if canvas["is_public"] == 0 and is_canvas_editor(canvas_id, jwt_username) is False and is_jwt_admin is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    try:
        with open(f'canvases/{canvas["username"]}/{canvas["id"]}.json', 'r', encoding='utf-8') as fd:
            canvas["data"] = str(json.loads(fd.read()))
    except FileNotFoundError:
        # canvas exist in db but the json file of data not exist.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found")
    except json.decoder.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JSON Decode Error")
    
    return {"canvases": [canvas], "token": generate_token(jwt_username) if jwt_username else None}

@router.post("/", response_model=Token)
def create_canvas(canvas: Canvas, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)

    canvas.id = generate_canvas_id()
    # Saves canvas in json file
    save_json_data(jwt_username, f'canvases/{jwt_username}/{canvas.id}.json', canvas.data)
    insert_canvas_to_db(canvas_id=canvas.id, username=jwt_username, canvas_name=canvas.name,
                        is_public=canvas.is_public, create_date=int(time.time()), edit_date=0, likes=0)
    insert_tags(canvas, canvas.id)
    return {"token": generate_token(jwt_username) if jwt_username else None}

@router.put("/{canvas_id}", response_model=Token)
def update_canvas(canvas_id: UUID, canvas: Canvas, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    raise_error_if_blocked(canvas.username) # Cannot edit a blocked creator's canvas
    canvas_id = str(canvas_id)
    if is_canvas_editor(canvas_id, jwt_username) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    canvas.username = get_canvas_username(canvas_id)
    save_json_data(canvas.username, f'canvases/{canvas.username}/{canvas_id}.json', canvas.data)
    update_canvas_in_db(canvas_id, canvas.name, canvas.is_public)
    remove_all_tags(canvas_id)
    insert_tags(canvas, canvas_id)
    return {"token": generate_token(jwt_username) if jwt_username else None}

@router.delete("/{canvas_id}", response_model=Token)
def delete_canvas(canvas_id: UUID, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    canvas_id = str(canvas_id)
    canvas_username = get_canvas_username(canvas_id)
    # checks if the user is creator of canvas or admin
    if canvas_username != jwt_username and is_admin(jwt_username) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    delete_canvas_from_db(canvas_id)
    try:
        os.remove(f'canvases/{canvas_username}/{canvas_id}.json')
    except Exception:
        pass
    return {"token": generate_token(jwt_username) if jwt_username else None}

@router.get("/", response_model=CanvasesResponse, tags=["get_canvases_by_filters"])
def get_canvases(username: Optional[str] = None, canvas_name: Optional[str] = None,
                 tags: Optional[str] = None, order: Optional[str] = None, page_num: Optional[int] = None,
                 jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_blocked(jwt_username)
    if jwt_username is None:
        jwt_username = 'guest' # debug
    all_results = set()
    if page_num is None or page_num < 1 or os.path.isfile(f'canvases/{jwt_username}/explore.json') is False:
        page_num = 1

    if page_num == 1:
        if username is not None:
            # request from artist page
            all_results = all_results.union(set(get_canvases_by_username(username)))
        if canvas_name is not None:
            # request from search page
            all_results = all_results.union(set(get_canvases_by_name(canvas_name)))
        if tags is not None:
            # request from explore page
            for tag in tags.split(','):
                all_results = all_results.union(set(get_canvases_by_tag(tag)))
        if len(all_results) == 0:
            all_results = all_results.union(set(get_all_canvases()))
        all_results = list(all_results)
        if order == 'likes':
            # sort canvases by likes from high to low
            all_results.sort(key=lambda x: x[-1], reverse=True)
        else:
            random.shuffle(all_results)
        explore_json = save_explore_json(all_results, jwt_username)
    else:
        explore_json = json.loads(open(f'canvases/{jwt_username}/explore.json', 'r').read())
    return {"canvases": explore_json[page_num*50-50:page_num*50],
            "token": generate_token(jwt_username) if jwt_username else None}

@router.put('/like/{canvas_id}', response_model=LikesResponse, tags=["like_canvas"])
def like_canvas(canvas_id: UUID, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    canvas_id = str(canvas_id)
    try:
        raise_error_if_blocked(get_canvas_username(canvas_id)) # Cannot like a blocked creator's canvas.
    except Exception as e:
        raise e
    like_or_unlike_canvas(canvas_id, jwt_username)
    return {"likes": get_num_of_likes(canvas_id), "token": generate_token(jwt_username) if jwt_username else None}

@router.get('/likes_number/{canvas_id}')
def get_canvas_likes_number(canvas_id: UUID):
    canvas_id = str(canvas_id)
    get_canvas_from_db(canvas_id)  # checks if canvas exist
    return {"likes": get_num_of_likes(canvas_id)}

def save_json_data(username, canvas_path, data):
    Path(f"canvases/{username}").mkdir(parents=True, exist_ok=True) # maybe in windows needs to add '/' prefix
    try:
        data = data.replace('\'', '\"')
        with open(canvas_path, 'w', encoding='utf-8') as fd:
            json.dump(json.loads(data), fd, ensure_ascii=False, indent=4) # raises error if not json, otherwise saves it
    except json.decoder.JSONDecodeError:
        try:
            os.remove(canvas_path)
        except Exception:
            pass
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JSON Decode Error")

def save_explore_json(all_results, username):
    canvases = []
    Path(f"canvases/{username}").mkdir(parents=True, exist_ok=True)  # maybe in windows needs to add '/' prefix
    for result in all_results:
        canvas = dict()
        (canvas['id'], canvas['username'], canvas['name'], canvas['is_public'], canvas['create_date'],
         canvas['edit_date'], canvas['likes']) = result
        canvas['tags'] = get_tags(canvas['id'])
        with open(f'canvases/{canvas['username']}/{canvas['id']}.json', 'r', encoding='utf-8') as fd:
            canvas['data'] = str(json.loads(fd.read()))
        canvases.append(canvas)
    # save the list of canvases as json file
    with open(f'canvases/{username}/explore.json', 'w', encoding='utf-8') as fd:
        json.dump(canvases, fd, ensure_ascii=False, indent=4)
    return canvases
