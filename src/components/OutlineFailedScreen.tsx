"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import PolaroidCard from "./PolaroidCard";

interface OutlineFailedScreenProps {
  onRetry: () => void;
  onBack: () => void;
}

const OutlineFailedScreen = ({ onRetry, onBack }: OutlineFailedScreenProps) => {
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
          😔 Oops!
        </h1>
        <p className="font-permanent-marker text-neutral-300 text-xl tracking-wide">
          Outline generation failed
        </p>
      </motion.div>

      {/* Main error polaroid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
        className="mb-8 flex justify-center"
      >
        <PolaroidCard
          caption="Generation Failed"
          status="error"
          isMobile={true}
          className="w-80"
        />
      </motion.div>

      {/* Error details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full max-w-md mb-8"
      >
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-6 border border-neutral-700">
          <p className="text-neutral-300 mb-4 font-permanent-marker text-lg">
            We couldn&apos;t generate an outline from your photo. This might be
            due to:
          </p>
          <ul className="text-neutral-400 space-y-2 text-sm">
            <li>• Photo quality or lighting issues</li>
            <li>• Network connectivity problems</li>
            <li>• AI service temporarily unavailable</li>
          </ul>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <motion.button
          onClick={onRetry}
          className="primary-button"
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-5 h-5 inline mr-2" />
          Try Again
        </motion.button>

        <motion.button
          onClick={onBack}
          className="secondary-button"
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 inline mr-2" />
          Take New Photo
        </motion.button>
      </motion.div>

      {/* Floating error icons */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 text-red-400"
            style={{
              left: `${20 + i * 20}%`,
              top: `${20 + (i % 2) * 30}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            <AlertCircle className="w-full h-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OutlineFailedScreen;
