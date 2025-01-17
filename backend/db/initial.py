import os
from pathlib import Path
import shutil
from typing import List
from dotenv import load_dotenv
from fastapi import HTTPException, status
import psycopg2
from .utils import connect_to_db, commit_and_close_db

__all__ = ['create_tables_and_folders', 'delete_tables_and_folders', 'insert_initial_values', 'add_pg_trgm_extension',
           'add_super_admin']
load_dotenv()
UPLOAD_DIR = os.getenv("UPLOAD_DIR")

def create_tables_and_folders() -> None:
    commands = []
    with open('tables.sql', 'r', encoding='utf-8') as fd:
        lines = fd.read().split(';')
        for line in lines:
            line = line.strip()
            if line.startswith('CREATE TABLE IF NOT EXISTS'):
                commands.append(line)
    con, cur = connect_to_db()
    for command in commands:
        cur.execute(command)
    commit_and_close_db(con)
    for folder in ['paints', UPLOAD_DIR]:
        Path(folder).mkdir(exist_ok=True, parents=True)

def delete_tables_and_folders() -> None:
    ans = input('Are you sure you want to delete all tables and folders? Yes / No\n')
    if ans.lower() not in ['yes', 'y']:
        print('Aborted')
        return
    for folder in ['paints', UPLOAD_DIR]:
        try:
            shutil.rmtree(f'{folder}/')
        except FileNotFoundError:
            pass
    con, cur = connect_to_db()
    cur.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public")
    commit_and_close_db(con)

def insert_initial_values(values: List[str], table_name: str) -> None:
    con, cur = connect_to_db()
    for value in values:
        try:
            cur.execute(f"INSERT INTO {table_name} (name) VALUES (%s)", (value,))
            con.commit()
        except psycopg2.Error:
            con, cur = connect_to_db()
    commit_and_close_db(con)

def add_pg_trgm_extension() -> None:
    con, cur = connect_to_db()
    try:
        cur.execute("CREATE EXTENSION pg_trgm;")
    except psycopg2.Error:
        con.close()
        return
    commit_and_close_db(con)

def add_super_admin(username: str) -> None:
    # TODO: Delele function after roles done
    con, cur = connect_to_db()
    cur.execute("SELECT id FROM users WHERE username = %s", (username,))
    res = cur.fetchone()
    if res is None:
        con.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {username} not found")
    user_id = res[0]
    cur.execute("INSERT INTO admins(user_id) VALUES (%s)", (user_id,))
    cur.execute("INSERT INTO super_admins(user_id) VALUES (%s)", (user_id,))
    commit_and_close_db(con)
