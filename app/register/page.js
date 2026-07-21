"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";
import { userSchemaZod } from "@/utils/zodConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import AuthIllustration from "@/component/AuthIllustration";

export default function SignUpPage() {
  const router = useRouter();
  const formMethods = useForm({
    resolver: zodResolver(userSchemaZod),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError, // Add this to set custom errors
  } = formMethods;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      console.log(data);

      const { username, email, password, confirmPassword } = data;

      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });

      const result = await res.json();
      console.log(result);

      if (res.ok) {
        await fetch("/api/v1/auth/otp-generate", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: "register" }),
        });
        router.push("/verify-otp");
      } else {
        // Handle server errors
        if (result.errors) {
          // Set field-specific errors from server
          Object.keys(result.errors).forEach((field) => {
            setError(field, {
              type: "server",
              message: result.errors[field],
            });
          });
        } else {
          // Set general error
          setError("root.serverError", {
            type: "server",
            message: result.message || "Failed to register",
          });
        }
      }
    } catch (err) {
      console.log(err);
      setError("root.serverError", {
        type: "server",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false); // ← stop loading
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F6F2E9] font-sans text-[#16273F] antialiased overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
        .font-serif-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Side Illustration — same vault/document motif as landing + login */}
        <div className="hidden md:flex w-1/2 items-center justify-center border-r border-[#16273F]/10 bg-[#EFEAE0]">
          <AuthIllustration />
        </div>

        {/* Right Side Form */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-8 overflow-y-auto">
          <div className="w-full max-w-md">
            <h2 className="font-serif-display text-3xl font-medium tracking-tight text-[#16273F] mb-8">
              Create Your Account
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div>
                <input
                  {...register("username")}
                  type="text"
                  placeholder="Username"
                  className="w-full px-4 py-3 border border-[#16273F]/20 rounded-lg bg-white text-[#16273F] placeholder:text-[#566173]/70 focus:outline-none focus:ring-2 focus:ring-[#B08D57] focus:border-transparent transition-shadow"
                />
                {errors.username && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

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

              {/* Confirm Password */}
              <div>
                <input
                  {...register("confirmPassword", {
                    validate: (value, formValues) =>
                      value === formValues.password || "Passwords do not match",
                  })}
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 border border-[#16273F]/20 rounded-lg bg-white text-[#16273F] placeholder:text-[#566173]/70 focus:outline-none focus:ring-2 focus:ring-[#B08D57] focus:border-transparent transition-shadow"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 rounded-full text-[#F6F2E9] font-medium transition-all flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B08D57] ${
                  isSubmitting
                    ? "bg-[#16273F]/50 cursor-not-allowed"
                    : "bg-[#16273F] hover:bg-[#0F1B2D] active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#F6F2E9]/30 border-t-[#F6F2E9] rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            {/* Display server errors */}
            {errors.root?.serverError && (
              <p className="text-sm text-red-600 mt-2">
                {errors.root.serverError.message}
              </p>
            )}

            <p className="mt-4 text-sm text-[#566173]">
              Already have an account?{" "}
              <a href="/login" className="text-[#16273F] font-medium hover:text-[#B08D57] underline underline-offset-2">
                Sign In
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