from auth import get_jwt_user_id, check_guest_or_blocked
from fastapi import APIRouter, Depends
from classes import Canvases, Canvas
from db_utils import *
import time
import json

router = APIRouter(prefix="/canvas")
    
@router.get("/{canvas_id}", response_model=Canvas)
def get_canvas(canvas_id: int, jwt_user_id: int | None = Depends(get_jwt_user_id)) -> Canvas:
    raise_error_if_blocked(jwt_user_id)
    canvas = dict()
    (canvas["id"], canvas["user_id"], canvas["name"] , canvas["is_public"], canvas["create_date"],
     canvas["edit_date"], canvas["likes"],canvas["description"], canvas["photo"]) = get_canvas_from_db(canvas_id)
    canvas["tags"] = get_canvas_tags(canvas_id)
    canvas["username"], _, _, _, canvas["profile_photo"] = get_user_from_db(canvas["user_id"])[1:6]
    # If the creator of the canvas is blocked, then their canvas is also blocked from viewing.
    raise_error_if_blocked(canvas["user_id"])

    # If canvas is private (draft), only creator, editors and admins should get it
    if canvas["is_public"] == 0 and is_canvas_editor(canvas_id, jwt_user_id) is False and is_admin(jwt_user_id) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    try:
        with open(f'canvases/{canvas["user_id"]}/{canvas["id"]}.json', 'r', encoding='utf-8') as fd:
            canvas["data"] = str(json.loads(fd.read()))
    except FileNotFoundError:
        # canvas exist in db but the json file of data not exist.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Json Data of canvas {canvas_id} not found")
    except json.decoder.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JSON Decode Error")
    return canvas

@router.post("", response_model=Canvas, status_code=status.HTTP_201_CREATED)
def create_canvas(canvas: Canvas, jwt_user_id: int = Depends(check_guest_or_blocked)) -> Canvas:
    if len(canvas.name) >= 255:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Canvas name too long")
    canvas.id = insert_canvas_to_db(user_id=jwt_user_id, canvas_name=canvas.name,
                        is_public=canvas.is_public, create_date=int(time.time()), edit_date=0, likes=0,
                                    description=canvas.description, photo=canvas.photo)
    save_json_data(jwt_user_id, f'canvases/{jwt_user_id}/{canvas.id}.json', canvas.data)
    insert_canvas_tags(canvas, canvas.id)
    return get_canvas(canvas.id, jwt_user_id)

@router.put("/{canvas_id}", response_model=Canvas)
def update_canvas(canvas_id: int, canvas: Canvas, jwt_user_id: int = Depends(check_guest_or_blocked)) -> Canvas:
    raise_error_if_blocked(canvas.user_id) # Cannot edit a blocked creator's canvas
    if is_canvas_editor(canvas_id, jwt_user_id) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    if len(canvas.name) >= 255:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Canvas name too long")
    canvas.user_id = get_canvas_user_id(canvas_id)
    save_json_data(canvas.user_id, f'canvases/{canvas.user_id}/{canvas_id}.json', canvas.data)
    update_canvas_in_db(canvas_id, canvas.name, canvas.is_public,canvas.description, canvas.photo)
    remove_all_tags(canvas_id)
    insert_canvas_tags(canvas, canvas_id)
    return get_canvas(canvas_id, jwt_user_id)

@router.delete("/{canvas_id}")
def delete_canvas(canvas_id: int, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    canvas_user_id = get_canvas_user_id(canvas_id)
    # checks if the user is creator of canvas or admin
    if canvas_user_id != jwt_user_id and is_admin(jwt_user_id) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    delete_canvas_from_db(canvas_id)
    json_path = f'canvases/{canvas_user_id}/{canvas_id}.json'
    delete_photos_of_canvas(json_path)
    try:
        os.remove(json_path)
    except Exception:
        pass
    return {}

@router.get("", response_model=Canvases)
def get_canvases(user_id: Optional[int] = None, canvas_name: Optional[str] = None, tags: Optional[str] = None,
                 order: Optional[str] = None, page_num: Optional[int] = None,
                 jwt_user_id: int | None = Depends(get_jwt_user_id)) -> Canvases:
    raise_error_if_blocked(jwt_user_id)
    tags_results, filters = [], []
    page_num = 1 if page_num is None or page_num < 1 else page_num

    if user_id:
        filters.append(('user_id', user_id))
    if canvas_name:
        filters.append(('canvas_name', canvas_name))

    if tags:
        for tag in tags.split(','):
            tags_results += get_canvases_by_tag(tag)
        results = list(set(get_canvases_by_filters(filters)) & set(tags_results))
    else:
        results = get_canvases_by_filters(filters)

    if order == 'likes':
        # sort canvases by likes from high to low
        results.sort(key=lambda x: x[6], reverse=True)
    else:
        # sort canvases by dates from low to high
        results.sort(key=lambda x: x[0], reverse=True)

    return {"canvases": convert_results_to_canvases(
        results[page_num * CANVASES_PER_PAGE - CANVASES_PER_PAGE:page_num * CANVASES_PER_PAGE])}

def save_json_data(user_id: int, canvas_path: str, data: str) -> None:
    Path(f"canvases/{user_id}").mkdir(parents=True, exist_ok=True) # maybe in windows needs to add '/' prefix
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

def convert_results_to_canvases(results: list) -> List[Canvas]:
    canvases = []
    for result in results:
        canvas = dict()
        (canvas['id'], canvas['user_id'], canvas['name'], canvas['is_public'], canvas['create_date'],
         canvas['edit_date'], canvas['likes'], canvas['description'], canvas['photo']) = result
        canvas['tags'] = get_canvas_tags(canvas['id'])
        canvas["username"], _, _, _, canvas["profile_photo"] = get_user_from_db(canvas["user_id"])[1:6]
        try:
            with open(f'canvases/{canvas['user_id']}/{canvas['id']}.json', 'r', encoding='utf-8') as fd:
                canvas['data'] = str(json.loads(fd.read()))
        except FileNotFoundError:
            print(f'Error: Json Data of canvas {canvas["user_id"]}/{canvas["id"]} not found')
            canvas['data'] = '{}'
        canvases.append(canvas)
    return canvases

def delete_photos_of_canvas(json_path: str) -> None:
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