"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireCredits?: boolean;
  minCredits?: number;
}

export default function ProtectedRoute({
  children,
  requireCredits = true,
  minCredits = 1,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (requireCredits && session?.user && session.user.credits < minCredits) {
      router.push("/credits");
      return;
    }
  }, [session, status, router, requireCredits, minCredits]);

  // Show loading spinner while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

  // If requires credits but user doesn't have enough, don't render children
  if (requireCredits && session?.user && session.user.credits < minCredits) {
    return null;
  }

  // User is authenticated and has enough credits, render children
  return <>{children}</>;
}
