"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ArtworkViewer from "@/components/ArtworkViewer";

interface SubmissionData {
  submission: {
    queueNumber: string;
    originalPhotoUrl: string;
    generatedOutlineUrl: string;
    createdAt: string;
    status: string;
  };
  animations: Array<{
    taskId: string;
    status: string;
    cloudinaryVideoUrl?: string;
    cloudinaryImageUrl?: string;
    createdAt: string;
    updatedAt: string;
    errorMessage?: string;
  }>;
}

export default function ViewPage() {
  const [queueNumber, setQueueNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(
    null
  );

  const handleSearch = async () => {
    if (!queueNumber.trim()) {
      setError("Please enter a queue number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/get-submission?queueNumber=${queueNumber.trim()}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch submission");
      }

      setSubmissionData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load submission"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSubmissionData(null);
    setQueueNumber("");
    setError("");
  };

  if (submissionData) {
    return (
      <ArtworkViewer
        submission={submissionData.submission}
        animations={submissionData.animations}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen bg-black bg-grid-white/[0.05]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-caveat font-bold text-neutral-100 mb-4">
          🔍 View Artwork
        </h1>
        <p className="font-permanent-marker text-neutral-300 text-xl tracking-wide">
          Enter your queue number to view your creation
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
        className="w-full max-w-md space-y-6"
      >
        <div className="relative">
          <input
            type="text"
            value={queueNumber}
            onChange={(e) => setQueueNumber(e.target.value)}
            placeholder="Enter queue number (e.g., 10001)"
            className="w-full px-6 py-4 text-xl font-permanent-marker text-center bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-yellow-400 focus:bg-white/20 transition-all duration-300"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-center font-permanent-marker text-lg"
          >
            {error}
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="primary-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Search className="w-6 h-6 mr-2" />
            )}
            {isLoading ? "Searching..." : "View Artwork"}
          </button>

          <Link
            href="/"
            className="secondary-button flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Back to Home
          </Link>
        </div>
      </motion.div>

      {/* Animated sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
