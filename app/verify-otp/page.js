"use client";
import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";
import AuthIllustration from "@/component/Authillustration.jsx";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { otpSchemaZod } from "@/utils/zodConfig";

export default function OtpPage() {
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
      const res = await fetch("/api/v1/auth/otp-generate", {
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
        {/* Left Side Illustration — same vault/document motif as login + sign up */}
        <div className="hidden md:flex w-1/2 items-center justify-center border-r border-[#16273F]/10 bg-[#EFEAE0]">
          <AuthIllustration />
        </div>

        {/* Right Side Form */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-8">
          <div className="w-full max-w-md">
            <h2 className="font-serif-display text-3xl font-medium tracking-tight text-[#16273F] mb-2">
              Verify Your Account
            </h2>
            <p className="text-sm text-[#566173] mb-6">
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
                className="w-full px-4 py-3 border border-[#16273F]/20 rounded-lg bg-white text-center text-lg tracking-widest text-[#16273F] placeholder:text-[#566173]/70 placeholder:tracking-normal placeholder:text-base focus:outline-none focus:ring-2 focus:ring-[#B08D57] focus:border-transparent transition-shadow"
              />

              {errors.otp && (
                <p className="text-red-500 text-sm">{errors.otp.message}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#16273F] text-[#F6F2E9] font-medium rounded-full hover:bg-[#0F1B2D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B08D57]"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>

            {serverError && (
              <p className="text-red-500 text-sm mt-2">{serverError}</p>
            )}

            <p className="mt-4 text-sm text-[#566173]">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                disabled={disableButton}
                className={`font-medium ${
                  disableButton
                    ? "text-[#566173]/50 cursor-not-allowed"
                    : "text-[#16273F] hover:text-[#B08D57] underline underline-offset-2"
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
