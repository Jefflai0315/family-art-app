"use client";

import React from "react";
import { CheckCircle, Upload, Palette, ArrowRight } from "lucide-react";

interface QueueReadyScreenProps {
  queueNumber: string;
  onUploadAnother: () => void;
  onProceedToArtwork: () => void;
}

const QueueReadyScreen = ({
  queueNumber,
  onUploadAnother,
  onProceedToArtwork,
}: QueueReadyScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Outline Ready!
          </h2>
          <p className="text-gray-600">Your coloring page is ready</p>
        </div>

        {/* Queue Number Display */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              #{queueNumber}
            </div>
            <p className="text-blue-700 font-medium">Your Queue Number</p>
            <p className="text-blue-600 text-sm mt-1">
              Save this number to submit your finished artwork later
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center space-x-2 text-yellow-800 mb-2">
            <Palette className="w-5 h-5" />
            <span className="font-medium">Next Steps:</span>
          </div>
          <p className="text-yellow-700 text-sm">
            Print your outline, color it with your family, then come back with
            your queue number to create an animation!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onProceedToArtwork}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Palette className="w-5 h-5" />
            <span>Submit Finished Artwork</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onUploadAnother}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Another Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueReadyScreen;
