from typing import List, Tuple, Optional, Literal
from fastapi import HTTPException, status
from dotenv import load_dotenv
from classes import Canvas, User
from pathlib import Path
import psycopg2
import inspect
import shutil
import time
import os

load_dotenv()
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
UPLOAD_DIR = "uploaded_files"
CANVASES_PER_PAGE = 50

#################################
############# tags ##############

def get_tags_from_db() -> List[dict]:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM tags")
    tags = cur.fetchall()
    con.close()
    return [{'id': tag[0], 'name': tag[1]} for tag in tags]

def get_canvas_tags(canvas_id: int) -> List[str]:
    con, cur = connect_to_db()
    cur.execute(
        "SELECT tags.name FROM tags, tags_of_canvases WHERE canvas_id = %s AND tags.id=tags_of_canvases.tag_id",
        (canvas_id,))
    tags_name = cur.fetchall()
    con.close()
    return [tag_name[0] for tag_name in tags_name]

def get_tags_id(tags: List[str] | None) -> List[int]:
    con, cur = connect_to_db()
    tags_id = []
    if tags is None:
        return tags_id
    for tag in set(tags):
        cur.execute("SELECT id FROM tags WHERE name = %s", (tag,))
        res = cur.fetchone()
        if res is None:
            con.close()
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tag {tag} not found")
        tags_id.append(res[0])
    con.close()
    return tags_id

def get_tag_by_id(tag_id: int) -> Tuple[int, str] | None:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM tags WHERE tags.id = %s", (tag_id,))
    tag = cur.fetchone()
    con.close()
    return tag

def insert_tag(tag_name: str) -> Tuple[int, str]:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM tags WHERE name = %s", (tag_name,))
    if cur.fetchone():
        con.close()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Tag {tag_name} already exists")
    cur.execute("INSERT INTO tags(name) VALUES (%s) RETURNING id",(tag_name,))
    tag_id = cur.fetchone()[0]
    con.commit()
    con.close()
    return tag_id, tag_name

def insert_canvas_tags(canvas: Canvas, canvas_id: int) -> None:
    for tag_name in canvas.tags:
        raise_error_if_invalid_tag(tag_name)
    con, cur = connect_to_db()
    for tag in canvas.tags:
        # checks if tag exist in db. if not create new tag and then add this tag to canvas.
        cur.execute("SELECT id FROM tags WHERE name = %s", (tag,))
        res = cur.fetchone()
        if res is None:
            # create new tag in db
            cur.execute(f"INSERT INTO tags(name) VALUES (%s) RETURNING id", (tag,))
            res = cur.fetchone()
        tag_id = res[0]
        cur.execute("INSERT INTO tags_of_canvases VALUES (%s,%s)", (canvas_id, tag_id))
    commit_and_close_db(con)

