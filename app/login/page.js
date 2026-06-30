"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Side Image */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-100">
          <Image
            src="/login.png"
            alt="Login Illustration"
            width={500}
            height={400}
          />
        </div>

        {/* Right Side Form */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-8">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Sign In to Your Account
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

            <p className="mt-4 text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-blue-600 hover:underline">
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
