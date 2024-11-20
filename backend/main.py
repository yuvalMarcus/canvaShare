from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
from uuid import UUID, uuid4
import json
import uvicorn
import sqlite3
import time
import os

DB = "database.db"

app = FastAPI()

class Canvas(BaseModel):
    id: Optional[UUID] = None
    username: Optional[str] = None
    name: str
    tags: Optional[str] = None
    is_public: bool = False,
    create_date: Optional[int] = None,
    edit_date: Optional[int] = None,
    data: str



@app.get("/canvas/{canvas_id}", response_model=List[Canvas])
async def get_canvas(canvas_id: UUID):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    res = cur.execute("SELECT * FROM canvases WHERE canvas_id=?", (str(canvas_id),)).fetchone()
    con.close()
    if res is None:
        return []
    canvas = dict()
    canvas["id"], canvas["username"], canvas["name"], canvas["tags"], canvas["is_public"], canvas["create_date"], canvas["edit_date"] = res

    if canvas["is_public"] == 0:
        ###### need to validate jwt and check if the username in jwt have permission to edit or if username is admin.
        ###### if not raise error 401
        pass

    try:
        with open(f'canvases/{canvas["username"]}/{canvas["id"]}.json', 'r', encoding='utf-8') as fd:
            canvas["data"] = str(json.loads(fd.read()))
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Canvas not found")
    except json.decoder.JSONDecodeError:
        raise HTTPException(status_code=400, detail="JSON Decode Error")
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")
    return [canvas]

@app.put("/canvas/{canvas_id}", status_code=201)
async def update_canvas(canvas_id: UUID, canvas: Canvas):
    ###### need to validate jwt and check if the username in jwt exist and not blocked and have permission to edit.
    ###### if not raise 401 error

    con = sqlite3.connect(DB)
    cur = con.cursor()
    res = cur.execute(f"SELECT username from canvases WHERE canvas_id=?",(str(canvas_id),)).fetchone()
    if res is not None:
        canvas.username = res[0]
    else:
        raise_http_exception(con, 404, "Canvas not found")
    save_json_data(con, canvas.username, f'canvases/{canvas.username}/{canvas_id}.json', canvas.data)

    cur.execute(f"UPDATE canvases SET name=?, tags=?, is_public=?, edit_date={int(time.time())} WHERE canvas_id=?",
                (str(canvas.name), str(canvas.tags), canvas.is_public, str(canvas_id))).fetchone()
    con.commit()
    con.close()
    return dict()

@app.post("/canvas/", status_code=201)
async def create_canvas(canvas: Canvas):
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
                                                               str(canvas.name), str(canvas.tags), canvas.is_public,
                                                               int(time.time()), 0))
    con.commit()
    con.close()
    return dict()


def raise_http_exception(con, code, message):
    con.close()
    raise HTTPException(status_code=code, detail=message)


def save_json_data(con, username, canvas_path, data):
    error_code, error_msg = None, None
    Path(f"canvases/{username}").mkdir(parents=True, exist_ok=True) # maybe in windows needs to add '/' prefix
    try:
        data = data.replace('\'', '\"')
        with open(canvas_path, 'w', encoding='utf-8') as fd:
            json.dump(json.loads(data), fd, ensure_ascii=False, indent=4) # raises error if not json, otherwise saves it
    except json.decoder.JSONDecodeError:
        error_code, error_msg = 400, "JSON Decode Error"
    except Exception as e:
        error_code, error_msg = 500, e.__str__()

    if error_code is not None:
        try:
            os.remove(canvas_path)
        except Exception:
            pass
        raise_http_exception(con, error_code, error_msg)


def create_tables():
    con = sqlite3.connect(DB)
    cur = con.cursor()
    create_commands = ["CREATE TABLE users(username TEXT PRIMARY KEY, password TEXT, is_blocked INTEGER)",
                       "CREATE TABLE canvases(canvas_id TEXT PRIMARY KEY, username TEXT, name TEXT, tags TEXT, is_public INTEGER, create_date INTEGER, edit_date INTEGER)",
                       "CREATE TABLE permissions(canvas_id TEXT, username TEXT, type_of_permission TEXT, PRIMARY KEY (canvas_id, username))",
                       "CREATE TABLE likes(canvas_id TEXT, username TEXT, like INTEGER, PRIMARY KEY (canvas_id, username))"]
    for command in create_commands:
        try:
            cur.execute(command)
        except sqlite3.OperationalError:
            pass

# Debug. remove before production
def delete_tables_and_folders():
    import shutil
    try:
        shutil.rmtree('canvases/')
    except Exception:
        pass
    con = sqlite3.connect(DB)
    cur = con.cursor()
    for table in ("users", "canvases", "permissions", "likes"):
        try:
            cur.execute(f"DROP TABLE {table}")
        except Exception:
            pass

# Debug. remove before production
#delete_tables_and_folders()

create_tables()
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


# Update object (json) with only some parameters:
#updated_task = task.copy(update=task_update.dict(exclude_unset=True))

# Notes for myself:
# in table "canvases": dates saved as integer timestamp
# in table "permissions": type_of_permission can be "view" / "edit"
# no need to save path of canvas.json in table because the path is canvases/{username}/{canvas_id}.json
# later need to add option to get canvas if you have permission and not only for creator
