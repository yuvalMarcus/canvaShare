from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
from uuid import UUID, uuid4
import random
import json
import uvicorn
import sqlite3
import time
import re
import os

DB = "database.db"

tags_metadata = [
    {
        "name": "get_canvas_by_id",
        "description": "Get specific canvas.",
    },
    {
        "name": "create_canvas",
        "description": "Create a new canvas.",
    },
    {
        "name": "edit_canvas",
        "description": "Edit exist canvas.",
    },
    {
        "name": "delete_canvas",
        "description": "Delete canvas.",
    },
    {
        "name": "get_canvases_by_filters",
        "description": "Get list of canvases by filters.<br>"
                       "The filters can be username, canvas name, tags.<br>"
                       "The results can be sorted by likes.<br>"
                       "In every request (page) the maximum results is 50.<br>"
                       "To get the rest of results you need to request specific page."
    },
    {
        "name": "like_canvas",
        "description": "Like a canvas or remove like from canvas."
    },
    {
        "name": "get_canvas_likes",
        "description": "Get the number of likes for a canvas."
    },
    {
        "name": "report",
        "description": "Report a canvas or artist."
    },
    {
        "name": "register",
        "description": "Register a new user."
    }

]

app = FastAPI(openapi_tags=tags_metadata)

class Canvas(BaseModel):
    id: Optional[UUID] = None
    username: Optional[str] = None
    name: str
    tags: Optional[List[str]] = None
    is_public: bool = False
    create_date: Optional[int] = None
    edit_date: Optional[int] = None
    data: str
    likes: Optional[int] = None

class User(BaseModel):
    username: str
    password: Optional[str] = None
    email: Optional[str] = None
    tags: Optional[List[str]] = None
    is_blocked: Optional[bool] = False
    is_deleted: Optional[bool] = False
    is_admin: Optional[bool] = False
    is_super_admin: Optional[bool] = False
    photo: Optional[str] = None
    about: Optional[str] = None
    #token: Optional[str] = None

class Report(BaseModel):
    type: str # canvas / artist
    canvas_id: Optional[UUID] = None
    username: Optional[str] = None
    description: str

@app.get("/canvas/{canvas_id}", response_model=List[Canvas], tags=["get_canvas_by_id"])
def get_canvas(canvas_id: UUID):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    canvas = dict()
    (canvas["id"], canvas["username"], canvas["name"] , canvas["is_public"], canvas["create_date"],
     canvas["edit_date"], canvas["likes"]) = get_canvas_from_db(con, cur, canvas_id)
    canvas["tags"] = cur.execute(
        "SELECT tags.tag_name FROM tags, tags_of_canvases WHERE canvas_id=? AND tags.tag_id=tags_of_canvases.tag_id",
        (str(canvas_id),)).fetchall()
    con.close()
    if canvas["is_public"] == 0:
        ###### need to validate jwt and check if the username in jwt have permission to edit or if username is admin.
        ###### if not raise error 401
        pass

    try:
        with open(f'canvases/{canvas["username"]}/{canvas["id"]}.json', 'r', encoding='utf-8') as fd:
            canvas["data"] = str(json.loads(fd.read()))
    except FileNotFoundError:
        # canvas exist in db but the json file of data not exist.
        raise HTTPException(status_code=404, detail="Canvas not found")
    except json.decoder.JSONDecodeError:
        raise HTTPException(status_code=400, detail="JSON Decode Error")
    return [canvas]

@app.post("/canvas", tags=["create_canvas"])
def create_canvas(canvas: Canvas):
    con = sqlite3.connect(DB)
    cur = con.cursor()

    ####### need to validate jwt
    canvas_username = 'yarinl0' # Debug. This variable should get value from jwt.
    # Checks if username exist in db and not blocked
    if not cur.execute("SELECT * FROM users WHERE username=? AND is_blocked=0", (canvas_username,)).fetchall():
        raise_http_exception(con, 401, "Username not found or blocked.")

    # Generate unique id for canvas
    canvas.id = uuid4()
    while cur.execute(f"SELECT * FROM canvases WHERE canvas_id=?", (str(canvas.id),)).fetchall():
        canvas.id = uuid4()

    # Saves canvas in json file
    save_json_data(con, canvas_username, f'canvases/{canvas_username}/{canvas.id}.json', canvas.data)

    cur.execute("INSERT INTO canvases VALUES (?,?,?,?,?,?,?)",(str(canvas.id), str(canvas_username),
                                                               str(canvas.name), canvas.is_public, int(time.time()), 0, 0))
    insert_tags_to_db(cur, canvas, canvas.id)
    con.commit()
    con.close()
    return dict()

