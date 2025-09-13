"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Wand2, RefreshCw } from "lucide-react";
import { ANIMATION_MODELS, AnimationModelType } from "@/lib/animationConfig";

interface RegenerateAnimationScreenProps {
  queueNumber: string;
  imageData: string;
  currentPrompt?: string;
  currentModel?: string;
  onRegenerate: (prompt: string, modelType: string) => void;
  onBack: () => void;
}

const RegenerateAnimationScreen = ({
  queueNumber,
  imageData,
  currentPrompt = "Bring this artwork to life with gentle animation and flowing colors",
  currentModel = "HAILUO_FAST",
  onRegenerate,
  onBack,
}: RegenerateAnimationScreenProps) => {
  const [customPrompt, setCustomPrompt] = useState(currentPrompt);
  const [selectedModel, setSelectedModel] = useState<AnimationModelType>(
    currentModel as AnimationModelType
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!customPrompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      onRegenerate(customPrompt.trim(), selectedModel);
    } finally {
      setIsGenerating(false);
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
          ✨ Regenerate Animation
        </h1>
        <p className="font-permanent-marker text-neutral-300 text-xl tracking-wide">
          Try a different prompt or model
        </p>
        <p className="font-permanent-marker text-neutral-400 text-lg mt-2">
          Queue #{queueNumber}
        </p>
      </motion.div>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        onClick={onBack}
        className="absolute top-4 left-4 secondary-button"
      >
        <ArrowLeft className="w-5 h-5 inline mr-2" />
        Back
      </motion.button>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-2xl space-y-8"
      >
        {/* Prompt input */}
        <div className="space-y-4">
          <label className="block text-neutral-200 font-permanent-marker text-xl">
            Animation Prompt
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe how you want your artwork to be animated..."
            className="w-full h-32 p-4 bg-neutral-800 border border-neutral-600 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
            disabled={isGenerating}
          />
          <p className="text-neutral-400 text-sm">
            Be creative! Describe the movement, colors, or mood you want to see.
          </p>
        </div>

        {/* Model selection */}
        <div className="space-y-4">
          <label className="block text-neutral-200 font-permanent-marker text-xl">
            Animation Model
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(ANIMATION_MODELS).map(([key, model]) => (
              <motion.button
                key={key}
                onClick={() => setSelectedModel(key as AnimationModelType)}
                disabled={isGenerating}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedModel === key
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-neutral-600 bg-neutral-800 hover:border-neutral-500"
                } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-left">
                  <h3 className="font-permanent-marker text-lg text-neutral-100 mb-2">
                    {model.displayName}
                  </h3>
                  <p className="text-sm text-neutral-400 mb-2">
                    {model.description}
                  </p>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>{model.duration}s duration</span>
                    <span>{model.resolution}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Preview image */}
        <div className="space-y-4">
          <label className="block text-neutral-200 font-permanent-marker text-xl">
            Your Artwork
          </label>
          <div className="flex justify-center">
            <img
              src={imageData}
              alt="Your artwork"
              className="max-w-xs max-h-48 object-contain rounded-xl border-2 border-neutral-600"
            />
          </div>
        </div>

        {/* Generate button */}
        <motion.button
          onClick={handleRegenerate}
          disabled={isGenerating || !customPrompt.trim()}
          className={`w-full primary-button text-lg py-4 ${
            isGenerating || !customPrompt.trim()
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          whileHover={{ scale: isGenerating ? 1 : 1.02 }}
          whileTap={{ scale: isGenerating ? 1 : 0.98 }}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 inline mr-2 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 inline mr-2" />
              Regenerate Animation
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RegenerateAnimationScreen;
