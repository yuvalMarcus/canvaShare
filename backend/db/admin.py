from .utils import connect_to_db

def is_admin(user_id: int) -> bool:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM admins WHERE user_id = %s", (user_id,))
    flag = bool(cur.fetchone())
    con.close()
    return flag

def is_super_admin(user_id: int) -> bool:
    con, cur = connect_to_db()
    cur.execute("SELECT * FROM super_admins WHERE user_id = %s", (user_id,))
    flag = bool(cur.fetchone())
    con.close()
    return flag

# def update_admin(user_id: int, admin_flag: bool) -> None:
#     con, cur = connect_to_db()
#     try:
#         if admin_flag is True:
#             cur.execute("INSERT INTO admins(user_id) VALUES (%s)", (user_id,))
#         else:
#             cur.execute("DELETE FROM admins WHERE user_id = %s", (user_id,))
#     except Exception:
#         pass
#     commit_and_close_db(con)
