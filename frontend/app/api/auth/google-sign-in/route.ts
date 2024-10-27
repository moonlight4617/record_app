import { NextRequest, NextResponse } from "next/server"
import crypto from 'crypto'

const {
  NEXT_PUBLIC_COGNITO_DOMAIN,
  NEXT_PUBLIC_CLIENT_ID,
  NEXT_PUBLIC_REDIRECT_URI,
  NEXT_PUBLIC_STATE
} = process.env

export async function GET(request: NextRequest) {
    let authorizeParams = new URLSearchParams()
    // const origin = request.nextUrl.origin
    const state = crypto.randomBytes(16).toString('hex')

    authorizeParams.append('response_type', 'code')
    authorizeParams.append('client_id', NEXT_PUBLIC_CLIENT_ID as string)
    // authorizeParams.append('redirect_uri', `${origin}/api/auth/google-callback`)
    authorizeParams.append('redirect_uri', NEXT_PUBLIC_REDIRECT_URI as string)
    authorizeParams.append('state', NEXT_PUBLIC_STATE as string)
    authorizeParams.append('identity_provider', 'Google')
    authorizeParams.append('scope', 'profile email openid')

    const response = NextResponse.redirect(`${NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/authorize?${authorizeParams.toString()}`);

    // CORSヘッダーの追加
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
}
