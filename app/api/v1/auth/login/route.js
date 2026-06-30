import User from "@/model/User";
import bcrypt from "bcryptjs";
import db from "@/utils/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { LoginSchemaZod } from "@/utils/zodConfig";
import { serialize } from "cookie";

export async function POST(req) {
  const data = await req.json();
  const result = LoginSchemaZod.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.flatten().fieldErrors;
    return NextResponse.json(
      { message: "Validation failed", errors: errorMessages },
      { status: 400 }
    );
  }

  await db();

  try {
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    if (passwordMatch) {
      const token = jwt.sign(
        {
          id: user._id,
          name: user.username,
          email: user.email,
          iseVerifed: user.verified,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const cookie = serialize("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 12, // 12 hour
        path: "/",
      });

      const res = NextResponse.json(
        { success: true, message: "Login successful" },
        { status: 200 }
      );
      res.headers.set("Set-Cookie", cookie);
      return res;
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
