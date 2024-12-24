import os
from dotenv import load_dotenv
from fastapi import HTTPException, status
import psycopg2

load_dotenv()
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

def connect_to_db() -> tuple:
    con = psycopg2.connect(database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
    cur = con.cursor()
    return con, cur

def commit_and_close_db(con) -> None:
    con.commit()
    con.close()

def raise_error_if_guest(user_id: int | None) -> None:
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

def raise_error_if_blocked(user_id: int | None) -> None:
    if user_id is None:
        return # If the user is guest do not raise error
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM users WHERE id = %s AND is_blocked=False", (user_id,))
    if not cur.fetchall():
        con.close()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is blocked")
    con.close()
