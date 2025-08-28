"use client";

import React, { useRef, useState } from "react";
import { Upload, ArrowLeft, Crop, RotateCcw, RotateCw } from "lucide-react";
import ReactCrop, { Crop as CropType, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface CaptureScreenProps {
  onPhotoCapture: (photoData: string) => void;
  onBack: () => void;
}

const CaptureScreen = ({ onPhotoCapture, onBack }: CaptureScreenProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState<CropType>({
    unit: "%",
    width: 80,
    height: 60,
    x: 10,
    y: 20,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setRotation(0); // Reset rotation for new image
        // Reset crop to center of image
        setCrop({
          unit: "%",
          width: 80,
          height: 60,
          x: 10,
          y: 20,
        });
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

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

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

    const croppedPhotoData = canvas.toDataURL("image/jpeg");
    setCroppedPreview(croppedPhotoData);
    setShowPreview(true);
  };

  const handleConfirmCrop = () => {
    if (croppedPreview) {
      onPhotoCapture(croppedPreview);
    }
  };

  const handleResetCrop = () => {
    setShowPreview(false);
    setCroppedPreview(null);
    // Reset crop to center of image
    setCrop({
      unit: "%",
      width: 80,
      height: 60,
      x: 10,
      y: 20,
    });
  };

  return (
    <div className="min-h-[100dvh] bg-gray-900 flex flex-col">
      <div className="flex-1 relative overflow-hidden items-center justify-center h-full">
        {!uploadedImage ? (
          // Upload interface
          <div className="absolute inset-0 flex items-center justify-center h-full w-full">
            <div className="text-center text-white p-8">
              <Upload className="w-24 h-24 mx-auto mb-6 text-gray-400" />

              <p className="text-lg opacity-90 mb-6">
                Choose a photo from your gallery
              </p>
              <label className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full cursor-pointer hover:scale-105 transition-transform">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                Select Photo
              </label>
            </div>
          </div>
        ) : showPreview ? (
          // Preview interface
          <div className="absolute inset-0 flex items-center justify-center p-4 h-full w-full">
            <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center mt-20">
              <div className="text-center">
                <div className="bg-white rounded-2xl p-2 mb-6 shadow-2xl">
                  <img
                    src={croppedPreview || ""}
                    alt="Cropped preview"
                    className="max-w-full max-h-[60vh] rounded-xl"
                  />
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleResetCrop}
                    className="bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-gray-500 transition-colors"
                  >
                    ↺ Crop Again
                  </button>
                  <button
                    onClick={handleConfirmCrop}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full hover:scale-105 transition-transform"
                  >
                    ✓ Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Crop interface
          <div className="absolute inset-0 flex items-center justify-center p-4 h-full w-full">
            <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center mt-20">
              {/* Rotation controls */}
              <div className="absolute bottom-10 right-4 z-10 flex gap-2">
                <button
                  onClick={handleRotateLeft}
                  className="bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all hover:scale-110"
                  title="Rotate Left"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRotateRight}
                  className="bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all hover:scale-110"
                  title="Rotate Right"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </div>

              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={4 / 3}
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
                    </div>
                  </div>
                )}
              >
                <img
                  ref={imgRef}
                  src={uploadedImage}
                  alt="Uploaded photo"
                  className="max-w-full max-h-full object-contain"
                  style={{
                    maxHeight: "70vh",
                    transform: `rotate(${rotation}deg)`,
                    transition: "transform 0.3s ease-in-out",
                  }}
                />
              </ReactCrop>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Top instructions */}
        <div className="absolute top-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-2xl">
          <h2 className="text-xl font-bold mb-1">
            {!uploadedImage
              ? "Upload Family Photo 📸"
              : showPreview
              ? "Preview Your Photo 👀"
              : "Crop Your Photo ✂️"}
          </h2>
          <p className="text-sm opacity-90">
            {!uploadedImage
              ? "Choose a photo from your gallery to get started"
              : showPreview
              ? "Review your cropped photo and confirm or go back to adjust"
              : "Resize the crop area."}
          </p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="bg-black bg-opacity-80 p-6">
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="text-white p-3 rounded-full bg-gray-600 hover:bg-gray-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {!uploadedImage || showPreview ? (
            <div className="w-20 h-20"></div>
          ) : (
            <>
              <button
                onClick={handleCrop}
                disabled={!completedCrop}
                className={`w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 ${
                  !completedCrop
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-110"
                }`}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Crop className="w-8 h-8 text-white" />
                </div>
              </button>
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setRotation(0);
                  setCrop({
                    unit: "%",
                    width: 80,
                    height: 60,
                    x: 10,
                    y: 20,
                  });
                }}
                className="absolute right-4 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition-colors text-sm"
              >
                Reupload
              </button>
            </>
          )}

          <div className="w-12"></div>
        </div>
      </div>
    </div>
  );
};

export default CaptureScreen;
