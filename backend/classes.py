from pydantic import BaseModel
from typing import Optional, List

class Token(BaseModel):
    token: str

class Tokens(BaseModel):
    user_id: int
    token: str
    refresh_token: str

class Canvas(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    username: Optional[str] = None
    profile_photo: Optional[str] = None
    name: str
    tags: Optional[List[str]] = None
    is_public: bool
    create_date: Optional[int] = None
    edit_date: Optional[int] = None
    data: str
    likes: Optional[int] = None
    description: Optional[str] = None
    photo: str

class Canvases(BaseModel):
    canvases: List[Canvas]

class Like(BaseModel):
    id: Optional[int] = None
    canvas_id: int
    user_id: Optional[int] = None

class Likes(BaseModel):
    results: List[Like]

class Report(BaseModel):
    id: Optional[int] = None
    date: Optional[int] = None
    type: str  # canvas / artist
    canvas_id: Optional[int] = None
    user_id: Optional[int] = None
    description: str

class Reports(BaseModel):
    reports: List[Report]

class Tag(BaseModel):
    id: Optional[int] = None
    name: str

class Tags(BaseModel):
    tags: List[Tag]

class User(BaseModel):
    id: Optional[int] = None
    username: str
    password: Optional[str] = None
    email: Optional[str] = None
    tags: Optional[List[str]] = None
    is_blocked: Optional[bool] = False
    is_admin: Optional[bool] = False
    is_super_admin: Optional[bool] = False
    profile_photo: Optional[str] = None
    cover_photo: Optional[str] = None
    about: Optional[str] = None
