# main.py
from fastapi import FastAPI
from mangum import Mangum
from .routers import users
from .routers import login
from .routers import google_login
from .routers import google_callback
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = [
    "http://localhost:3000",  # フロントエンドのURLを指定
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # フロントエンドのオリジンを許可
    allow_credentials=True,
    allow_methods=["*"],  # 全てのHTTPメソッドを許可
    allow_headers=["*"],  # 全てのヘッダーを許可
)

app.include_router(users.router)
app.include_router(login.router)
app.include_router(google_login.router)
app.include_router(google_callback.router)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI on Lambda!"}

# Mangum handlerを使用してLambdaに対応
handler = Mangum(app)
