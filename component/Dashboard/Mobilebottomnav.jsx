"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, TrashIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  TrashIcon as TrashIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from "@heroicons/react/24/solid";

const tabs = [
  { href: "/dashboard", label: "Drive", icon: HomeIcon, activeIcon: HomeIconSolid },
  { href: "/dashboard/trash", label: "Trash", icon: TrashIcon, activeIcon: TrashIconSolid },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircleIcon, activeIcon: UserCircleIconSolid },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex items-stretch justify-around border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {tabs.map(({ href, label, icon: Icon, activeIcon: ActiveIcon }) => {
        const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        const DisplayIcon = isActive ? ActiveIcon : Icon;

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium"
          >
            <DisplayIcon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
            <span className={isActive ? "text-blue-600" : "text-gray-500"}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}