from fastapi import HTTPException, status
from dotenv import load_dotenv
from pathlib import Path
from uuid import uuid4
import psycopg2
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

def get_tags_from_db():
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM tags")
    tags = cur.fetchall()
    con.close()
    return [{'id': tag[0], 'name': tag[1]} for tag in tags]

def get_canvas_tags(canvas_id):
    con, cur = connect_to_db()
    cur.execute(
        "SELECT tags.name FROM tags, tags_of_canvases WHERE canvas_id = %s AND tags.id=tags_of_canvases.tag_id",
        (canvas_id,))
    tags = cur.fetchall()
    con.close()
    return [tag[0] for tag in tags]

def get_tags_id(tags):
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

def get_tag_by_id(tag_id):
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM tags WHERE tags.id = %s", (tag_id,))
    tag = cur.fetchone()
    con.close()
    return tag

def insert_tag(tag_name):
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM tags WHERE name = %s", (tag_name,))
    if cur.fetchone():
        con.close()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Tag {tag_name} already exists")
    cur.execute("INSERT INTO tags(name) VALUES (%s)",(tag_name,))
    con.commit()
    cur.execute("SELECT * FROM tags WHERE name = %s", (tag_name,))
    tag = cur.fetchone()
    con.close()
    return tag

def insert_canvas_tags(canvas, canvas_id):
    for tag_name in canvas.tags:
        is_valid_tag(tag_name)
    con, cur = connect_to_db()
    for tag in canvas.tags:
        # checks if tag exist in db. if not create new tag and then add this tag to canvas.
        cur.execute("SELECT id FROM tags WHERE name = %s", (tag,))
        res = cur.fetchone()
        if res is None:
            # create new tag in db
            cur.execute(f"INSERT INTO tags (name) VALUES (%s)", (tag,))
            cur.execute(f"SELECT id FROM tags WHERE name = %s", (tag,))
            res = cur.fetchone()
        tag_id = res[0]
        cur.execute("INSERT INTO tags_of_canvases VALUES (%s,%s)", (canvas_id, tag_id))
    commit_and_close_db(con)

def remove_all_tags(canvas_id):
    con, cur = connect_to_db()
    cur.execute(f"DELETE FROM tags_of_canvases WHERE canvas_id=%s", (canvas_id,))
    commit_and_close_db(con)

def insert_favorite_tags_to_db(username, tags_id):
    con, cur = connect_to_db()
    for tag_id in tags_id:
        cur.execute("INSERT INTO favorite_tags (username, tag_id) VALUES (%s,%s)", (username, tag_id))
    commit_and_close_db(con)

###################################
############# canvas ##############

def generate_canvas_id():
    con, cur = connect_to_db()
    canvas_id = str(uuid4())
    while True:
        cur.execute(f"SELECT * FROM canvases WHERE id=%s", (canvas_id,))
        if cur.fetchone() is None:
            break
        canvas_id = str(uuid4())
    con.close()
    return canvas_id

def insert_canvas_to_db(canvas_id, username, canvas_name, is_public, create_date, edit_date, likes):
    if len(canvas_name) >= 255:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Canvas name too long")
    con, cur = connect_to_db()
    cur.execute("INSERT INTO canvases VALUES (%s,%s,%s,%s,%s,%s,%s)",
                (canvas_id, username, canvas_name, is_public, create_date, edit_date, likes))
    commit_and_close_db(con)

def update_canvas_in_db(canvas_id, canvas_name, is_public):
    if len(canvas_name) >= 255:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Canvas name too long")
    con, cur = connect_to_db()
    cur.execute(f"UPDATE canvases SET name=%s, is_public=%s, edit_date={int(time.time())} WHERE id=%s",
                (canvas_name, is_public, canvas_id))
    commit_and_close_db(con)

def delete_canvas_from_db(canvas_id):
    con, cur = connect_to_db()
    cur.execute("DELETE FROM canvases WHERE id=%s", (canvas_id,))
    commit_and_close_db(con)

