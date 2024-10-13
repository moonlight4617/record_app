from fastapi import HTTPException, Response, APIRouter
from pydantic import BaseModel
import boto3

router = APIRouter(prefix="/account",)

# Cognito設定
COGNITO_REGION = "ap-northeast-1"  # リージョン
COGNITO_USER_POOL_ID = "ap-northeast-1_opoYPW1ze"  # ユーザープールID
COGNITO_APP_CLIENT_ID = "56tvselb1i26o0bi4c748tk64g"  # アプリクライアントID

# Boto3クライアント作成
client = boto3.client('cognito-idp', region_name=COGNITO_REGION)

# リクエスト用のデータモデル
class AuthRequest(BaseModel):
    username: str
    password: str

@router.post("/login/", tags=["account"])
async def login(auth_request: AuthRequest, response: Response):
    try:
        # Cognitoに対して認証リクエストを実行
        response = client.initiate_auth(
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': auth_request.username,
                'PASSWORD': auth_request.password
            },
            ClientId=COGNITO_APP_CLIENT_ID
        )

        # 認証に成功したらトークンを取得
        id_token = response['AuthenticationResult']['IdToken']
        access_token = response['AuthenticationResult']['AccessToken']
        refresh_token = response['AuthenticationResult']['RefreshToken']

        response.set_cookie(
          key="access_token",
          value=access_token,
          max_age=3600,
          httponly=True,
          # secure=True,    # Secure属性 (HTTPSでのみ送信)
          samesite='Strict'
        )

        # トークンをフロントエンドに返す
        return {
            "id_token": id_token,
            "access_token": access_token,
            "refresh_token": refresh_token
        }

    except client.exceptions.NotAuthorizedException:
        # 認証エラー
        raise HTTPException(status_code=401, detail="Invalid username or password")
    except client.exceptions.UserNotFoundException:
        # ユーザーが見つからないエラー
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        # その他のエラー
        raise HTTPException(status_code=500, detail=str(e))
