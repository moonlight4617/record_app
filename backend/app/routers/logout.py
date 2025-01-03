import os
from dotenv import load_dotenv
from fastapi import HTTPException, APIRouter
from fastapi.responses import Response

router = APIRouter(prefix="/account")

load_dotenv()

# 環境変数を取得
ENVIRONMENT = os.getenv("ENVIRONMENT", "local")


@router.post("/logout")
def logout(response: Response):
    try:
        if ENVIRONMENT == "production":
            response.delete_cookie(
                key="access_token", path="/", httponly=True, secure=True
            )
            response.delete_cookie(
                key="id_token", path="/", httponly=True, secure=True
            )
            response.delete_cookie(
                key="refresh_token", path="/", httponly=True, secure=True
            )
            response.delete_cookie(
                key="user_id", path="/", httponly=True, secure=True
            )
        else:
            response.delete_cookie(
                key="access_token", httponly=True, samesite="Lax", secure=False
            )
            response.delete_cookie(
                key="id_token", httponly=True, samesite="Lax", secure=False
            )
            response.delete_cookie(
                key="refresh_token",
                httponly=True,
                samesite="Lax",
                secure=False,
            )
            response.delete_cookie(
                key="user_id", httponly=True, samesite="Lax", secure=False
            )
        return {"message": "Successfully logged out"}
    except Exception as e:
        # その他のエラー
        raise HTTPException(status_code=500, detail=str(e))
