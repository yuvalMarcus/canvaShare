from auth import check_guest_or_blocked
from fastapi import APIRouter, Depends, HTTPException, status
from models import Reports, Report
from db.reports import *
from db.admin import is_admin
from db.users import is_user_exist
from db.canvases import get_canvas

router = APIRouter(prefix="/report")

@router.post('')
def create_report_endpoint(report: Report) -> dict:
    if report.type == 'artist' and isinstance(report.user_id, int):
        if is_user_exist(user_id=report.user_id) is False:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Username not found")
        report.canvas_id = None
    elif report.type == 'canvas' and isinstance(report.canvas_id, int):
        get_canvas(report.canvas_id) # checks if canvas exist
        report.canvas_id, report.user_id = report.canvas_id, None
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Both fields (user_id, canvas_id) cannot be null")
    insert_report(report.type, report.canvas_id, report.user_id, report.description)
    return {}

@router.get('', response_model=Reports)
def get_reports_endpoint(jwt_user_id: int = Depends(check_guest_or_blocked)) -> Reports:
    if is_admin(jwt_user_id):
        reports = []
        for db_report in get_reports():
            report = {}
            (report['id'], report['date'], report['type'], report['canvas_id'], report['user_id'],
             report['description']) = db_report
            reports.append(report)
        return {"reports": reports}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

@router.delete('/{report_id}')
def delete_report_endpoint(report_id: int, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    if is_admin(jwt_user_id):
        delete_report(report_id)
        return {}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
