# main.py
from fastapi import FastAPI
from mangum import Mangum
from .routers import users, login, google_login, google_callback, add_content, get_years, get_year_contents, get_year_best, update_best, edit_content
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
app.include_router(add_content.router)
app.include_router(get_years.router)
app.include_router(get_year_contents.router)
app.include_router(get_year_best.router)
app.include_router(update_best.router)
app.include_router(edit_content.router)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI on Lambda!"}

# Mangum handlerを使用してLambdaに対応
handler = Mangum(app)
