"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import ArtworkViewer from "@/components/ArtworkViewer";
import FloatingPolaroidPairs from "@/components/FloatingPolaroidPairs";

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
  const [recentSubmissions, setRecentSubmissions] = useState<
    {
      queueNumber: string;
      cloudinaryImageUrl?: string;
      cloudinaryVideoUrl?: string;
      createdAt: string;
      status: string;
      animations: Array<{
        taskId: string;
        status: string;
        cloudinaryVideoUrl?: string;
        cloudinaryImageUrl?: string;
        createdAt: string;
      }>;
    }[]
  >([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Load recent submissions for background
  useEffect(() => {
    const loadRecentSubmissions = async () => {
      try {
        const response = await fetch("/api/get-recent-submissions");
        const data = await response.json();

        if (response.ok) {
          setRecentSubmissions(data.submissions || []);
        }
      } catch (err) {
        console.error("Failed to load recent submissions:", err);
      } finally {
        setLoadingRecent(false);
      }
    };

    loadRecentSubmissions();
  }, []);

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
    <div className="relative flex flex-col items-center justify-center w-full h-screen bg-black bg-grid-white/[0.05] overflow-hidden">
      {/* Floating Polaroid Pairs Background */}
      {!loadingRecent && recentSubmissions.length > 0 && (
        <FloatingPolaroidPairs submissions={recentSubmissions} />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative z-10"
      >
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-caveat font-bold text-neutral-100 mb-4 drop-shadow-2xl">
          🔍 View Artwork
        </h1>
        <p className="font-permanent-marker text-neutral-300 text-xl tracking-wide drop-shadow-lg">
          Enter your queue number to view your creation
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
        className=" p-4 w-full max-w-md space-y-6 relative z-10"
      >
        <div className="relative">
          <input
            type="text"
            value={queueNumber}
            onChange={(e) => setQueueNumber(e.target.value)}
            placeholder="Enter queue number (e.g., 10001)"
            className="w-full px-6 py-4 text-lg md:text-xl font-permanent-marker text-center bg-black/40 backdrop-blur-md border-2 border-white/50 rounded-lg text-white placeholder-neutral-300 focus:outline-none focus:border-yellow-400 focus:bg-black/60 transition-all duration-300 shadow-2xl"
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
            className="w-full primary-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Search className="w-6 h-6 mr-2" />
            )}
            {isLoading ? "Searching..." : "View Artwork"}
          </button>

          {/* <Link
            href="/"
            className="secondary-button flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Back to Home
          </Link> */}
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
