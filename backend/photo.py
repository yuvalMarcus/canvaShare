from fastapi import APIRouter, File, UploadFile, Depends
from fastapi.responses import FileResponse
from auth import check_guest_or_blocked
from typing import Dict
from uuid import uuid4
from db_utils import *
import requests

router = APIRouter(prefix="/photo")
load_dotenv()
API_KEY = os.getenv('API_KEY')


@router.get('')
def get_photos_from_api(category: str, _: int = Depends(check_guest_or_blocked)) -> Dict[str, list]:
    results = []
    if category:
        for page in range(1, 4):
            try:
                results += requests.get(f'https://api.unsplash.com/search/photos?query={category}'
                                        f'&client_id={API_KEY}&page={page}').json()['results']
            except Exception:
                if page == 1:
                    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                                        detail=f"Rate Limit Exceeded (50 per hour), Try again later")
    return {"results": results}

@router.post('')
def upload_picture(save_to: Literal['profile_photo', 'cover_photo', 'canvas'],
                   file: UploadFile = File(...), jwt_user_id: int = Depends(check_guest_or_blocked)) -> Dict[str, str]:
    file_extension = file.filename.split('.')[-1].lower()
    if not (0 < file.size <= 10*1024*1024):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image size must be between 0 and 10MB")
    if type(file.filename) is str and file_extension not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid file type. Please upload an image in format jpg, jpeg, webp or png")
    try:
        photo_id = generate_photo_uuid()
        photo_name = f"{photo_id}.{file_extension}"
        with Path(f"{UPLOAD_DIR}/{photo_name}").open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        if save_to in ['profile_photo', 'cover_photo']:
            prev_photo = update_photo(photo_name, jwt_user_id, save_to)
            if prev_photo:
                try:
                    os.remove(prev_photo)
                except Exception:
                    print(f'Could not delete previous photo {prev_photo}')
        return {"photo": photo_name}
    except Exception:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Upload failed")

@router.get("/{photo_name}", response_model=UploadFile)
def uploaded_files(photo_name: str) -> UploadFile:
    file_path = Path(f'{UPLOAD_DIR}/{photo_name}')
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"File not found")
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