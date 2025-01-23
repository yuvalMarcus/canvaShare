import time
from typing import List, Tuple, Literal
from fastapi import HTTPException, status
from .utils import connect_to_db, commit_and_close_db

def insert_report(report_type: Literal['artist', 'artist'], paint_id: int | None,
                        user_id: int | None, description: str) -> None:
    con, cur = connect_to_db()
    cur.execute(
        f"INSERT INTO reports (date, type, paint_id, user_id, description) VALUES ({int(time.time())},%s,%s,%s,%s)",
        (report_type, paint_id, user_id, description))
    commit_and_close_db(con)

def get_reports() -> List[Tuple[int, int, str, int | None, int | None, str]]:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM reports")
    res = cur.fetchall()
    con.close()
    return res

def delete_report(report_id: int) -> None:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM reports WHERE id = %s", (report_id,))
    if cur.fetchone() is None:
        con.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    cur.execute("DELETE FROM reports WHERE id = %s", (report_id,))
    commit_and_close_db(con)
    con.close()
