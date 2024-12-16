from fastapi import APIRouter
from classes import User, Tokens, Token
from db_utlls import *
from auth import *
from validation import *

user_prefixed_router = APIRouter(prefix="/user")
router = APIRouter()

# Routes endpoints to here , prefix is /user so endpoints start from what's after /user .
# for example /user/{user_id} would just be /{user_id}

@router.get("/{user_id}", response_model=User)
def get_user(user_id: int) -> User:
    # Ensure the target user exists
    if not is_user_exist(user_id=user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user = dict()
    (user["id"], user["username"], user["is_blocked"], user["is_admin"], user ["profile_photo"], user["cover_photo"], user["about"]) = get_user_from_db(user_id)
    return user

@router.get("/{user_name}", response_model=List[str])
def get_user(user_name: Optional(str) = None) -> List[User]:
    return search_user_by_name(user_name=user_name)

@router.post('/register')
def register(user: User) -> dict:
    if is_valid_username(user.username) and is_valid_password(user.password) and is_valid_email(user.email):
        tags_id = get_tags_id(user.tags)
        user.id = insert_user_to_db(username=user.username.lower(), hashed_password=get_password_hash(user.password),
                          email=user.email, is_blocked=False, disabled=True)
        insert_favorite_tags_to_db(user.id, tags_id)
        return {}

@router.post('/login', response_model=Tokens)
def login(user: User) -> Tokens:
    username_by_email = get_username_by_email(user.username)  # In case an email was entered in the username box
    user.username = username_by_email if username_by_email is not None else user.username
    user.id = get_user_id(user.username)
    if user.id and user.password:
        if verify_password(user.password, hashed_password=get_hashed_password(user.id)):
            connect_user(user.id)
            return {"token": generate_token(user.id, user.username, ACCESS_TOKEN_EXPIRE_TIME),
                    "refresh_token": generate_token(user.id, user.username, REFRESH_TOKEN_EXPIRE_TIME)}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

@router.post('/logout')
def logout(jwt_user_id: int | None = Depends(get_jwt_user_id)) -> dict:
    raise_error_if_guest(jwt_user_id)
    disconnect_user(jwt_user_id)
    return {}

@router.post('/refreshToken', response_model=Tokens)
def refresh_token(token: Token) -> Tokens:
    jwt_user_id = get_jwt_user_id(token.token) # validate token
    raise_error_if_guest(jwt_user_id)
    raise_error_if_blocked(jwt_user_id)
    username = get_username_by_id(jwt_user_id)
    return {"token": generate_token(jwt_user_id, username, ACCESS_TOKEN_EXPIRE_TIME),
            "refresh_token": generate_token(jwt_user_id, username, REFRESH_TOKEN_EXPIRE_TIME)}

##### Only admins can delete users #####
#####  Super admin can delete admins, and regular admins cannot delete each other ####
@router.delete('/artist/{user_id}')
def delete_user(user_id: int, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    if not is_admin(jwt_user_id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    # Ensure the target user exists
    if not is_user_exist(user_id=user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Prevent regular admins from deleting other admins
    if is_admin(user_id) and not is_super_admin(jwt_user_id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admins cannot delete each other")

    remove_photos(user_id) # Remove associated profile and cover photos
    delete_user_from_db(user_id)
    print(f"User with user_id {user_id} deleted successfully.")
    return {}

@router.put('/artist/{user_id}')
def update_user_status(user: User, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    # Ensure the target user exists
    if not is_user_exist(user_id=user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Only admin can update user status
    if is_admin(jwt_user_id) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    # Handle admin status updates
    if user.is_admin is not None:
        if is_super_admin(jwt_user_id) is True and is_super_admin(user.id) is False:
            update_admin_in_db(user.id, user.is_admin)
            return {}
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    # Handle block status updates
    if user.is_blocked is not None:
        # Super admin can block only admins and users. Regular admin can block only users.
        if is_super_admin(user.id) is False and (is_super_admin(jwt_user_id) is True or is_admin(user.id) is False):
            update_user_in_db(user.id, is_blocked=user.is_blocked)
            if user.is_blocked is True:
                disconnect_user(user.id) # disconnect user after block
            return {}
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
        detail="Must specify either admin_flag or blocked_flag query parameter")