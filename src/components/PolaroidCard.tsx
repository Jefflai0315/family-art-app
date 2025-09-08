"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
// import { cn } from "../lib/utils";

// Temporary inline cn function
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

type ImageStatus = "pending" | "done" | "error";

interface PolaroidCardProps {
  imageUrl?: string;
  videoUrl?: string;
  caption: string;
  status: ImageStatus;
  error?: string;
  dragConstraintsRef?: React.RefObject<HTMLElement>;
  onShake?: (caption: string) => void;
  onDownload?: (url: string, caption: string) => Promise<void> | void;
  onAction?: () => void;
  isMobile?: boolean;
  className?: string;
  aspectRatio?: "4:3" | "1:1" | "16:9";
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <svg
      className="animate-spin h-8 w-8 text-neutral-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);

const ErrorDisplay = () => (
  <div className="flex items-center justify-center h-full">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 text-red-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </div>
);

const Placeholder = () => (
  <div className="flex flex-col items-center justify-center h-full text-neutral-500 group-hover:text-neutral-300 transition-colors duration-300">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16 mb-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
    <span className="font-permanent-marker text-xl">Upload Photo</span>
  </div>
);

const PolaroidCard: React.FC<PolaroidCardProps> = ({
  imageUrl,
  videoUrl,
  caption,
  status,
  dragConstraintsRef,
  onShake,
  onDownload,
  onAction,
  isMobile = false,
  className,
  aspectRatio = "4:3",
}) => {
  const [isDeveloped, setIsDeveloped] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const lastShakeTime = useRef(0);
  const lastVelocity = useRef({ x: 0, y: 0 });

  // Helper function to get aspect ratio class for the image area only
  const getImageAspectRatioClass = (ratio: "4:3" | "1:1" | "16:9") => {
    switch (ratio) {
      case "4:3":
        return "aspect-[4/3]";
      case "1:1":
        return "aspect-square";
      case "16:9":
        return "aspect-video";
      default:
        return "aspect-[4/3]";
    }
  };

  // Reset states when the image/video URL changes or status goes to pending.
  useEffect(() => {
    if (status === "pending") {
      setIsDeveloped(false);
      setIsImageLoaded(false);
    }
    if (status === "done" && (imageUrl || videoUrl)) {
      setIsDeveloped(false);
      // Set image as loaded immediately if we have a valid URL
      setIsImageLoaded(true);

      // Fallback: ensure image is visible even if onLoad doesn't fire
      const fallbackTimer = setTimeout(() => {
        setIsImageLoaded(true);
      }, 100);

      return () => clearTimeout(fallbackTimer);
    }
  }, [imageUrl, videoUrl, status]);

  // When the image is loaded, start the developing animation.
  useEffect(() => {
    if (isImageLoaded) {
      const timer = setTimeout(() => {
        setIsDeveloped(true);
      }, 200); // Short delay before animation starts
      return () => clearTimeout(timer);
    }
  }, [isImageLoaded]);

  const handleDragStart = () => {
    // Reset velocity on new drag to prevent false triggers from old data
    lastVelocity.current = { x: 0, y: 0 };
  };

  const handleDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { velocity: { x: number; y: number } }
  ) => {
    if (!onShake || isMobile) return;

    const velocityThreshold = 1500; // Require a high velocity to be considered a "shake".
    const shakeCooldown = 2000; // 2 seconds cooldown to prevent spamming.

    const { x, y } = info.velocity;
    const { x: prevX, y: prevY } = lastVelocity.current;
    const now = Date.now();

    // A true "shake" is a rapid movement AND a sharp change in direction.
    // We detect this by checking if the velocity is high and if its direction
    // has reversed from the last frame (i.e., the dot product is negative).
    const magnitude = Math.sqrt(x * x + y * y);
    const dotProduct = x * prevX + y * prevY;

    if (
      magnitude > velocityThreshold &&
      dotProduct < 0 &&
      now - lastShakeTime.current > shakeCooldown
    ) {
      lastShakeTime.current = now;
      onShake(caption);
    }

    lastVelocity.current = { x, y };
  };

