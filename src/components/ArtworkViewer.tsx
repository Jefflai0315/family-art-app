"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Share2,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import PolaroidCard from "./PolaroidCard";

interface Submission {
  queueNumber: string;
  originalPhotoUrl: string;
  generatedOutlineUrl: string;
  createdAt: string;
  status: string;
}

interface Animation {
  taskId: string;
  status: string;
  cloudinaryVideoUrl?: string;
  cloudinaryImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

interface ArtworkViewerProps {
  submission: Submission;
  animations: Animation[];
  onBack: () => void;
}

const ArtworkViewer = ({
  submission,
  animations,
  onBack,
}: ArtworkViewerProps) => {
  const [currentView, setCurrentView] = useState<
    "original" | "outline" | "animation"
  >("original");
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const successfulAnimations = animations.filter(
    (anim) => anim.status === "success" && anim.cloudinaryVideoUrl
  );

  const downloadVideo = async (url: string, filename: string) => {
    try {
      if (url.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading video:", error);
      window.open(url, "_blank");
    }
  };

  const shareContent = () => {
    const currentAnimation = successfulAnimations[currentAnimationIndex];
    const url =
      currentAnimation?.cloudinaryVideoUrl || submission.originalPhotoUrl;

    if (navigator.share) {
      navigator.share({
        title: "My Family Artwork",
        text: "Check out my family artwork!",
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("URL copied to clipboard!");
    }
  };

  const getCurrentImageUrl = () => {
    switch (currentView) {
      case "original":
        return submission.originalPhotoUrl;
      case "outline":
        return submission.generatedOutlineUrl;
      case "animation":
        return (
          successfulAnimations[currentAnimationIndex]?.cloudinaryImageUrl ||
          submission.originalPhotoUrl
        );
      default:
        return submission.originalPhotoUrl;
    }
  };

  const getCurrentVideoUrl = () => {
    if (
      currentView === "animation" &&
      successfulAnimations[currentAnimationIndex]
    ) {
      return successfulAnimations[currentAnimationIndex].cloudinaryVideoUrl;
    }
    return undefined;
  };

  const getCurrentCaption = () => {
    switch (currentView) {
      case "original":
        return "Original Photo";
      case "outline":
        return "Generated Outline";
      case "animation":
        return `Animation ${currentAnimationIndex + 1}`;
      default:
        return "Artwork";
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen bg-black bg-grid-white/[0.05]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-caveat font-bold text-neutral-100 mb-2">
          🎨 Artwork Viewer
        </h1>
        <p className="font-permanent-marker text-neutral-300 text-lg tracking-wide">
          Queue Number:{" "}
          <span className="text-yellow-400">{submission.queueNumber}</span>
        </p>
      </motion.div>

      {/* View Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex gap-2 mb-6"
      >
        <button
          onClick={() => setCurrentView("original")}
          className={`px-4 py-2 rounded-lg font-permanent-marker text-sm transition-all duration-300 ${
            currentView === "original"
              ? "bg-yellow-400 text-black"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          Original
        </button>
        <button
          onClick={() => setCurrentView("outline")}
          className={`px-4 py-2 rounded-lg font-permanent-marker text-sm transition-all duration-300 ${
            currentView === "outline"
              ? "bg-yellow-400 text-black"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          Outline
        </button>
        <button
          onClick={() => setCurrentView("animation")}
          disabled={successfulAnimations.length === 0}
          className={`px-4 py-2 rounded-lg font-permanent-marker text-sm transition-all duration-300 ${
            currentView === "animation"
              ? "bg-yellow-400 text-black"
              : successfulAnimations.length === 0
              ? "bg-white/5 text-white/50 cursor-not-allowed"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          Animation ({successfulAnimations.length})
        </button>
      </motion.div>

      {/* Animation Selector */}
      {currentView === "animation" && successfulAnimations.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex gap-2 mb-6"
        >
          {successfulAnimations.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAnimationIndex(index)}
              className={`w-8 h-8 rounded-full font-permanent-marker text-sm transition-all duration-300 ${
                currentAnimationIndex === index
                  ? "bg-yellow-400 text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </motion.div>
      )}

      {/* Main Polaroid Display */}
      <motion.div
        key={currentView + currentAnimationIndex}
        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="mb-8"
      >
        <PolaroidCard
          caption={getCurrentCaption()}
          status="done"
          imageUrl={getCurrentImageUrl()}
          videoUrl={getCurrentVideoUrl()}
          isMobile={true}
          className="w-80 md:w-96"
          aspectRatio="4:3"
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={() => {
            if (getCurrentVideoUrl()) {
              downloadVideo(
                getCurrentVideoUrl()!,
                `artwork-${submission.queueNumber}-${getCurrentCaption()
                  .toLowerCase()
                  .replace(/\s+/g, "-")}.mp4`
              );
            } else {
              const link = document.createElement("a");
              link.href = getCurrentImageUrl();
              link.download = `artwork-${
                submission.queueNumber
              }-${getCurrentCaption().toLowerCase().replace(/\s+/g, "-")}.jpg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
          className="primary-button flex items-center justify-center"
        >
          <Download className="w-5 h-5 mr-2" />
          Download
        </button>

        <button
          onClick={shareContent}
          className="secondary-button flex items-center justify-center"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </button>

        <button
          onClick={onBack}
          className="secondary-button flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </motion.div>

      {/* Info Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-8 text-center text-neutral-400 text-sm"
      >
        <p>Created: {new Date(submission.createdAt).toLocaleDateString()}</p>
        {successfulAnimations.length > 0 && (
          <p>Animations: {successfulAnimations.length} available</p>
        )}
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
};

export default ArtworkViewer;
