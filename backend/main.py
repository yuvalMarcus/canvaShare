from imports import *
import canvas
import user

tags_metadata = [
    {
        "name": "get_canvas_by_id",
        "description": "Get specific canvas.",
    },
    {
        "name": "get_canvases_by_filters",
        "description": "Get list of canvases by filters.<br>"
                       "The filters can be username, canvas name, tags.<br>"
                       "The results can be sorted by likes.<br>"
                       "In every request (page) the maximum results is 50.<br>"
                       "To get the rest of results you need to request specific page."
    },
    {
        "name": "like_canvas",
        "description": "Like a canvas or remove like from canvas."
    },
    {
        "name": "get_canvas_likes",
        "description": "Get the number of likes for a canvas."
    },
    {
        "name": "report",
        "description": "Report a canvas or artist."
    },
    {
        "name": "logout_username",
        "description": "This endpoint is for admins to log out users"
    },
    {
        "name": "search_photos_api",
        "description": "Search photos in https://unsplash.com API"
    }
]

app = FastAPI(openapi_tags=tags_metadata)
app.include_router(canvas.router)

@app.post('/report', response_model=Token, tags=["report"])
def create_report(report: Report, jwt_username: str | None = Depends(get_jwt_username)):
    if not (1 <= len(report.description) <= 100):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Report description must be between 1 and 100 characters.")
    con = sqlite3.connect(DB)
    cur = con.cursor()
    if report.type == 'artist' and report.username is not None:
        if is_user_exist(report.username) is False:
            raise_http_exception(con, 404, "User not found")
        report.canvas_id = None
    elif report.type == 'canvas' and report.canvas_id is not None:
        get_canvas_from_db(con, cur, report.canvas_id) # checks if canvas exist
        report.canvas_id, report.username = str(report.canvas_id), None
    else:
        raise_http_exception(con, 400, "Report type must be 'artist' or 'canvas' and their fields cannot be empty")
    cur.execute(f"INSERT INTO reports (report_date, type, canvas_id, username, description) VALUES ({int(time.time())},?,?,?,?)",
                (report.type, report.canvas_id, report.username, report.description))
    con.commit()
    con.close()
    return {"token": generate_token(jwt_username) if jwt_username else None}
        
@app.post('/register', response_model=Token, tags=["register"])
def register(user: User):
    if is_valid_username(user.username) and is_valid_password(user.password) and is_valid_email(user.email):
        tags_id = get_tags_id(user.tags)
        con = sqlite3.connect(DB)
        cur = con.cursor()
        cur.execute("INSERT INTO users (username, hashed_password, email, is_blocked, is_deleted, photo, about, disabled) VALUES (?,?,?,?,?,?,?,?)",
                    (user.username.lower(), get_password_hash(user.password),user.email, 0, 0, None, None, True))
        for tag_id in tags_id:
            cur.execute("INSERT INTO favorite_tags (username, tag_id) VALUES (?,?)", (user.username, tag_id))
        con.commit()
        con.close()
        return {"token": generate_token(user.username)}

@app.post('/login', response_model=Token, tags=["login"])
def login(user: User):
    if is_user_exist(user.username) and user.password:
        con = sqlite3.connect(DB)
        cur = con.cursor()
        res = cur.execute("SELECT hashed_password FROM users WHERE username=? and is_blocked=0", (user.username,)).fetchone()
        if res is None:
            raise HTTPException(status_code=401, detail="User is blocked")
        if verify_password(user.password, hashed_password=res[0]):
            cur.execute("UPDATE users SET disabled=? WHERE username=?", (False, user.username))
            con.commit()
            con.close()
            return {"token": generate_token(user.username)}
        con.close()
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})

@app.post('/logout', tags=["logout"])
def logout(jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    con = sqlite3.connect(DB)
    con.cursor().execute("UPDATE users SET disabled=? WHERE username=?", (True, jwt_username))
    con.commit()
    con.close()
    return {} # should be empty
    
@app.post('/logout/{username}', tags=["logout_username"])
def logout_username(username: str, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    if is_user_exist(username):
        if is_admin(jwt_username):
            con = sqlite3.connect(DB)
            con.cursor().execute("UPDATE users SET disabled=? WHERE username=?", (True, username))
            con.commit()
            con.close()
            return {} # should be empty
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
@app.get('/search_photos', response_model=PhotosSearchResponse, tags=["search_photos_api"])
def search_photos(category: str, jwt_username: str | None = Depends(get_jwt_username)):
    raise_error_if_guest(jwt_username)
    raise_error_if_blocked(jwt_username)
    try:
        api_results = requests.get(f'https://api.unsplash.com/search/photos?query={category}&client_id={API_KEY}').json()
        return {"api_results": api_results, "token": generate_token(jwt_username) if jwt_username else None}
    except Exception:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Rate Limit Exceeded (50 per hour). Try again later.")

@app.post("/upload", tags=["upload"])
def upload_picture(file: UploadFile = File(...)):
    try:
        file_id = uuid4()
        Path(UPLOAD_DIR).mkdir(exist_ok=True, parents=True)
        file_extension = file.filename.split('.')[-1]
        file_path = f"{UPLOAD_DIR}/{file_id}.{file_extension}"
        with Path(file_path).open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"file_path": file_path}
    except Exception:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)

@app.get("/uploaded_files/{file_id}", tags=["get_uploaded_files"])
def uploaded_files(file_id: str):
    file_path = Path(f'{UPLOAD_DIR}/{file_id}')
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"File not found.")
    return FileResponse(file_path)

#delete_tables_and_folders()
create_tables()

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)