from typing import Dict, Literal
from uuid import uuid4
from pathlib import Path
import shutil
import os
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import requests
from auth import check_guest_or_blocked
from db.users import update_user_photo

router = APIRouter(prefix="/photo")
load_dotenv()
API_KEY = os.getenv('API_KEY')
UPLOAD_DIR = os.getenv('UPLOAD_DIR')

@router.get('')
def get_photos_from_api_endpoint(category: str, _: int = Depends(check_guest_or_blocked)) -> Dict[str, list]:
    results = []
    if category:
        for page in range(1, 4):
            try:
                results += requests.get(f'https://api.unsplash.com/search/photos?query={category}'
                                        f'&client_id={API_KEY}&page={page}', timeout=30).json()['results']
            except requests.exceptions.ConnectTimeout as e:
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Connection timed out") from e
            except requests.exceptions.JSONDecodeError as e:
                if page == 1:
                    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                                        detail="Rate Limit Exceeded (50 per hour), Try again later") from e
    return {"results": results}

@router.post('')
def upload_picture_endpoint(save_to: Literal['profile_photo', 'cover_photo', 'canvas'],
                   file: UploadFile = File(...), jwt_user_id: int = Depends(check_guest_or_blocked)) -> Dict[str, str]:
    file_extension = file.filename.split('.')[-1].lower()
    if not 0 < file.size <= 10*1024*1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image size must be between 0 and 10MB")
    if isinstance(file.filename, str) and (file_extension not in ["jpg", "jpeg", "png", "webp"] or '/' in file.filename):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid file type. Please upload an image in format jpg, jpeg, webp or png")
    try:
        photo_id = generate_photo_uuid()
        photo_name = f"{photo_id}.{file_extension}"
        with Path(f"{UPLOAD_DIR}/{photo_name}").open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        if save_to in ['profile_photo', 'cover_photo']:
            prev_photo = update_user_photo(photo_name, jwt_user_id, save_to)
            if prev_photo:
                try:
                    os.remove(prev_photo)
                except FileNotFoundError:
                    print(f'Could not delete previous photo {prev_photo}')
        return {"photo": f'http://{os.getenv('BACK_DOMAIN')}:{os.getenv('BACK_PORT')}/photo/{photo_name}'}
    except (FileNotFoundError, Exception) as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Upload failed") from e

@router.get("/{photo_name}", response_model=UploadFile)
def uploaded_files_endpoint(photo_name: str) -> UploadFile:
    file_path = Path(f'{UPLOAD_DIR}/{photo_name}')
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileResponse(file_path)

def generate_photo_uuid() -> str:
    while True:
        exist = False
        photo_id = str(uuid4())
        for file in Path(UPLOAD_DIR).iterdir():
            if photo_id in file.name:
                exist = True
                break
        if not exist:
            break
    return photo_id
