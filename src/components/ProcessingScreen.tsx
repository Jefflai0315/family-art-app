"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import PolaroidCard from "./PolaroidCard";

interface ProcessingScreenProps {
  progress: number;
}

const ProcessingScreen = ({ progress }: ProcessingScreenProps) => {
  const steps = [
    "Analyzing family photo...",
    "Generating outline with AI...",
    "Optimizing for printing...",
    "Ready for coloring!",
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
        <h1 className="text-6xl md:text-8xl font-caveat font-bold text-neutral-100 mb-4">
          ✨ Creating Magic
        </h1>
        <p className="font-permanent-marker text-neutral-300 text-xl tracking-wide">
          Your coloring outline is being prepared
        </p>
      </motion.div>

      {/* Main processing polaroid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
        className="mb-8"
      >
        <PolaroidCard caption="Processing..." status="pending" />
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full max-w-md mb-8"
      >
        <div className="bg-neutral-800 rounded-full h-4 mb-4 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-center text-neutral-300 font-permanent-marker text-lg">
          {Math.round(progress)}% complete
        </p>
      </motion.div>

      {/* Processing steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="w-full max-w-md space-y-4"
      >
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                progress > (index + 1) * 25 ? "bg-green-500" : "bg-neutral-600"
              }`}
              animate={{
                scale: progress > (index + 1) * 25 ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {progress > (index + 1) * 25 && (
                <CheckCircle className="w-5 h-5 text-white" />
              )}
            </motion.div>
            <span className="text-neutral-300 font-permanent-marker text-lg">
              {step}
            </span>
          </motion.div>
        ))}
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

export default ProcessingScreen;
