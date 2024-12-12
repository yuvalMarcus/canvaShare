from auth import check_guest_or_blocked
from fastapi import APIRouter, Depends
from classes import Reports, Report
from db_utlls import *

router = APIRouter(prefix="/report")

@router.post('')
def create_report(report: Report) -> dict:
    if not (1 <= len(report.description) <= 100):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Report description must be between 1 and 100 characters")
    if report.type == 'artist' and type(report.user_id) is int:
        if is_user_exist(user_id=report.user_id) is False:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Username not found")
        report.canvas_id = None
    elif report.type == 'canvas' and type(report.canvas_id) is int:
        get_canvas_from_db(report.canvas_id) # checks if canvas exist
        report.canvas_id, report.user_id = report.canvas_id, None
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Report type must be 'artist' or 'canvas' and their fields cannot be empty")
    insert_report_to_db(report.type, report.canvas_id, report.user_id, report.description)
    return {}

@router.get('', response_model=Reports)
def get_reports(jwt_user_id: int = Depends(check_guest_or_blocked)) -> Reports:
    if is_admin(jwt_user_id):
        reports = []
        for db_report in get_db_reports():
            report = dict()
            (report['id'], report['date'], report['type'], report['canvas_id'], report['user_id'],
             report['description']) = db_report
            reports.append(report)
        return {"reports": reports}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

@router.delete('/{report_id}')
def delete_report(report_id: int, jwt_user_id: int = Depends(check_guest_or_blocked)) -> dict:
    if is_admin(jwt_user_id):
        delete_report_from_db(report_id)
        return {}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")