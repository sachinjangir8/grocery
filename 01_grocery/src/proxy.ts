import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export default auth(async function middleware(req) {
  const { pathname } = req.nextUrl;

  const publicPaths = [
    "/login",
    "/register",
    "/api/auth",
    "/api/auth/callback/google",
    "/api/auth/session",
    "/api/socket/connect",
    "/api/socket/updateLocation"
  ];

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const session = req.auth;
  console.log("Token in middleware:", session);
  console.log(req.url);

  if (!session) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // here we will do role based route access
  const role = session?.user?.role;
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/api/admin") && role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  if (pathname.startsWith("/delivery") && role !== "deliveryBoy") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/api/delivery") && role !== "deliveryBoy") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return NextResponse.next();
});

export const config = {
    matcher: '/((?!api/auth|_next/static|_next/image|favicon.ico).*)'
}

// login, register,api,auth public routes
// otherwise check for token in cookies home page, dashboard etc