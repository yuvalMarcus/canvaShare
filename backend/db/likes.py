from typing import List, Tuple, Optional
from fastapi import HTTPException, status
from .utils import connect_to_db, commit_and_close_db

def like_or_unlike_canvas(user_id: int, like_flag: bool, like_id: Optional[int]=None, canvas_id: Optional[int]=None) -> None:
    con, cur = connect_to_db()
    if like_flag is True:
        # like canvas
        cur.execute("SELECT * from likes WHERE canvas_id = %s AND user_id = %s", (canvas_id, user_id))
        res = cur.fetchone()
        if res is None:
            cur.execute("INSERT INTO likes(canvas_id, user_id) VALUES (%s,%s)", (canvas_id, user_id))
    if like_flag is False:
        # unlike canvas
        cur.execute("SELECT canvas_id FROM likes WHERE id = %s", (like_id,))
        res = cur.fetchone()
        if res is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Like not found")
        canvas_id = res[0]
        cur.execute("DELETE FROM likes WHERE id = %s AND user_id = %s ", (like_id, user_id))
    con.commit()
    cur.execute("SELECT COUNT(*) FROM likes WHERE canvas_id = %s", (canvas_id,))
    num_of_likes = cur.fetchone()[0]
    cur.execute("UPDATE canvases SET likes = %s WHERE id = %s", (num_of_likes, canvas_id))
    commit_and_close_db(con)

def get_likes(canvas_id: Optional[int] = None, user_id: Optional[int] = None) -> List[Tuple[int, int, int]]:
    filters = ""
    params = []
    if canvas_id:
        filters += " AND canvas_id = %s"
        params.append(canvas_id)
    if user_id:
        filters += " AND user_id = %s"
        params.append(user_id)
    con, cur = connect_to_db()
    cur.execute(f"SELECT * from likes WHERE 1=1{filters}", (*params,))
    res = cur.fetchall()
    con.close()
    return res
