import User from "@/model/User";
import bcrypt from "bcryptjs";
import db from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { userSchemaZod } from "@/utils/zodConfig";
import { serialize } from "cookie";
import jwt from "jsonwebtoken"; 


export async function POST(req) {
  const data = await req.json();
  const result = userSchemaZod.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.flatten().fieldErrors;
    return NextResponse.json(
      { message: "Validation failed", errors: errorMessages },
      { status: 400 }
    );
  }

  await db();
  try {
    const existing_email = await User.findOne({ email: data.email });
    if (existing_email) {
      return NextResponse.json(
        {
          message: "Email already registered",
          error: "Email already registered",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const newUser = await User.create({
      username: data.username,
      email: data.email,
      passwordHash,
      verified: false,
    });
    const token = jwt.sign(
      {
        id: newUser._id,
        name: newUser.username,
        email: newUser.email,
        isVerifed: newUser.verified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const cookie = serialize("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    const res = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    );
    res.headers.set("Set-Cookie", cookie);
    return res;
  } catch (error) {
    console.log("Failed to create new User:", error);
    return NextResponse.json(
      { message: "Internal server error", error: "Failed to create user" },
      { status: 500 }
    );
  }
}
