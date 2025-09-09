"use client";

import React, { useState } from "react";
import { Upload, ArrowLeft, Check, Loader2 } from "lucide-react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ArtworkScanScreenProps {
  onArtworkScanned: (artworkData: string) => void;
  onBack: () => void;
  queueNumber?: string;
}

const ArtworkScanScreen = ({
  onArtworkScanned,
  onBack,
  queueNumber,
}: ArtworkScanScreenProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 75,
    height: 56.25, // 4:3 aspect ratio (75 * 3/4 = 56.25)
    x: 12.5,
    y: 21.875,
  });
  const [isCropping, setIsCropping] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = () => {
    // Reset crop to center of the image with 4:3 aspect ratio
    setCrop({
      unit: "%",
      width: 75,
      height: 56.25, // 4:3 aspect ratio (75 * 3/4 = 56.25)
      x: 12.5,
      y: 21.875,
    });
  };

  const getCroppedImg = (imageSrc: string, crop: Crop): Promise<string> => {
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
    if (uploadedImage && crop.width && crop.height) {
      setIsProcessing(true);
      try {
        const croppedImg = await getCroppedImg(uploadedImage, crop);
        setCroppedImage(croppedImg);
        setIsCropping(false);
      } catch (error) {
        console.error("Error cropping image:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmitToWavespeed = async () => {
    if (!croppedImage || !queueNumber) {
      console.error("Missing cropped image or queue number");
      return;
    }

    setIsSubmitting(true);
    try {
      // First check if there's already an animation for this queue number
      const checkResponse = await fetch(
        `/api/get-animation?queueNumber=${queueNumber}`
      );
      if (checkResponse.ok) {
        const checkResult = await checkResponse.json();
        if (checkResult.success && checkResult.animation) {
          const existingAnimation = checkResult.animation;
          if (
            existingAnimation.status === "success" &&
            existingAnimation.cloudinaryVideoUrl
          ) {
            // Animation already exists and is complete
            onArtworkScanned(existingAnimation.cloudinaryVideoUrl);
            console.log("Animation already exists and is complete, yess");
            return;
          } else if (
            ["queuing", "processing"].includes(existingAnimation.status)
          ) {
            // Animation is already being processed
            alert(
              "Animation is already being processed for this queue number. Please wait for it to complete."
            );
            return;
          }
        }
      }

      // Call the wavespeed API through our animate-artwork endpoint
      const response = await fetch("/api/animate-artwork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: croppedImage,
          prompt:
            "Bring this artwork to life with gentle animation and flowing colors",
          familyArtId: queueNumber, // Using queue number as the family art ID
        }),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          console.log("Animation submitted successfully:", result.taskId);
          // Instead of passing the result directly, trigger the parent to poll the database
          // The parent will handle polling and showing the processing screen
          onArtworkScanned("processing");
        } else {
          console.error("Animation submission failed:", result.error);
          alert("Failed to submit artwork for animation. Please try again.");
        }
      } else {
        console.error("Animation API request failed:", response.status);
        alert("Failed to submit artwork for animation. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting to wavespeed:", error);
      alert(
        "An error occurred while submitting your artwork. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const retakePhoto = () => {
    setUploadedImage(null);
    setCroppedImage(null);
    setCrop({
      unit: "%",
      width: 70,
      height: 70,
      x: 15,
      y: 15,
    });
    setIsCropping(false);
  };

  if (croppedImage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Artwork Ready!
            </h2>
            <p className="text-gray-600 mb-6">
              Your finished artwork is ready for animation
            </p>
            {queueNumber && (
              <p className="text-sm text-gray-500 mb-4">
                Queue Number:{" "}
                <span className="font-semibold">{queueNumber}</span>
              </p>
            )}
          </div>

          {/* Cropped artwork preview */}
          <div className="bg-gray-100 rounded-2xl p-4 mb-6">
            <img
              src={croppedImage}
              alt="Cropped finished artwork"
              className="w-full h-auto max-h-60 object-contain rounded-xl"
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSubmitToWavespeed}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Animation...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Submit for Animation</span>
                </>
              )}
            </button>

            <button
              onClick={retakePhoto}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-200"
            >
              Upload Different Image
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCropping && uploadedImage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Crop Your Artwork
            </h2>
            <p className="text-gray-600 mb-6">
              Adjust the crop area to focus on your finished artwork
            </p>
          </div>

          <div className="mb-6">
            <div className="bg-gray-100 rounded-xl p-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={4 / 3}
                minWidth={100}
                minHeight={100}
                keepSelection
                ruleOfThirds
              >
                <img
                  src={uploadedImage}
                  alt="Uploaded artwork"
                  className="w-full h-auto max-h-80 object-contain rounded-lg"
                  style={{ maxWidth: "100%", height: "auto" }}
                  onLoad={handleImageLoad}
                />
              </ReactCrop>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>
                Drag the corners to adjust the crop area. The crop will be
                landscape (4:3 ratio).
              </p>
              <div className="mt-2 p-2 bg-gray-200 rounded text-xs">
                <p>
                  Crop Area: {Math.round(crop.x)}%, {Math.round(crop.y)}% -{" "}
                  {Math.round(crop.width)}% × {Math.round(crop.height)}%
                </p>
              </div>
              <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-700">
                <p>
                  💡 Animation creation takes 2-5 minutes. You&apos;ll see your
                  result when it&apos;s ready!
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCropComplete}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Crop & Continue"}
            </button>

            <button
              onClick={retakePhoto}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-200"
            >
              Upload Different Image
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Upload className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Upload Your Finished Artwork
          </h2>
          <p className="text-gray-600 mb-6">
            Upload your completed coloring artwork to bring it to life with
            animation!
          </p>
          {queueNumber && (
            <p className="text-sm text-gray-500 mb-4">
              Queue Number: <span className="font-semibold">{queueNumber}</span>
            </p>
          )}
        </div>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Image</span>
            </button>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
};

export default ArtworkScanScreen;
