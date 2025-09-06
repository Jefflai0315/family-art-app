"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw, ArrowLeft, CheckCircle } from "lucide-react";
import PolaroidCard from "./PolaroidCard";

interface OutlinePreviewScreenProps {
  originalPhoto: string | null;
  generatedOutline: string | null;
  queueNumber?: string | null;
  aspectRatio?: "4:3" | "1:1" | "16:9";
  onProceed: () => void;
  onRegenerate: () => void;
  onBack: () => void;
}

const OutlinePreviewScreen: React.FC<OutlinePreviewScreenProps> = ({
  originalPhoto,
  generatedOutline,
  queueNumber,
  aspectRatio = "4:3",
  onProceed,
  onRegenerate,
  onBack,
}) => {
  const dragAreaRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!generatedOutline) return;

    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = generatedOutline;
    link.download = `coloring-outline-${queueNumber || "outline"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          🎨 Outline Ready!
        </h1>
        <p className="font-permanent-marker text-neutral-300 text-xl tracking-wide">
          Your AI-generated coloring outline
        </p>
      </motion.div>

      {/* Queue Number Display */}
      {queueNumber && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
          className="mb-8"
        >
          <div className="bg-yellow-400/20 backdrop-blur-sm rounded-lg p-6 border-2 border-yellow-400/50">
            <div className="text-center">
              <div className="text-6xl font-bold text-yellow-400 mb-3 font-caveat">
                #{queueNumber}
              </div>
              <p className="text-yellow-300 font-permanent-marker text-lg mb-2">
                Your Queue Number
              </p>
              <p className="text-yellow-200 text-sm">
                Save this number! You&apos;ll need it to submit your finished
                artwork later.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile-friendly polaroid layout */}
      <div className="w-full max-w-6xl">
        {/* Mobile: Stacked layout */}
        <div className="block md:hidden space-y-6">
          {/* Generated Outline Polaroid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            className="flex justify-center"
          >
            <PolaroidCard
              caption="Your Outline"
              status="done"
              imageUrl={generatedOutline || undefined}
              onDownload={handleDownload}
              isMobile={true}
              className="w-80"
              aspectRatio={aspectRatio}
            />
          </motion.div>

          {/* Original Photo Polaroid (if available) */}
          {originalPhoto && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
              className="flex justify-center"
            >
              <PolaroidCard
                caption="Original Photo"
                status="done"
                imageUrl={originalPhoto}
                isMobile={true}
                className="w-64"
                aspectRatio={aspectRatio}
              />
            </motion.div>
          )}
        </div>

        {/* Desktop: Scattered layout */}
        <div
          ref={dragAreaRef}
          className="hidden md:block relative w-full h-[600px] mt-4"
        >
          {/* Generated Outline Polaroid */}
          <motion.div
            className="absolute cursor-grab active:cursor-grabbing"
            style={{ top: "20%", left: "50%", transform: "translateX(-50%)" }}
            initial={{ opacity: 0, scale: 0.5, y: 100, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: "2deg" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.5,
            }}
          >
            <PolaroidCard
              dragConstraintsRef={dragAreaRef as React.RefObject<HTMLElement>}
              caption="Your Outline"
              status="done"
              imageUrl={generatedOutline || undefined}
              onDownload={handleDownload}
              aspectRatio={aspectRatio}
            />
          </motion.div>

          {/* Original Photo Polaroid (if available) */}
          {originalPhoto && (
            <motion.div
              className="absolute cursor-grab active:cursor-grabbing"
              style={{ top: "10%", left: "20%", transform: "rotate(-5deg)" }}
              initial={{ opacity: 0, scale: 0.5, y: 100, rotate: 0 }}
              animate={{ opacity: 1, scale: 0.8, y: 0, rotate: "-5deg" }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.7,
              }}
            >
              <PolaroidCard
                dragConstraintsRef={dragAreaRef as React.RefObject<HTMLElement>}
                caption="Original Photo"
                status="done"
                imageUrl={originalPhoto}
                className="w-64"
                aspectRatio={aspectRatio}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-4 mt-8"
      >
        <motion.button
          onClick={onBack}
          className="secondary-button"
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 inline mr-2" />
          Back
        </motion.button>

        <motion.button
          onClick={handleDownload}
          disabled={!generatedOutline}
          className="primary-button disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download className="w-5 h-5 inline mr-2" />
          Download
        </motion.button>

        <motion.button
          onClick={onRegenerate}
          className="secondary-button"
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-5 h-5 inline mr-2" />
          Regenerate
        </motion.button>

        <motion.button
          onClick={onProceed}
          className="primary-button"
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Animation
          <CheckCircle className="w-5 h-5 inline ml-2" />
        </motion.button>
      </motion.div>

      {/* Success sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: `${15 + i * 10}%`,
              top: `${20 + (i % 3) * 25}%`,
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

export default OutlinePreviewScreen;
