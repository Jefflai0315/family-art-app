"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, ArrowLeft, Check } from "lucide-react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ArtworkScanScreenProps {
  onArtworkScanned: (artworkData: string) => void;
  onBack: () => void;
}

const ArtworkScanScreen = ({
  onArtworkScanned,
  onBack,
}: ArtworkScanScreenProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [isCropping, setIsCropping] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
      };
      reader.readAsDataURL(file);
    }
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

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

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
    if (capturedImage && crop.width && crop.height) {
      setIsProcessing(true);
      try {
        const croppedImg = await getCroppedImg(capturedImage, crop);
        setCroppedImage(croppedImg);
        setIsCropping(false);
      } catch (error) {
        console.error("Error cropping image:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const confirmCrop = () => {
    if (croppedImage) {
      onArtworkScanned(croppedImage);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCroppedImage(null);
    setCrop({
      unit: "%",
      width: 80,
      height: 80,
      x: 10,
      y: 10,
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
              onClick={confirmCrop}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Continue to Animation
            </button>

            <button
              onClick={retakePhoto}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-200"
            >
              Retake Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCropping && capturedImage) {
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
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={1}
              minWidth={100}
              minHeight={100}
            >
              <img
                src={capturedImage}
                alt="Captured artwork"
                className="w-full h-auto max-h-80 object-contain"
              />
            </ReactCrop>
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
              Retake Photo
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
            <Camera className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Scan Your Finished Artwork
          </h2>
          <p className="text-gray-600 mb-6">
            Take a photo or upload your completed coloring artwork to bring it
            to life with animation!
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={startCamera}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Camera className="w-5 h-5" />
            <span>Take Photo</span>
          </button>

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

        {/* Camera view */}
        {streamRef.current && (
          <div className="mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto rounded-2xl mb-4"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <button
              onClick={capturePhoto}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Capture Photo
            </button>
          </div>
        )}

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
