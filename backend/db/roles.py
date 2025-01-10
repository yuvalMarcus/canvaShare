from typing import Optional, List
from fastapi import HTTPException, status
from .users import get_user_id
from .utils import connect_to_db, commit_and_close_db

def insert_user_roles(roles: List[str], user_id: Optional[int]=None, username: Optional[str]=None) -> None:
    if username and user_id or not (username or user_id):
        raise HTTPException(status_code=status.HTTP_400_NOT_FOUND,
                            detail="insert_user_roles accept only one argument: user_id or username, not both.")
    if username:
        user_id = get_user_id(username)
        if not user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    con, cur = connect_to_db()
    for role in roles:
        cur.execute("SELECT id FROM roles WHERE name = %s", (role,))
        res = cur.fetchone()
        if res is not None:
            cur.execute("SELECT * from user_roles WHERE role_id = %s AND user_id = %s", (res[0], user_id))
            if not cur.fetchone():
                cur.execute("INSERT INTO user_roles(role_id, user_id) VALUES (%s,%s)", (res[0], user_id))
    commit_and_close_db(con)
