import crypto from "crypto";
import db from "@/utils/db";
import jwt from "jsonwebtoken";
import Otp from "@/model/Otp";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { type } = await req.json();

  const cookieStore = await cookies();

  const token = cookieStore.get("authToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "No auth token" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await db();
    const otp_code = crypto.randomInt(100000, 999999).toString();
    const hashOtp = await bcrypt.hash(otp_code, 10);
    const newOtp = await Otp.create({
      userId: decoded.id,
      code: hashOtp,
      type: type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    try {
      let subject, htmlContent;

      if (type === "register") {
        subject = "Complete Your Registration - DocLocker OTP";
        htmlContent = `
                      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                        <h2 style="color:#2563eb;">Welcome to DocLocker</h2>
                        <p>Dear User,</p>
                        <p>Thank you for registering with <strong>DocLocker</strong>. To complete your registration, please use the following One-Time Password (OTP):</p>
                        <div style="margin:20px 0; font-size:22px; font-weight:bold; color:#2563eb;">${otp_code}</div>
                        <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
                        <br />
                        <p>Best regards,</p>
                        <p><strong>The DocLocker Team</strong></p>
                      </div>
                      `;
      } else if (type === "reset") {
        subject = "Reset Your Password - DocLocker OTP";
        htmlContent = `
                      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                        <h2 style="color:#2563eb;">DocLocker Password Reset</h2>
                        <p>Dear User,</p>
                        <p>We received a request to reset the password for your <strong>DocLocker</strong> account.</p>
                        <p>Please use the following One-Time Password (OTP) to reset your password:</p>
                        <div style="margin:20px 0; font-size:22px; font-weight:bold; color:#2563eb;">${otp_code}</div>
                        <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
                        <p>If you did not request this reset, you can safely ignore this email.</p>
                        <br />
                        <p>Best regards,</p>
                        <p><strong>The DocLocker Team</strong></p>
                      </div>
                    `;
      } else if (type === "login") {
        subject = "Login Your Account - DocLocker OTP";
        htmlContent = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                      <h2 style="color:#2563eb;">DocLocker Security Verification</h2>
                      <p>Dear User,</p>
                      <p>We received a request to log in to your <strong>DocLocker</strong> account.</p>
                      <p>Please use the following One-Time Password (OTP) to complete your login:</p>
                      <div style="margin:20px 0; font-size:22px; font-weight:bold; color:#2563eb;">
                        ${otp_code}
                      </div>
                      <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
                      <p>If you did not initiate this request, please ignore this email or contact our support team immediately.</p>
                      <br />
                      <p>Best regards,</p>
                      <p><strong>The DocLocker Team</strong></p>
                    </div>
                  `;
      }

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "DocLocker", email: "www.sumanraj2428@gmail.com" },
          to: [{ email: `${decoded.email}` }],
          subject: subject,
          htmlContent: htmlContent,
        }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
    return NextResponse.json({ success: true, newOtp }, { status: 200 });
  } catch (err) {
    console.log("JWT verification error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
}
