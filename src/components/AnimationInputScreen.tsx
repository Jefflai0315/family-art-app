"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  Upload,
  Crop,
  RotateCcw,
  RotateCw,
  Zap,
  Clock,
} from "lucide-react";
import ReactCrop, { Crop as CropType } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import PolaroidCard from "./PolaroidCard";
import { getAllModels, type AnimationModelType } from "@/lib/animationConfig";

interface AnimationInputScreenProps {
  onRetrieveAnimations: (queueNumber: string) => void;
  onGenerateAnimation: (
    queueNumber: string,
    imageData: string,
    prompt?: string,
    modelType?: AnimationModelType
  ) => void;
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
  const [showAdvancedPrompt, setShowAdvancedPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedModel, setSelectedModel] =
    useState<AnimationModelType>("HAILUO_FAST");
  const [isCropping, setIsCropping] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [cropPreset, setCropPreset] = useState<"4:3" | "1:1" | "16:9">("4:3");
  const [crop, setCrop] = useState<CropType>({
    unit: "%",
    width: 70,
    height: 52.5, // 4:3 aspect ratio (70 * 3/4 = 52.5)
    x: 15,
    y: 23.75,
  });
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper function to get crop dimensions based on preset
  const getCropDimensions = (preset: "4:3" | "1:1" | "16:9") => {
    switch (preset) {
      case "4:3":
        return { width: 70, height: 52.5, x: 15, y: 23.75 }; // 4:3 ratio, centered
      case "1:1":
        return { width: 60, height: 60, x: 20, y: 20 }; // Square, centered
      case "16:9":
        return { width: 75, height: 42.2, x: 12.5, y: 28.9 }; // 16:9 ratio, centered
      default:
        return { width: 70, height: 52.5, x: 15, y: 23.75 };
    }
  };