def delete_tag(tag_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute(f"DELETE FROM tags WHERE id = %s ", (tag_id,))
    commit_and_close_db(con)

def remove_all_tags(canvas_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute(f"DELETE FROM tags_of_canvases WHERE canvas_id=%s", (canvas_id,))
    commit_and_close_db(con)

def insert_favorite_tags_to_db(user_id: int, tags_id: int) -> None:
    con, cur = connect_to_db()
    for tag_id in tags_id:
        cur.execute("INSERT INTO favorite_tags (user_id, tag_id) VALUES (%s,%s)", (user_id, tag_id))
    commit_and_close_db(con)

def raise_error_if_invalid_tag(tag_name: str) -> None:
    if ',' in tag_name or not (0 < len(tag_name) < 255):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Tag name must be between 0 and 255 characters and not contain commas")


###################################
############# canvas ##############

def insert_canvas_to_db(user_id: int, canvas_name: str, is_public: bool,
                        create_date: int, edit_date: int, likes: int) -> int:
    con, cur = connect_to_db()
    cur.execute("INSERT INTO canvases(user_id, name, is_public, create_date, edit_date, likes)"
                " VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
                (user_id, canvas_name, is_public, create_date, edit_date, likes))
    canvas_id = cur.fetchone()[0]
    commit_and_close_db(con)
    return canvas_id

def update_canvas_in_db(canvas_id: int, canvas_name: str, is_public: bool) -> None:
    con, cur = connect_to_db()
    cur.execute(f"UPDATE canvases SET name=%s, is_public=%s, edit_date={int(time.time())} WHERE id=%s",
                (canvas_name, is_public, canvas_id))
    commit_and_close_db(con)

def delete_canvas_from_db(canvas_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("DELETE FROM canvases WHERE id=%s", (canvas_id,))
    commit_and_close_db(con)

def get_canvas_from_db(canvas_id: int) -> Tuple[int, int, str, bool, int, int, int]:
    con, cur = connect_to_db()
    # return canvas if existed, else raise 404 error
    cur.execute(f"SELECT * from canvases WHERE id=%s", (canvas_id,))
    res = cur.fetchone()
    con.close()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Canvas not found")
    return res

def get_canvas_user_id(canvas_id: int) -> int:
    return get_canvas_from_db(canvas_id)[1]

def get_canvases_by_user_id(user_id: int, page_num: int, order_by: str) \
        -> List[Tuple[int, int, str, bool, int, int, int]]:
    con, cur = connect_to_db()
    cur.execute(f"SELECT canvases.* from canvases, users WHERE canvases.user_id=users.id"
                f" AND users.user_id=%s AND is_blocked=false" + order_by + " LIMIT %s OFFSET %s",
                (user_id, CANVASES_PER_PAGE, (page_num - 1) * CANVASES_PER_PAGE))
    canvases = cur.fetchall()
    con.close()
    return canvases

def get_canvases_by_name(canvas_name: str, page_num: int, order_by: str)\
        -> List[Tuple[int, int, str, bool, int, int, int]]:
    con, cur = connect_to_db()
    cur.execute(f"SELECT canvases.* from canvases, users WHERE canvases.user_id=users.id"
                f" AND is_blocked=false AND canvases.name LIKE %s" + order_by + " LIMIT %s OFFSET %s",
                (f'%{canvas_name}%', CANVASES_PER_PAGE, (page_num - 1) * CANVASES_PER_PAGE))
    canvases = cur.fetchall()
    con.close()
    return canvases

def get_canvases_by_tag(tag: str) -> List[Tuple[int, int, str, bool, int, int, int]]:
    con, cur = connect_to_db()
    cur.execute(f"SELECT canvases.* FROM canvases, tags_of_canvases, tags, users WHERE tags.name=%s "
                f"AND canvases.id=tags_of_canvases.canvas_id AND tags.id=tags_of_canvases.tag_id "
                f"AND canvases.user_id=users.id AND is_blocked=false",
                (tag.strip(),))
    canvases = cur.fetchall()
    con.close()
    return canvases

def get_all_canvases(page_num: int, order_by: str) -> List[Tuple[int, int, str, bool, int, int, int]]:
    con, cur = connect_to_db()
    cur.execute(f"SELECT canvases.* FROM canvases,users  WHERE "
                f"canvases.user_id=users.id AND is_blocked=false" + order_by + " LIMIT %s OFFSET %s",
                (CANVASES_PER_PAGE, (page_num - 1) * CANVASES_PER_PAGE))
    canvases = cur.fetchall()
    con.close()
    return canvases

def like_or_unlike_canvas(canvas_id: int, user_id: int, like_flag: bool) -> None:
    con, cur = connect_to_db()
    cur.execute("SELECT * from likes WHERE canvas_id=%s AND user_id=%s", (canvas_id, user_id))
    res = cur.fetchone()
    if res is None and like_flag is True:
        # like canvas
        cur.execute("INSERT INTO likes VALUES (%s,%s)", (canvas_id, user_id))
    if res is not None and like_flag is False:
        # unlike canvas
        cur.execute("DELETE FROM likes WHERE canvas_id=%s AND user_id=%s ", (canvas_id, user_id))
    con.commit()
    cur.execute("UPDATE canvases SET likes=%s WHERE id=%s", (get_num_of_likes(canvas_id), canvas_id))
    commit_and_close_db(con)

def get_num_of_likes(canvas_id: int) -> int:
    con, cur = connect_to_db()
    cur.execute("SELECT COUNT(*) FROM likes WHERE canvas_id=%s", (canvas_id,))
    num_of_likes = cur.fetchone()[0]
    con.close()
    return num_of_likes

def get_canvases_likes() -> List[Tuple[int, int]]:
    con, cur = connect_to_db()
    cur.execute("SELECT id, likes FROM canvases")
    res = cur.fetchall()
    con.close()
    return res

#################################
############# user ##############

def insert_user_to_db(username: str, hashed_password: str, email: str, is_blocked: bool, disabled: bool) -> int:
    con, cur = connect_to_db()
    cur.execute(
        "INSERT INTO users (username, hashed_password, email, is_blocked, profile_photo, cover_photo, about, disabled)"
        " VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
        (username, hashed_password, email, is_blocked, None, None, None, disabled))
    user_id = cur.fetchone()[0]
    commit_and_close_db(con)
    return user_id

def raise_error_if_guest(user_id: int | None) -> None:
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

def raise_error_if_blocked(user_id: int | None) -> None:
    if user_id is None:
        return # If the user is guest do not raise error
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM users WHERE id=%s AND is_blocked=False", (user_id,))
    if not cur.fetchall():
        con.close()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is blocked")
    con.close()

def is_user_exist(user_id: Optional[int] = None, username: Optional[str] = None) -> bool:
    if user_id is None and username is None:
        return False
    con, cur = connect_to_db()
    if username is not None:
        cur.execute("SELECT * FROM users WHERE username=%s", (username,))
    else:
        cur.execute("SELECT * FROM users WHERE id=%s", (user_id,))
    if cur.fetchone() is None:
        return False
    con.close()
    return True

def get_username_by_id(user_id: int) -> str | None:
    con, cur = connect_to_db()
    cur.execute("SELECT username FROM users WHERE id=%s", (user_id,))
    res = cur.fetchone()
    con.close()
    return res[0] if res is not None else None

def is_user_blocked(user_id: int) -> bool:
    con, cur = connect_to_db()
    cur.execute("SELECT is_blocked FROM users WHERE id=%s", (user_id,))
    res = cur.fetchone()
    con.close()
    return res and res[0]  # Return True if the user is blocked

def get_user_id(username:str) -> int | None:
    con, cur = connect_to_db()
    cur.execute("SELECT id FROM users WHERE username=%s", (username,))
    res = cur.fetchone()
    con.close()
    return res[0] if res else None


def get_user_from_db(user_id: int) -> Tuple[int, str, bool, bool, str, str, str]:
    con, cur = connect_to_db()
    # return user if existed, else raise 404 error
    cur.execute(f"SELECT * from users WHERE id=%s", (user_id,))
    res = cur.fetchone()
    con.close()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User not found")
    return res

def search_user_by_name(user_name: Optional[str] = None) -> List[str]:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM users WHERE is_blocked =false ORDER BY SIMILARITY(username,user_name) DESC LIMIT 50")
    res = cur.fetchall()
    con.close()
    return res


def is_admin(user_id: int) -> bool:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM admins WHERE user_id=%s", (user_id,))
    flag = True if cur.fetchone() else False
    con.close()
    return flag

def is_super_admin(user_id: int) -> bool:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM super_admins WHERE user_id=%s", (user_id,))
    flag = True if cur.fetchone() else False
    con.close()
    return flag

def is_canvas_editor(canvas_id: int, user_id: int) -> bool:
    if user_id is None:
        return False
    con, cur = connect_to_db()
    cur.execute("SELECT user_id FROM canvases WHERE id=%s", (canvas_id,))
    res = cur.fetchone()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found")
    creator_id = res[0]
    cur.execute("SELECT * FROM canvas_editors WHERE canvas_id=%s AND user_id=%s", (canvas_id, user_id))
    if creator_id == user_id or cur.fetchone() is not None:
        con.close()
        return True
    con.close()
    return False

def get_hashed_password(user_id: int) -> str:
    con, cur = connect_to_db()
    cur.execute("SELECT hashed_password FROM users WHERE id=%s and is_blocked=False", (user_id,))
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
    cur.execute("UPDATE users SET disabled=%s WHERE id=%s", (False, user_id))
    commit_and_close_db(con)

def disconnect_user(user_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("UPDATE users SET disabled=%s WHERE id=%s", (True, user_id))
    commit_and_close_db(con)

def get_username_by_email(email: str) -> str | None:
    con, cur = connect_to_db()
    cur.execute("SELECT username FROM users WHERE email=%s", (email,))
    res = cur.fetchone()
    con.close()
    if res is not None:
        return res[0]
    return None

def update_photo(file_path: str, user_id: int, save_to: Literal['profile_photo', 'cover_photo']) -> str| None:
    con, cur = connect_to_db()
    prev_photo = None
    if save_to == 'profile_photo':
        cur.execute("SELECT profile_photo FROM users WHERE id=%s", (user_id,))
        prev_photo = cur.fetchone()
        cur.execute("UPDATE users SET profile_photo=%s WHERE id=%s", (file_path, user_id))
    elif save_to == 'cover_photo':
        cur.execute("SELECT cover_photo FROM users WHERE id=%s", (user_id,))
        prev_photo = cur.fetchone()
        cur.execute("UPDATE users SET cover_photo=%s WHERE id=%s", (file_path, user_id))
    commit_and_close_db(con)
    if prev_photo is not None:
        return prev_photo[0]

def delete_user_from_db(user_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("DELETE FROM users WHERE id=%s", (user_id,))
    commit_and_close_db(con)

def remove_photos(user_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("SELECT profile_photo, cover_photo FROM users WHERE id=%s", (user_id,))
    photos = cur.fetchone()
    if photos:
        for photo in photos:
            if photo:
                try:
                    os.remove(photo)
                except Exception:
                    pass
    con.close()

def update_user_in_db(user_id: int, is_blocked: Optional[bool]=None, profile_photo: Optional[str]=None,
                      cover_photo: Optional[str]=None, about: Optional[str]=None) -> None:
    con, cur = connect_to_db()
    updates = []
    params = []
    args = inspect.getfullargspec(update_user_in_db).args[1:] # get this function arguments name (string) except user_id
    for i, arg in enumerate([is_blocked, profile_photo, cover_photo, about]):
        if arg is not None:
            updates.append(f"{args[i]}=%s")
            params.append(arg)

    if updates:
        query = f"UPDATE users SET {', '.join(updates)} WHERE id=%s"
        params.append(user_id)
        cur.execute(query, tuple(params))
        commit_and_close_db(con)

####################################
########### admin #################

def update_admin_in_db(user_id: int, admin_flag: bool) -> None:
    con, cur = connect_to_db()
    try:
        if admin_flag is True:
            cur.execute("INSERT INTO admins(user_id) VALUES (%s)", (user_id,))
        else:
            cur.execute("DELETE FROM admins WHERE user_id=%s", (user_id,))
    except Exception:
        pass
    commit_and_close_db(con)

####################################
########### report #################

def insert_report_to_db(report_type: Literal['artist', 'artist'], canvas_id: int | None,
                        user_id: int | None, description: str) -> None:
    con, cur = connect_to_db()
    cur.execute(
        f"INSERT INTO reports (date, type, canvas_id, user_id, description) VALUES ({int(time.time())},%s,%s,%s,%s)",
        (report_type, canvas_id, user_id, description))
    commit_and_close_db(con)

def get_db_reports() -> List[Tuple[int, int, str, int | None, int | None, str]]:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM reports")
    res = cur.fetchall()
    con.close()
    return res

def delete_report_from_db(report_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM reports WHERE id=%s", (report_id,))
    if cur.fetchone() is None:
        con.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    cur.execute("DELETE FROM reports WHERE id=%s", (report_id,))
    commit_and_close_db(con)
    con.close()

############################################
####### initial and connection db ##########

def create_tables_and_folders() -> None:
    commands = []
    with open('tables.sql', 'r') as fd:
        lines = fd.read().split(';')
        for line in lines:
            line = line.strip()
            if line.startswith('CREATE TABLE'):
                commands.append(line)
    con, cur = connect_to_db()
    for command in commands:
        try:
            cur.execute(command)
        except Exception as e:
            print(f'Failed to create table')
            print(e)
    commit_and_close_db(con)
    for folder in ['canvases', UPLOAD_DIR]:
        Path(folder).mkdir(exist_ok=True, parents=True)

def delete_tables_and_folders() -> None:
    ans = input('Are you sure you want to delete all tables and folders? Yes / No\n')
    if ans.lower() not in ['yes', 'y']:
        print('Aborted')
        return
    for folder in ['canvases', UPLOAD_DIR]:
        try:
            shutil.rmtree(f'{folder}/')
        except Exception:
            pass
    con, cur = connect_to_db()
    cur.execute(f"DROP SCHEMA public CASCADE; CREATE SCHEMA public")
    commit_and_close_db(con)

def connect_to_db() -> tuple:
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    return con, cur

def commit_and_close_db(con) -> None:
    con.commit()
    con.close()