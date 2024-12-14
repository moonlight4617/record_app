import requests
from fastapi import APIRouter, HTTPException, Depends, Query, Header, status
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
import os
import base64

load_dotenv()
router = APIRouter(prefix="/account")

COGNITO_APP_CLIENT_ID = os.getenv('COGNITO_APP_CLIENT_ID')
COGNITO_DOMAIN = os.getenv('COGNITO_DOMAIN')
# COGNITO_APP_CLIENT_SECRET = os.getenv('COGNITO_APP_CLIENT_SECRET')
STATE = "random_generated_state_value"

# TODO: 後ほどソース整理
@router.get("/auth/google/callback", tags=["account"])
async def google_callback(code: str, state: str = None):
    if state != STATE:
        return {"error": "stateがない"}

    if code == None:
        return {"error": "codeがない"}

    # authorization_header = f"Basic {base64.b64encode(f'{COGNITO_APP_CLIENT_ID}:{COGNITO_APP_CLIENT_SECRET}'.encode()).decode()}"

    cognito_response = requests.post(
        f"{COGNITO_DOMAIN}/oauth2/token",
        data={
            "grant_type": "authorization_code",
            "client_id": COGNITO_APP_CLIENT_ID,
            "redirect_uri": "http://localhost:8000/account/auth/google/callback",
            "code": code
        },
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            # 'Authorization': authorization_header
        }
    )

    if cognito_response.status_code != 200:
        print("status_code:", cognito_response.status_code)
        try:
            # JSON形式である場合のみパース
            json = cognito_response.json()
            print("Response JSON:", json)
            raise HTTPException(status_code=400, detail=json)
        except ValueError:
            # JSONでない場合はテキストとして出力
            text = cognito_response.text
            print("Response Text:", text)
            raise HTTPException(status_code=400, detail={"error": "Non-JSON response", "message": text})

    tokens = cognito_response.json()
    id_token = tokens["id_token"]
    access_token = tokens["access_token"]
    # print("id_token")
    # print(id_token)
    # print("access_token")
    # print(access_token)

    # トークンをクッキーに保存
    cognito_tokens = cognito_response.json()
    # response = JSONResponse(content={"message": "Login successful"})
    # return response

    response = RedirectResponse(url="http://localhost:3000/content", status_code=status.HTTP_303_SEE_OTHER)
    response.set_cookie(key="access_token", value=cognito_tokens['access_token'], httponly=True, samesite="Lax")
    response.set_cookie(key="id_token", value=cognito_tokens['id_token'], httponly=True, samesite="Lax")
    return response
