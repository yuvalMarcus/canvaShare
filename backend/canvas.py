import json
import os
from pathlib import Path
import time
from typing import Optional, List
from auth import get_jwt_user_id, check_guest_or_blocked
from fastapi import APIRouter, Depends, HTTPException, status
from models import Canvases, Canvas, CanvasQueries
from dotenv import load_dotenv
from db.canvases import *
from db.users import get_user
from db.admin import is_admin
from db.tags import get_canvas_tags, insert_canvas_tags, remove_canvas_tags
from db.utils import raise_error_if_blocked

load_dotenv()
UPLOAD_DIR = os.getenv("UPLOAD_DIR")
CANVASES_PER_PAGE = 50
router = APIRouter(prefix="/canvas")
ID_COL_IN_CANVASES = 0
LIKES_COL_IN_CANVASES = 6
USERNAME_COL_IN_USERS = 1
COVER_COL_IN_USERS = 6

@router.get("/{canvas_id}", response_model=Canvas)
def get_canvas_endpoint(canvas_id: int, jwt_user_id: int | None = Depends(get_jwt_user_id)) -> Canvas:
    raise_error_if_blocked(jwt_user_id)
    canvas = {}
    (canvas["id"], canvas["user_id"], canvas["name"] , canvas["is_public"], canvas["create_date"],
     canvas["edit_date"], canvas["likes"],canvas["description"], canvas["photo"]) = get_canvas(canvas_id)
    canvas["tags"] = get_canvas_tags(canvas_id)
    canvas["username"], _, _, _, canvas["profile_photo"] = get_user(canvas["user_id"])[USERNAME_COL_IN_USERS:COVER_COL_IN_USERS]
    # If the creator of the canvas is blocked, then their canvas is also blocked from viewing.
    raise_error_if_blocked(canvas["user_id"])

    # If canvas is private (draft), only creator, editors and admins should get it
    if canvas["is_public"] == False and is_canvas_editor(canvas_id, jwt_user_id) is False and is_admin(jwt_user_id) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    try:
        with open(f'canvases/{canvas["user_id"]}/{canvas["id"]}.json', 'r', encoding='utf-8') as fd:
            canvas["data"] = json.loads(fd.read())
    except (FileNotFoundError, json.decoder.JSONDecodeError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cannot load json data file") from e
    return canvas

@router.post("")
def create_canvas_endpoint(canvas: Canvas, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    if None in [canvas.is_public, canvas.name, canvas.photo, canvas.data]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
    canvas.user_id = jwt_user_id
    canvas.create_date = int(time.time())
    canvas.edit_date = 0
    canvas.likes = 0
    canvas.id = insert_canvas(canvas)
    save_json_data(canvas.user_id, f'canvases/{canvas.user_id}/{canvas.id}.json', canvas.data)
    insert_canvas_tags(canvas, canvas.id)
    return {}

@router.put("/{canvas_id}")
def update_canvas_endpoint(canvas_id: int, canvas: Canvas, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    # need to edit this endpoint to change only the fields that are passed
    if is_canvas_editor(canvas_id, jwt_user_id) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    canvas.user_id = get_canvas_user_id(canvas_id)
    raise_error_if_blocked(canvas.user_id)  # Cannot edit a blocked creator's canvas
    save_json_data(canvas.user_id, f'canvases/{canvas.user_id}/{canvas_id}.json', canvas.data)
    update_canvas(canvas_id, canvas.name, canvas.is_public,canvas.description, canvas.photo)
    remove_canvas_tags(canvas_id)
    insert_canvas_tags(canvas, canvas_id)
    return {}

@router.delete("/{canvas_id}")
def delete_canvas_endpoint(canvas_id: int, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    canvas_user_id = get_canvas_user_id(canvas_id)
    # checks if the user is creator of canvas or admin
    if canvas_user_id != jwt_user_id and is_admin(jwt_user_id) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    delete_canvas(canvas_id)
    json_path = f'canvases/{canvas_user_id}/{canvas_id}.json'
    delete_photos_of_canvas(json_path)
    try:
        os.remove(json_path)
    except FileNotFoundError:
        pass
    return {}

@router.get("", response_model=Canvases)
def get_canvases_endpoint(canvas: CanvasQueries = Depends(), order: Optional[str] = None, page_num: Optional[int | str] = None,
                 jwt_user_id: int | None = Depends(get_jwt_user_id)) -> Canvases:
    raise_error_if_blocked(jwt_user_id)
    tags_results, filters = [], []
    filters_and_sort = ""
    page_num = int(page_num.split('&')[0]) if page_num and page_num.split('&')[0].isnumeric() else None
    page_num = 1 if page_num is None or page_num < 1 else page_num
    if canvas.user_id:
        filters.append(('user_id', canvas.user_id))
        filters_and_sort += f'&user_id={canvas.user_id}'
    if canvas.canvas_name:
        canvas_name = canvas.canvas_name.lower()
        filters.append(('canvas_name', canvas_name))
        filters_and_sort += f'&canvas_name={canvas_name}'
    if canvas.tags:
        for tag in canvas.tags.split(','):
            tags_results += get_canvases_by_tag(tag)
        filters_and_sort += f'&tags={canvas.tags}'
        results = list(set(get_canvases_by_filters(filters)) & set(tags_results))
    else:
        results = get_canvases_by_filters(filters)
    if order == 'likes':
        # sort canvases by likes from high to low
        results.sort(key=lambda x: x[LIKES_COL_IN_CANVASES], reverse=True)
        filters_and_sort += '&order=likes'
    else:
        # sort canvases by dates from low to high
        results.sort(key=lambda x: x[ID_COL_IN_CANVASES], reverse=True)
        filters_and_sort += '&order=dates'

    prev_link = f"{page_num-1}".replace(' ', '') if page_num > 1 else None
    next_link = f"{page_num+1}".replace(' ', '') if len(results) > page_num * CANVASES_PER_PAGE else None
    return {"next": next_link,
            "prev": prev_link,
            "results": convert_results_to_canvases(
                results[page_num * CANVASES_PER_PAGE - CANVASES_PER_PAGE:page_num * CANVASES_PER_PAGE])}

def save_json_data(user_id: int, canvas_path: str, data: str) -> None:
    Path(f"canvases/{user_id}").mkdir(parents=True, exist_ok=True) # maybe in windows needs to add '/' prefix
    try:
        data = data.replace('\'', '\"')
        with open(canvas_path, 'w', encoding='utf-8') as fd:
            json.dump(json.loads(data), fd, ensure_ascii=False, indent=4) # raises error if not json, otherwise saves it
    except json.decoder.JSONDecodeError as e:
        try:
            os.remove(canvas_path)
        except FileNotFoundError:
            pass
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JSON Decode Error") from e

def convert_results_to_canvases(results: list) -> List[Canvas]:
    canvases = []
    for result in results:
        canvas = {}
        (canvas['id'], canvas['user_id'], canvas['name'], canvas['is_public'], canvas['create_date'],
         canvas['edit_date'], canvas['likes'], canvas['description'], canvas['photo']) = result
        canvas['tags'] = get_canvas_tags(canvas['id'])
        canvas["username"], _, _, _, canvas["profile_photo"] = get_user(canvas["user_id"])[USERNAME_COL_IN_USERS:COVER_COL_IN_USERS]
        try:
            with open(f"canvases/{canvas['user_id']}/{canvas['id']}.json", 'r', encoding='utf-8') as fd:
                canvas['data'] = json.loads(fd.read())
        except FileNotFoundError:
            print(f'Error: Json Data of canvas {canvas["user_id"]}/{canvas["id"]} not found')
            canvas['data'] = {}
        canvases.append(canvas)
    return canvases

def delete_photos_of_canvas(json_path: str) -> None:
    try:
        with open(json_path, 'r', encoding='utf-8') as fd:
            data = json.loads(fd.read())
            for obj in data['objects']:
                try:
                    os.remove(f"{UPLOAD_DIR}/{obj['src'].split('/')[-1]}")
                except (FileNotFoundError, KeyError):
                    pass
    except (FileNotFoundError, KeyError, json.decoder.JSONDecodeError):
        pass
