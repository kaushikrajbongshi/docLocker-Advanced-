import { FileText, FolderClosed, Lock, ShieldCheck, KeyRound, Fingerprint } from "lucide-react";

/**
 * AuthIllustration
 * -----------------
 * Shared left-panel visual for the auth pages (login, sign up, etc).
 * Fills the whole panel instead of floating a small card in empty
 * space: a document stack sits inside a dashed orbit ring, with small
 * security-concept chips (shield, key, fingerprint) placed around it
 * and a vault-seal lock badge anchored to the stack itself.
 *
 * Usage:
 *   <div className="hidden md:flex w-1/2 items-center justify-center
 *        border-r border-[#16273F]/10 bg-[#EFEAE0]">
 *     <AuthIllustration />
 *   </div>
 */
export default function AuthIllustration() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden" aria-hidden="true">
      {/* ambient glow */}
      <div className="absolute h-80 w-80 rounded-full bg-[#B08D57]/10 blur-3xl" />
      {/* dot grid */}
      <div className="absolute inset-0 [background-image:radial-gradient(#16273F1a_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(closest-side,black,transparent)]" />

      {/* composition */}
      <div className="relative h-[380px] w-[380px]">
        {/* orbit ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[#16273F]/15" />
        {/* inner ring */}
        <div className="absolute inset-10 rounded-full border border-[#16273F]/10" />

        {/* floating chip — shield */}
        <div className="absolute left-3 top-16 flex h-12 w-12 items-center justify-center rounded-full border border-[#16273F]/15 bg-white shadow-sm">
          <ShieldCheck className="h-5 w-5 text-[#16273F]/70" strokeWidth={1.5} />
        </div>

        {/* floating chip — key */}
        <div className="absolute right-2 top-8 flex h-12 w-12 items-center justify-center rounded-full border border-[#16273F]/15 bg-white shadow-sm">
          <KeyRound className="h-5 w-5 text-[#B08D57]" strokeWidth={1.5} />
        </div>

        {/* floating chip — fingerprint */}
        <div className="absolute bottom-10 left-0 flex h-12 w-12 items-center justify-center rounded-full border border-[#16273F]/15 bg-white shadow-sm">
          <Fingerprint className="h-5 w-5 text-[#16273F]/70" strokeWidth={1.5} />
        </div>

        {/* document stack, centered on the orbit */}
        <div className="absolute left-1/2 top-1/2 h-64 w-52 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 -rotate-6 rounded-2xl border border-[#16273F]/15 bg-white shadow-sm" />
          <div className="absolute inset-0 rotate-3 rounded-2xl border border-[#16273F]/15 bg-white shadow-sm" />
          <div className="absolute inset-0 flex -rotate-2 flex-col gap-3 rounded-2xl border border-[#16273F]/15 bg-white p-6 shadow-md">
            <FileText className="h-6 w-6 text-[#16273F]/70" strokeWidth={1.5} />
            <div className="mt-1 h-2 w-3/4 rounded-full bg-[#16273F]/10" />
            <div className="h-2 w-full rounded-full bg-[#16273F]/10" />
            <div className="h-2 w-5/6 rounded-full bg-[#16273F]/10" />
            <FolderClosed className="mt-auto h-5 w-5 text-[#B08D57]" strokeWidth={1.5} />
          </div>

          {/* vault seal, anchored to the stack rather than floating loose in the corner */}
          <div className="absolute -bottom-6 -right-8 flex h-20 w-20 rotate-6 items-center justify-center rounded-full border-2 border-dashed border-[#B08D57] bg-[#F6F2E9] shadow-md">
            <Lock className="h-7 w-7 text-[#16273F]" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  );
}