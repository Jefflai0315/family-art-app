"use client";

import { useSession, signOut } from "next-auth/react";
import { Coins, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";

export default function UserProfile() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/20 transition-colors"
      >
        {/* Credits Display */}
        <div className="flex items-center space-x-2 text-white">
          <Coins className="w-5 h-5" />
          <span className="font-semibold">{session.user.credits}</span>
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-4 z-50">
          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-800">
                  {session.user.name || "User"}
                </h3>
                <p className="text-sm text-gray-600">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* Credits Section */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-700">Credits</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {session.user.credits}
                </div>
                <p className="text-xs text-gray-500">remaining</p>
              </div>
            </div>

            {session.user.credits < 5 && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ⚠️ Low credits! Consider purchasing more to continue using the
                  app.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 space-y-2">
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-3 text-gray-700">
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 transition-colors flex items-center space-x-3 text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
