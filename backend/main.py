from user import user_prefixed_router, router as user_router
from fastapi.middleware.cors import CORSMiddleware
from report import router as report_router
from canvas import router as canvas_router
from photo import router as photo_router
from tag import router as tag_router
from fastapi import FastAPI
from db_utlls import *
from auth import *
import logging
import uvicorn

load_dotenv()
app = FastAPI()
for router in [canvas_router, user_router, report_router, photo_router, tag_router, user_prefixed_router]:
    app.include_router(router)

app.add_middleware(CORSMiddleware, allow_origins=[os.getenv('ORIGIN')], allow_credentials=True, allow_methods=["*"],
                   allow_headers=["*"])

#delete_tables_and_folders()
create_tables_and_folders()

if __name__ == "__main__":
    logger = logging.getLogger()
    logger.setLevel(logging.ERROR)
    uvicorn.run(app, host=os.getenv('BACK_DOMAIN'), port=int(os.getenv('BACK_PORT')))