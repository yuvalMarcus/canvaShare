import os
from typing import List, Optional
from fastapi import HTTPException, status
from backend.models import UpdateUser, UserTuple
from .utils import connect_to_db, commit_and_close_db

__all__ = ['insert_user', 'get_user', 'get_users', 'get_user_id', 'get_user_email', 'get_hashed_password',
           'get_disabled_status', 'connect_user', 'disconnect_user', 'get_username_by_email', 'get_prev_photos',
           'remove_user_photos', 'delete_user', 'update_user', 'is_user_exist', 'get_popular_users']

def insert_user(username: str, hashed_password: str, email: str, is_blocked: bool, disabled: bool) -> int:
    con, cur = connect_to_db()
    cur.execute(
        "INSERT INTO users (username, hashed_password, email, is_blocked, profile_photo, cover_photo, about, disabled)"
        " VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
        (username, hashed_password, email, is_blocked, None, None, None, disabled))
    user_id = cur.fetchone()[0]
    commit_and_close_db(con)
    return user_id

def get_user(user_id: int) -> UserTuple:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    res = cur.fetchone()
    con.close()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return res

def get_users(username: Optional[str] = None, admin_request=False) ->  List[UserTuple]:
    filters = "" if username is None else " AND SIMILARITY(username, %s) > 0.2 ORDER BY SIMILARITY(username, %s) DESC LIMIT 50"
    params = [] if username is None else [username.lower(), username.lower()]
    con, cur = connect_to_db()
    blocked = "" if admin_request else " AND is_blocked=false"
    cur.execute("SELECT * FROM users WHERE 1=1" + blocked + filters, (*params,))
    res = cur.fetchall()
    con.close()
    return res

def get_popular_users(limit: Optional[int]=None):
    limit = 1 if isinstance(limit, int) and limit < 1 else limit
    filters = ' limit %s' if limit else ''
    params = [limit] if limit else []
    con, cur = connect_to_db()
    cur.execute("""WITH paint_likes AS (SELECT user_id, sum(likes) as likessum FROM paints group by user_id)
SELECT users.* FROM users, paint_likes WHERE users.id=paint_likes.user_id ORDER BY likessum DESC""" + filters, (*params,))
    res = cur.fetchall()
    con.close()
    return res

def get_user_id(username:str) -> int | None:
    con, cur = connect_to_db()
    cur.execute("SELECT id FROM users WHERE username = %s", (username,))
    res = cur.fetchone()
    con.close()
    return res[0] if res else None

def get_user_email(user_id: int) -> str | None:
    con, cur = connect_to_db()
    cur.execute("SELECT email FROM users WHERE id = %s", (user_id,))
    res = cur.fetchone()
    con.close()
    return res[0] if res else None

def get_hashed_password(user_id: int) -> str:
    con, cur = connect_to_db()
    cur.execute("SELECT hashed_password FROM users WHERE id = %s and is_blocked=false", (user_id,))
    res = cur.fetchone()
    con.close()
    if res is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is blocked")
    return res[0]

def get_disabled_status(user_id: int) -> bool:
    con, cur = connect_to_db()
    cur.execute("SELECT disabled FROM users WHERE id = %s", (user_id,))
    user_disabled = cur.fetchone()[0]
    con.close()
    return user_disabled

def connect_user(user_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("UPDATE users SET disabled = %s WHERE id = %s", (False, user_id))
    commit_and_close_db(con)

def disconnect_user(user_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("UPDATE users SET disabled = %s WHERE id = %s", (True, user_id))
    commit_and_close_db(con)

def get_username_by_email(email: str | None) -> str | None:
    if email is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
    con, cur = connect_to_db()
    cur.execute("SELECT username FROM users WHERE email = %s", (email,))
    res = cur.fetchone()
    con.close()
    if res is not None:
        return res[0]
    return None

def get_prev_photos(user_id: int, profile_photo: Optional[str] = None, cover_photo: Optional[str] = None) -> List[str]:
    con, cur = connect_to_db()
    prev_photos = []
    if profile_photo:
        cur.execute("SELECT profile_photo FROM users WHERE id = %s", (user_id,))
        res = cur.fetchone()
        if res and res[0]:
            prev_photos.append(res[0])
    if cover_photo:
        cur.execute("SELECT cover_photo FROM users WHERE id = %s", (user_id,))
        res = cur.fetchone()
        if res and res[0]:
            prev_photos.append(res[0])
    con.close()
    return prev_photos

def remove_user_photos(user_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("SELECT profile_photo, cover_photo FROM users WHERE id = %s", (user_id,))
    photos = cur.fetchone()
    if photos:
        for photo in photos:
            if photo:
                try:
                    os.remove(photo)
                except FileNotFoundError:
                    pass
    con.close()

def delete_user(user_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
    commit_and_close_db(con)

def update_user(user: UpdateUser) -> None:
    con, cur = connect_to_db()
    updates, params = [], []
    user_model_dump = user.model_dump()
    for key in user_model_dump:
        if user_model_dump[key] is not None and key != 'user_id':
            updates.append(f"{key} = %s")
            params.append(user_model_dump[key])

    if updates:
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
        params.append(user_model_dump['user_id'])
        cur.execute(query, tuple(params))
        commit_and_close_db(con)

def is_user_exist(user_id: Optional[int] = None, username: Optional[str] = None) -> bool:
    if user_id is None and username is None:
        return False
    con, cur = connect_to_db()
    if username is not None:
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    else:
        cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    if cur.fetchone() is None:
        return False
    con.close()
    return True
