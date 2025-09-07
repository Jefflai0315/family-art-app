"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import PolaroidCard from "./PolaroidCard";

interface Animation {
  taskId: string;
  status: string;
  downloadUrl?: string;
  cloudinaryVideoUrl?: string;
  cloudinaryImageUrl?: string;
  prompt?: string;
  familyArtId: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

interface AnimationGalleryScreenProps {
  animations: Animation[];
  queueNumber: string;
  onBack: () => void;
  onGenerateNew: () => void;
}

const AnimationGalleryScreen = ({
  animations,
  queueNumber,
  onBack,
  onGenerateNew,
}: AnimationGalleryScreenProps) => {
  const dragAreaRef = useRef<HTMLDivElement>(null);

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

  const successfulAnimations = animations.filter(
    (anim) => anim.status === "success" && anim.cloudinaryVideoUrl
  );

  // Pre-defined positions for scattered polaroids
  const POSITIONS = [
    { top: "5%", left: "10%", rotate: -8 },
    { top: "15%", left: "60%", rotate: 5 },
    { top: "45%", left: "5%", rotate: 3 },
    { top: "2%", left: "35%", rotate: 10 },
    { top: "40%", left: "70%", rotate: -12 },
    { top: "50%", left: "38%", rotate: -3 },
  ];

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
          🎬 Animation Gallery
        </h1>
        <p className="font-permanent-marker text-neutral-300 text-xl tracking-wide">
          Queue Number: <span className="text-yellow-400">{queueNumber}</span>
        </p>
        <p className="text-neutral-400 mt-2">
          Found {successfulAnimations.length} animation
          {successfulAnimations.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {successfulAnimations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          <PolaroidCard
            caption="No Animations Yet"
            status="done"
            isMobile={true}
            className="w-80"
            aspectRatio="4:3"
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={onGenerateNew} className="primary-button">
              Create New Animation
            </button>
            <button onClick={onBack} className="secondary-button">
              Go Back
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Mobile: Stacked layout */}
          <div className="block md:hidden w-full max-w-sm space-y-6">
            {successfulAnimations.map((animation, index) => (
              <motion.div
                key={animation.taskId}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: index * 0.2,
                  duration: 0.8,
                  type: "spring",
                }}
                className="flex justify-center"
              >
                <PolaroidCard
                  caption={`Animation ${index + 1}`}
                  status="done"
                  imageUrl={animation.cloudinaryImageUrl}
                  videoUrl={animation.cloudinaryVideoUrl}
                  onDownload={() => {
                    if (animation.cloudinaryVideoUrl) {
                      downloadVideo(
                        animation.cloudinaryVideoUrl,
                        `animation-${queueNumber}-${index + 1}.mp4`
                      );
                    }
                  }}
                  onShake={() => {
                    if (animation.cloudinaryVideoUrl && navigator.share) {
                      navigator.share({
                        title: "My Animated Family Artwork",
                        text: "Check out my animated art!",
                        url: animation.cloudinaryVideoUrl,
                      });
                    } else if (animation.cloudinaryVideoUrl) {
                      navigator.clipboard.writeText(
                        animation.cloudinaryVideoUrl
                      );
                      alert("Animation URL copied to clipboard!");
                    }
                  }}
                  isMobile={true}
                  className="w-80"
                  aspectRatio="4:3"
                />
              </motion.div>
            ))}
          </div>

          {/* Desktop: Scattered polaroid layout */}
          <div
            ref={dragAreaRef}
            className="hidden md:block relative w-full max-w-6xl h-[600px] mt-4"
          >
            {successfulAnimations.map((animation, index) => {
              const { top, left, rotate } = POSITIONS[index % POSITIONS.length];
              return (
                <motion.div
                  key={animation.taskId}
                  className="absolute cursor-grab active:cursor-grabbing"
                  style={{ top, left }}
                  initial={{ opacity: 0, scale: 0.5, y: 100, rotate: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotate: `${rotate}deg`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: index * 0.15,
                  }}
                >
                  <PolaroidCard
                    dragConstraintsRef={
                      dragAreaRef as React.RefObject<HTMLElement>
                    }
                    caption={`Animation ${index + 1}`}
                    status="done"
                    imageUrl={animation.cloudinaryImageUrl}
                    videoUrl={animation.cloudinaryVideoUrl}
                    onDownload={() => {
                      if (animation.cloudinaryVideoUrl) {
                        downloadVideo(
                          animation.cloudinaryVideoUrl,
                          `animation-${queueNumber}-${index + 1}.mp4`
                        );
                      }
                    }}
                    onShake={() => {
                      if (animation.cloudinaryVideoUrl && navigator.share) {
                        navigator.share({
                          title: "My Animated Family Artwork",
                          text: "Check out my animated art!",
                          url: animation.cloudinaryVideoUrl,
                        });
                      } else if (animation.cloudinaryVideoUrl) {
                        navigator.clipboard.writeText(
                          animation.cloudinaryVideoUrl
                        );
                        alert("Animation URL copied to clipboard!");
                      }
                    }}
                    aspectRatio="4:3"
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <button onClick={onGenerateNew} className="primary-button">
              Create Another Animation
            </button>
            <button onClick={onBack} className="secondary-button">
              Go Back
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default AnimationGalleryScreen;
