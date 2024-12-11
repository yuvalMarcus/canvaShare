from typing import List
from fastapi import APIRouter, Query
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
                          about=None, disabled=True, admin=user.is_admin, super_admin=user.is_super_admin) # need to add is_admin + is_super_admin TO DB
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




##### Only Admin/Super Admin Can Delete Users #####
#####  super admin can delete admins, and admins cannot delete each other or super admins ####
@router.delete('/artist/{username}', status_code=status.HTTP_204_NO_CONTENT)
def delete_artist(username: str, jwt_username: str = Depends(get_jwt_username)):
    # Check if the authenticated user is an admin or super_admin
    if not (is_admin(jwt_username) or is_super_admin(jwt_username)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete users"
        )
    # Ensure the target user exists
    if not is_user_exist(username):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Prevent admins from deleting other admins
    if is_admin(jwt_username) and is_admin(username):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cannot delete other admins"
        )

    # Prevent admins from deleting super admins
    if is_admin(jwt_username) and is_super_admin(username):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cannot delete super admins"
        )

    # Allow super admins to delete admins or regular users
    if is_super_admin(jwt_username):
        # Log the deletion action (optional)
        print(f"Super admin {jwt_username} is deleting user {username}.")

    # Remove associated profile and cover photos
    remove_photos(username)

    # Delete the user from the database
    delete_user_from_db(username)

    return {"message": f"User {username} deleted successfully."}

@router.put('/artist/{username}')
def update_user_status(
    username: str,
    is_admin: Optional[bool] = Query(None),
    is_blocked: Optional[bool] = Query(None),
    jwt_username: str = Depends(get_jwt_username)
):
    """
    Update a user's admin or block status. Super admins can modify both.
    Admins can only modify block status for regular users.
    Blocked users cannot perform any actions.
    """

    # Ensure the token owner is not blocked
    if is_user_blocked(jwt_username):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Blocked users cannot modify user statuses"
        )

    # Ensure the target user exists
    if not is_user_exist(username):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


    # Ensure the token owner is either an admin or super admin
    if not (is_admin or is_super_admin(jwt_username)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify user status"
        )

    # Handle admin status updates
    if is_admin is not None:
        if not is_super_admin(jwt_username):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only super admins can modify admin status"
            )
        update_user_in_db(username, is_admin=is_admin)
        return {"message": f"User {username} admin status updated to {is_admin}."}

    # Handle block status updates
    if is_blocked is not None:
        if is_admin and (is_admin or is_super_admin(username)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admins cannot block/unblock other admins or super admins"
            )
        update_user_in_db(username, is_blocked=is_blocked)
        return {"message": f"User {username} block status updated to {is_blocked}."}

    # If neither query parameter is provided
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Must specify either is_admin or is_blocked query parameter"
    )



