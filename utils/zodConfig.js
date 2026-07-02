import { z } from "zod";

const passwordBase = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Must include at least one uppercase letter",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Must include at least one lowercase letter",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Must include at least one number",
  })
  .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
    message: "Must include at least one special character",
  });

export const userSchemaZod = z
  .object({
    username: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordBase,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const LoginSchemaZod = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const otpSchemaZod = z.object({
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});