@app.put("/canvas/{canvas_id}", tags=["edit_canvas"])
def update_canvas(canvas_id: UUID, canvas: Canvas):
    ###### need to validate jwt and check if the username in jwt exist and not blocked and have permission to edit.
    ###### if not raise 401 error
    con = sqlite3.connect(DB)
    cur = con.cursor()
    canvas.username = get_canvas_from_db(con, cur, canvas_id)[1]
    save_json_data(con, canvas.username, f'canvases/{canvas.username}/{canvas_id}.json', canvas.data)

    cur.execute(f"UPDATE canvases SET name=?, is_public=?, edit_date={int(time.time())} WHERE canvas_id=?",
                (str(canvas.name), canvas.is_public, str(canvas_id)))
    # remove old tags
    cur.execute(f"DELETE FROM tags_of_canvases WHERE canvas_id=?", (str(canvas_id),))
    # insert new tags
    insert_tags_to_db(cur, canvas, canvas_id)
    con.commit()
    con.close()
    return dict()

@app.delete("/canvas/{canvas_id}", tags=["delete_canvas"])
def delete_canvas(canvas_id: UUID):
    ###### need to validate jwt and check if the username in jwt exist and not blocked and have permission to delete (creator or admin).
    ###### if not raise 401 error
    con = sqlite3.connect(DB)
    cur = con.cursor()
    username = get_canvas_from_db(con, cur, canvas_id)[1]
    cur.execute("DELETE FROM canvases WHERE canvas_id=?", (str(canvas_id),))
    cur.execute("DELETE FROM permissions WHERE canvas_id=?", (str(canvas_id),))
    cur.execute("DELETE FROM likes WHERE canvas_id=?", (str(canvas_id),))
    cur.execute("DELETE FROM tags_of_canvases WHERE canvas_id=?", (str(canvas_id),))
    con.commit()
    con.close()
    try:
        os.remove(f'canvases/{username}/{canvas_id}.json')
    except Exception:
        pass
    return dict()

@app.get("/canvas", response_model=List[Canvas], tags=["get_canvases_by_filters"])
def get_canvases(username: Optional[str] = None, canvas_name: Optional[str] = None,
                       tags: Optional[str] = None, order: Optional[str] = None, page_num: Optional[int] = None):
    ####### get username from jwt
    jwt_username = 'yarinl0'  # debug
    all_results = set()
    if page_num is None or page_num < 1 or os.path.isfile(f'canvases/{jwt_username}/explore.json') is False:
        page_num = 1

    if page_num == 1:
        con = sqlite3.connect(DB)
        cur = con.cursor()
        if username is not None:
            # request from artist page
            all_results = all_results.union(set(cur.execute(f"SELECT * from canvases WHERE username=?", (username,)).fetchall()))
        if canvas_name is not None:
            # request from search page
            all_results = all_results.union(set(cur.execute(f"SELECT * from canvases WHERE name LIKE ?", (f'%{canvas_name}%',)).fetchall()))
        if tags is not None:
            # request from explore page
            for tag in tags.split(','):
                all_results = all_results.union(set(cur.execute(f"SELECT canvases.canvas_id, username, name, is_public, "
                                                                f"create_date, edit_date, likes "
                                                                f"FROM canvases, tags_of_canvases, tags "
                                                                f"WHERE tags.tag_name=? "
                                                                f"AND canvases.canvas_id=tags_of_canvases.canvas_id "
                                                                f"AND tags.tag_id=tags_of_canvases.tag_id",
                                                                (tag.strip(), )).fetchall()))
        if len(all_results) == 0:
            all_results = all_results.union(set(cur.execute(f"SELECT * from canvases").fetchall()))
        all_results = list(all_results)
        if order == 'likes':
            # sort canvases by likes from high to low
            all_results.sort(key=lambda x: x[-1], reverse=True)
        else:
            random.shuffle(all_results)
        explore_json = save_explore_json(all_results, jwt_username, cur)
        con.close()
    else:
        explore_json = json.loads(open(f'canvases/{jwt_username}/explore.json', 'r').read())
    return explore_json[page_num*50-50:page_num*50]

