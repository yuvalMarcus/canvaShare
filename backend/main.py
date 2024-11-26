from fastapi import FastAPI, HTTPException, status, Depends , File , UploadFile
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta, UTC
from pydantic import BaseModel
from typing import List, Dict, Optional
from passlib.context import CryptContext
from uuid import UUID, uuid4
from pathlib import Path
from dotenv import load_dotenv
from jose import JWTError, jwt
import requests
import random
import json
import uvicorn
import sqlite3
import time
import re
import os
import shutil


load_dotenv()
ACCESS_TOKEN_EXPIRE_MINUTES = 30
API_KEY = os.getenv('API_KEY')
DB = os.getenv('DB')
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = "HS256"
UPLOAD_DIR = "uploaded_files"


tags_metadata = [
    {
        "name": "get_canvas_by_id",
        "description": "Get specific canvas.",
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
        "name": "logout_username",
        "description": "This endpoint is for admins to log out users"
    },
    {
        "name": "search_photos_api",
        "description": "Search photos in https://unsplash.com API"
    }
]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
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

class CanvasesResponse(BaseModel):
    canvases: List[Canvas]
    token: Optional[str] = None
    
class LikesResponse(BaseModel):
    likes: int
    token: Optional[str] = None
    
class PhotosSearchResponse(BaseModel):
    api_results: Optional[Dict] = None
    token: Optional[str] = None
    
class Token(BaseModel):
    token: Optional[str] = None

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

class Report(BaseModel):
    type: str # canvas / artist
    canvas_id: Optional[UUID] = None
    username: Optional[str] = None
    description: str

class Photo(BaseModel):
    id: Optional[UUID] = None
    file: UploadFile = File(...)

def get_jwt_username(token: str | None = Depends(oauth2_scheme)):
    # jwt authentication, checks if user exist and not disabled
    if token is None:
        return None
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                          detail="Could not validate credentials.",
                                          headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        expiration: int = payload.get("exp")

        if username is None or expiration is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    if is_user_exist(username):
        con = sqlite3.connect(DB)
        cur = con.cursor()
        user_disabled = cur.execute("SELECT disabled FROM users WHERE username = ?", (username,)).fetchone()[0]
        con.close()
        if user_disabled == 0:
            return username
    raise credentials_exception

