import crypto from "crypto";
import bcrypt from "bcryptjs";

import { saveOTP, deleteOTP } from "@/lib/otp";
import { generateOTPEmail } from "@/lib/email/otpTemplate";
import { sendEmail } from "@/lib/email/sendEmail";

export async function generateAndSendOTP(userId, email, type) {
  await deleteOTP(userId);

  const otp = crypto.randomInt(100000, 999999).toString();

  const hashOtp = await bcrypt.hash(otp, 10);

  await saveOTP(userId, hashOtp, type);

  const { subject, htmlContent } = generateOTPEmail(type, otp);

  await sendEmail(email, subject, htmlContent);

  return true;
}
