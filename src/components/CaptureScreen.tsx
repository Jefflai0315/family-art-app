"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Crop,
  RotateCcw,
  RotateCw,
  Upload,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import ReactCrop, { Crop as CropType, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import PolaroidCard from "./PolaroidCard";

interface CaptureScreenProps {
  onPhotoCapture: (
    photoData: string,
    aspectRatio: "4:3" | "1:1" | "16:9"
  ) => void;
  onBack: () => void;
}

const CaptureScreen = ({ onPhotoCapture, onBack }: CaptureScreenProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState<CropType>({
    unit: "%",
    width: 70,
    height: 52.5, // 4:3 aspect ratio (70 * 3/4 = 52.5)
    x: 15,
    y: 23.75,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showReuploadConfirm, setShowReuploadConfirm] = useState(false);
  const [cropPreset, setCropPreset] = useState<"4:3" | "1:1" | "16:9">("4:3");
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        setUploadedImage(e.target?.result as string);
        setRotation(0); // Reset rotation for new image
        // Reset crop to center of image with current preset
        const dimensions = getCropDimensions(cropPreset);
        setCrop({
          unit: "%",
          ...dimensions,
        });
        setShowReuploadConfirm(false);
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

  const handleCrop = () => {
    if (!imgRef.current || !completedCrop || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    // Set canvas size to the cropped dimensions
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    // Apply rotation if needed
    if (rotation !== 0) {
      // Save the current context state
      ctx.save();

      // Move to the center of the canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw the cropped image centered
      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        -completedCrop.width / 2,
        -completedCrop.height / 2,
        completedCrop.width,
        completedCrop.height
      );

      // Restore the context state
      ctx.restore();
    } else {
      // No rotation, draw normally
      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
    }

    const croppedPhotoData = canvas.toDataURL("image/jpeg");
    setCroppedPreview(croppedPhotoData);
    setShowPreview(true);
  };

  const handleConfirmCrop = () => {
    if (croppedPreview) {
      onPhotoCapture(croppedPreview, cropPreset);
    }
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

  const handleResetCrop = () => {
    setShowPreview(false);
    setCroppedPreview(null);
    // Reset crop to center of image with current preset
    const dimensions = getCropDimensions(cropPreset);
    setCrop({
      unit: "%",
      ...dimensions,
    });
  };

  const handleReupload = () => {
    setShowReuploadConfirm(true);
  };

  const confirmReupload = () => {
    setUploadedImage(null);
    setRotation(0);
    setShowPreview(false);
    setCroppedPreview(null);
    setShowReuploadConfirm(false);
    const dimensions = getCropDimensions(cropPreset);
    setCrop({
      unit: "%",
      ...dimensions,
    });
  };

  const cancelReupload = () => {
    setShowReuploadConfirm(false);
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
        <h1 className="text-6xl md:text-8xl font-caveat font-bold text-neutral-100 mb-4">
          📸 Capture Your Family
        </h1>
        <p className="font-permanent-marker text-neutral-300 text-xl tracking-wide">
          {!uploadedImage
            ? "Choose a photo from your gallery"
            : showPreview
            ? "Preview your photo"
            : "Crop your photo"}
        </p>
      </motion.div>

      {!uploadedImage ? (
        // Upload interface
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
          className="flex flex-col items-center gap-8"
        >
          <PolaroidCard
            caption="Click to Upload"
            status="done"
            aspectRatio={cropPreset}
            onAction={() => {
              const input = document.getElementById(
                "file-upload"
              ) as HTMLInputElement;
              input?.click();
            }}
          />
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
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
      ) : showPreview ? (
        // Preview interface
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
          className="flex flex-col items-center gap-8"
        >
          <PolaroidCard
            caption="Your Photo"
            status="done"
            imageUrl={croppedPreview || undefined}
            aspectRatio={cropPreset}
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleResetCrop} className="secondary-button">
              ↺ Crop Again
            </button>
            <button onClick={handleConfirmCrop} className="primary-button">
              ✓ Continue
            </button>
          </div>
        </motion.div>
      ) : (
        // Crop interface
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
            className="max-w-full max-h-full"
            renderSelectionAddon={() => (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-white">
                  <div className="w-8 h-8 mx-auto mb-1 opacity-80 text-center text-lg">
                    👨‍👩‍👧‍👦
                  </div>
                  <p className="text-xs font-medium opacity-90">
                    Position your family here
                  </p>
                  <p className="text-xs opacity-70 mt-1">{cropPreset} ratio</p>
                </div>
              </div>
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={uploadedImage}
              alt="Uploaded photo"
              className="max-w-full max-h-full object-contain"
              style={{
                maxHeight: "65dvh",
                transform: `rotate(${rotation}deg)`,
                transition: "transform 0.3s ease-in-out",
              }}
            />
          </ReactCrop>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <motion.button
              onClick={onBack}
              className="bg-white/90 text-gray-800 px-6 py-3 rounded-full font-medium shadow-lg hover:bg-white transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>

            <motion.button
              onClick={handleCrop}
              disabled={!completedCrop}
              className={`w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${
                !completedCrop
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-110 hover:shadow-2xl"
              }`}
              whileHover={completedCrop ? { scale: 1.1 } : {}}
              whileTap={completedCrop ? { scale: 0.9 } : {}}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  completedCrop
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    : "bg-gray-300"
                }`}
              >
                <Crop className="w-8 h-8 text-white" />
              </div>
            </motion.button>

            <motion.button
              onClick={handleReupload}
              className="bg-white/90 text-gray-800 px-6 py-3 rounded-full font-medium shadow-lg hover:bg-white transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload className="w-5 h-5" />
              Reupload
            </motion.button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Reupload confirmation modal */}
      {showReuploadConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Reupload Photo?
            </h3>
            <p className="text-gray-600 mb-6">
              This will replace your current photo and reset all changes. Are
              you sure?
            </p>
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={cancelReupload}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4" />
                Cancel
              </motion.button>
              <motion.button
                onClick={confirmReupload}
                className="px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Check className="w-4 h-4" />
                Yes, Reupload
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CaptureScreen;
