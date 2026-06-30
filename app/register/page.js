"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";
import { userSchemaZod } from "@/utils/zodConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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

  const onSubmit = async (data) => {
    try {
      const { username, email, password } = data;

      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
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
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Side Image */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-100">
          <Image
            src="/signup.png"
            alt="Sign up illustration"
            width={500}
            height={500}
          />
        </div>

        {/* Right Side Form */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-8">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Create Your Account
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username */}
              <div>
                <input
                  {...register("username")}
                  type="text"
                  placeholder="Username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Confirm Password */}
              <div>
                <input
                  {...register("confirmPassword", {
                    validate: (value, formValues) =>
                      value === formValues.password || "Passwords do not match",
                  })}
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sign Up
              </button>
            </form>

            {/* Display server errors */}
            {errors.root?.serverError && (
              <p className="text-sm text-red-600 mt-2">
                {errors.root.serverError.message}
              </p>
            )}

            <p className="mt-4 text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
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
