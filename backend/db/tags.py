from typing import List, Tuple
from fastapi import HTTPException, status
from backend.models import Paint
from .utils import connect_to_db, commit_and_close_db

def get_tags() -> List[dict]:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM tags")
    tags = cur.fetchall()
    con.close()
    return tags

def get_paint_tags(paint_id: int) -> List[str]:
    con, cur = connect_to_db()
    cur.execute(
        "SELECT tags.name FROM tags, tags_of_paints WHERE paint_id = %s AND tags.id=tags_of_paints.tag_id",
        (paint_id,))
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
            continue
        tags_id.append(res[0])
    con.close()
    return tags_id

def get_tag_by_id(tag_id: int) -> Tuple[int, str] | None:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM tags WHERE tags.id = %s", (tag_id,))
    tag = cur.fetchone()
    con.close()
    return tag

def insert_tag(tag_name: str) -> None:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM tags WHERE name = %s", (tag_name,))
    if cur.fetchone():
        con.close()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Tag {tag_name} already exists")
    cur.execute("INSERT INTO tags(name) VALUES (%s)",(tag_name,))
    con.commit()
    con.close()

def insert_paint_tags(paint: Paint, paint_id: int) -> None:
    con, cur = connect_to_db()
    for tag in paint.tags:
        # checks if tag exist in db. if not create new tag and then add this tag to paint.
        cur.execute("SELECT id FROM tags WHERE name = %s", (tag,))
        res = cur.fetchone()
        if res is None:
            # create new tag in db
            cur.execute("INSERT INTO tags(name) VALUES (%s) RETURNING id", (tag,))
            res = cur.fetchone()
        tag_id = res[0]
        cur.execute("INSERT INTO tags_of_paints VALUES (%s,%s)", (paint_id, tag_id))
    commit_and_close_db(con)

def delete_tag(tag_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("DELETE FROM tags WHERE id = %s ", (tag_id,))
    commit_and_close_db(con)

def remove_paint_tags(paint_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("DELETE FROM tags_of_paints WHERE paint_id = %s", (paint_id,))
    commit_and_close_db(con)

def delete_favorite_tags(user_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("DELETE FROM favorite_tags WHERE user_id = %s", (user_id,))
    commit_and_close_db(con)

def insert_favorite_tags(user_id: int, tags_id: List[int]) -> None:
    con, cur = connect_to_db()
    for tag_id in tags_id:
        cur.execute("INSERT INTO favorite_tags (user_id, tag_id) VALUES (%s,%s)", (user_id, tag_id))
    commit_and_close_db(con)

def get_favorite_tags(user_id: int) -> List[str]:
    con, cur = connect_to_db()
    cur.execute("SELECT tags.name FROM favorite_tags, tags WHERE user_id = %s AND tags.id = tag_id", (user_id,))
    res = cur.fetchall()
    con.close()
    return [tag[0] for tag in res]
