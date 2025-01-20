from typing import Optional, List, Annotated, Literal, Tuple
from fastapi import Query
from pydantic import BaseModel

class Token(BaseModel):
    token: str

class Tokens(BaseModel):
    user_id: int
    token: str
    refresh_token: str

class Paint(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    username: Optional[str] = None
    profile_photo: Optional[str] = None
    name: Annotated[Optional[str], Query(max_length=100)] = None
    tags: Optional[List[Annotated[str, Query(min_length=1, max_length=50, pattern=r"^[^,]+$")]]] = None
    is_public: Optional[bool] = None
    create_date: Optional[int] = None
    edit_date: Optional[int] = None
    data: Optional[str] | dict = None
    likes: Optional[int] = None
    description: Annotated[Optional[str], Query(max_length=250)] = None
    photo: Annotated[Optional[str], Query(max_length=250)] = None

class Paints(BaseModel):
    next: Optional[int] = None
    prev: Optional[int] = None
    results: List[Paint]

class PaintQueries(BaseModel):
    user_id: Optional[int] = None
    paint_name: Optional[str] = None
    tags: Optional[str] = None

class Like(BaseModel):
    id: Optional[int] = None
    paint_id: int
    user_id: Optional[int] = None

class Likes(BaseModel):
    results: List[Like]

class Report(BaseModel):
    id: Optional[int] = None
    date: Optional[int] = None
    type: Literal['paint', 'artist']
    paint_id: Optional[int] = None
    user_id: Optional[int] = None
    description: Annotated[str, Query(min_length=1, max_length=250)]

class Reports(BaseModel):
    reports: List[Report]

class Tag(BaseModel):
    id: Optional[int] = None
    name: Annotated[str, Query(min_length=1, max_length=50, pattern=r"^[^,]+$")]

class Tags(BaseModel):
    tags: List[Tag]

class User(BaseModel):
    id: Optional[int] = None # no need to validate
    username: Annotated[Optional[str], Query(min_length=3, max_length=20, pattern=r"^[a-z0-9]*$")] = None
    password: Annotated[Optional[str], Query(min_length=3, max_length=50)] = None
    email: Annotated[Optional[str], Query(min_length=6, max_length=50, pattern=r"^\S+@\S+\.\S+$")] = None
    tags: Optional[List[Annotated[str, Query(min_length=1, max_length=50, pattern=r"^[^,]+$")]]] = None
    is_blocked: Optional[bool] = False
    profile_photo: Annotated[Optional[str], Query(max_length=250)] = None
    cover_photo: Annotated[Optional[str], Query(max_length=250)] = None
    about: Annotated[Optional[str], Query(max_length=250)] = None
    roles: Optional[List[str]] = None

class UpdateUser(BaseModel):
    user_id: int
    username: Optional[str] = None
    hashed_password: Optional[str] = None
    email: Optional[str] = None
    is_blocked: Optional[bool] = None
    profile_photo: Optional[str] = None
    cover_photo: Optional[str] = None
    about: Optional[str] = None

UserTuple = Tuple[int, str, str, str, bool, str, str, str, bool]
