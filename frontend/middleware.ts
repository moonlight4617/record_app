import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token");

  // ログインが必要なページへのアクセスを保護
  if (pathname.startsWith("/content") && !accessToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ログイン済みのユーザーがログインページにアクセスした場合はリダイレクト
  if (pathname === "/" && accessToken) {
    return NextResponse.redirect(new URL("/content", req.url));
  }

  return NextResponse.next();
}
