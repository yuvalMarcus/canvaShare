from auth import get_jwt_username, check_guest_or_blocked
from fastapi import APIRouter, Depends
from typing import Optional, List
from pydantic import BaseModel
from db_utlls import *
from uuid import UUID

router = APIRouter(prefix="/report")

class Report(BaseModel):
    id: Optional[int] = None
    date: Optional[int] = None
    type: str  # canvas / artist
    canvas_id: Optional[UUID] = None
    username: Optional[str] = None
    description: str

class Reports(BaseModel):
    reports: List[Report]

@router.post('')
def create_report(report: Report, jwt_username: str | None = Depends(get_jwt_username)):
    if not (1 <= len(report.description) <= 100):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Report description must be between 1 and 100 characters")
    if not (3 <= len(report.username) <= 20 and report.username.isalnum()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username")
    if report.type == 'artist' and report.username is not None:
        if is_user_exist(report.username) is False:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Username not found")
        report.canvas_id = None
    elif report.type == 'canvas' and report.canvas_id is not None:
        report.canvas_id = str(report.canvas_id)
        get_canvas_from_db(report.canvas_id) # checks if canvas exist
        report.canvas_id, report.username = report.canvas_id, None
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Report type must be 'artist' or 'canvas' and their fields cannot be empty")
    insert_report_to_db(report.type, report.canvas_id, report.username, report.description)
    return {}

@router.get('', response_model=Reports)
def get_reports(jwt_username: str = Depends(check_guest_or_blocked)):
    if is_admin(jwt_username):
        reports = []
        for db_report in get_db_reports():
            report = dict()
            (report['id'], report['date'], report['type'], report['canvas_id'], report['username'],
             report['description']) = db_report
            reports.append(report)
        return {"reports": reports}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

@router.delete('/{report_id}')
def delete_report(report_id: int, jwt_username: str = Depends(check_guest_or_blocked)):
    if is_admin(jwt_username):
        delete_report_from_db(report_id)
        return {}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")