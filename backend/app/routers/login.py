import os
from dotenv import load_dotenv
from fastapi import HTTPException, APIRouter, status
from pydantic import BaseModel
import boto3
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/account")

load_dotenv()

# Cognito設定
COGNITO_APP_CLIENT_ID = os.getenv('COGNITO_APP_CLIENT_ID')
AWS_REGION = os.getenv('AWS_REGION')

# Boto3クライアント作成
client = boto3.client('cognito-idp', region_name=AWS_REGION)

# リクエスト用のデータモデル
class AuthRequest(BaseModel):
    username: str
    password: str

@router.post("/login/", tags=["account"])
async def login(auth_request: AuthRequest, response: JSONResponse):
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

        response = JSONResponse(content=
            {"message": "Login successful"},
            status_code=status.HTTP_200_OK
        )
        # response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite='Lax')  // TODO: 本番ではsecureを指定
        response.set_cookie(key="access_token", value=access_token, httponly=True, samesite='Lax')
        response.set_cookie(key="id_token", value=id_token, httponly=True, samesite='Lax')
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite='Lax')

        return response

    except client.exceptions.NotAuthorizedException:
        # 認証エラー
        raise HTTPException(status_code=401, detail="Invalid username or password")
    except client.exceptions.UserNotFoundException:
        # ユーザーが見つからないエラー
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        # その他のエラー
        raise HTTPException(status_code=500, detail=str(e))
