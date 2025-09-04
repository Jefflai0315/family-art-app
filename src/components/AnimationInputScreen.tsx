"use client";

import React, { useState } from "react";
import { Upload, Search, ArrowLeft, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-400 to-green-400 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full my-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🎬 Animation Center
          </h1>
          <p className="text-gray-600">
            Retrieve your existing animations or create a new one
          </p>
        </div>

        {/* Queue Number Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Queue Number *
          </label>
          <input
            type="text"
            value={queueNumber}
            onChange={(e) => setQueueNumber(e.target.value)}
            placeholder="Enter your queue number"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Retrieve Button */}
          <button
            onClick={handleRetrieve}
            disabled={isRetrieving || !queueNumber.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isRetrieving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Retrieving...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Retrieve My Animations</span>
              </>
            )}
          </button>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !queueNumber.trim() || !uploadedImage}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Generate New Animation</span>
              </>
            )}
          </button>
        </div>

        {/* Image Upload Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Artwork (for new animation)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            {uploadedImage ? (
              <div className="space-y-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded artwork"
                  className="w-full h-48 object-contain rounded-lg mx-auto"
                />
                <button
                  onClick={clearImage}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600 mb-2">
                    Click to upload your finished artwork
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go Back</span>
        </button>
        </div>
      </div>
    </div>
  );
};

export default AnimationInputScreen;
