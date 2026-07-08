import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { otpLimiter } from "@/middleware/rateLimiter";
import { generateAndSendOTP } from "@/lib/services/otp/otpService";

export async function POST(req) {
  const { type } = await req.json();

  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "No auth token" },
      { status: 401 },
    );
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ===========================
    // Rate Limiter
    // ===========================
    try {
      await otpLimiter.consume(decoded.id);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many OTP requests. Please try again later.",
          retryAfter: Math.ceil(error.msBeforeNext / 1000),
        },
        { status: 429 },
      );
    }

    await generateAndSendOTP(decoded.id, decoded.email, type);
    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired token.",
      },
      { status: 403 },
    );
  }
}
