"use client";

import FamilyArtApp from "@/components/FamilyArtApp";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute requireCredits={false}>
      <FamilyArtApp />
    </ProtectedRoute>
  );
}
