from fastapi import HTTPException, Request
from app.crud.user_curd import save_user
from app.schemas.user import User
import jwt, os
from jwt import PyJWKClient

COGNITO_USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID')
COGNITO_REGION = os.getenv('AWS_REGION')
COGNITO_APP_CLIENT_ID = os.getenv('COGNITO_APP_CLIENT_ID')

def get_sub_from_id_token(id_token) -> tuple | None:
    try:
        jwks_url = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"
        jwk_client = PyJWKClient(jwks_url)

        # トークンのヘッダーから`kid`を取得し、該当する公開鍵を取得
        signing_key = jwk_client.get_signing_key_from_jwt(id_token)

        # TODO: IDトークンをデコードしてペイロードを取得。開発環境では微妙に時刻にズレが生じているようなのでleewayで有効期限に余裕を持たせ
        payload = jwt.decode(id_token, signing_key.key, algorithms=["RS256"], audience=COGNITO_APP_CLIENT_ID, leeway=60)

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

    if not id_token:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # `user_id`がクッキーにない場合は、`id_token`から取得
    if not user_id:
        user = get_sub_from_id_token(id_token)
        user_id, _, _ = user  # user_idだけ使用
    return user_id
