"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Coins, Sparkles, CreditCard, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreditsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user && session.user.credits >= 1) {
      router.push("/");
    }
  }, [session, router]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Coins className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Out of Credits
          </h1>
          <p className="text-gray-600">
            You need more credits to continue using the app
          </p>
        </div>

        {/* Current Credits */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">
              {session.user.credits}
            </div>
            <p className="text-gray-600">Credits Remaining</p>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="space-y-4 mb-8">
          <div className="border-2 border-gray-200 rounded-2xl p-4 hover:border-purple-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Starter Pack</h3>
                <p className="text-sm text-gray-600">10 credits</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">$4.99</div>
                <p className="text-xs text-gray-500">$0.50/credit</p>
              </div>
            </div>
          </div>

          <div className="border-2 border-purple-300 bg-purple-50 rounded-2xl p-4 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Popular Pack</h3>
                <p className="text-sm text-gray-600">25 credits</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">$9.99</div>
                <p className="text-xs text-gray-500">$0.40/credit</p>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-2xl p-4 hover:border-purple-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Family Pack</h3>
                <p className="text-sm text-gray-600">50 credits</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">$17.99</div>
                <p className="text-xs text-gray-500">$0.36/credit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-transform flex items-center justify-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Purchase Credits</span>
          </button>

          <Link
            href="/"
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to App</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full bg-red-100 text-red-600 px-6 py-3 rounded-2xl font-semibold hover:bg-red-200 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 mt-6">
          Each AI operation (outline generation, animation) costs 1 credit.
          Credits never expire and can be used anytime.
        </p>
      </div>
    </div>
  );
}
