"use client";

import FamilyArtApp from "@/components/FamilyArtApp";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute requireCredits={true} minCredits={1}>
      <FamilyArtApp />
    </ProtectedRoute>
  );
}
