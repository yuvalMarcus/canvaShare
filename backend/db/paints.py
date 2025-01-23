import time
from typing import List, Tuple
from fastapi import HTTPException, status
from backend.models import Paint, UpdatePaint
from .utils import connect_to_db, commit_and_close_db

def insert_paint(paint: Paint) -> int:
    con, cur = connect_to_db()
    cur.execute("INSERT INTO paints(user_id, name, is_public, create_date, edit_date, likes, description, photo)"
                " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (paint.user_id, paint.name, paint.is_public, paint.create_date, paint.edit_date, paint.likes,
                 paint.description, paint.photo))
    paint_id = cur.fetchone()[0]
    commit_and_close_db(con)
    return paint_id

def update_paint(paint: UpdatePaint):
    con, cur = connect_to_db()
    updates, params = [], []
    paint_model_dump = paint.model_dump()
    for key in paint_model_dump:
        if paint_model_dump[key] is not None and key != 'paint_id':
            updates.append(f"{key} = %s")
            params.append(paint_model_dump[key])

    if updates:
        updates.append(f"edit_date={int(time.time())}")
        query = f"UPDATE paints SET {', '.join(updates)} WHERE id = %s"
        params.append(paint_model_dump['paint_id'])
        cur.execute(query, tuple(params))
        commit_and_close_db(con)


def delete_paint(paint_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("DELETE FROM paints WHERE id = %s", (paint_id,))
    commit_and_close_db(con)

def get_paint(paint_id: int) -> Tuple[int, int, str, bool, int, int, int, str, str]:
    con, cur = connect_to_db()
    cur.execute("SELECT * from paints WHERE id = %s", (paint_id,))
    res = cur.fetchone()
    con.close()
    if res is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paint not found")
    return res

def get_paint_user_id(paint_id: int) -> int:
    return get_paint(paint_id)[1]

def get_paints_by_filters(args) -> List[Tuple[int, int, str, bool, int, int, int, str, str]]:
    filters = ""
    params = []
    for name, value in args:
        if name == "user_id":
            filters += " AND users.id = %s"
            params.append(value)
        elif name == "paint_name":
            filters += " AND SIMILARITY(paints.name, %s) > 0.2"
            params.append(value)
    con, cur = connect_to_db()
    cur.execute("SELECT paints.* from paints, users WHERE paints.user_id=users.id AND is_blocked=false"
                + filters, (*params,))
    paints = cur.fetchall()
    con.close()
    return paints

def get_paints_by_tag(tag: str) -> List[Tuple[int, int, str, bool, int, int, int, str, str]]:
    con, cur = connect_to_db()
    cur.execute("SELECT paints.* FROM paints, tags_of_paints, tags, users WHERE tags.name = %s "
                "AND paints.id=tags_of_paints.paint_id AND tags.id=tags_of_paints.tag_id "
                "AND paints.user_id=users.id AND is_blocked=false", (tag.strip(),))
    paints = cur.fetchall()
    con.close()
    return paints
