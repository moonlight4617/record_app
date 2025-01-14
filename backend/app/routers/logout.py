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
        # ドメイン統一したことによって不要になったコード
        # if ENVIRONMENT == "production":
        #     # TODO: domainは環境変数に移動
        #     response.delete_cookie(
        #         key="access_token", domain=".memoapp.jp",
        #     )
        #     response.delete_cookie(
        #         key="id_token", domain=".memoapp.jp",
        #     )
        #     response.delete_cookie(
        #         key="refresh_token", domain=".memoapp.jp",
        #     )
        #     response.delete_cookie(
        #         key="user_id", domain=".memoapp.jp",
        #     )
        # else:
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
