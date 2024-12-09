from typing import List
from fastapi import APIRouter
from db_utlls import *
from auth import *
from validation import *

user_prefixed_router = APIRouter(prefix="/user")
router = APIRouter()

class User(BaseModel):
    username: str
    password: Optional[str] = None
    email: Optional[str] = None
    tags: Optional[List[str]] = None
    is_blocked: Optional[bool] = False
    is_admin: Optional[bool] = False
    is_super_admin: Optional[bool] = False
    profile_photo: Optional[str] = None
    cover_photo: Optional[str] = None
    about: Optional[str] = None

# Routes endpoints to here , prefix is /user so endpoints start from what's after /user .
# for example /user/{user_id} would just be /{user_id}


@router.post('/register', status_code=status.HTTP_201_CREATED)
def register(user: User):
    if is_valid_username(user.username) and is_valid_password(user.password) and is_valid_email(user.email):
        tags_id = get_tags_id(user.tags)
        insert_user_to_db(username=user.username.lower(), hashed_password=get_password_hash(user.password),
                          email=user.email, is_blocked=False, profile_photo=None, cover_photo=None,
                          about=None, disabled=True)
        insert_favorite_tags_to_db(user.username, tags_id)
        return {}

@router.post('/login', response_model=Tokens)
def login(user: User):
    username_by_email = get_username_by_email(user.username)  # In case an email was entered in the username box
    user.username = username_by_email if username_by_email is not None else user.username
    if is_user_exist(user.username) and user.password:
        hashed_password = get_hashed_password(user.username)
        if verify_password(user.password, hashed_password=hashed_password):
            connect_user(user.username)
            return {"token": generate_token(user.username, ACCESS_TOKEN_EXPIRE_TIME),
                    "refresh_token": generate_token(user.username, REFRESH_TOKEN_EXPIRE_TIME)}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})

@router.post('/logout', status_code=status.HTTP_204_NO_CONTENT)
def logout(jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    disconnect_user(jwt_username)
    return {}  # should be empty


@router.post('/logout/{username}', status_code=status.HTTP_204_NO_CONTENT)
def logout_username(username: str, jwt_username: str = Depends(check_guest_or_blocked)):
    if is_user_exist(username):
        if is_admin(jwt_username):
            disconnect_user(username)
            return {}  # should be empty
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

@router.post('/refreshToken', response_model=Tokens)
def refresh_token(token: Token):
    jwt_username = get_jwt_username(token.token)
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    return {"token": generate_token(jwt_username, ACCESS_TOKEN_EXPIRE_TIME),
            "refresh_token": generate_token(jwt_username, REFRESH_TOKEN_EXPIRE_TIME)}