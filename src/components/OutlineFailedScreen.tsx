"use client";

import React from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

interface OutlineFailedScreenProps {
  onRetry: () => void;
  onBack: () => void;
}

const OutlineFailedScreen = ({ onRetry, onBack }: OutlineFailedScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-orange-400 to-yellow-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Outline Generation Failed
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t generate an outline from your photo. This might be
            due to:
          </p>
          <ul className="text-left text-gray-600 mb-6 space-y-2">
            <li>• Photo quality or lighting issues</li>
            <li>• Network connectivity problems</li>
            <li>• AI service temporarily unavailable</li>
          </ul>
        </div>

        <div className="space-y-4">
          <button
            onClick={onRetry}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={onBack}
            className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Take New Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutlineFailedScreen;
