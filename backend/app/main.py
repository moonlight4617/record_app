# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.routers import (add_content, add_watchlist, delete_watchlist,
                         edit_content, get_recommendation, get_watchlist,
                         get_year_contents, get_years, google_callback,
                         google_login, login, logout, update_best, users)

app = FastAPI()
origins = [
    "http://localhost:3000",
    "https://record-app-moonlight4617s-projects.vercel.app",
    "https://www.memoapp.jp",
    "https://memoapp.jp",
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
app.include_router(update_best.router)
app.include_router(edit_content.router)
app.include_router(logout.router)
app.include_router(add_watchlist.router)
app.include_router(get_watchlist.router)
app.include_router(delete_watchlist.router)
app.include_router(get_recommendation.router)


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI on Lambda!"}


@app.get("/health")
def health_check():
    return {"message": "ok"}


# Mangum handlerを使用してLambdaに対応
handler = Mangum(app)
