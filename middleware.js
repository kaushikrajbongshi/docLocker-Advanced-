import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const token = req.cookies.get("authToken")?.value;

  // If no token exists, redirect to login (except if already on login page)
  if (!token) {
    if (req.nextUrl.pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next(); // Let them access login page
  }

  // If token exists, verify it
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);



    // Check if user is verified
    if (!payload.iseVerifed) {
      // Fixed the typo
      if (req.nextUrl.pathname !== "/verify-otp") {
        return NextResponse.redirect(new URL("/verify-otp", req.url));
      }
    }

    return NextResponse.next(); // All good, continue
  } catch (error) {
    console.log("JWT verification failed:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  //where middleware work
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/verify-otp",
  ],
};
