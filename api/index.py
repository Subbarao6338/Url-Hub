from fastapi import FastAPI
import sqlite3
import os

app = FastAPI()

@app.get("/api/hello")
def hello():
    return {"message": "Hello from Python on Vercel!"}

@app.get("/api/data")
def get_data():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'sample.db')
    if not os.path.exists(db_path):
        return {"error": f"Database not found at {db_path}"}

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM items")
        rows = cursor.fetchall()
        conn.close()
        return {"items": rows}
    except Exception as e:
        return {"error": str(e)}
