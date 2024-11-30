from fastapi import HTTPException, status
from dotenv import load_dotenv
from uuid import uuid4
import sqlite3
import shutil
import time
import os

load_dotenv()
DB = os.getenv('DB')
UPLOAD_DIR = "uploaded_files"

#################################
############# tags ##############

def get_tags(canvas_id):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    tags = cur.execute(
        "SELECT tags.tag_name FROM tags, tags_of_canvases WHERE canvas_id=? AND tags.tag_id=tags_of_canvases.tag_id",
        (canvas_id,)).fetchall()
    con.close()
    return [tag[0] for tag in tags]

def get_tags_id(tags):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    tags_id = []
    if tags is None:
        return tags_id
    for tag in set(tags):
        res = cur.execute("SELECT tag_id FROM tags WHERE tag_name=?", (tag,)).fetchone()
        if res is None:
            con.close()
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tag {tag} not found")
        tags_id.append(res[0])
    con.close()
    return tags_id

def insert_tags(canvas, canvas_id):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    for tag in canvas.tags:
        if ',' in tag:
            # invalid tag name. not saved in db
            continue
        # checks if tag exist in db. if not create new tag and then add this tag to canvas.
        res = cur.execute(f"SELECT tag_id FROM tags WHERE tag_name=?", (tag,)).fetchone()
        if res is None:
            # create new tag in db
            cur.execute(f"INSERT INTO tags (tag_name) VALUES (?)", (tag,))
            res = cur.execute(f"SELECT tag_id FROM tags WHERE tag_name=?", (tag,)).fetchone()
        tag_id = res[0]
        cur.execute(f"INSERT INTO tags_of_canvases VALUES (?,?)", (canvas_id, tag_id))
    con.commit()
    con.close()

def remove_all_tags(canvas_id):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    cur.execute(f"DELETE FROM tags_of_canvases WHERE canvas_id=?", (canvas_id,))
    con.commit()
    con.close()

def insert_favorite_tags_to_db(username, tags_id):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    for tag_id in tags_id:
        cur.execute("INSERT INTO favorite_tags (username, tag_id) VALUES (?,?)", (username, tag_id))
    con.commit()
    con.close()

###################################
############# canvas ##############

def generate_canvas_id():
    con = sqlite3.connect(DB)
    cur = con.cursor()
    canvas_id = str(uuid4())
    while cur.execute(f"SELECT * FROM canvases WHERE canvas_id=?", (canvas_id,)).fetchall():
        canvas_id = str(uuid4())
    con.close()
    return canvas_id

def insert_canvas_to_db(canvas_id, username, canvas_name, is_public, create_date, edit_date, likes):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    cur.execute("INSERT INTO canvases VALUES (?,?,?,?,?,?,?)",
                (canvas_id, username, canvas_name, is_public, create_date, edit_date, likes))
    con.commit()
    con.close()

def update_canvas_in_db(canvas_id, canvas_name, is_public):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    cur.execute(f"UPDATE canvases SET name=?, is_public=?, edit_date={int(time.time())} WHERE canvas_id=?",
                (canvas_name, is_public, canvas_id))
    con.commit()
    con.close()

def delete_canvas_from_db(canvas_id):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    cur.execute("DELETE FROM canvases WHERE canvas_id=?", (canvas_id,))
    cur.execute("DELETE FROM canvas_editors WHERE canvas_id=?", (canvas_id,))
    cur.execute("DELETE FROM likes WHERE canvas_id=?", (canvas_id,))
    cur.execute("DELETE FROM tags_of_canvases WHERE canvas_id=?", (canvas_id,))
    con.commit()
    con.close()

def get_canvas_from_db(canvas_id):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    # return canvas if existed, else raise 404 error
    res = cur.execute(f"SELECT * from canvases WHERE canvas_id=?", (canvas_id,)).fetchone()
    con.close()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Canvas not found")
    return res

def get_canvas_username(canvas_id):
    return get_canvas_from_db(canvas_id)[1]

def get_canvases_by_username(username):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    canvases = cur.execute(f"SELECT * from canvases WHERE username=?", (username,)).fetchall()
    con.close()
    return canvases

def get_canvases_by_name(canvas_name):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    canvases = cur.execute(f"SELECT * from canvases WHERE name LIKE ?", (f'%{canvas_name}%',)).fetchall()
    con.close()
    return canvases

def get_canvases_by_tag(tag):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    canvases = cur.execute(f"SELECT canvases.canvas_id, username, name, is_public, create_date, edit_date, likes "
                f"FROM canvases, tags_of_canvases, tags WHERE tags.tag_name=? "
                f"AND canvases.canvas_id=tags_of_canvases.canvas_id AND tags.tag_id=tags_of_canvases.tag_id",
                (tag.strip(),)).fetchall()
    con.close()
    return canvases

def get_all_canvases():
    con = sqlite3.connect(DB)
    cur = con.cursor()
    canvases = cur.execute(f"SELECT * from canvases").fetchall()
    con.close()
    return canvases

def like_or_unlike_canvas(canvas_id, username):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    if cur.execute("SELECT * from likes WHERE canvas_id=? AND username=?",
                      (canvas_id, username)).fetchone() is None:
        # like canvas
        cur.execute("INSERT INTO likes VALUES (?,?)", (canvas_id, username))
    else:
        # unlike canvas
        cur.execute("DELETE FROM likes WHERE canvas_id=? AND username=? ", (canvas_id, username))
    cur.execute("UPDATE canvases SET likes=? WHERE canvas_id=?", (get_num_of_likes(canvas_id), canvas_id))
    con.commit()
    con.close()

