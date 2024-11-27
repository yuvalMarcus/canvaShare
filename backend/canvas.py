from imports import *
from fastapi import APIRouter

router = APIRouter(prefix="/canvas",tags=["canvas"])


class Canvas(BaseModel):
    id: Optional[UUID] = None
    username: Optional[str] = None
    name: str
    tags: Optional[List[str]] = None
    is_public: bool = False
    create_date: Optional[int] = None
    edit_date: Optional[int] = None
    data: str
    likes: Optional[int] = None

class CanvasesResponse(BaseModel):
    canvases: List[Canvas]
    token: Optional[str] = None
    
class LikesResponse(BaseModel):
    likes: int
    token: Optional[str] = None
    
    
@router.get("/{canvas_id}", response_model=CanvasesResponse, tags=["get_canvas_by_id"])
def get_canvas(canvas_id: UUID, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_blocked(jwt_username)
    con = sqlite3.connect(DB)
    cur = con.cursor()
    canvas = dict()
    (canvas["id"], canvas["username"], canvas["name"] , canvas["is_public"], canvas["create_date"],
     canvas["edit_date"], canvas["likes"]) = get_canvas_from_db(con, cur, canvas_id)
    db_tags = cur.execute(
        "SELECT tags.tag_name FROM tags, tags_of_canvases WHERE canvas_id=? AND tags.tag_id=tags_of_canvases.tag_id",
        (str(canvas_id),)).fetchall()
    canvas["tags"] = [tag[0] for tag in db_tags]
    con.close()
    is_jwt_admin = is_admin(jwt_username)
    if is_jwt_admin is False:
        # If the creator of the canvas is blocked, then their canvas is also blocked from viewing.
        # Only administrators can see blocked canvases.
        raise_error_if_blocked(canvas["username"])

    # If canvas is private (draft), only creator, editors and admins should get it
    if canvas["is_public"] == 0 and is_canvas_editor(canvas_id, jwt_username) is False and is_jwt_admin is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    try:
        with open(f'canvases/{canvas["username"]}/{canvas["id"]}.json', 'r', encoding='utf-8') as fd:
            canvas["data"] = str(json.loads(fd.read()))
    except FileNotFoundError:
        # canvas exist in db but the json file of data not exist.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canvas not found")
    except json.decoder.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JSON Decode Error")
    
    return {"canvases": [canvas], "token": generate_token(jwt_username) if jwt_username else None}

@router.post("/", response_model=Token, tags=["create_canvas"])
def create_canvas(canvas: Canvas, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    con = sqlite3.connect(DB)
    cur = con.cursor()
    # Generate unique id for canvas
    canvas.id = uuid4()
    while cur.execute(f"SELECT * FROM canvases WHERE canvas_id=?", (str(canvas.id),)).fetchall():
        canvas.id = uuid4()

    # Saves canvas in json file
    save_json_data(con, jwt_username, f'canvases/{jwt_username}/{canvas.id}.json', canvas.data)

    cur.execute("INSERT INTO canvases VALUES (?,?,?,?,?,?,?)",(str(canvas.id), str(jwt_username),
                                                               str(canvas.name), canvas.is_public, int(time.time()), 0, 0))
    insert_tags_to_db(cur, canvas, canvas.id)
    con.commit()
    con.close()
    return {"token": generate_token(jwt_username) if jwt_username else None}

@router.put("/{canvas_id}", response_model=Token, tags=["edit_canvas"])
def update_canvas(canvas_id: UUID, canvas: Canvas, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    raise_error_if_blocked(canvas.username) # Cannot edit a blocked creator's canvas

    if is_canvas_editor(canvas_id, jwt_username) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    con = sqlite3.connect(DB)
    cur = con.cursor()
    canvas.username = get_canvas_from_db(con, cur, canvas_id)[1]
    save_json_data(con, canvas.username, f'canvases/{canvas.username}/{canvas_id}.json', canvas.data)
    cur.execute(f"UPDATE canvases SET name=?, is_public=?, edit_date={int(time.time())} WHERE canvas_id=?",
                (str(canvas.name), canvas.is_public, str(canvas_id)))
    # remove old tags
    cur.execute(f"DELETE FROM tags_of_canvases WHERE canvas_id=?", (str(canvas_id),))
    # insert new tags
    insert_tags_to_db(cur, canvas, canvas_id)
    con.commit()
    con.close()
    return {"token": generate_token(jwt_username) if jwt_username else None}

@router.delete("/{canvas_id}", response_model=Token, tags=["delete_canvas"])
def delete_canvas(canvas_id: UUID, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    con = sqlite3.connect(DB)
    cur = con.cursor()
    username = get_canvas_from_db(con, cur, canvas_id)[1]
    # checks if the user is creator of canvas or admin
    if username != jwt_username and is_admin(jwt_username) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    cur.execute("DELETE FROM canvases WHERE canvas_id=?", (str(canvas_id),))
    cur.execute("DELETE FROM canvas_editors WHERE canvas_id=?", (str(canvas_id),))
    cur.execute("DELETE FROM likes WHERE canvas_id=?", (str(canvas_id),))
    cur.execute("DELETE FROM tags_of_canvases WHERE canvas_id=?", (str(canvas_id),))
    con.commit()
    con.close()
    try:
        os.remove(f'canvases/{username}/{canvas_id}.json')
    except Exception:
        pass
    return {"token": generate_token(jwt_username) if jwt_username else None}

@router.get("/", response_model=CanvasesResponse, tags=["get_canvases_by_filters"])
def get_canvases(username: Optional[str] = None, canvas_name: Optional[str] = None, tags: Optional[str] = None,
                 order: Optional[str] = None, page_num: Optional[int] = None, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_blocked(jwt_username)
    if jwt_username is None:
        jwt_username = 'guest' # debug
    all_results = set()
    if page_num is None or page_num < 1 or os.path.isfile(f'canvases/{jwt_username}/explore.json') is False:
        page_num = 1

    if page_num == 1:
        con = sqlite3.connect(DB)
        cur = con.cursor()
        if username is not None:
            # request from artist page
            all_results = all_results.union(set(cur.execute(f"SELECT * from canvases WHERE username=?", (username,)).fetchall()))
        if canvas_name is not None:
            # request from search page
            all_results = all_results.union(set(cur.execute(f"SELECT * from canvases WHERE name LIKE ?", (f'%{canvas_name}%',)).fetchall()))
        if tags is not None:
            # request from explore page
            for tag in tags.split(','):
                all_results = all_results.union(set(cur.execute(f"SELECT canvases.canvas_id, username, name, is_public, "
                                                                f"create_date, edit_date, likes "
                                                                f"FROM canvases, tags_of_canvases, tags "
                                                                f"WHERE tags.tag_name=? "
                                                                f"AND canvases.canvas_id=tags_of_canvases.canvas_id "
                                                                f"AND tags.tag_id=tags_of_canvases.tag_id",
                                                                (tag.strip(), )).fetchall()))
        if len(all_results) == 0:
            all_results = all_results.union(set(cur.execute(f"SELECT * from canvases").fetchall()))
        all_results = list(all_results)
        if order == 'likes':
            # sort canvases by likes from high to low
            all_results.sort(key=lambda x: x[-1], reverse=True)
        else:
            random.shuffle(all_results)
        explore_json = save_explore_json(all_results, jwt_username, cur)
        con.close()
    else:
        explore_json = json.loads(open(f'canvases/{jwt_username}/explore.json', 'r').read())
    return {"canvases": explore_json[page_num*50-50:page_num*50], "token": generate_token(jwt_username) if jwt_username else None}

@router.put('/like/{canvas_id}', response_model=LikesResponse, tags=["like_canvas"])
def like_canvas(canvas_id: UUID, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    con = sqlite3.connect(DB)
    cur = con.cursor()
    canvas_username = get_canvas_from_db(con, cur, canvas_id)[1]
    try:
        raise_error_if_blocked(canvas_username) # Cannot like a blocked creator's canvas.
    except Exception as e:
        con.close()
        raise e
    res = cur.execute("SELECT * from likes WHERE canvas_id=? AND username=?",
                      (str(canvas_id), jwt_username)).fetchone()
    if res is None:
        # like canvas
        cur.execute("INSERT INTO likes VALUES (?,?)", (str(canvas_id), jwt_username))
    else:
        # canvas already liked. unlike canvas
        cur.execute("DELETE FROM likes WHERE canvas_id=? AND username=? ", (str(canvas_id), jwt_username))
    num_of_likes = cur.execute("SELECT COUNT(*) FROM likes WHERE canvas_id=?", (str(canvas_id),)).fetchone()[0]
    cur.execute("UPDATE canvases SET likes=? WHERE canvas_id=?", (num_of_likes, str(canvas_id)))
    con.commit()
    con.close()
    return {"likes": num_of_likes, "token": generate_token(jwt_username) if jwt_username else None}

@router.get('/likes_number/{canvas_id}', tags=["get_canvas_likes"])
def get_canvas_likes_number(canvas_id: UUID):
    con = sqlite3.connect(DB)
    cur = con.cursor()
    get_canvas_from_db(con, cur, canvas_id)  # checks if canvas exist
    num_of_likes = cur.execute("SELECT COUNT(*) FROM likes WHERE canvas_id=?", (str(canvas_id),)).fetchone()[0]
    con.close()
    return {"likes": num_of_likes}
