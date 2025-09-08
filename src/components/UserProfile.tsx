"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { Coins, User, LogOut, LogIn, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { handleApiCall } from "@/lib/errorHandling";

interface CreditsResponse {
  success: boolean;
  credits?: number;
  error?: string;
}

export default function UserProfile() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const fetchCredits = useCallback(async () => {
    if (!session?.user?.email) return;

    setIsLoadingCredits(true);
    setCreditsError(null);

    try {
      const { data, error } = await handleApiCall<CreditsResponse>(async () => {
        return fetch("/api/get-credits", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      });

      if (error) {
        if (error.type === "auth") {
          setCreditsError("Please sign in to view credits");
        } else if (error.type === "credits") {
          setCreditsError("Unable to load credits");
        } else {
          setCreditsError("Error loading credits");
        }
        setCredits(null);
      } else if (data?.success) {
        setCredits(data.credits ?? null);
        setCreditsError(null);
      } else {
        setCreditsError("Unable to load credits");
        setCredits(null);
      }
    } catch {
      setCreditsError("Error loading credits");
      setCredits(null);
    } finally {
      setIsLoadingCredits(false);
    }
  }, [session?.user?.email]);

  // Fetch credits when session changes
  useEffect(() => {
    if (session?.user?.email) {
      fetchCredits();
    } else {
      setCredits(null);
      setCreditsError(null);
    }
  }, [session?.user?.email, fetchCredits]);

  // Show sign in button if not authenticated
  if (!session?.user) {
    return (
      <div className="relative">
        <button
          onClick={handleSignIn}
          className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/20 transition-colors"
        >
          <LogIn className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Sign In</span>
        </button>
      </div>
    );
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
          {isLoadingCredits ? (
            <span className="font-semibold">...</span>
          ) : creditsError ? (
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="font-semibold text-red-400">Error</span>
            </div>
          ) : (
            <span className="font-semibold">{credits ?? 0}</span>
          )}
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
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
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="w-full h-full flex flex-col justify-center whitespace-nowrap">
                <h3 className="font-semibold text-gray-800">
                  {session.user.name || "User"}
                </h3>
                <p className="text-sm text-gray-600 w-full truncate overflow-hidden">
                  {session.user.email}
                </p>
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
                {isLoadingCredits ? (
                  <div className="text-2xl font-bold text-gray-400">...</div>
                ) : creditsError ? (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Error</span>
                    </div>
                    <button
                      onClick={fetchCredits}
                      className="text-xs text-purple-600 hover:text-purple-700 mt-1"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-purple-600">
                      {credits ?? 0}
                    </div>
                    <p className="text-xs text-gray-500">remaining</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 space-y-2">
            <a
              href="/credits"
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-3 text-gray-700"
            >
              <Coins className="w-4 h-4" />
              <span>Add Credits</span>
            </a>

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