def get_num_of_likes(canvas_id):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    num_of_likes = cur.execute("SELECT COUNT(*) FROM likes WHERE canvas_id=?", (canvas_id,)).fetchone()[0]
    con.close()
    return num_of_likes

#################################
############# user ##############

def insert_user_to_db(username, hashed_password, email, is_blocked, is_deleted, profile_photo, cover_photo, about, disabled):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    cur.execute(
        "INSERT INTO users (username, hashed_password, email, is_blocked, is_deleted,"
        " profile_photo, cover_photo, about, disabled) VALUES (?,?,?,?,?,?,?,?,?)",
        (username, hashed_password, email, is_blocked, is_deleted, profile_photo, cover_photo, about, disabled))
    con.commit()
    con.close()

def raise_error_if_guest(username):
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

def raise_error_if_blocked(username):
    if username is None:
        return
    con = sqlite3.connect(DB)
    cur = con.cursor()
    if not cur.execute("SELECT * FROM users WHERE username=? AND is_blocked=0", (username,)).fetchall():
        con.close()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Username not found or blocked.")
    con.close()

def is_user_exist(username: str) -> bool:
    con = sqlite3.connect(DB)
    cur = con.cursor()
    if cur.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone() is None:
        return False
    con.close()
    return True

def is_admin(username):
    if username is None:
        return False
    con = sqlite3.connect(DB)
    cur = con.cursor()
    if cur.execute("SELECT * FROM admins WHERE username=?", (username,)).fetchone():
        con.close()
        return True
    con.close()
    return False

def is_canvas_editor(canvas_id, username):
    if username is None:
        return False
    con = sqlite3.connect(DB)
    cur = con.cursor()
    res = cur.execute("SELECT username FROM canvases WHERE canvas_id=?", (canvas_id,)).fetchone()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found.")
    creator = res[0]
    if creator == username or cur.execute("SELECT * FROM canvas_editors WHERE canvas_id=? AND username=?",
                                             (canvas_id, username)).fetchone() is not None:
        con.close()
        return True
    con.close()
    return False

def get_hashed_password(username):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    res = cur.execute("SELECT hashed_password FROM users WHERE username=? and is_blocked=0",
                      (username,)).fetchone()
    con.close()
    if res is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is blocked")
    return res[0]

def get_disabled_status(username: str):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    user_disabled = cur.execute("SELECT disabled FROM users WHERE username = ?", (username,)).fetchone()[0]
    con.close()
    return user_disabled

def connect_user(username):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    cur.execute("UPDATE users SET disabled=? WHERE username=?", (False, username))
    con.commit()
    con.close()

def disconnect_user(username):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    cur.execute("UPDATE users SET disabled=? WHERE username=?", (True, username))
    con.commit()
    con.close()

####################################
########### report #################

def insert_report_to_db(report_type, canvas_id, username, description):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    cur.execute(
        f"INSERT INTO reports (report_date, type, canvas_id, username, description) VALUES ({int(time.time())},?,?,?,?)",
        (report_type, canvas_id, username, description))
    con.commit()
    con.close()

####################################
####### initial functions ##########

def create_tables():
    con = sqlite3.connect(DB)
    cur = con.cursor()
    create_commands = ["CREATE TABLE users(username TEXT PRIMARY KEY, hashed_password TEXT, email TEXT, is_blocked INTEGER,"
                       " is_deleted INTEGER, profile_photo TEXT, cover_photo TEXT, about TEXT, disabled INTEGER)",
                       "CREATE TABLE canvases(canvas_id TEXT PRIMARY KEY, username TEXT, name TEXT, is_public INTEGER, "
                       "create_date INTEGER, edit_date INTEGER, likes INTEGER)",
                       "CREATE TABLE canvas_editors(canvas_id TEXT, username TEXT, PRIMARY KEY (canvas_id, username))",
                       "CREATE TABLE tags(tag_id INTEGER PRIMARY KEY AUTOINCREMENT, tag_name TEXT)",
                       "CREATE TABLE tags_of_canvases(canvas_id TEXT, tag_id INTEGER, PRIMARY KEY (canvas_id, tag_id))",
                       "CREATE TABLE favorite_tags(username TEXT, tag_id INTEGER, PRIMARY KEY (username, tag_id))",
                       "CREATE TABLE likes(canvas_id TEXT, username TEXT, PRIMARY KEY (canvas_id, username))",
                       "CREATE TABLE reports(report_id INTEGER PRIMARY KEY AUTOINCREMENT, report_date INTEGER, type TEXT,"
                       " canvas_id TEXT, username TEXT, description TEXT)",
                       "CREATE TABLE admins(username TEXT PRIMARY KEY)",
                       "CREATE TABLE super_admins(username TEXT PRIMARY KEY)"]
    for command in create_commands:
        try:
            cur.execute(command)
        except sqlite3.OperationalError:
            pass
    con.commit()
    con.close()

def delete_tables_and_folders():
    for folder in ['canvases', UPLOAD_DIR]:
        try:
            shutil.rmtree(f'{folder}/')
        except Exception:
            pass
    con = sqlite3.connect(DB)
    cur = con.cursor()
    for table in ("users", "canvases", "canvas_editors", "tags", "tags_of_canvases", "favorite_tags",
                  "likes", "reports", "admins", "super_admins"):
        try:
            cur.execute(f"DROP TABLE {table}")
        except Exception:
            pass
    con.commit()
    con.close()
