from canvas import router as canvas_router
from fastapi.middleware.cors import CORSMiddleware
from user import user_prefixed_router,router as user_router
from report import router as report_router
from photo import router as photo_router
from tag import router as tag_router
from fastapi import FastAPI
from db_utlls import *
from auth import *
import logging
import uvicorn

load_dotenv()
FRONT_DOMAIN, FRONT_PORT = os.getenv('FRONT_DOMAIN'), os.getenv('FRONT_PORT')
BACK_DOMAIN, BACK_PORT = os.getenv('BACK_DOMAIN'), int(os.getenv('BACK_PORT'))

app = FastAPI()
app.include_router(canvas_router)
app.include_router(user_router)
app.include_router(report_router)
app.include_router(photo_router)
app.include_router(tag_router)
app.include_router(user_prefixed_router)

origins = [
    f"{FRONT_DOMAIN}:{FRONT_PORT}"
]

app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


delete_tables_and_folders()
create_tables_and_folders()

if __name__ == "__main__":
    logger = logging.getLogger()
    logger.setLevel(logging.ERROR)
    uvicorn.run(app, host=BACK_DOMAIN, port=BACK_PORT)