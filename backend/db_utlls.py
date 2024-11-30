from fastapi import HTTPException, status
from dotenv import load_dotenv
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

#################################
############# tags ##############

def get_tags(canvas_id):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute(
        "SELECT tags.tag_name FROM tags, tags_of_canvases WHERE canvas_id = %s AND tags.tag_id=tags_of_canvases.tag_id",
        (canvas_id,))
    tags = cur.fetchall()
    con.close()
    return [tag[0] for tag in tags]

def get_tags_id(tags):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    tags_id = []
    if tags is None:
        return tags_id
    for tag in set(tags):
        cur.execute("SELECT tag_id FROM tags WHERE tag_name = %s", (tag,))
        res = cur.fetchone()
        if res is None:
            con.close()
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tag {tag} not found")
        tags_id.append(res[0])
    con.close()
    return tags_id

def insert_tags(canvas, canvas_id):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    for tag in canvas.tags:
        if ',' in tag:
            # invalid tag name. not saved in db
            continue
        # checks if tag exist in db. if not create new tag and then add this tag to canvas.
        cur.execute(f"SELECT tag_id FROM tags WHERE tag_name = %s", (tag,))
        res = cur.fetchone()
        if res is None:
            # create new tag in db
            cur.execute(f"INSERT INTO tags (tag_name) VALUES (%s)", (tag,))
            cur.execute(f"SELECT tag_id FROM tags WHERE tag_name = %s", (tag,))
            res = cur.fetchone()
        tag_id = res[0]
        cur.execute(f"INSERT INTO tags_of_canvases VALUES (%s,%s)", (canvas_id, tag_id))
    con.commit()
    con.close()

def remove_all_tags(canvas_id):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute(f"DELETE FROM tags_of_canvases WHERE canvas_id=%s", (canvas_id,))
    con.commit()
    con.close()

def insert_favorite_tags_to_db(username, tags_id):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    for tag_id in tags_id:
        cur.execute("INSERT INTO favorite_tags (username, tag_id) VALUES (%s,%s)", (username, tag_id))
    con.commit()
    con.close()

###################################
############# canvas ##############

def generate_canvas_id():
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    canvas_id = str(uuid4())
    while True:
        cur.execute(f"SELECT * FROM canvases WHERE canvas_id=%s", (canvas_id,))
        if cur.fetchone() is None:
            break
        canvas_id = str(uuid4())
    con.close()
    return canvas_id

def insert_canvas_to_db(canvas_id, username, canvas_name, is_public, create_date, edit_date, likes):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute("INSERT INTO canvases VALUES (%s,%s,%s,%s,%s,%s,%s)",
                (canvas_id, username, canvas_name, is_public, create_date, edit_date, likes))
    con.commit()
    con.close()

def update_canvas_in_db(canvas_id, canvas_name, is_public):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute(f"UPDATE canvases SET name=%s, is_public=%s, edit_date={int(time.time())} WHERE canvas_id=%s",
                (canvas_name, is_public, canvas_id))
    con.commit()
    con.close()

def delete_canvas_from_db(canvas_id):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute("DELETE FROM canvases WHERE canvas_id=%s", (canvas_id,))
    cur.execute("DELETE FROM canvas_editors WHERE canvas_id=%s", (canvas_id,))
    cur.execute("DELETE FROM likes WHERE canvas_id=%s", (canvas_id,))
    cur.execute("DELETE FROM tags_of_canvases WHERE canvas_id=%s", (canvas_id,))
    con.commit()
    con.close()

def get_canvas_from_db(canvas_id):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    # return canvas if existed, else raise 404 error
    cur.execute(f"SELECT * from canvases WHERE canvas_id=%s", (canvas_id,))
    res = cur.fetchone()
    con.close()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Canvas not found")
    return res

def get_canvas_username(canvas_id):
    return get_canvas_from_db(canvas_id)[1]

def get_canvases_by_username(username):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute(f"SELECT * from canvases WHERE username=%s", (username,))
    canvases = cur.fetchall()
    con.close()
    return canvases

def get_canvases_by_name(canvas_name):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute(f"SELECT * from canvases WHERE name LIKE %s", (f'%{canvas_name}%',))
    canvases = cur.fetchall()
    con.close()
    return canvases

def get_canvases_by_tag(tag):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute(f"SELECT canvases.canvas_id, username, name, is_public, create_date, edit_date, likes "
                f"FROM canvases, tags_of_canvases, tags WHERE tags.tag_name=%s "
                f"AND canvases.canvas_id=tags_of_canvases.canvas_id AND tags.tag_id=tags_of_canvases.tag_id",
                (tag.strip(),))
    canvases = cur.fetchall()
    con.close()
    return canvases

def get_all_canvases():
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute(f"SELECT * from canvases")
    canvases = cur.fetchall()
    con.close()
    return canvases

def like_or_unlike_canvas(canvas_id, username):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute("SELECT * from likes WHERE canvas_id=%s AND username=%s", (canvas_id, username))
    if cur.fetchone() is None:
        # like canvas
        cur.execute("INSERT INTO likes VALUES (%s,%s)", (canvas_id, username))
    else:
        # unlike canvas
        cur.execute("DELETE FROM likes WHERE canvas_id=%s AND username=%s ", (canvas_id, username))
    cur.execute("UPDATE canvases SET likes=%s WHERE canvas_id=%s", (get_num_of_likes(canvas_id), canvas_id))
    con.commit()
    con.close()