@app.put('/canvas/like/{canvas_id}', tags=["like_canvas"])
def like_canvas(canvas_id: UUID):
    ##### get username from jwt. check if username exist in db and not blocked.
    username = 'yarinl0' # debug
    con = sqlite3.connect(DB)
    cur = con.cursor()
    get_canvas_from_db(con, cur, canvas_id) # checks if canvas exist
    res = cur.execute("SELECT * from likes WHERE canvas_id=? AND username=?",
                      (str(canvas_id), username)).fetchone()
    if res is None:
        # like canvas
        cur.execute("INSERT INTO likes VALUES (?,?)", (str(canvas_id), username))
    else:
        # canvas already liked. unlike canvas
        cur.execute("DELETE FROM likes WHERE canvas_id=? AND username=? ", (str(canvas_id), username))
    num_of_likes = cur.execute("SELECT COUNT(*) FROM likes WHERE canvas_id=?", (str(canvas_id),)).fetchone()[0]
    cur.execute("UPDATE canvases SET likes=? WHERE canvas_id=?", (num_of_likes, str(canvas_id)))
    con.commit()
    con.close()
    return {"num_of_likes": num_of_likes}

@app.get('/canvas/likes_number/{canvas_id}', tags=["get_canvas_likes"])
def get_canvas_likes_number(canvas_id: UUID):
    # no need to check permissions
    con = sqlite3.connect(DB)
    cur = con.cursor()
    get_canvas_from_db(con, cur, canvas_id)  # checks if canvas exist
    num_of_likes = cur.execute("SELECT COUNT(*) FROM likes WHERE canvas_id=?", (str(canvas_id),)).fetchone()[0]
    con.close()
    return {"num_of_likes": num_of_likes}

@app.post('/report', tags=["report"])
def create_report(report: Report):
    if not (1 <= len(report.description) <= 100):
        raise HTTPException(status_code=400, detail="Report description must be between 1 and 100 characters.")
    con = sqlite3.connect(DB)
    cur = con.cursor()
    if report.type == 'artist' and report.username is not None:
        if is_user_exist(report.username) is False:
            raise_http_exception(con, 404, "User not found")
        report.canvas_id = None
    elif report.type == 'canvas' and report.canvas_id is not None:
        get_canvas_from_db(con, cur, report.canvas_id) # checks if canvas exist
        report.canvas_id, report.username = str(report.canvas_id), None
    else:
        raise_http_exception(con, 400, "Report type must be 'artist' or 'canvas' and their fields cannot be empty")
    cur.execute(f"INSERT INTO reports (report_date, type, canvas_id, username, description) VALUES ({int(time.time())},?,?,?,?)",
                (report.type, report.canvas_id, report.username, report.description))
    con.commit()
    con.close()
    return dict()
        
@app.post('/register', tags=["register"])
def register(user: User):
    if is_valid_username(user.username) and is_valid_password(user.password) and is_valid_email(user.email):
        user.username = user.username.lower()
        encrypted_password = encrypt_password(user.password)
        tags_id = get_tags_id(user.tags)
        con = sqlite3.connect(DB)
        cur = con.cursor()
        cur.execute("INSERT INTO users (username, password, email, is_blocked, is_deleted, photo, about) VALUES (?,?,?,?,?,?,?)",
                    (user.username, encrypted_password,user.email, 0, 0, None, None))
        for tag_id in tags_id:
            cur.execute("INSERT INTO favorite_tags (username, tag_id) VALUES (?,?)", (user.username, tag_id))
        con.commit()
        con.close()
        return {}

def get_tags_id(tags):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    tags_id = []
    if tags is None:
        return tags_id
    for tag in set(tags):
        res = cur.execute("SELECT tag_id FROM tags WHERE tag_name=?", (tag,)).fetchone()
        if res is None:
            raise_http_exception(con, 404, f"Tag {tag} not found")
        tags_id.append(res[0])
    con.close()
    return tags_id

def is_valid_password(password):
    if (password is not None and 6 <= len(password) <= 50 and re.search(r'[0-9]', password)
            and re.search(r'[A-Z]', password) and re.search(r'[a-z]', password)
            and re.search(r'[!@#$%^&*_+\-=]', password)):
        return True
    raise HTTPException(status_code=400, detail="Invalid password")