  // Helper function to get aspect ratio from preset
  const getAspectRatio = (preset: "4:3" | "1:1" | "16:9") => {
    switch (preset) {
      case "4:3":
        return 4 / 3;
      case "1:1":
        return 1;
      case "16:9":
        return 16 / 9;
      default:
        return 4 / 3;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setRotation(0); // Reset rotation for new image
        // Reset crop to center of image with current preset
        const dimensions = getCropDimensions(cropPreset);
        setCrop({
          unit: "%",
          ...dimensions,
        });
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCropPresetChange = (preset: "4:3" | "1:1" | "16:9") => {
    setCropPreset(preset);
    const dimensions = getCropDimensions(preset);
    setCrop({
      unit: "%",
      ...dimensions,
    });
    setCompletedCrop(undefined);
  };

  const handleImageLoad = () => {
    // Reset crop to center of the image with current preset
    const dimensions = getCropDimensions(cropPreset);
    setCrop({
      unit: "%",
      ...dimensions,
    });
  };

  const getCroppedImg = (imageSrc: string, crop: CropType): Promise<string> => {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        // Get the actual displayed image element to calculate proper scaling
        const imgElement = document.querySelector(
          'img[src="' + imageSrc + '"]'
        ) as HTMLImageElement;
        if (!imgElement) {
          resolve(imageSrc);
          return;
        }

        // Calculate the actual scaling factors based on displayed vs natural dimensions
        const scaleX = image.naturalWidth / imgElement.offsetWidth;
        const scaleY = image.naturalHeight / imgElement.offsetHeight;

        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;

        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width * scaleX,
          crop.height * scaleY
        );

        resolve(canvas.toDataURL("image/jpeg"));
      };
    });
  };

  const handleCropComplete = async () => {
    if (uploadedImage && completedCrop) {
      setIsProcessing(true);
      try {
        const croppedImg = await getCroppedImg(uploadedImage, completedCrop);
        setCroppedImage(croppedImg);
        setIsCropping(false);
      } catch (error) {
        console.error("Error cropping image:", error);
      } finally {
        setIsProcessing(false);
      }
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

    if (!croppedImage) {
      alert("Please upload an image first");
      return;
    }

    setIsGenerating(true);
    try {
      // Use custom prompt if provided, otherwise use default
      const prompt =
        customPrompt.trim() ||
        "Bring this artwork to life with gentle animation and flowing colors";
      onGenerateAnimation(
        queueNumber.trim(),
        croppedImage,
        prompt,
        selectedModel
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setCroppedImage(null);
    setIsCropping(false);
    // Reset file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const retakePhoto = () => {
    setUploadedImage(null);
    setCroppedImage(null);
    setIsCropping(false);
    setRotation(0);
    const dimensions = getCropDimensions(cropPreset);
    setCrop({
      unit: "%",
      ...dimensions,
    });
    setCompletedCrop(undefined);
  };

  // Show crop screen when cropping
  if (isCropping && uploadedImage) {
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
            ✂️ Crop Your Artwork
          </h1>
          <p className="font-permanent-marker text-neutral-300 text-xl tracking-wide">
            Adjust the crop area to focus on your finished artwork
          </p>
        </motion.div>

        {/* Crop interface */}
        <div className="relative w-full max-w-4xl h-[75dvh] mt-4 flex items-center justify-center">
          {/* Crop preset controls */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            {(["4:3", "1:1", "16:9"] as const).map((preset) => (
              <motion.button
                key={preset}
                onClick={() => handleCropPresetChange(preset)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  cropPreset === preset
                    ? "bg-white text-purple-600 shadow-lg"
                    : "bg-black/50 text-white hover:bg-black/70"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {preset}
              </motion.button>
            ))}
          </div>

          {/* Rotation controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <motion.button
              onClick={handleRotateLeft}
              className="bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white shadow-lg transition-all"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              title="Rotate Left"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={handleRotateRight}
              className="bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white shadow-lg transition-all"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              title="Rotate Right"
            >
              <RotateCw className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Rotation indicator */}
          {rotation !== 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-20 right-4 z-10 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg"
            >
              {rotation > 0 ? `↻ ${rotation}°` : `↺ ${Math.abs(rotation)}°`}
            </motion.div>
          )}

          <ReactCrop
            key={cropPreset} // Force re-render when preset changes
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={getAspectRatio(cropPreset)}
            minWidth={200}
            minHeight={150}
            keepSelection
            className="max-w-full max-h-[65dvh]"
            renderSelectionAddon={() => (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-white">
                  <div className="w-8 h-8 mx-auto mb-1 opacity-80 text-center text-lg">
                    🎨
                  </div>
                  <p className="text-xs font-medium opacity-90">
                    Position your artwork here
                  </p>
                  <p className="text-xs opacity-70 mt-1">{cropPreset} ratio</p>
                </div>
              </div>
            )}
          >
            <img
              src={uploadedImage}
              alt="Uploaded artwork"
              className="max-w-full max-h-[65dvh] object-contain"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: "transform 0.3s ease-in-out",
              }}
              onLoad={handleImageLoad}
            />
          </ReactCrop>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-2 right-2 flex justify-between items-center gap-2">
            <motion.button
              onClick={retakePhoto}
              className="bg-white/90 text-gray-800 px-6 py-3 rounded-full text-xs font-medium shadow-lg hover:bg-white transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>

            <motion.button
              onClick={handleCropComplete}
              disabled={!completedCrop || isProcessing}
              className={`w-18 h-18 bg-white rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${
                !completedCrop || isProcessing
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-110 hover:shadow-2xl"
              }`}
              whileHover={completedCrop && !isProcessing ? { scale: 1.1 } : {}}
              whileTap={completedCrop && !isProcessing ? { scale: 0.9 } : {}}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  completedCrop && !isProcessing
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    : "bg-gray-300"
                }`}
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Crop className="w-8 h-8 text-white" />
                )}
              </div>
            </motion.button>

            <motion.button
              onClick={retakePhoto}
              className="bg-white/90 text-gray-800 px-6 py-3 rounded-full text-xs font-medium shadow-lg hover:bg-white transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload className="w-5 h-5" />
              Reupload
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

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
            className="flex-1 flex justify-center "
          >
            <motion.button
              onClick={handleRetrieve}
              className={`secondary-button w-full ${
                queueNumber.trim() === ""
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.6, duration: 0.6 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              disabled={queueNumber.trim() === ""}
            >
              {isRetrieving ? "Retrieving..." : "Retrieve Animations"}
            </motion.button>
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
              {croppedImage ? (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                  >
                    <PolaroidCard
                      caption="Cropped Artwork"
                      status="done"
                      imageUrl={croppedImage}
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
              ) : uploadedImage ? (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                  >
                    <PolaroidCard
                      caption="Ready to Crop"
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
                    className="cursor-pointer flex justify-center"
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

        {/* Advanced Prompt Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-6 border border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <label className="text-neutral-300 font-permanent-marker text-lg">
                Animation Prompt
              </label>
              <button
                onClick={() => setShowAdvancedPrompt(!showAdvancedPrompt)}
                className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">
                  {showAdvancedPrompt ? "Hide" : "Advanced"}
                </span>
              </button>
            </div>

            {showAdvancedPrompt ? (
              <div className="space-y-4">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter your custom animation prompt (e.g., 'Make the colors dance and the characters wave gently')"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-600 rounded-lg text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent font-permanent-marker text-sm resize-none"
                  rows={3}
                />
                <p className="text-xs text-neutral-400">
                  Leave empty to use the default prompt: &quot;Bring this
                  artwork to life with gentle animation and flowing colors&quot;
                </p>
              </div>
            ) : (
              <div className="text-neutral-400 text-sm">
                {customPrompt.trim() ? (
                  <div>
                    <span className="text-yellow-400">Custom prompt:</span>{" "}
                    &quot;{customPrompt}&quot;
                  </div>
                ) : (
                  <div>
                    Using default prompt: &quot;Bring this artwork to life with
                    gentle animation and flowing colors&quot;
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Animation Model Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-6 border border-neutral-700">
            <label className="block text-neutral-300 font-permanent-marker text-lg mb-4">
              Animation Model
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(getAllModels()).map(([key, model]) => (
                <motion.button
                  key={key}
                  onClick={() => setSelectedModel(key as AnimationModelType)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedModel === key
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-neutral-600 hover:border-neutral-500"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {key === "HAILUO_FAST" ? (
                        <Zap className="w-6 h-6 text-yellow-400" />
                      ) : (
                        <Clock className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-permanent-marker text-lg text-neutral-100 mb-1">
                        {model.displayName}
                      </h3>
                      <p className="text-sm text-neutral-400 mb-2">
                        {model.description}
                      </p>
                      <div className="flex space-x-4 text-xs text-neutral-500">
                        <span>Duration: {model.duration}s</span>
                        <span>Resolution: {model.resolution}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Generate Animation Button */}
        {croppedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mb-8"
          >
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating || queueNumber.trim() === ""}
              className={`w-full primary-button ${
                queueNumber.trim() === "" || isGenerating
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
              whileHover={{
                scale: queueNumber.trim() !== "" && !isGenerating ? 1.05 : 1,
              }}
              whileTap={{
                scale: queueNumber.trim() !== "" && !isGenerating ? 0.95 : 1,
              }}
            >
              {isGenerating ? "Generating Animation..." : "Generate Animation"}
            </motion.button>
          </motion.div>
        )}

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