@app.get("/canvas/{canvas_id}", response_model=CanvasesResponse, tags=["get_canvas_by_id"])
def get_canvas(canvas_id: UUID, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_blocked(jwt_username)
    con = sqlite3.connect(DB)
    cur = con.cursor()
    canvas = dict()
    (canvas["id"], canvas["username"], canvas["name"] , canvas["is_public"], canvas["create_date"],
     canvas["edit_date"], canvas["likes"]) = get_canvas_from_db(con, cur, canvas_id)
    db_tags = cur.execute(
        "SELECT tags.tag_name FROM tags, tags_of_canvases WHERE canvas_id=? AND tags.tag_id=tags_of_canvases.tag_id",
        (str(canvas_id),)).fetchall()
    canvas["tags"] = [tag[0] for tag in db_tags]
    con.close()
    is_jwt_admin = is_admin(jwt_username)
    if is_jwt_admin is False:
        # If the creator of the canvas is blocked, then their canvas is also blocked from viewing.
        # Only administrators can see blocked canvases.
        raise_error_if_blocked(canvas["username"])

    # If canvas is private (draft), only creator, editors and admins should get it
    if canvas["is_public"] == 0 and is_canvas_editor(canvas_id, jwt_username) is False and is_jwt_admin is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    try:
        with open(f'canvases/{canvas["username"]}/{canvas["id"]}.json', 'r', encoding='utf-8') as fd:
            canvas["data"] = str(json.loads(fd.read()))
    except FileNotFoundError:
        # canvas exist in db but the json file of data not exist.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found")
    except json.decoder.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JSON Decode Error")
    
    return {"canvases": [canvas], "token": generate_token(jwt_username) if jwt_username else None}

@app.post("/canvas", response_model=Token, tags=["create_canvas"])
def create_canvas(canvas: Canvas, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    con = sqlite3.connect(DB)
    cur = con.cursor()
    # Generate unique id for canvas
    canvas.id = uuid4()
    while cur.execute(f"SELECT * FROM canvases WHERE canvas_id=?", (str(canvas.id),)).fetchall():
        canvas.id = uuid4()

    # Saves canvas in json file
    save_json_data(con, jwt_username, f'canvases/{jwt_username}/{canvas.id}.json', canvas.data)

    cur.execute("INSERT INTO canvases VALUES (?,?,?,?,?,?,?)",(str(canvas.id), str(jwt_username),
                                                               str(canvas.name), canvas.is_public, int(time.time()), 0, 0))
    insert_tags_to_db(cur, canvas, canvas.id)
    con.commit()
    con.close()
    return {"token": generate_token(jwt_username) if jwt_username else None}

@app.put("/canvas/{canvas_id}", response_model=Token, tags=["edit_canvas"])
def update_canvas(canvas_id: UUID, canvas: Canvas, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    raise_error_if_blocked(canvas.username) # Cannot edit a blocked creator's canvas

    if is_canvas_editor(canvas_id, jwt_username) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
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
    return {"token": generate_token(jwt_username) if jwt_username else None}

@app.delete("/canvas/{canvas_id}", response_model=Token, tags=["delete_canvas"])
def delete_canvas(canvas_id: UUID, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    con = sqlite3.connect(DB)
    cur = con.cursor()
    username = get_canvas_from_db(con, cur, canvas_id)[1]
    # checks if the user is creator of canvas or admin
    if username != jwt_username and is_admin(jwt_username) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    cur.execute("DELETE FROM canvases WHERE canvas_id=?", (str(canvas_id),))
    cur.execute("DELETE FROM canvas_editors WHERE canvas_id=?", (str(canvas_id),))
    cur.execute("DELETE FROM likes WHERE canvas_id=?", (str(canvas_id),))
    cur.execute("DELETE FROM tags_of_canvases WHERE canvas_id=?", (str(canvas_id),))
    con.commit()
    con.close()
    try:
        os.remove(f'canvases/{username}/{canvas_id}.json')
    except Exception:
        pass
    return {"token": generate_token(jwt_username) if jwt_username else None}

@app.get("/canvas", response_model=CanvasesResponse, tags=["get_canvases_by_filters"])
def get_canvases(username: Optional[str] = None, canvas_name: Optional[str] = None, tags: Optional[str] = None,
                 order: Optional[str] = None, page_num: Optional[int] = None, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_blocked(jwt_username)
    if jwt_username is None:
        jwt_username = 'guest' # debug
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
    return {"canvases": explore_json[page_num*50-50:page_num*50], "token": generate_token(jwt_username) if jwt_username else None}

@app.put('/canvas/like/{canvas_id}', response_model=LikesResponse, tags=["like_canvas"])
def like_canvas(canvas_id: UUID, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    con = sqlite3.connect(DB)
    cur = con.cursor()
    canvas_username = get_canvas_from_db(con, cur, canvas_id)[1]
    try:
        raise_error_if_blocked(canvas_username) # Cannot like a blocked creator's canvas.
    except Exception as e:
        con.close()
        raise e
    res = cur.execute("SELECT * from likes WHERE canvas_id=? AND username=?",
                      (str(canvas_id), jwt_username)).fetchone()
    if res is None:
        # like canvas
        cur.execute("INSERT INTO likes VALUES (?,?)", (str(canvas_id), jwt_username))
    else:
        # canvas already liked. unlike canvas
        cur.execute("DELETE FROM likes WHERE canvas_id=? AND username=? ", (str(canvas_id), jwt_username))
    num_of_likes = cur.execute("SELECT COUNT(*) FROM likes WHERE canvas_id=?", (str(canvas_id),)).fetchone()[0]
    cur.execute("UPDATE canvases SET likes=? WHERE canvas_id=?", (num_of_likes, str(canvas_id)))
    con.commit()
    con.close()
    return {"likes": num_of_likes, "token": generate_token(jwt_username) if jwt_username else None}

@app.get('/canvas/likes_number/{canvas_id}', tags=["get_canvas_likes"])
def get_canvas_likes_number(canvas_id: UUID):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    get_canvas_from_db(con, cur, canvas_id)  # checks if canvas exist
    num_of_likes = cur.execute("SELECT COUNT(*) FROM likes WHERE canvas_id=?", (str(canvas_id),)).fetchone()[0]
    con.close()
    return {"likes": num_of_likes}

@app.post('/report', response_model=Token, tags=["report"])
def create_report(report: Report, jwt_username: str | None = Depends(get_jwt_username)):
    if not (1 <= len(report.description) <= 100):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Report description must be between 1 and 100 characters.")
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
    return {"token": generate_token(jwt_username) if jwt_username else None}
        
@app.post('/register', response_model=Token, tags=["register"])
def register(user: User):
    if is_valid_username(user.username) and is_valid_password(user.password) and is_valid_email(user.email):
        tags_id = get_tags_id(user.tags)
        con = sqlite3.connect(DB)
        cur = con.cursor()
        cur.execute("INSERT INTO users (username, hashed_password, email, is_blocked, is_deleted, photo, about, disabled) VALUES (?,?,?,?,?,?,?,?)",
                    (user.username.lower(), get_password_hash(user.password),user.email, 0, 0, None, None, True))
        for tag_id in tags_id:
            cur.execute("INSERT INTO favorite_tags (username, tag_id) VALUES (?,?)", (user.username, tag_id))
        con.commit()
        con.close()
        return {"token": generate_token(user.username)}

@app.post('/login', response_model=Token, tags=["login"])
def login(user: User):
    if is_user_exist(user.username) and user.password:
        con = sqlite3.connect(DB)
        cur = con.cursor()
        res = cur.execute("SELECT hashed_password FROM users WHERE username=? and is_blocked=0", (user.username,)).fetchone()
        if res is None:
            raise HTTPException(status_code=401, detail="User is blocked")
        if verify_password(user.password, hashed_password=res[0]):
            cur.execute("UPDATE users SET disabled=? WHERE username=?", (False, user.username))
            con.commit()
            con.close()
            return {"token": generate_token(user.username)}
        con.close()
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})

@app.post('/logout', tags=["logout"])
def logout(jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    con = sqlite3.connect(DB)
    con.cursor().execute("UPDATE users SET disabled=? WHERE username=?", (True, jwt_username))
    con.commit()
    con.close()
    return {} # should be empty
    
@app.post('/logout/{username}', tags=["logout_username"])
def logout_username(username: str, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    if is_user_exist(username):
        if is_admin(jwt_username):
            con = sqlite3.connect(DB)
            con.cursor().execute("UPDATE users SET disabled=? WHERE username=?", (True, username))
            con.commit()
            con.close()
            return {} # should be empty
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
@app.get('/search_photos', response_model=PhotosSearchResponse, tags=["search_photos_api"])
def search_photos(category: str, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    try:
        api_results = requests.get(f'https://api.unsplash.com/search/photos?query={category}&client_id={API_KEY}').json()
        return {"api_results": api_results, "token": generate_token(jwt_username) if jwt_username else None}
    except Exception:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Rate Limit Exceeded (50 per hour). Try again later.")

@app.post("/upload", tags=["upload"])
def upload_picture(file: UploadFile = File(...)):
    try:
        file_id = uuid4()
        Path(UPLOAD_DIR).mkdir(exist_ok=True, parents=True)
        file_extension = file.filename.split('.')[-1]
        file_path = f"{UPLOAD_DIR}/{file_id}.{file_extension}"
        with Path(file_path).open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"file_path": file_path}
    except Exception:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)

@app.get("/uploaded_files/{file_id}", tags=["get_uploaded_files"])
async def uploaded_files(file_id: str):
    file_path = Path(f'{UPLOAD_DIR}/{file_id}')
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"File not found.")
    return FileResponse(file_path)

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

def is_valid_password(password):
    if (password is not None and 6 <= len(password) <= 50 and re.search(r'[0-9]', password)
            and re.search(r'[A-Z]', password) and re.search(r'[a-z]', password)
            and re.search(r'[!@#$%^&*_+\-=]', password)):
        return True
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid password")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def is_valid_username(username):
    if is_user_exist(username) is True:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User {username} already exists")
    if 3 <= len(username) <= 20 and username.isalnum():
        return True
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username")

def is_valid_email(email):
    if email is not None and re.search(r"^\S+@\S+\.\S+$", email):
        return True
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email")

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
    res = cur.execute(f"SELECT * from canvases WHERE canvas_id=?", (str(canvas_id),)).fetchone()
    if res is None:
        raise_http_exception(con, 404, "Canvas not found")
    return res

def is_canvas_editor(canvas_id, username):
    if username is None:
        return False
    con = sqlite3.connect(DB)
    cur = con.cursor()
    creator = cur.execute("SELECT username FROM canvases WHERE canvas_id=?", (canvas_id,)).fetchone()[0]
    if creator == username or cur.execute("SELECT * FROM canvas_editors WHERE canvas_id=? AND username=?",
                                             (canvas_id, username)).fetchone() is not None:
        con.close()
        return True
    con.close()
    return False

def raise_error_if_guest(username):
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
def raise_error_if_blocked(username):
    if username is None:
        return
    con = sqlite3.connect(DB)
    cur = con.cursor()
    if not cur.execute("SELECT * FROM users WHERE username=? AND is_blocked=0", (username,)).fetchall():
        raise_http_exception(con, 401, "Username not found or blocked.")
    con.close()

def create_tables():
    con = sqlite3.connect(DB)
    cur = con.cursor()
    create_commands = ["CREATE TABLE users(username TEXT PRIMARY KEY, hashed_password TEXT, email TEXT, is_blocked INTEGER,"
                       " is_deleted INTEGER, photo TEXT, about TEXT, disabled INTEGER)",
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

def delete_tables_and_folders():
    try:
        shutil.rmtree('canvases/')
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

def generate_token(username: str | None):
    if username is None:
        return ''
    to_encode = {"username": username}
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

#delete_tables_and_folders()
create_tables()

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)