def get_num_of_likes(canvas_id):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute("SELECT COUNT(*) FROM likes WHERE canvas_id=%s", (canvas_id,))
    num_of_likes = cur.fetchone()[0]
    con.close()
    return num_of_likes

#################################
############# user ##############

def insert_user_to_db(username, hashed_password, email, is_blocked, is_deleted, profile_photo, cover_photo, about, disabled):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute(
        "INSERT INTO users (username, hashed_password, email, is_blocked, is_deleted,"
        " profile_photo, cover_photo, about, disabled) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        (username, hashed_password, email, is_blocked, is_deleted, profile_photo, cover_photo, about, disabled))
    con.commit()
    con.close()

def raise_error_if_guest(username):
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

def raise_error_if_blocked(username):
    if username is None:
        return
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute("SELECT * FROM users WHERE username=%s AND is_blocked=False", (username,))
    if not cur.fetchall():
        con.close()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Username not found or blocked.")
    con.close()

def is_user_exist(username: str) -> bool:
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute("SELECT * FROM users WHERE username=%s", (username,))
    if cur.fetchone() is None:
        return False
    con.close()
    return True

def is_admin(username):
    if username is None:
        return False
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute("SELECT * FROM admins WHERE username=%s", (username,))
    if cur.fetchone():
        con.close()
        return True
    con.close()
    return False

def is_canvas_editor(canvas_id, username):
    if username is None:
        return False
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute("SELECT username FROM canvases WHERE canvas_id=%s", (canvas_id,))
    res = cur.fetchone()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found.")
    creator = res[0]
    cur.execute("SELECT * FROM canvas_editors WHERE canvas_id=%s AND username=%s", (canvas_id, username))
    if creator == username or cur.fetchone() is not None:
        con.close()
        return True
    con.close()
    return False

def get_hashed_password(username):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute("SELECT hashed_password FROM users WHERE username=%s and is_blocked=False", (username,))
    res = cur.fetchone()
    con.close()
    if res is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is blocked")
    return res[0]

def get_disabled_status(username: str):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute("SELECT disabled FROM users WHERE username = %s", (username,))
    user_disabled = cur.fetchone()[0]
    con.close()
    return user_disabled

def connect_user(username):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute("UPDATE users SET disabled=%s WHERE username=%s", (False, username))
    con.commit()
    con.close()

def disconnect_user(username):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute("UPDATE users SET disabled=%s WHERE username=%s", (True, username))
    con.commit()
    con.close()

####################################
########### report #################

def insert_report_to_db(report_type, canvas_id, username, description):
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    cur.execute(
        f"INSERT INTO reports (report_date, type, canvas_id, username, description) VALUES ({int(time.time())},%s,%s,%s,%s)",
        (report_type, canvas_id, username, description))
    con.commit()
    con.close()

####################################
####### initial functions ##########

def create_tables():
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    tables = ["users(username VARCHAR(255) PRIMARY KEY NOT NULL, hashed_password VARCHAR(255), email VARCHAR(255),"
              " is_blocked BOOLEAN NOT NULL, is_deleted BOOLEAN NOT NULL, profile_photo VARCHAR(255),"
              " cover_photo VARCHAR(255), about TEXT, disabled BOOLEAN NOT NULL)",

              "canvases(canvas_id VARCHAR(255) PRIMARY KEY NOT NULL, username VARCHAR(255) NOT NULL,"
              " name VARCHAR(255) NOT NULL, is_public BOOLEAN NOT NULL, create_date INT NOT NULL, edit_date INT,"
              " likes INT NOT NULL)",

              "reports(report_id SERIAL PRIMARY KEY , report_date INT NOT NULL,"
              " type VARCHAR(255) NOT NULL, canvas_id VARCHAR(255), username VARCHAR(255), description TEXT NOT NULL)",

              "canvas_editors(canvas_id VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL, PRIMARY KEY (canvas_id, username))",
              "tags(tag_id SERIAL PRIMARY KEY, tag_name VARCHAR(255)  NOT NULL)",
              "tags_of_canvases(canvas_id VARCHAR(255) NOT NULL, tag_id INT NOT NULL, PRIMARY KEY (canvas_id, tag_id))",
              "favorite_tags(username VARCHAR(255) NOT NULL, tag_id INT NOT NULL, PRIMARY KEY (username, tag_id))",
              "likes(canvas_id VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL, PRIMARY KEY (canvas_id, username))",
              "admins(username VARCHAR(255) PRIMARY KEY NOT NULL)",
              "super_admins(username VARCHAR(255) PRIMARY KEY NOT NULL)"]
    for table in tables:
        try:
            cur.execute("CREATE TABLE IF NOT EXISTS " + table)
        except Exception as e:
            print(e)
            pass
    con.commit()
    con.close()

def delete_tables_and_folders():
    for folder in ['canvases', UPLOAD_DIR]:
        try:
            shutil.rmtree(f'{folder}/')
        except Exception:
            pass
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST,port=DB_PORT)
    cur = con.cursor()
    for table in ("users", "canvases", "canvas_editors", "tags", "tags_of_canvases", "favorite_tags",
                  "likes", "reports", "admins", "super_admins"):
        try:
            cur.execute(f"DROP TABLE {table}")
        except Exception:
            pass
    con.commit()
    con.close()
