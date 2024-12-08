from auth import get_jwt_username, check_guest_or_blocked
from fastapi import APIRouter, Depends
from typing import Optional, List
from pydantic import BaseModel
from db_utlls import *
from uuid import UUID
import time
import json


router = APIRouter(prefix="/canvas")

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

class Canvases(BaseModel):
    canvases: List[Canvas]
    
@router.get("/{canvas_id}", response_model=Canvas)
def get_canvas(canvas_id: UUID, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_blocked(jwt_username)
    canvas_id = str(canvas_id)
    canvas = dict()
    (canvas["id"], canvas["username"], canvas["name"] , canvas["is_public"], canvas["create_date"],
     canvas["edit_date"], canvas["likes"]) = get_canvas_from_db(canvas_id)
    canvas["tags"] = get_canvas_tags(canvas_id)

    is_jwt_admin = is_admin(jwt_username)
    # If the creator of the canvas is blocked, then their canvas is also blocked from viewing.
    raise_error_if_blocked(canvas["username"])

    # If canvas is private (draft), only creator, editors and admins should get it
    if canvas["is_public"] == 0 and is_canvas_editor(canvas_id, jwt_username) is False and is_jwt_admin is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    try:
        with open(f'canvases/{canvas["username"]}/{canvas["id"]}.json', 'r', encoding='utf-8') as fd:
            canvas["data"] = str(json.loads(fd.read()))
    except FileNotFoundError:
        # canvas exist in db but the json file of data not exist.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Json Data of canvas {canvas_id} not found")
    except json.decoder.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JSON Decode Error")
    return canvas

@router.post("", response_model=Canvas, status_code=status.HTTP_201_CREATED)
def create_canvas(canvas: Canvas, jwt_username: str = Depends(check_guest_or_blocked)):
    canvas.id = generate_canvas_id()
    # Saves canvas in json file
    save_json_data(jwt_username, f'canvases/{jwt_username}/{canvas.id}.json', canvas.data)
    insert_canvas_to_db(canvas_id=canvas.id, username=jwt_username, canvas_name=canvas.name,
                        is_public=canvas.is_public, create_date=int(time.time()), edit_date=0, likes=0)
    insert_canvas_tags(canvas, canvas.id)
    return get_canvas(canvas.id, jwt_username)

@router.put("/{canvas_id}", response_model=Canvas)
def update_canvas(canvas_id: UUID, canvas: Canvas, jwt_username: str = Depends(check_guest_or_blocked)):
    raise_error_if_blocked(canvas.username) # Cannot edit a blocked creator's canvas
    canvas_id = str(canvas_id)
    if is_canvas_editor(canvas_id, jwt_username) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    canvas.username = get_canvas_username(canvas_id)
    save_json_data(canvas.username, f'canvases/{canvas.username}/{canvas_id}.json', canvas.data)
    update_canvas_in_db(canvas_id, canvas.name, canvas.is_public)
    remove_all_tags(canvas_id)
    insert_canvas_tags(canvas, canvas_id)
    return get_canvas(canvas_id, jwt_username)

@router.delete("/{canvas_id}")
def delete_canvas(canvas_id: UUID, jwt_username: str = Depends(check_guest_or_blocked)):
    canvas_id = str(canvas_id)
    canvas_username = get_canvas_username(canvas_id)
    # checks if the user is creator of canvas or admin
    if canvas_username != jwt_username and is_admin(jwt_username) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    delete_canvas_from_db(canvas_id)
    json_path = f'canvases/{canvas_username}/{canvas_id}.json'
    delete_photos_of_canvas(json_path)
    try:
        os.remove(json_path)
    except Exception:
        pass
    return {}

@router.get("", response_model=Canvases)
def get_canvases(username: Optional[str] = None, canvas_name: Optional[str] = None, tags: Optional[str] = None,
                 order: Optional[str] = None, page_num: Optional[int] = None,
                 jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_blocked(jwt_username)
    results = []
    order_by = ' ORDER BY likes DESC' if order == 'likes' else ''
    page_num = 1 if page_num is None or page_num < 1 else page_num
    if username:
        results = get_canvases_by_username(username, page_num, order_by)
    elif canvas_name:
        results = get_canvases_by_name(canvas_name, page_num, order_by)
    elif tags:
        for tag in tags.split(','):
            results += get_canvases_by_tag(tag)
        if order == 'likes':
            # sort canvases by likes from high to low
            results.sort(key=lambda x: x[-1], reverse=True)
        results = results[page_num * CANVASES_PER_PAGE - CANVASES_PER_PAGE:page_num * CANVASES_PER_PAGE]
    else:
        results = get_all_canvases(page_num, order_by)
    return {"canvases": convert_results_to_canvases(results)}

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

def convert_results_to_canvases(results):
    canvases = []
    for result in results:
        canvas = dict()
        (canvas['id'], canvas['username'], canvas['name'], canvas['is_public'], canvas['create_date'],
         canvas['edit_date'], canvas['likes']) = result
        canvas['tags'] = get_canvas_tags(canvas['id'])
        try:
            with open(f'canvases/{canvas['username']}/{canvas['id']}.json', 'r', encoding='utf-8') as fd:
                canvas['data'] = str(json.loads(fd.read()))
        except FileNotFoundError:
            print(f'Error: Json Data of canvas {canvas["username"]}/{canvas["id"]} not found')
            canvas['data'] = '{}'
        canvases.append(canvas)
    return canvases

def delete_photos_of_canvas(json_path):
    try:
        with open(json_path, 'r', encoding='utf-8') as fd:
            data = json.loads(fd.read())
            for obj in data['objects']:
                try:
                    os.remove(f'{UPLOAD_DIR}/{obj['src'].split('/')[-1]}')
                except Exception:
                    pass
    except Exception:
        pass