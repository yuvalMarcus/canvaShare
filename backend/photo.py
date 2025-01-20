from typing import Dict
from uuid import uuid4
from pathlib import Path
import shutil
import os
import logging
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import requests
from auth import check_guest_or_blocked
from db.utils import is_safe_remove_photo

router = APIRouter(prefix="/photo")
load_dotenv()
API_KEY = os.getenv('API_KEY')
UPLOAD_DIR = os.getenv('UPLOAD_DIR')
FILE_MAX_SIZE = 10*1024*1024
FILE_MIN_SIZE = 0
TIMEOUT = 30

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get('')
def get_photos_from_api_endpoint(category: str, _: int = Depends(check_guest_or_blocked)) -> Dict[str, list]:
    results = []
    if category:
        for page in range(1, 4):
            try:
                response = requests.get(
                    f'https://api.unsplash.com/search/photos?query={category}&client_id={API_KEY}&page={page}',
                    timeout=TIMEOUT)
                response.raise_for_status()
                results += response.json().get('results', [])
            except (requests.exceptions.ConnectTimeout,
                    requests.exceptions.JSONDecodeError,
                    requests.exceptions.RequestException) as e:
                if not results:
                    logger.error("Error fetching photos from API: %s", e)
                    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                                        detail="Error fetching photos") from e
    return {"results": results}

@router.post('')
def upload_picture_endpoint(file: UploadFile = File(...), _: int = Depends(check_guest_or_blocked)) -> Dict[str, str]:
    file_extension = file.filename.split('.')[-1].lower()
    if not FILE_MIN_SIZE < file.size <= FILE_MAX_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Image size must be between {FILE_MIN_SIZE} and {FILE_MAX_SIZE}MB")
    if isinstance(file.filename, str) and (file_extension not in ["jpg", "jpeg", "png", "webp"] or '/' in file.filename):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid file type. Please upload an image in format jpg, jpeg, webp or png")
    try:
        photo_id = generate_photo_uuid()
        photo_name = f"{photo_id}.{file_extension}"
        with Path(f"{UPLOAD_DIR}/{photo_name}").open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"photo": f"http://{os.getenv('BACK_DOMAIN')}:{os.getenv('BACK_PORT')}/photo/{photo_name}"}
    except (FileNotFoundError, Exception) as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Upload failed") from e

@router.get("/{photo_name}", response_model=UploadFile)
def uploaded_files_endpoint(photo_name: str) -> UploadFile:
    file_path = Path(f'{UPLOAD_DIR}/{photo_name}')
    if not file_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileResponse(file_path)

def delete_photo(photo_link: str) -> None:
    photo_name = f'{photo_link.split("/")[-1]}'
    photo_path = Path(f'{UPLOAD_DIR}/{photo_name}')
    try:
        if is_safe_remove_photo(photo_name):
            photo_path.unlink()
    except FileNotFoundError:
        logger.warning('Could not delete previous photo %s', photo_path)

def generate_photo_uuid() -> str:
    while True:
        photo_id = str(uuid4())
        if not any(photo_id in file.name for file in Path(UPLOAD_DIR).iterdir()):
            break
    return photo_id