def get_canvas_from_db(canvas_id):
    con, cur = connect_to_db()
    # return canvas if existed, else raise 404 error
    cur.execute(f"SELECT * from canvases WHERE id=%s", (canvas_id,))
    res = cur.fetchone()
    con.close()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Canvas not found")
    return res

def get_canvas_username(canvas_id):
    return get_canvas_from_db(canvas_id)[1]

def get_canvases_by_username(username, page_num, order_by):
    con, cur = connect_to_db()
    cur.execute(f"SELECT canvases.* from canvases, users WHERE canvases.username=users.username"
                f" AND users.username=%s AND is_blocked=false" + order_by + " LIMIT %s OFFSET %s",
                (username, CANVASES_PER_PAGE, (page_num - 1) * CANVASES_PER_PAGE))
    canvases = cur.fetchall()
    con.close()
    return canvases

def get_canvases_by_name(canvas_name, page_num, order_by):
    con, cur = connect_to_db()
    cur.execute(f"SELECT canvases.* from canvases, users WHERE canvases.username=users.username"
                f" AND is_blocked=false AND canvases.name LIKE %s" + order_by + " LIMIT %s OFFSET %s",
                (f'%{canvas_name}%', CANVASES_PER_PAGE, (page_num - 1) * CANVASES_PER_PAGE))
    canvases = cur.fetchall()
    con.close()
    return canvases

def get_canvases_by_tag(tag):
    con, cur = connect_to_db()
    cur.execute(f"SELECT canvases.* FROM canvases, tags_of_canvases, tags, users WHERE tags.name=%s "
                f"AND canvases.id=tags_of_canvases.canvas_id AND tags.id=tags_of_canvases.tag_id "
                f"AND canvases.username=users.username AND is_blocked=false",
                (tag.strip(),))
    canvases = cur.fetchall()
    con.close()
    return canvases

def get_all_canvases(page_num, order_by):
    con, cur = connect_to_db()
    cur.execute(f"SELECT canvases.* FROM canvases,users  WHERE "
                f"canvases.username=users.username AND is_blocked=false" + order_by + " LIMIT %s OFFSET %s",
                (CANVASES_PER_PAGE, (page_num - 1) * CANVASES_PER_PAGE))
    canvases = cur.fetchall()
    con.close()
    return canvases

def like_or_unlike_canvas(canvas_id, username):
    con, cur = connect_to_db()
    cur.execute("SELECT * from likes WHERE canvas_id=%s AND username=%s", (canvas_id, username))
    if cur.fetchone() is None:
        # like canvas
        cur.execute("INSERT INTO likes VALUES (%s,%s)", (canvas_id, username))
    else:
        # unlike canvas
        cur.execute("DELETE FROM likes WHERE canvas_id=%s AND username=%s ", (canvas_id, username))
    con.commit()
    cur.execute("UPDATE canvases SET likes=%s WHERE id=%s", (get_num_of_likes(canvas_id), canvas_id))
    commit_and_close_db(con)

def get_num_of_likes(canvas_id):
    con, cur = connect_to_db()
    cur.execute("SELECT COUNT(*) FROM likes WHERE canvas_id=%s", (canvas_id,))
    num_of_likes = cur.fetchone()[0]
    con.close()
    return num_of_likes

#################################
############# user ##############

