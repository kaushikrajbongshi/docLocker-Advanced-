import bcrypt from "bcryptjs";
import db from "@/lib/mongodb";
import User from "@/model/User";
import jwt from "jsonwebtoken";
import { otpSchemaZod } from "@/utils/zodConfig";
import { NextResponse } from "next/server";
import { serialize, parse } from "cookie";
import { deleteOTP, getOTP } from "@/lib/otp";

export async function POST(req) {
  const data = await req.json();
  const parsed = otpSchemaZod.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Invalid OTP format" },
      { status: 400 },
    );
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const cookiesObj = parse(cookieHeader);
  const token = cookiesObj.authToken;

  if (!token) {
    return NextResponse.json({ error: "No auth token" }, { status: 401 });
  }

  await db();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const otp = await getOTP(decoded.id);
    if (!otp) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const otpMatch = await bcrypt.compare(parsed.data.otp, otp.code);
    if (!otpMatch) {
      return NextResponse.json(
        { success: false, message: "Wrong otp" },
        { status: 400 },
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { verified: true },
      { new: true },
    );

    // Create a NEW JWT with verified = true
    const newToken = jwt.sign(
      {
        id: updatedUser._id,
        name: updatedUser.username,
        email: updatedUser.email,
        iseVerifed: true, // keep same key because middleware uses it
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    // Save new token in cookie
    const cookie = serialize("authToken", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 12,
      path: "/",
    });

    await deleteOTP(decoded.id);

    const res = NextResponse.json(
      { success: true, message: "Otp verification successful" },
      { status: 200 },
    );
    res.headers.set("Set-Cookie", cookie);
    return res;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error!" },
      { status: 400 },
    );
  }
}
