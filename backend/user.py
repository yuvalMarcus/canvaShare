from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from models import User, Token , Tokens, UpdateUser, UserTuple, Users
from photo import delete_photo
from db.tags import insert_favorite_tags, get_tags_id, get_favorite_tags, delete_favorite_tags
from db.utils import raise_error_if_guest, raise_error_if_blocked
from db.users import (insert_user, get_user_id, get_username_by_email, get_user_email, get_hashed_password,
                      connect_user, disconnect_user, get_user, get_users, get_popular_users, is_user_exist,
                      get_prev_photos, remove_user_photos, delete_user, update_user, insert_user_roles, has_role,
                      get_user_roles)
from auth import (get_jwt_user_id, generate_token, get_password_hash, verify_password, check_guest_or_blocked,
                  ACCESS_TOKEN_EXPIRE_TIME, REFRESH_TOKEN_EXPIRE_TIME)

user_router = APIRouter(prefix="/user")
access_router = APIRouter()
USERNAME_COL_IN_USERS = 1
EMAIL_COL_IN_USERS = 3

@access_router.post('/register')
def register_endpoint(user: User) -> dict:
    is_valid_username(user.username)
    is_valid_email(user.email)
    is_valid_password(user.password)
    user.id = insert_user(username=user.username, hashed_password=get_password_hash(user.password), email=user.email,
                          is_blocked=False, disabled=True)
    insert_favorite_tags(user.id, get_tags_id(user.tags))
    return {"user_id": user.id}

@access_router.post('/login', response_model=Tokens)
def login_endpoint(user: User):
    username_by_email = get_username_by_email(user.username)  # In case an email was entered in the username box
    user.username = username_by_email if username_by_email is not None else user.username
    user.id = get_user_id(user.username)
    if user.id and user.password:
        if verify_password(user.password, hashed_password=get_hashed_password(user.id)):
            connect_user(user.id)
            return {
                "user_id": user.id,
                "token": generate_token(user.id, user.username, ACCESS_TOKEN_EXPIRE_TIME),
                "refresh_token": generate_token(user.id, user.username, REFRESH_TOKEN_EXPIRE_TIME)
            }
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

@access_router.post('/logout')
def logout_endpoint(jwt_user_id: int | None = Depends(get_jwt_user_id)) -> dict:
    raise_error_if_guest(jwt_user_id)
    disconnect_user(jwt_user_id)
    return {}

@access_router.post('/refreshToken', response_model=Tokens)
def refresh_token_endpoint(token: Token):
    jwt_user_id = get_jwt_user_id(token.token) # validate token
    raise_error_if_guest(jwt_user_id)
    raise_error_if_blocked(jwt_user_id)
    username = get_user(jwt_user_id)[USERNAME_COL_IN_USERS]
    return {"user_id": jwt_user_id,
            "token": generate_token(jwt_user_id, username, ACCESS_TOKEN_EXPIRE_TIME),
            "refresh_token": generate_token(jwt_user_id, username, REFRESH_TOKEN_EXPIRE_TIME)
            }

@user_router.get("/{user_id}", response_model=User)
def get_user_endpoint(user_id: int, jwt_user_id: int = Depends(get_jwt_user_id)) -> User:
    raise_error_if_blocked(jwt_user_id)
    return convert_db_user_to_user(get_user(user_id), jwt_user_id)

@user_router.get("", response_model=Users)
def get_users_endpoint(username: Optional[str] = None, order_by: Optional[str]=None, limit: Optional[int]=None,
                       jwt_user_id: int = Depends(get_jwt_user_id)) -> Users:
    raise_error_if_blocked(jwt_user_id)
    if order_by == 'popular':
        users = get_popular_users(limit)
    else:
        users = get_users(jwt_user_id, username)
    return {"results": [convert_db_user_to_user(user, jwt_user_id) for user in users]}

@user_router.post("")
def create_user_endpoint(user: User, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    if has_role('user_management', jwt_user_id):
        user_id = register_endpoint(user)['user_id']
        update_user_endpoint(user_id, user, jwt_user_id)
        return {}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

@user_router.delete('/{user_id}')
def delete_user_endpoint(user_id: int, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    if has_role('user_management', jwt_user_id):
        # Ensure the target user exists
        if not is_user_exist(user_id=user_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        remove_user_photos(user_id) # Remove associated profile and cover photos
        delete_user(user_id)
        return {}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

@user_router.put('/{user_id}')
def update_user_endpoint(user_id: int, user: User
                         , jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    # Ensure the target user exists
    if not is_user_exist(user_id=user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user_id == jwt_user_id or has_role('user_management', jwt_user_id):
        _ = is_valid_username(user.username, user_id) if user.username else None
        _ = is_valid_email(user.email, user_id) if user.email else None
        is_blocked = user.is_blocked if has_role('user_management', jwt_user_id) else None
        roles = user.roles if has_role('roles_management', jwt_user_id) else None
        hashed_password = get_password_hash(user.password) if user.password else None
        if user.profile_photo or user.cover_photo:
            for prev_photo in get_prev_photos(user_id, user.profile_photo, user.cover_photo):
                if prev_photo not in [user.profile_photo, user.cover_photo]:
                    delete_photo(prev_photo)
        update_user(UpdateUser(user_id=user_id, username=user.username, hashed_password=hashed_password,
                          email=user.email, profile_photo=user.profile_photo, cover_photo=user.cover_photo,
                          about=user.about, is_blocked=is_blocked))
        if user.tags is not None:
            delete_favorite_tags(user_id)
            insert_favorite_tags(user_id, get_tags_id(user.tags))
        if roles is not None:
            insert_user_roles(roles, user_id)
        return {}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

def is_valid_username(username: str | None, user_id: int=None) -> None:
    if username is None:
        raise HTTPException(status_code=status.HTTP_400_BAD, detail="Username cannot be empty")
    if user_id and get_user(user_id)[USERNAME_COL_IN_USERS] == username:
        # User trying to update his username to same username
        return
    if is_user_exist(username=username) is True:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User {username} already exists")

def is_valid_email(email: str | None, user_id: int=None) -> None:
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email cannot be empty")
    if user_id and get_user(user_id)[EMAIL_COL_IN_USERS] == email:
        # User trying to update his email to same username
        return
    if get_username_by_email(email) is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email already exists")

def is_valid_password(password: str | None) -> None:
    if password is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password cannot be empty")

def convert_db_user_to_user(db_user: UserTuple, user_id: int) -> User:
    user = {}
    (user["id"], user["username"], _, _, user["is_blocked"], user["profile_photo"], user["cover_photo"],
     user["about"], _) = db_user
    if user["id"] == user_id or has_role('user_view', user_id):
        user["tags"] = get_favorite_tags(user["id"])
        user["email"] = get_user_email(user["id"])
    if has_role('roles_view', user_id) or (user["id"] == user_id):
        user["roles"] = get_user_roles(user["id"])
    return user
