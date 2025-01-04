import time
from typing import List, Tuple
from fastapi import HTTPException, status
from backend.models import Canvas
from .utils import connect_to_db, commit_and_close_db

__all__ = ['insert_canvas', 'update_canvas', 'delete_canvas', 'get_canvas', 'get_canvas_user_id', 'get_canvases_by_filters',
           'get_canvases_by_tag', 'is_canvas_editor']

def insert_canvas(canvas: Canvas) -> int:
    con, cur = connect_to_db()
    cur.execute("INSERT INTO canvases(user_id, name, is_public, create_date, edit_date, likes, description, photo)"
                " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (canvas.user_id, canvas.name, canvas.is_public, canvas.create_date, canvas.edit_date, canvas.likes,
                 canvas.description, canvas.photo))
    canvas_id = cur.fetchone()[0]
    commit_and_close_db(con)
    return canvas_id

def update_canvas(canvas_id: int, canvas_name: str, is_public: bool, description: str, photo:str) -> None:
    con, cur = connect_to_db()
    cur.execute(f"UPDATE canvases SET name = %s, is_public = %s, edit_date={int(time.time())}, description = %s,"
                f" photo = %s WHERE id = %s",
                (canvas_name, is_public, description, photo, canvas_id))
    commit_and_close_db(con)

def delete_canvas(canvas_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("DELETE FROM canvases WHERE id = %s", (canvas_id,))
    commit_and_close_db(con)

def get_canvas(canvas_id: int) -> Tuple[int, int, str, bool, int, int, int, str, str]:
    con, cur = connect_to_db()
    cur.execute("SELECT * from canvases WHERE id = %s", (canvas_id,))
    res = cur.fetchone()
    con.close()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found")
    return res

def get_canvas_user_id(canvas_id: int) -> int:
    return get_canvas(canvas_id)[1]

def get_canvases_by_filters(args) -> List[Tuple[int, int, str, bool, int, int, int, str, str]]:
    filters = ""
    params = []
    for name, value in args:
        if name == "user_id":
            filters += " AND users.id = %s"
            params.append(value)
        elif name == "canvas_name":
            filters += " AND canvases.name LIKE %s"
            params.append(f'%{value}%')
    con, cur = connect_to_db()
    cur.execute("SELECT canvases.* from canvases, users WHERE canvases.user_id=users.id AND is_blocked=false"
                + filters, (*params,))
    canvases = cur.fetchall()
    con.close()
    return canvases

def get_canvases_by_tag(tag: str) -> List[Tuple[int, int, str, bool, int, int, int, str, str]]:
    con, cur = connect_to_db()
    cur.execute("SELECT canvases.* FROM canvases, tags_of_canvases, tags, users WHERE tags.name = %s "
                "AND canvases.id=tags_of_canvases.canvas_id AND tags.id=tags_of_canvases.tag_id "
                "AND canvases.user_id=users.id AND is_blocked=false", (tag.strip(),))
    canvases = cur.fetchall()
    con.close()
    return canvases

def is_canvas_editor(canvas_id: int, user_id: int) -> bool:
    if user_id is None:
        return False
    con, cur = connect_to_db()
    cur.execute("SELECT user_id FROM canvases WHERE id = %s", (canvas_id,))
    res = cur.fetchone()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found")
    creator_id = res[0]
    cur.execute("SELECT * FROM canvas_editors WHERE canvas_id = %s AND user_id = %s", (canvas_id, user_id))
    if creator_id == user_id or cur.fetchone() is not None:
        con.close()
        return True
    con.close()
    return False
