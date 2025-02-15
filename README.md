![alt text](logo.png)

## React - installation and running:
1. Install npm
2. Open terminal and navigate to frontend folder with `cd` command
3. Install modules with the command: `npm i`

## Python - installation and running:
1. Install python (less than or equal to python 3.12)
2. Open terminal and navigate to backend folder with `cd` command
3. Create a new environment with the command: `python -m venv myenv`
4. Activate the environment with the command:  
Mac / Ubuntu:  
    `source myenv/bin/activate`  
Windows:  
    `myenv\Scripts\activate`
5. Install dependencies with the command: `python -m pip install -r requirements.txt`

## Database - installation and running:
1. Create a database using postgresql called canvaShare.

## Run Project - installation and running:
1. Update the env file according to the database and environment details on your computer (DB_NAME, DB_PASS, DB_PORT, SUPER_ADMINS).
2. Run the server with the command or run main file (Python): `uvicorn main:app --port=8000 --reload`
3. Run the app with the command (React): `npm run dev`

Endpoints documentation: http://127.0.0.1:8000/docs
