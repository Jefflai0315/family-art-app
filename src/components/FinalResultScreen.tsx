"use client";

import React from "react";
import { motion } from "framer-motion";
import { Share2, Download } from "lucide-react";
import PolaroidCard from "./PolaroidCard";

interface FinalResultScreenProps {
  onRestart: () => void;
  animationUrl?: string | null;
}

const FinalResultScreen = ({
  onRestart,
  animationUrl,
}: FinalResultScreenProps) => {
  console.log("FinalResultScreen received animationUrl:", animationUrl);

  const downloadVideo = async (url: string, filename: string) => {
    try {
      // If it's a data URL, download directly
      if (url.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // If it's an external URL, fetch and download as blob
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

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading video:", error);
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full flex-1 min-h-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-caveat font-bold text-neutral-100 mb-4">
          🎉 Your Masterpiece!
        </h1>
        <p className="font-permanent-marker text-neutral-300 text-xl tracking-wide">
          Watch your art come alive
        </p>
      </motion.div>

      {/* Main polaroid with animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
        className="mb-8 flex justify-center"
      >
        <PolaroidCard
          caption="Animated Artwork"
          status="done"
          imageUrl={animationUrl || undefined}
          onDownload={() => {
            if (animationUrl) {
              downloadVideo(animationUrl, "animated-family-artwork.mp4");
            }
          }}
          onShake={() => {
            if (animationUrl && navigator.share) {
              navigator.share({
                title: "My Animated Family Artwork",
                text: "Check out my animated art!",
                url: animationUrl,
              });
            } else if (animationUrl) {
              navigator.clipboard.writeText(animationUrl);
              alert("Animation URL copied to clipboard!");
            }
          }}
          isMobile={true}
          className="w-80"
        />
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={() => {
            if (animationUrl && navigator.share) {
              navigator.share({
                title: "My Animated Family Artwork",
                text: "Check out my animated art!",
                url: animationUrl,
              });
            } else if (animationUrl) {
              navigator.clipboard.writeText(animationUrl);
              alert("Animation URL copied to clipboard!");
            }
          }}
          disabled={!animationUrl}
          className="secondary-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-5 h-5 inline mr-2" />
          Share
        </button>

        <button
          onClick={() => {
            if (animationUrl) {
              downloadVideo(animationUrl, "animated-family-artwork.mp4");
            }
          }}
          disabled={!animationUrl}
          className="primary-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5 inline mr-2" />
          Save
        </button>

        <button onClick={onRestart} className="secondary-button">
          Create Another Masterpiece
        </button>
      </motion.div>
    </div>
  );
};

export default FinalResultScreen;
