import os

import jwt
from dotenv import load_dotenv
from fastapi import HTTPException, Request
from jwt import PyJWKClient

from app.crud.user_curd import save_user
from app.schemas.user import User

load_dotenv()

COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_REGION = os.getenv("AWS_REGION")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")


def get_sub_from_id_token(id_token) -> tuple | None:
    try:
        jwks_url = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"  # noqa: E501
        jwk_client = PyJWKClient(jwks_url)

        # トークンのヘッダーから`kid`を取得し、該当する公開鍵を取得
        signing_key = jwk_client.get_signing_key_from_jwt(id_token)

        # IDトークンをデコードしてペイロードを取得。
        # 開発環境では微妙に時刻にズレが生じているようなのでleewayで有効期限に余裕を持たせ
        payload = jwt.decode(
            id_token,
            signing_key.key,
            algorithms=["RS256"],
            audience=COGNITO_APP_CLIENT_ID,
            leeway=60,
        )

        # ペイロードからsub（ユーザーID）を取得
        user_id = payload.get("sub")
        email = payload.get("email")
        name = payload.get("cognito:username")

        return user_id, email, name
    except Exception as e:
        print("Error decoding id_token:", e)
        return None


async def create_user_service(user: User):
    save_user(user)


async def get_user_id(request: Request) -> str:
    id_token = request.cookies.get("id_token")
    user_id = request.cookies.get("user_id")

    # 通常のクッキーアクセスで取得できない場合、ヘッダーから手動でパース
    if not id_token or not user_id:
        print("Cookies not found in request.cookies, trying header parsing...")
        cookie_header = request.headers.get("cookie") or request.headers.get("Cookie")
        if cookie_header:
            # 簡単なクッキーパース
            cookies = {}
            for cookie_pair in cookie_header.split(";"):
                if "=" in cookie_pair:
                    name, value = cookie_pair.strip().split("=", 1)
                    cookies[name] = value

            id_token = cookies.get("id_token") or id_token
            user_id = cookies.get("user_id") or user_id
        else:
            print("No cookie header found")

    if not id_token:
        print("ERROR: id_token not found in cookies")
        raise HTTPException(status_code=401, detail="Unauthorized")

    # `user_id`がクッキーにない場合は、`id_token`から取得
    if not user_id:
        print("user_id not in cookies, extracting from id_token")
        user = get_sub_from_id_token(id_token)
        if user:
            user_id, _, _ = user  # user_idだけ使用
        else:
            print("ERROR: Failed to extract user_id from id_token")
            raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user_id
