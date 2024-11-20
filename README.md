![alt text](logo.png)

## React - installation and running:
1. Install npm
2. Open terminal
3. Navigate to frontend folder with `cd` command
4. Install modules with the command: `npm i`
5. Run the app with the command: `npm run dev`

## Python - installation and running:
1. Install python
2. Open terminal
3. Navigate to backend folder with `cd` command
4.  Install virtualenv package with the command: `python -m pip install virtualenv`
5. Create a new environment with the command: `python -m venv myenv`
6. Activate the environment with the command:  
Mac / Ubuntu:  
    `source myenv/bin/activate`  
Windows:  
    `myenv\Scripts\activate`
7. Install dependencies with the command: `python -m pip install -r requirements.txt`
8. Run the server with the command: `uvicorn main:app --port=8000 --reload`
* For endpoint testing enter to http://127.0.0.1:8000/docs