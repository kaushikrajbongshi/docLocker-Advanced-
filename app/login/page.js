"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthIllustration from "@/component/AuthIllustration";

// Login validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const { email, password } = data;

      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (res.ok) {
        await fetch("/api/v1/auth/otp-generate", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: "login" }),
        });
        router.push("/verify-otp");
      } else {
        console.log("Server response:", result); // Debug log
        // Handle server errors
        if (result.errors) {
          // Handle field-specific errors from server
          Object.keys(result.errors).forEach((field) => {
            const errorMessage = Array.isArray(result.errors[field])
              ? result.errors[field][0]
              : result.errors[field];
            setError(field, {
              type: "server",
              message: errorMessage,
            });
          });
        } else if (result.error) {
          // Handle single error (like invalid credentials)
          setError("root.serverError", {
            type: "server",
            message: result.error,
          });
        } else {
          // Fallback general error
          setError("root.serverError", {
            type: "server",
            message: result.message || "Failed to login",
          });
        }
      }
    } catch (err) {
      console.log(err);
      setError("root.serverError", {
        type: "server",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2E9] font-sans text-[#16273F] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
        .font-serif-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      {/* Navbar — swap for the restyled Navbar from the landing page redesign
          so the wordmark/Sign In button match across the app */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Side Illustration — same vault/document motif as the landing hero */}
        <div className="hidden md:flex w-1/2 items-center justify-center border-r border-[#16273F]/10 bg-[#EFEAE0]">
          <AuthIllustration />
        </div>

        {/* Right Side Form */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-8">
          <div className="w-full max-w-md">
            <h2 className="font-serif-display text-3xl font-medium tracking-tight text-[#16273F] mb-8">
              Sign In to Your Account
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 border border-[#16273F]/20 rounded-lg bg-white text-[#16273F] placeholder:text-[#566173]/70 focus:outline-none focus:ring-2 focus:ring-[#B08D57] focus:border-transparent transition-shadow"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-[#16273F]/20 rounded-lg bg-white text-[#16273F] placeholder:text-[#566173]/70 focus:outline-none focus:ring-2 focus:ring-[#B08D57] focus:border-transparent transition-shadow"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-[#16273F] text-[#F6F2E9] font-medium rounded-full hover:bg-[#0F1B2D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B08D57]"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Display server errors */}
            {errors.root?.serverError && (
              <p className="text-sm text-red-600 mt-2">
                {errors.root.serverError.message}
              </p>
            )}

            <p className="mt-4 text-sm text-[#566173]">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-[#16273F] font-medium hover:text-[#B08D57] underline underline-offset-2">
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}