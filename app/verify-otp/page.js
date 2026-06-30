"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { otpSchemaZod } from "@/utils/zodConfig";

export default function OtpPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // timer state
  const [timer, setTimer] = useState(0);
  const [disableButton, setDisableButton] = useState(false);
  // countdown effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      setDisableButton(true);
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setDisableButton(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");

    const validOtp = otpSchemaZod.safeParse(data);

    if (!validOtp.success) {
      setServerError("Invalid OTP format");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: data.otp }),
      });

      const result = await res.json();

      if (result.success) {
        window.location.href = "/dashboard";
      } else {
        setServerError(result.message || "Invalid OTP");
      }
    } catch (err) {
      setServerError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    console.log("done");

    try {
      const res = await fetch("/api/v1/auth/resendOtp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "reset" }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        console.log("Otp resend Succesfully");
        setTimer(300);
      } else {
        setServerError(
          result.message || "Something went wrong, Wait for sometimes",
        );
      }
    } catch (err) {
      setServerError("Something went wrong. Try again.");
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
            src="/otp.png"
            alt="OTP Verification illustration"
            width={400}
            height={400}
          />
        </div>

        {/* Right Side Form */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-8">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Verify Your Account
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Please enter the 6-digit code sent to your email.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter OTP"
                {...register("otp", {
                  required: "OTP is required",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "OTP must be 6 digits",
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {errors.otp && (
                <p className="text-red-500 text-sm">{errors.otp.message}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>

            {serverError && (
              <p className="text-red-500 text-sm mt-2">{serverError}</p>
            )}

            <p className="mt-4 text-sm text-gray-600">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                disabled={disableButton}
                className={`${
                  disableButton
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:underline"
                }`}
                onClick={handleResendOtp}
              >
                {disableButton ? `Resend in ${timer}s` : "Resend"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
