import User from "@/model/User";
import db from "@/utils/db";
import { parse, serialize } from "cookie";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  await db();

  const cookieHeader = req.headers.get("cookie") || "";
  const cookiesObj = parse(cookieHeader);
  const token = cookiesObj.authToken;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await User.findByIdAndUpdate(decoded.id, { verified: false }, { new: true });

    const cookie = serialize("authToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0), 
      path: "/",
    });

    // Return JSON response instead of redirect
    const response = NextResponse.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error) {
    console.error("[Logout API] Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error!" },
      { status: 400 }
    );
  }
}