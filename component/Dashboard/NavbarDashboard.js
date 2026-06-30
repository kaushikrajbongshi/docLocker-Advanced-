"use client";
import React, { useState } from "react";
import {
  UserCircleIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const NavbarDashboard = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const handleLogOut = async () => {
    try {
      const res = await fetch("/api/v1/auth/logOut", {
        method: "POST",
      });
      const result = await res.json();

      if (result.success) {
        router.push("/");
      } else {
        console.log("Logout failed:", result.message);
      }
    } catch (err) {
      console.log("Logout error:", err);
    }
  };
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-semibold text-blue-600">
              DocLocker
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-purple-700 transition-colors"
            >
              <UserCircleIcon className="w-5 h-5" />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                >
                  <UserCircleIcon className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogOut}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 border-t"
                >
                  <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarDashboard;
