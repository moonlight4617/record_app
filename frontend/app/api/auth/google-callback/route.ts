import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

const {
  NEXT_PUBLIC_COGNITO_DOMAIN,
  NEXT_PUBLIC_CLIENT_ID,
  NEXT_PUBLIC_REDIRECT_URI,
  DOMAIN,
} = process.env;

export async function GET(request: NextRequest) {
  try {
    // const origin = request.nextUrl.origin
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code") as string;

    if (!code) {
      const error = searchParams.get("error");
      return NextResponse.json({ error: error || "Unknown error" });
    }

    const requestBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: NEXT_PUBLIC_CLIENT_ID as string,
      code: code,
      // redirect_uri: `${origin}/api/auth/callback`
      redirect_uri: NEXT_PUBLIC_REDIRECT_URI as string,
    });

    // Get tokens
    const res = await fetch(`${NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestBody,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        error: data.error,
        error_description: data.error_description,
      });
    }

    // Store tokens in cookies
    const cookieStore = cookies();
    // cookieStore.set("id_token", data.id_token);
    // cookieStore.set("access_token", data.access_token);
    // cookieStore.set("refresh_token", data.refresh_token);

    cookieStore.set("id_token", data.id_token, {
      domain: DOMAIN,
      sameSite: "none",
      httpOnly: true,
      secure: true,
    });
    cookieStore.set("access_token", data.access_token, {
      domain: DOMAIN,
      sameSite: "none",
      httpOnly: true,
      secure: true,
    });
    cookieStore.set("refresh_token", data.refresh_token, {
      domain: DOMAIN,
      sameSite: "none",
      httpOnly: true,
      secure: true,
    });

    return NextResponse.redirect(new URL("/content", request.nextUrl));
  } catch (error) {
    return NextResponse.json({ error: error });
  }
}