  const cardInnerContent = (
    <>
      <div
        className={cn(
          "w-full bg-neutral-900 shadow-inner flex-grow relative overflow-hidden group",
          getImageAspectRatioClass(aspectRatio)
        )}
      >
        {status === "pending" && <LoadingSpinner />}
        {status === "error" && <ErrorDisplay />}
        {status === "done" && (imageUrl || videoUrl) && (
          <>
            <div
              className={cn(
                "absolute top-2 right-2 z-20 flex flex-col gap-2 transition-opacity duration-300",
                !isMobile && "opacity-0 group-hover:opacity-100"
              )}
            >
              {onDownload && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation(); // Prevent drag from starting on click
                    const url = videoUrl || imageUrl;
                    if (url && onDownload) {
                      await onDownload(url, caption);
                    }
                  }}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label={`Download ${
                    videoUrl ? "video" : "image"
                  } for ${caption}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
              )}
              {isMobile && onShake && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShake(caption);
                  }}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label={`Regenerate ${
                    videoUrl ? "video" : "image"
                  } for ${caption}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.899 2.186l-1.42.71a5.002 5.002 0 00-8.479-1.554H10a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.899-2.186l1.42-.71a5.002 5.002 0 008.479 1.554H10a1 1 0 110-2h6a1 1 0 011 1v6a1 1 0 01-1 1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* The developing chemical overlay - fades out */}
            <div
              className={`absolute inset-0 z-10 bg-[#3a322c] transition-opacity duration-[3500ms] ease-out ${
                isDeveloped ? "opacity-0" : "opacity-100"
              }`}
              aria-hidden="true"
            />

            {/* Video Content */}
            {videoUrl ? (
              <video
                key={videoUrl}
                src={videoUrl}
                className={`w-full h-full object-cover transition-all duration-[4000ms] ease-in-out relative z-20 ${
                  isImageLoaded
                    ? isDeveloped
                      ? "opacity-100 filter-none"
                      : "opacity-80 filter sepia(1) contrast(0.8) brightness(0.8)"
                    : "opacity-0"
                }`}
                onLoadedData={() => {
                  console.log("Video loaded:", videoUrl);
                  setIsImageLoaded(true);
                }}
                onError={(e) => {
                  console.error("Video error:", e, videoUrl);
                }}
                controls
                loop
                muted
                playsInline
                autoPlay
                preload="metadata"
              />
            ) : (
              /* Image Content */
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt={caption}
                  onLoad={() => setIsImageLoaded(true)}
                  className={`w-full h-full object-cover transition-all duration-[4000ms] ease-in-out ${
                    isImageLoaded
                      ? isDeveloped
                        ? "opacity-100 filter-none"
                        : "opacity-80 filter sepia(1) contrast(0.8) brightness(0.8)"
                      : "opacity-0"
                  }`}
                />
              </>
            )}
          </>
        )}
        {status === "done" && !imageUrl && !videoUrl && <Placeholder />}
        {onAction && !videoUrl && (
          <button
            onClick={onAction}
            className="absolute inset-0 w-full h-full z-10 bg-transparent hover:bg-black/10 transition-colors duration-200"
            aria-label={`Action for ${caption}`}
          />
        )}
      </div>
      <div className="absolute bottom-4 left-4 right-4 text-center px-2">
        <p
          className={cn(
            "font-permanent-marker text-lg truncate",
            status === "done" && (imageUrl || videoUrl)
              ? "text-black"
              : "text-neutral-800"
          )}
        >
          {caption}
        </p>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div
        className={cn(
          "bg-neutral-100 dark:bg-neutral-100 !p-4 !pb-16 flex flex-col items-center justify-start w-80 max-w-full rounded-md shadow-lg relative",
          videoUrl ? "cursor-default" : "cursor-grab active:cursor-grabbing",
          className
        )}
      >
        {cardInnerContent}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "bg-neutral-100 dark:bg-neutral-100 !p-4 !pb-16 flex flex-col items-center justify-start w-80 max-w-full rounded-md shadow-lg relative",
        videoUrl ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        className
      )}
      drag={!videoUrl}
      dragConstraints={dragConstraintsRef}
      onDrag={handleDrag}
      onDragStart={handleDragStart}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {cardInnerContent}
    </motion.div>
  );
};

export default PolaroidCard;
