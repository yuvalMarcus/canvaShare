import logging
import os
from psycopg2 import Error as psycopg2Error
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from user import access_router, user_router, register_endpoint
from report import router as report_router
from canvas import router as canvas_router
from photo import router as photo_router
from tag import router as tag_router
from like import router as like_router
from models import User
from db.initial import *
from dotenv import load_dotenv
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
add_pg_trgm_extension()

tags = ['Christmas', 'Animals', 'Art', 'Beauty', 'Design', 'DIY And Crafts', 'Food And Drink', 'Home Decor',
            'Quotes', 'Travel', 'Tattoos', 'Fantasy', 'Arcane']
insert_initial_tags(tags)

super_admins = os.getenv("SUPER_ADMINS")
if super_admins:
    for super_admin in [i.strip() for i in super_admins.split(',')]:
        try:
            username, password, email = super_admin.split(':')
            register_endpoint(User(username=username, password=password, email=email))
            add_super_admin(username)
        except ValueError:
            print("Failed to add super admin\nThe scheme should be username:password:email\n")
        except (psycopg2Error, HTTPException) as e:
            print(f"Failed to add super admin\n{e}\n")


if __name__ == "__main__":
    uvicorn.run(app, host=os.getenv('BACK_DOMAIN'), port=int(os.getenv('BACK_PORT')))
