export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-[#16273F]/10 py-8 text-center text-sm text-[#566173]">
      © {new Date().getFullYear()} DocLocker. All rights reserved.
    </footer>
  );
}