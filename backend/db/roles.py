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
    try:
        # Remove all existing
        cur.execute("DELETE FROM user_roles WHERE user_id = %s", (user_id,))
        # Add the new roles list to the user
        for role in roles:
            cur.execute("SELECT id FROM roles WHERE name = %s", (role,))
            res = cur.fetchone()
            if res is not None:
                cur.execute("SELECT * from user_roles WHERE role_id = %s AND user_id = %s", (res[0], user_id))
                if not cur.fetchone():
                    cur.execute("INSERT INTO user_roles(role_id, user_id) VALUES (%s,%s)", (res[0], user_id))
        commit_and_close_db(con)
    except Exception as e:
        con.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"An error occurred, please try again: {str(e)}")
    finally:
        con.close()

def has_role(role: str, user_id: Optional[int] = None, username: Optional[str] = None) -> bool:
    if username and user_id or not (username or user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="user_has_role requires either user_id or username, but not both.")
    if username:
        user_id = get_user_id(username)
        if not user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="User not found")
    con, cur = connect_to_db()
    try:
        # check if the user has the  role
        cur.execute("SELECT 1 FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = %s AND r.name = %s", 
                    (user_id, role))
        return cur.fetchone() is not None
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"An error occurred, please try again: {str(e)}")
    finally:
        con.close()

def get_user_roles(user_id: Optional[int] = None, username: Optional[str] = None) -> List[str]:
    if username and user_id or not (username or user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="get_all_user_roles requires either user_id or username, but not both.")
    if username:
        user_id = get_user_id(username)
        if not user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="User not found")
    con, cur = connect_to_db()
    try:
        cur.execute("SELECT r.name FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = %s", (user_id,))
        roles = [row[0] for row in cur.fetchall()]
        return roles
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"An error occurred, please try again: {str(e)}")
    finally:
        con.close()

def remove_all(user_id: Optional[int] = None, username: Optional[str] = None) -> None:
    if username and user_id or not (username or user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="remove_all_roles_from_user requires either user_id or username, but not both.")

    if username:
        user_id = get_user_id(username)
        if not user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="User not found")
    con, cur = connect_to_db()
    try:
        # Delete all roles
        cur.execute("DELETE FROM user_roles WHERE user_id = %s", (user_id,))
        commit_and_close_db(con)
    except Exception as e:
        con.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"An error occurred, please try again: {str(e)}")
    finally:
        con.close()


