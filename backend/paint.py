import json
import os
from pathlib import Path
import time
from typing import Optional, List
from auth import get_jwt_user_id, check_guest_or_blocked
from fastapi import APIRouter, Depends, HTTPException, status
from models import Paints, Paint, PaintQueries
from dotenv import load_dotenv
from db.paints import *
from db.users import get_user, has_role
from db.tags import get_paint_tags, insert_paint_tags, remove_paint_tags
from db.utils import raise_error_if_blocked

load_dotenv()
UPLOAD_DIR = os.getenv("UPLOAD_DIR")
PAINTS_PER_PAGE = 50
router = APIRouter(prefix="/paint")
ID_COL_IN_PAINTS = 0
LIKES_COL_IN_PAINTS = 6
USERNAME_COL_IN_USERS = 1
COVER_COL_IN_USERS = 6

@router.get("/{paint_id}", response_model=Paint)
def get_paint_endpoint(paint_id: int, jwt_user_id: int | None = Depends(get_jwt_user_id)) -> Paint:
    raise_error_if_blocked(jwt_user_id)
    paint = {}
    (paint["id"], paint["user_id"], paint["name"] , paint["is_public"], paint["create_date"],
     paint["edit_date"], paint["likes"],paint["description"], paint["photo"]) = get_paint(paint_id)
    paint["tags"] = get_paint_tags(paint_id)
    paint["username"], _, _, _, paint["profile_photo"] = get_user(paint["user_id"])[USERNAME_COL_IN_USERS:COVER_COL_IN_USERS]
    # If the creator of the paint is blocked, then their paint is also blocked from viewing.
    raise_error_if_blocked(paint["user_id"])

    # If paint is private (draft), only creator and admins should get it
    if (paint["is_public"] == False
            and get_paint_user_id(paint["id"]) != jwt_user_id
            and has_role('paint_view', jwt_user_id) is False):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    try:
        with open(f'paints/{paint["user_id"]}/{paint["id"]}.json', 'r', encoding='utf-8') as fd:
            paint["data"] = json.loads(fd.read())
    except (FileNotFoundError, json.decoder.JSONDecodeError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cannot load json data file") from e
    return paint

@router.post("")
def create_paint_endpoint(paint: Paint, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    if None in [paint.is_public, paint.name, paint.photo, paint.data]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
    paint.user_id = jwt_user_id
    paint.create_date = int(time.time())
    paint.edit_date = 0
    paint.likes = 0
    paint.id = insert_paint(paint)
    save_json_data(paint.user_id, f'paints/{paint.user_id}/{paint.id}.json', paint.data)
    insert_paint_tags(paint, paint.id)
    return {}

@router.put("/{paint_id}")
def update_paint_endpoint(paint_id: int, paint: Paint, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    # need to edit this endpoint to change only the fields that are passed
    if not paint["id"] or get_paint_user_id(paint["id"]) != jwt_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    paint.user_id = get_paint_user_id(paint_id)
    raise_error_if_blocked(paint.user_id)  # Cannot edit a blocked creator's paint
    save_json_data(paint.user_id, f'paints/{paint.user_id}/{paint_id}.json', paint.data)
    update_paint(paint_id, paint.name, paint.is_public,paint.description, paint.photo)
    remove_paint_tags(paint_id)
    insert_paint_tags(paint, paint_id)
    return {}

@router.delete("/{paint_id}")
def delete_paint_endpoint(paint_id: int, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    paint_user_id = get_paint_user_id(paint_id)
    # checks if the user is creator of paint or admin
    if paint_user_id != jwt_user_id and has_role('paint_management', jwt_user_id) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    delete_paint(paint_id)
    json_path = f'paints/{paint_user_id}/{paint_id}.json'
    delete_photos_of_paint(json_path)
    try:
        os.remove(json_path)
    except FileNotFoundError:
        pass
    return {}

@router.get("", response_model=Paints)
def get_paints_endpoint(paint: PaintQueries = Depends(), order: Optional[str] = None, page_num: Optional[int | str] = None,
                 jwt_user_id: int | None = Depends(get_jwt_user_id)) -> Paints:
    raise_error_if_blocked(jwt_user_id)
    tags_results, filters = [], []

    page_num = int(page_num.split('&')[0]) if page_num and page_num.split('&')[0].isnumeric() else None
    page_num = 1 if page_num is None or page_num < 1 else page_num
    if paint.user_id:
        filters.append(('user_id', paint.user_id))
    if paint.paint_name:
        paint_name = paint.paint_name.lower()
        filters.append(('paint_name', paint_name))
    if paint.tags:
        for tag in paint.tags.split(','):
            tags_results += get_paints_by_tag(tag)
        results = list(set(get_paints_by_filters(filters)) & set(tags_results))
    else:
        results = get_paints_by_filters(filters)
    if order == 'likes':
        # sort paints by likes from high to low
        results.sort(key=lambda x: x[LIKES_COL_IN_PAINTS], reverse=True)
    else:
        # sort paints by dates from low to high
        results.sort(key=lambda x: x[ID_COL_IN_PAINTS], reverse=True)

    prev_link = page_num - 1 if page_num > 1 else None
    next_link = page_num + 1 if len(results) > page_num * PAINTS_PER_PAGE else None
    return {"next": next_link,
            "prev": prev_link,
            "results": convert_results_to_paints(
                results[page_num * PAINTS_PER_PAGE - PAINTS_PER_PAGE:page_num * PAINTS_PER_PAGE], jwt_user_id)}

def save_json_data(user_id: int, paint_path: str, data: str) -> None:
    Path(f"paints/{user_id}").mkdir(parents=True, exist_ok=True) # maybe in windows needs to add '/' prefix
    try:
        data = data.replace('\'', '\"')
        with open(paint_path, 'w', encoding='utf-8') as fd:
            json.dump(json.loads(data), fd, ensure_ascii=False, indent=4) # raises error if not json, otherwise saves it
    except json.decoder.JSONDecodeError as e:
        try:
            os.remove(paint_path)
        except FileNotFoundError:
            pass
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JSON Decode Error") from e

def convert_results_to_paints(results: list, jwt_user_id) -> List[Paint]:
    paints = []
    is_admin = has_role('paint_view', jwt_user_id)
    for result in results:
        paint = {}
        (paint['id'], paint['user_id'], paint['name'], paint['is_public'], paint['create_date'],
         paint['edit_date'], paint['likes'], paint['description'], paint['photo']) = result
        paint['tags'] = get_paint_tags(paint['id'])
        paint["username"], _, _, _, paint["profile_photo"] = get_user(paint["user_id"])[USERNAME_COL_IN_USERS:COVER_COL_IN_USERS]

        # Hide private paints from unauthorized users
        if (paint["is_public"] == False
                and get_paint_user_id(paint["id"]) != jwt_user_id
                and is_admin is False):
            continue
        try:
            with open(f"paints/{paint['user_id']}/{paint['id']}.json", 'r', encoding='utf-8') as fd:
                paint['data'] = json.loads(fd.read())
        except FileNotFoundError:
            print(f'Error: Json Data of paint {paint["user_id"]}/{paint["id"]} not found')
            paint['data'] = {}
        paints.append(paint)
    return paints

def delete_photos_of_paint(json_path: str) -> None:
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
