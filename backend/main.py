from user import access_router, user_router, register
from fastapi.middleware.cors import CORSMiddleware
from report import router as report_router
from canvas import router as canvas_router
from photo import router as photo_router
from tag import router as tag_router
from like import router as like_router
from classes import User
from fastapi import FastAPI
from db_utils import *
from auth import *
import logging
import uvicorn

logger = logging.getLogger()
logger.setLevel(logging.ERROR)
load_dotenv()
app = FastAPI()
for router in [canvas_router, user_router, report_router, photo_router, tag_router, access_router, like_router]:
    app.include_router(router)

app.add_middleware(CORSMiddleware, allow_origins=[os.getenv('ORIGIN')], allow_credentials=True, allow_methods=["*"],
                   allow_headers=["*"])

#delete_tables_and_folders()
create_tables_and_folders()

tags = ['Christmas', 'Animals', 'Art', 'Beauty', 'Design', 'DIY And Crafts', 'Food And Drink', 'Home Decor',
            'Quotes', 'Travel', 'Tattoos', 'Fantasy', 'Arcane']
insert_initial_tags(tags)

super_admins = os.getenv("SUPER_ADMINS")
if super_admins:
    for super_admin in [i.strip() for i in super_admins.split(',')]:
        try:
            username, password, email = super_admin.split(':')
            register(User(username=username, password=password, email=email))
            add_super_admin(username)
        except Exception as e:
            print(f"Failed to add super admin\n{e}\n")

if __name__ == "__main__":
    uvicorn.run(app, host=os.getenv('BACK_DOMAIN'), port=int(os.getenv('BACK_PORT')))