"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Coins, Plus, Check, Link } from "lucide-react";

export default function TestCreditsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const addCredits = async (amount: number) => {
    if (!session?.user) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/add-test-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        // Refresh the session to update credits
        window.location.reload();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">
            Please sign in to access test credits
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Coins className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Test Credits
          </h1>
          <p className="text-gray-600">Add test credits for development</p>
        </div>

        {/* Current Credits */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {session.user.credits}
            </div>
            <p className="text-gray-600">Current Credits</p>
          </div>
        </div>

        {/* Add Credits Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={() => addCredits(5)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-transform flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            <span>Add 5 Credits</span>
          </button>

          <button
            onClick={() => addCredits(10)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-transform flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            <span>Add 10 Credits</span>
          </button>

          <button
            onClick={() => addCredits(25)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-transform flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            <span>Add 25 Credits</span>
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-2 text-green-800">
              <Check className="w-5 h-5" />
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}

        {/* Back Button */}
        <Link
          href="/"
          className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Back to App</span>
        </Link>

        {/* Info */}
        <p className="text-xs text-gray-500 mt-6">
          This page is only available in development mode. Each AI operation
          costs 1 credit.
        </p>
      </div>
    </div>
  );
}
