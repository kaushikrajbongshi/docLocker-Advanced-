import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[#16273F]/10 bg-[#F6F2E9]/90 px-6 py-4 backdrop-blur md:px-10">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16273F]">
          <Lock className="h-4 w-4 text-[#F6F2E9]" strokeWidth={2} />
        </span>
        <span className="font-serif-display text-2xl font-medium tracking-tight text-[#16273F]">
          DocLocker
        </span>
      </Link>

      <div>
        <button
          onClick={() => router.push("/login")}
          className="rounded-full bg-[#16273F] px-5 py-2.5 text-sm font-medium text-[#F6F2E9] transition-colors hover:bg-[#0F1B2D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B08D57]"
        >
          Sign In
        </button>
      </div>
    </nav>
  );
}