def insert_user_to_db(username, hashed_password, email, is_blocked, profile_photo, cover_photo, about, disabled):
    con, cur = connect_to_db()
    cur.execute(
        "INSERT INTO users (username, hashed_password, email, is_blocked, profile_photo, cover_photo, about, disabled)"
        " VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (username, hashed_password, email, is_blocked, profile_photo, cover_photo, about, disabled))
    commit_and_close_db(con)

def raise_error_if_guest(username):
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

def raise_error_if_blocked(username):
    if username is None:
        return
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM users WHERE username=%s AND is_blocked=False", (username,))
    if not cur.fetchall():
        con.close()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is blocked")
    con.close()

def is_user_exist(username: str) -> bool:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM users WHERE username=%s", (username,))
    if cur.fetchone() is None:
        return False
    con.close()
    return True

def is_admin(username):
    if username is None:
        return False
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM admins WHERE username=%s", (username,))
    if cur.fetchone():
        con.close()
        return True
    con.close()
    return False

def is_canvas_editor(canvas_id, username):
    if username is None:
        return False
    con, cur = connect_to_db()
    cur.execute("SELECT username FROM canvases WHERE id=%s", (canvas_id,))
    res = cur.fetchone()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found")
    creator = res[0]
    cur.execute("SELECT * FROM canvas_editors WHERE canvas_id=%s AND username=%s", (canvas_id, username))
    if creator == username or cur.fetchone() is not None:
        con.close()
        return True
    con.close()
    return False

def get_hashed_password(username):
    con, cur = connect_to_db()
    cur.execute("SELECT hashed_password FROM users WHERE username=%s and is_blocked=False", (username,))
    res = cur.fetchone()
    con.close()
    if res is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is blocked")
    return res[0]

def get_disabled_status(username: str):
    con, cur = connect_to_db()
    cur.execute("SELECT disabled FROM users WHERE username = %s", (username,))
    user_disabled = cur.fetchone()[0]
    con.close()
    return user_disabled

def connect_user(username):
    con, cur = connect_to_db()
    cur.execute("UPDATE users SET disabled=%s WHERE username=%s", (False, username))
    commit_and_close_db(con)

def disconnect_user(username):
    con, cur = connect_to_db()
    cur.execute("UPDATE users SET disabled=%s WHERE username=%s", (True, username))
    commit_and_close_db(con)

def get_username_by_email(email):
    con, cur = connect_to_db()
    cur.execute("SELECT username FROM users WHERE email=%s", (email,))
    res = cur.fetchone()
    con.close()
    if res is not None:
        return res[0]
    return None

def update_photo(file_path, username, save_to):
    con, cur = connect_to_db()
    prev_photo = None
    if save_to == 'profile_photo':
        cur.execute("SELECT profile_photo FROM users WHERE username=%s", (username,))
        prev_photo = cur.fetchone()
        cur.execute("UPDATE users SET profile_photo=%s WHERE username=%s", (file_path, username))
    elif save_to == 'cover_photo':
        cur.execute("SELECT cover_photo FROM users WHERE username=%s", (username,))
        prev_photo = cur.fetchone()
        cur.execute("UPDATE users SET cover_photo=%s WHERE username=%s", (file_path, username))
    commit_and_close_db(con)
    if prev_photo is not None:
        return prev_photo[0]

####################################
########### report #################

def insert_report_to_db(report_type, canvas_id, username, description):
    con, cur = connect_to_db()
    cur.execute(
        f"INSERT INTO reports (date, type, canvas_id, username, description) VALUES ({int(time.time())},%s,%s,%s,%s)",
        (report_type, canvas_id, username, description))
    commit_and_close_db(con)

def get_db_reports():
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM reports")
    res = cur.fetchall()
    con.close()
    return res

def delete_report_from_db(report_id):
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM reports WHERE id=%s", (report_id,))
    if cur.fetchone() is None:
        con.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    cur.execute("DELETE FROM reports WHERE id=%s", (report_id,))
    commit_and_close_db(con)
    con.close()

####################################
####### initial functions ##########

def create_tables_and_folders():
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

def delete_tables_and_folders():
    for folder in ['canvases', UPLOAD_DIR]:
        try:
            shutil.rmtree(f'{folder}/')
        except Exception:
            pass
    con, cur = connect_to_db()
    cur.execute(f"DROP SCHEMA public CASCADE; CREATE SCHEMA public")
    commit_and_close_db(con)

def connect_to_db():
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    return con, cur

def commit_and_close_db(con):
    con.commit()
    con.close()

def is_valid_tag(tag_name):
    if ',' in tag_name or not (0 < len(tag_name) < 255):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Tag name must be between 0 and 255 characters and not contain commas")