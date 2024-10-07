# main.py
from fastapi import FastAPI
from mangum import Mangum
from .routers import users

app = FastAPI()

app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI on Lambda!"}

@app.get("/test")
def read_root():
    return {"message": "Hello Test!"}


# Mangum handlerを使用してLambdaに対応
handler = Mangum(app)
