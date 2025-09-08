"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { CreditCard, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CREDIT_PACKAGES } from "@/lib/stripe";
import { stripePromise } from "@/lib/stripe-client";
import { handleApiCall } from "@/lib/errorHandling";

interface CreditsResponse {
  success: boolean;
  credits: number;
}

interface CheckoutResponse {
  success: boolean;
  sessionId: string;
  url: string;
}

export default function CreditsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsError, setCreditsError] = useState<string | null>(null);

  // Fetch current credits
  const fetchCredits = useCallback(async () => {
    if (!session?.user?.email) return;

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
        setCreditsError("Unable to load credits");
        setCredits(null);
      } else if (data?.success) {
        setCredits(data.credits);
        setCreditsError(null);
      } else {
        setCreditsError("Unable to load credits");
        setCredits(null);
      }
    } catch {
      setCreditsError("Error loading credits");
      setCredits(null);
    }
  }, [session?.user?.email]);

  // Check for success/cancel parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      setMessage("Payment successful! Your credits have been added.");
      fetchCredits();
    } else if (urlParams.get("canceled") === "true") {
      setMessage("Payment was canceled. No credits were added.");
    }
  }, [fetchCredits]);

  // Fetch credits when session changes
  useEffect(() => {
    if (session?.user?.email) {
      fetchCredits();
    }
  }, [session?.user?.email, fetchCredits]);

  const handlePurchase = async (packageId: string) => {
    if (!session?.user) return;

    setLoading(packageId);
    setMessage("");

    try {
      const { data, error } = await handleApiCall<CheckoutResponse>(
        async () => {
          return fetch("/api/create-checkout-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ packageId }),
          });
        }
      );

      if (error) {
        setMessage(`Error: ${error.message}`);
        return;
      }

      if (data?.success && data.url) {
        // Redirect to Stripe checkout
        const stripe = await stripePromise;
        if (stripe) {
          const { error: stripeError } = await stripe.redirectToCheckout({
            sessionId: data.sessionId,
          });

          if (stripeError) {
            setMessage(`Error: ${stripeError.message}`);
          }
        } else {
          setMessage("Stripe is not configured. Please contact support.");
        }
      } else {
        setMessage("Failed to create checkout session");
      }
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(null);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black bg-grid-white/5 flex items-center justify-center">
        <div className="text-center text-neutral-100">
          <h1 className="text-4xl font-caveat font-bold mb-4">
            Please sign in to purchase credits
          </h1>
          <Link
            href="/auth/signin"
            className="inline-block bg-neutral-800 text-neutral-100 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-700 transition-colors border border-neutral-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-grid-white/5 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-caveat font-bold text-neutral-100 mb-4">
            Purchase Credits
          </h1>
          <p className="font-permanent-marker text-neutral-300 text-lg tracking-wide">
            Get credits to create your family artwork
          </p>
        </div>

        {/* Current Credits */}
        <div className="text-center mb-12">
          <div className="text-6xl font-caveat font-bold text-neutral-100 mb-2">
            {creditsError ? (
              <span className="text-red-400">Error</span>
            ) : (
              credits ?? "..."
            )}
          </div>
          <p className="text-neutral-400 text-lg">Current Credits</p>
          {creditsError && (
            <button
              onClick={fetchCredits}
              className="text-sm text-neutral-500 hover:text-neutral-300 mt-2 underline transition-colors"
            >
              Retry
            </button>
          )}
        </div>

        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-neutral-900/50 border rounded-lg p-6 transition-all duration-300 hover:scale-105 ${
                pkg.popular
                  ? "border-yellow-400/50 shadow-lg shadow-yellow-400/20"
                  : "border-neutral-700 hover:border-neutral-600"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                    Recommended
                  </div>
                </div>
              )}

              <div className="text-center">
                {/* Credits */}
                <div className="text-4xl font-caveat font-bold text-neutral-100 mb-2">
                  {pkg.credits}
                </div>
                <div className="text-neutral-400 mb-4">Credits</div>

                {/* Price */}
                <div className="text-3xl font-caveat font-bold text-neutral-100 mb-2">
                  SGD ${(pkg.price / 100).toFixed(2)}
                </div>
                <div className="text-sm text-neutral-500 mb-6">
                  ${(pkg.price / 100 / pkg.credits).toFixed(2)} per credit
                </div>

                {/* Description */}
                <p className="text-neutral-400 text-sm mb-6">
                  {pkg.description}
                </p>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    pkg.popular
                      ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
                      : "bg-neutral-700 text-neutral-100 hover:bg-neutral-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                >
                  {loading === pkg.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Purchase</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className="mb-8 p-4 bg-neutral-900/50 border border-neutral-700 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2 text-neutral-100">
              <Check className="w-5 h-5 text-green-400" />
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-neutral-800 text-neutral-100 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-700 transition-colors border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to App</span>
          </Link>
        </div>

        {/* Info */}
        <div className="text-center text-neutral-500 text-sm space-y-1">
          <p>Each AI generation costs 1 credit • Credits never expire</p>
          <p>Secure payment powered by Stripe</p>
        </div>
      </div>
    </div>
  );
}
