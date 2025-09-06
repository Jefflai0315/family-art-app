"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import PolaroidCard from "./PolaroidCard";

interface AnimationInputScreenProps {
  onRetrieveAnimations: (queueNumber: string) => void;
  onGenerateAnimation: (queueNumber: string, imageData: string) => void;
  onBack: () => void;
}

const AnimationInputScreen = ({
  onRetrieveAnimations,
  onGenerateAnimation,
  onBack,
}: AnimationInputScreenProps) => {
  const [queueNumber, setQueueNumber] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetrieve = async () => {
    if (!queueNumber.trim()) {
      alert("Please enter a queue number");
      return;
    }

    setIsRetrieving(true);
    try {
      onRetrieveAnimations(queueNumber.trim());
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleGenerate = async () => {
    if (!queueNumber.trim()) {
      alert("Please enter a queue number");
      return;
    }

    if (!uploadedImage) {
      alert("Please upload an image");
      return;
    }

    setIsGenerating(true);
    try {
      onGenerateAnimation(queueNumber.trim(), uploadedImage);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    // Reset file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
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
          🎬 Animation Center
        </h1>
        <p className="font-permanent-marker text-neutral-300 text-xl tracking-wide">
          Retrieve your existing animations or create a new one
        </p>
      </motion.div>

      {/* Main content area */}
      <div className="w-full max-w-4xl">
        {/* Queue Number Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-6 border border-neutral-700">
            <label className="block text-neutral-300 font-permanent-marker text-lg mb-3">
              Queue Number *
            </label>
            <input
              type="text"
              value={queueNumber}
              onChange={(e) => setQueueNumber(e.target.value)}
              placeholder="Enter your queue number"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-600 rounded-lg text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent font-permanent-marker text-lg"
            />
          </div>
        </motion.div>

        {/* Action Polaroids */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Retrieve Animation Polaroid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
            className="flex-1 flex justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
            >
              <PolaroidCard
                caption={isRetrieving ? "Retrieving..." : "Retrieve Animations"}
                status={isRetrieving ? "pending" : "done"}
                onAction={handleRetrieve}
                isMobile={true}
                className="w-80"
                aspectRatio="4:3"
              />
            </motion.div>
          </motion.div>

          {/* Generate Animation Polaroid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
            className="flex-1 flex justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
            >
              <PolaroidCard
                caption={isGenerating ? "Generating..." : "Generate New"}
                status={isGenerating ? "pending" : "done"}
                onAction={handleGenerate}
                isMobile={true}
                className="w-80"
                aspectRatio="4:3"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Image Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-6 border border-neutral-700">
            <label className="block text-neutral-300 font-permanent-marker text-lg mb-4">
              Upload Artwork (for new animation)
            </label>
            <div className="border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center">
              {uploadedImage ? (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                  >
                    <PolaroidCard
                      caption="Your Artwork"
                      status="done"
                      imageUrl={uploadedImage}
                      isMobile={true}
                      className="w-64"
                    />
                  </motion.div>
                  <motion.button
                    onClick={clearImage}
                    className="secondary-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Remove Image
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                  >
                    <PolaroidCard
                      caption="Click to Upload"
                      status="done"
                      onAction={() => {
                        const input = document.getElementById(
                          "image-upload"
                        ) as HTMLInputElement;
                        input?.click();
                      }}
                      isMobile={true}
                      className="w-64"
                      aspectRatio="4:3"
                    />
                  </motion.div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <p className="text-neutral-400 font-permanent-marker text-lg">
                    Click the polaroid to upload your finished artwork
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            onClick={onBack}
            className="secondary-button"
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            Go Back
          </motion.button>
        </motion.div>
      </div>

      {/* Floating animation icons */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 text-yellow-400"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          >
            🎬
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnimationInputScreen;
