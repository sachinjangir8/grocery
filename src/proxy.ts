import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { URL } from "node:url";

export  async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicPaths = [
    "/login",
    "/register",
    "/api/auth",
    "/api/auth/callback/google",
    "/api/auth/session"
  ];

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // protected routes logic later
    const token =await getToken({req,secret:process.env.NEXTAUTH_SECRET});
    console.log("Token in middleware:", token);
    console.log(req.url);
    if(!token){
        const loginUrl=new URL('/login',req.url);
        loginUrl.searchParams.set('callbackUrl',req.url);
        return NextResponse.redirect(loginUrl);
    }

    // here we will do role based route access
    const role=token.role
    if(pathname.startsWith("/user") && role!=="user"){
      return NextResponse.redirect(new URL("/Unauthorized",req.url))
    }
    if(pathname.startsWith("/admin") && role!=="admin"){
      return NextResponse.redirect(new URL("/Unauthorized",req.url))
    }
    if(pathname.startsWith("/delivery") && role!=="deliveryBoy"){
      return NextResponse.redirect(new URL("/Unauthorized",req.url))
    }
    return NextResponse.next();
}

export const config = {
    matcher: '/((?!api/auth|_next/static|_next/image|favicon.ico).*)'
}

// login, register,api,auth public routes
// otherwise check for token in cookies home page, dashboard etc