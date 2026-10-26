import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;
  const admin = req.nextUrl.pathname.startsWith("/admin");
  const account = req.nextUrl.pathname.startsWith("/account");
  if ((admin || account) && !token) {
    const url = new URL(account ? "/swap/login" : "/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/account", "/account/:path*"],
};
