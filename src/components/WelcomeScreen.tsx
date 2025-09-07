"use client";

import React from "react";
import { motion } from "framer-motion";
import PolaroidCard from "./PolaroidCard";

interface WelcomeScreenProps {
  onStart: () => void;
  onSubmitArtwork: () => void;
}

// Ghost polaroids configuration for intro animation
const GHOST_POLAROIDS_CONFIG = [
  {
    initial: { x: "-150%", y: "-100%", rotate: -30 },
    transition: { delay: 0.2 },
  },
  { initial: { x: "150%", y: "-80%", rotate: 25 }, transition: { delay: 0.4 } },
  {
    initial: { x: "-120%", y: "120%", rotate: 45 },
    transition: { delay: 0.6 },
  },
  { initial: { x: "180%", y: "90%", rotate: -20 }, transition: { delay: 0.8 } },
  { initial: { x: "0%", y: "-200%", rotate: 0 }, transition: { delay: 0.5 } },
  { initial: { x: "100%", y: "150%", rotate: 10 }, transition: { delay: 0.3 } },
];

const WelcomeScreen = ({ onStart, onSubmitArtwork }: WelcomeScreenProps) => {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full flex-1 min-h-0">
      {/* Ghost polaroids for intro animation */}
      {GHOST_POLAROIDS_CONFIG.map((config, index) => (
        <motion.div
          key={index}
          className="absolute w-80 h-[26rem] rounded-md p-4 bg-neutral-100/10 blur-sm"
          initial={config.initial}
          animate={{
            x: "0%",
            y: "0%",
            rotate: (Math.random() - 0.5) * 20,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            ...config.transition,
            ease: "circOut",
            duration: 2,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.8, type: "spring" }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-caveat font-bold text-neutral-100 mb-4">
          Family Art Magic
        </h1>
        <p className="font-permanent-marker text-neutral-300 text-xl tracking-wide">
          Turn your family photo into a masterpiece!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.8 }}
        className="flex flex-col items-center gap-8"
      >
        <motion.button
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer flex justify-center"
          onClick={onStart}
        >
          <PolaroidCard
            caption="Start Creating"
            status="done"
            isMobile={true}
            className="w-80"
            aspectRatio="4:3"
          />
        </motion.button>

        {/* Secondary action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            onClick={onSubmitArtwork}
            className="secondary-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.6, duration: 0.6 }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit Finished Artwork
          </motion.button>

          <motion.a
            href="/view"
            className="secondary-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.8, duration: 0.6 }}
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            View Existing Artwork
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
