from auth import Token, API_KEY, get_jwt_username, generate_token, get_password_hash, verify_password
from validation import is_valid_email, is_valid_username, is_valid_password
from fastapi import FastAPI, File , UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from user import User, router as user_router
from canvas import router as canvas_router, CANVASES_PER_PAGE
from fastapi.responses import FileResponse
from typing import Dict, Optional
from pydantic import BaseModel
from pathlib import Path
from db_utlls import *
from uuid import UUID
import logging
import requests
import uvicorn


tags_metadata = [
    {
        "name": "report",
        "description": "Report a canvas or artist."
    },
    {
        "name": "logout_username",
        "description": "This endpoint is for admins to log out users"
    },
    {
        "name": "search_photos_api",
        "description": "Search photos in https://unsplash.com API"
    },
    {
        "name": "get_canvases_by_filters",
        "description": "Get list of canvases by filters.<br>"
                       "The filters can be username, canvas name, tags.<br>"
                       "The results can be sorted by likes.<br>"
                       f"In every request (page) the maximum results is {CANVASES_PER_PAGE}.<br>"
                       "To get the rest of results you need to request specific page."
    },
    {
        "name": "like_canvas",
        "description": "Like a canvas or remove like from canvas."
    }
]

class PhotosSearchResponse(BaseModel):
    api_results: Optional[Dict] = None
    token: Optional[str] = None

class Report(BaseModel):
    type: str  # canvas / artist
    canvas_id: Optional[UUID] = None
    username: Optional[str] = None
    description: str

app = FastAPI(openapi_tags=tags_metadata)
app.include_router(canvas_router)
app.include_router(user_router)

origins = [
    "http://localhost:5173/",
    "http://localhost:8000/",
    "http://localhost/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post('/report', response_model=Token, tags=["report"])
def create_report(report: Report, jwt_username: str | None = Depends(get_jwt_username)):
    if not (1 <= len(report.description) <= 100):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Report description must be between 1 and 100 characters.")
    if report.type == 'artist' and report.username is not None:
        if is_user_exist(report.username) is False:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Username not found.")
        report.canvas_id = None
    elif report.type == 'canvas' and report.canvas_id is not None:
        report.canvas_id = str(report.canvas_id)
        get_canvas_from_db(report.canvas_id) # checks if canvas exist
        report.canvas_id, report.username = report.canvas_id, None
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Report type must be 'artist' or 'canvas' and their fields cannot be empty")
    insert_report_to_db(report.type, report.canvas_id, report.username, report.description)
    return {"token": generate_token(jwt_username) if jwt_username else None}
        
@app.post('/register', response_model=Token)
def register(user: User):
    if is_valid_username(user.username) and is_valid_password(user.password) and is_valid_email(user.email):
        tags_id = get_tags_id(user.tags)
        insert_user_to_db(username=user.username.lower(), hashed_password=get_password_hash(user.password),
                          email=user.email, is_blocked=False, profile_photo=None, cover_photo=None,
                          about=None, disabled=True)
        insert_favorite_tags_to_db(user.username, tags_id)
        connect_user(user.username)
        return {"token": generate_token(user.username)}

@app.post('/login', response_model=Token)
def login(user: User):
    if is_user_exist(user.username) and user.password:
        hashed_password = get_hashed_password(user.username)
        if verify_password(user.password, hashed_password=hashed_password):
            connect_user(user.username)
            return {"token": generate_token(user.username)}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})

@app.post('/logout')
def logout(jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    disconnect_user(jwt_username)
    return {} # should be empty
    
@app.post('/logout/{username}', tags=["logout_username"])
def logout_username(username: str, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    if is_user_exist(username):
        if is_admin(jwt_username):
            disconnect_user(username)
            return {} # should be empty
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
@app.get('/search_photos', response_model=PhotosSearchResponse, tags=["search_photos_api"])
def search_photos(category: str, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    if category:
        try:
            api_results = requests.get(f'https://api.unsplash.com/search/photos?query={category}&client_id={API_KEY}').json()
            return {"api_results": api_results, "token": generate_token(jwt_username) if jwt_username else None}
        except Exception:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                                detail=f"Rate Limit Exceeded (50 per hour). Try again later.")
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
@app.post("/upload")
def upload_picture(file: UploadFile = File(...)):
    if file.size == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
    if type(file.filename) is str and not file.filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid file type. Please upload an image in format jpg, jpeg, webp or png.")
    if file.size > 10*1024*1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image too large. Maximum size is 10MB.")
    try:
        file_id = uuid4()
        Path(UPLOAD_DIR).mkdir(exist_ok=True, parents=True)
        file_extension = file.filename.split('.')[-1]
        file_path = f"{UPLOAD_DIR}/{file_id}.{file_extension.lower()}"
        with Path(file_path).open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"file_path": file_path}
    except Exception:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)

@app.get("/uploaded_files/{file_id}")
def uploaded_files(file_id: str):
    file_path = Path(f'{UPLOAD_DIR}/{file_id}')
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"File not found.")
    return FileResponse(file_path)

delete_tables_and_folders()
create_tables()

if __name__ == "__main__":
    logger = logging.getLogger()
    logger.setLevel(logging.ERROR)
    uvicorn.run(app, host="127.0.0.1", port=8000)