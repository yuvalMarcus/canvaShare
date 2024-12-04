from validation import is_valid_email, is_valid_username, is_valid_password
from canvas import router as canvas_router
from fastapi.middleware.cors import CORSMiddleware
from user import User, router as user_router
from report import router as report_router
from photo import router as photo_router
from fastapi import FastAPI
from db_utlls import *
from auth import *
import logging
import uvicorn

load_dotenv()
DOMAIN = os.getenv('DOMAIN')
PORT = os.getenv('PORT')
app = FastAPI()
app.include_router(canvas_router)
app.include_router(user_router)
app.include_router(report_router)
app.include_router(photo_router)

origins = [
    f"{DOMAIN}:{PORT}"
]

app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

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
    username_by_email = get_username_by_email(user.username) # In case an email was entered in the username box
    user.username = username_by_email if username_by_email is not None else user.username
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
    
@app.post('/logout/{username}')
def logout_username(username: str, jwt_username: str | None = Depends(check_guest_or_blocked)):
    if is_user_exist(username):
        if is_admin(jwt_username):
            disconnect_user(username)
            return {} # should be empty
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

#delete_tables_and_folders()
create_tables_and_folders()

if __name__ == "__main__":
    logger = logging.getLogger()
    logger.setLevel(logging.ERROR)
    uvicorn.run(app, host="127.0.0.1", port=8000)