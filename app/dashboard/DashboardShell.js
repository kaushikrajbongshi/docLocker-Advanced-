"use client";

import NavbarDashboard from "@/component/Dashboard/NavbarDashboard";
import LeftNavigation from "@/component/Dashboard/LeftNavigation";
import MobileBottomNav from "@/component/Dashboard/MobileBottomNav";

export default function DashboardShell({ children }) {
  return (
    <>
      <NavbarDashboard />
      <div className="flex">
        {/* Sidebar: desktop only. On mobile, navigation moves to the
            bottom tab bar instead, so the sidebar no longer overlaps
            content on small screens. */}
        <div className="hidden md:block">
          <LeftNavigation />
        </div>

        {/* pb-16 reserves space for the fixed bottom tab bar on mobile
            so page content isn't hidden behind it; md:pb-0 removes
            that reservation once the bottom bar itself is hidden. */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>

      <MobileBottomNav />
    </>
  );
}