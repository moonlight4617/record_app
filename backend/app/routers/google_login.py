import os
import secrets
import urllib.parse

from dotenv import load_dotenv
from fastapi import APIRouter
from fastapi.responses import RedirectResponse

router = APIRouter(prefix="/account")

load_dotenv()

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
COGNITO_DOMAIN = os.getenv("COGNITO_DOMAIN")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")
REDIRECT_URI = os.getenv("REDIRECT_URI")
SCOPE = "openid email profile"
STATE = "random_generated_state_value"


@router.get("/auth/google", tags=["account"])
async def google_login():

    state = secrets.token_hex(16)
    # print("state")
    # print(state)

    query_params = {
        "client_id": COGNITO_APP_CLIENT_ID,
        # "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",
        "identity_provider": "Google LoginWithAmazon",
        "state": state,
        # "state": STATE
    }
    url = f"{COGNITO_DOMAIN}/oauth2/authorize?{urllib.parse.urlencode(query_params)}&redirect_uri={REDIRECT_URI}"  # noqa: E501
    return RedirectResponse(url)