def is_valid_username(username):
    if is_user_exist(username) is True:
        raise HTTPException(status_code=400, detail=f"User {username} already exists")
    if 3 <= len(username) <= 20 and username.isalnum():
        return True
    raise HTTPException(status_code=400, detail="Invalid username")

def is_valid_email(email):
    if email is not None and re.search(r"^\S+@\S+\.\S+$", email):
        return True
    raise HTTPException(status_code=400, detail="Invalid email")

def encrypt_password(password):
    ######### need to build this function
    return '1234'

def is_user_exist(username: str) -> bool:
    con = sqlite3.connect(DB)
    cur = con.cursor()
    if cur.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone() is None:
        return False
    con.close()
    return True

def insert_tags_to_db(cur, canvas, canvas_id):
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
        cur.execute(f"INSERT INTO tags_of_canvases VALUES (?,?)", (str(canvas_id), tag_id))

def raise_http_exception(con, code, message):
    con.close()
    raise HTTPException(status_code=code, detail=message)

def save_json_data(con, username, canvas_path, data):
    Path(f"canvases/{username}").mkdir(parents=True, exist_ok=True) # maybe in windows needs to add '/' prefix
    try:
        data = data.replace('\'', '\"')
        with open(canvas_path, 'w', encoding='utf-8') as fd:
            json.dump(json.loads(data), fd, ensure_ascii=False, indent=4) # raises error if not json, otherwise saves it
    except json.decoder.JSONDecodeError:
        try:
            os.remove(canvas_path)
        except Exception:
            pass
        raise_http_exception(con, 400, "JSON Decode Error")

def save_explore_json(all_results, username, cur):
    canvases = []
    Path(f"canvases/{username}").mkdir(parents=True, exist_ok=True)  # maybe in windows needs to add '/' prefix
    for result in all_results:
        canvas = dict()
        (canvas['id'], canvas['username'], canvas['name'], canvas['is_public'], canvas['create_date'],
         canvas['edit_date'], canvas['likes']) = result
        canvas['tags'] = cur.execute("SELECT tags.tag_name FROM tags, tags_of_canvases "
                                     "WHERE tags.tag_id=tags_of_canvases.tag_id "
                                     "AND tags_of_canvases.canvas_id=?", (canvas['id'],)).fetchall()
        canvas['tags'] = [i[0] for i in canvas['tags']]
        with open(f'canvases/{canvas['username']}/{canvas['id']}.json', 'r', encoding='utf-8') as fd:
            canvas['data'] = str(json.loads(fd.read()))
        canvases.append(canvas)
    # save the list of canvases as json file
    with open(f'canvases/{username}/explore.json', 'w', encoding='utf-8') as fd:
        json.dump(canvases, fd, ensure_ascii=False, indent=4)
    return canvases

def get_canvas_from_db(con, cur, canvas_id):
    # return canvas if existed, else raise 404 error
    res = cur.execute(f"SELECT username from canvases WHERE canvas_id=?", (str(canvas_id),)).fetchone()
    if res is None:
        raise_http_exception(con, 404, "Canvas not found")
    return res

def create_tables():
    con = sqlite3.connect(DB)
    cur = con.cursor()
    create_commands = ["CREATE TABLE users(username TEXT PRIMARY KEY, password TEXT, email TEXT, is_blocked INTEGER,"
                       " is_deleted INTEGER, photo TEXT, about TEXT)",
                       "CREATE TABLE canvases(canvas_id TEXT PRIMARY KEY, username TEXT, name TEXT, is_public INTEGER, "
                       "create_date INTEGER, edit_date INTEGER, likes INTEGER)",
                       "CREATE TABLE permissions(canvas_id TEXT, username TEXT, type_of_permission TEXT, PRIMARY KEY (canvas_id, username))",
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

def delete_tables_and_folders():
    import shutil
    try:
        shutil.rmtree('canvases/')
    except Exception:
        pass
    con = sqlite3.connect(DB)
    cur = con.cursor()
    for table in ("users", "canvases", "permissions", "tags", "tags_of_canvases", "favorite_tags",
                  "likes", "reports", "admins", "super_admins"):
        try:
            cur.execute(f"DROP TABLE {table}")
        except Exception:
            pass

#delete_tables_and_folders()
create_tables()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)