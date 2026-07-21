"use client";
import {
  Lock,
  FileText,
  FolderClosed,
  Image as ImageIcon,
  Music2,
} from "lucide-react";
import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";
import { useRouter } from "next/navigation";

export default function DocLockerLanding() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2E9] font-sans text-[#16273F] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
        .font-serif-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      {/* Nav */}
      {/* <header className="sticky top-0 z-50 border-b border-[#16273F]/10 bg-[#F6F2E9]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16273F]">
              <Lock className="h-4 w-4 text-[#F6F2E9]" strokeWidth={2} />
            </span>
            <span className="font-serif-display text-2xl font-medium tracking-tight text-[#16273F]">
              DocLocker
            </span>
          </div>

          <button
            type="button"
            className="rounded-full bg-[#16273F] px-5 py-2.5 text-sm font-medium text-[#F6F2E9] transition-colors hover:bg-[#0F1B2D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B08D57]"
          >
            Sign In
          </button>
        </div>
      </header> */}

      <Navbar />
      {/* Hero */}
      <main className="flex-1">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-20 pt-16 md:grid-cols-2 md:gap-12 md:px-10 md:pb-28 md:pt-24">
          {/* Copy */}
          <div className="fade-up" style={{ animationDelay: "0.05s" }}>
            <h1 className="font-serif-display text-5xl font-medium leading-[1.06] tracking-tight text-[#16273F] sm:text-6xl lg:text-[4.5rem]">
              <span className="block">Secure your files</span>
              <span className="block text-[#B08D57]">Access anywhere.</span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#566173]">
              End-to-end encrypted storage for peace of mind, with instant
              access across all your devices.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={() => router.push("/login")}
                type="button"
                className="rounded-full bg-[#16273F] px-7 py-3.5 text-sm font-medium text-[#F6F2E9] transition-colors hover:bg-[#0F1B2D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B08D57]"
              >
                Sign In
              </button>
              <button
                type="button"
                className="rounded-full border border-[#16273F]/25 bg-transparent px-7 py-3.5 text-sm font-medium text-[#16273F] transition-colors hover:border-[#16273F]/50 hover:bg-[#16273F]/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B08D57]"
                onClick={() => router.push("/login")}
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Illustration */}
          <div
            className="fade-up relative mx-auto flex h-[380px] w-full max-w-md items-center justify-center sm:h-[440px]"
            style={{ animationDelay: "0.15s" }}
            aria-hidden="true"
          >
            {/* backdrop glow */}
            <div className="absolute h-72 w-72 rounded-full bg-[#B08D57]/10 blur-3xl" />
            <div className="absolute inset-0 [background-image:radial-gradient(#16273F1a_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(closest-side,black,transparent)]" />

            {/* document cards */}
            <div className="relative h-64 w-52 sm:h-72 sm:w-56">
              <div className="absolute inset-0 -rotate-6 rounded-2xl border border-[#16273F]/15 bg-white shadow-sm" />
              <div className="absolute inset-0 rotate-3 rounded-2xl border border-[#16273F]/15 bg-white shadow-sm" />
              <div className="absolute inset-0 flex -rotate-2 flex-col gap-3 rounded-2xl border border-[#16273F]/15 bg-white p-6 shadow-md">
                <FileText
                  className="h-6 w-6 text-[#16273F]/70"
                  strokeWidth={1.5}
                />
                <div className="mt-1 h-2 w-3/4 rounded-full bg-[#16273F]/10" />
                <div className="h-2 w-full rounded-full bg-[#16273F]/10" />
                <div className="h-2 w-5/6 rounded-full bg-[#16273F]/10" />
                <div className="mt-auto flex gap-2">
                  <FolderClosed
                    className="h-5 w-5 text-[#B08D57]"
                    strokeWidth={1.5}
                  />
                  <ImageIcon
                    className="h-5 w-5 text-[#16273F]/40"
                    strokeWidth={1.5}
                  />
                  <Music2
                    className="h-5 w-5 text-[#16273F]/40"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>

            {/* vault seal badge */}
            <div className="absolute bottom-2 right-2 flex h-24 w-24 rotate-6 items-center justify-center rounded-full border-2 border-dashed border-[#B08D57] bg-[#F6F2E9] shadow-md sm:bottom-4 sm:right-0">
              <Lock className="h-9 w-9 text-[#16273F]" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="border-t border-[#16273F]/10 py-8">
        <p className="text-center text-sm text-[#566173]">
          © 2026 DocLocker. All rights reserved.
        </p>
      </footer> */}
      <Footer />
    </div>
  );
}
