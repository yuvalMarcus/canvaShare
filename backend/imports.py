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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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

