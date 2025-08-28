"use client";

import React from "react";
import { Sparkles, CheckCircle } from "lucide-react";

interface EnhancingScreenProps {
  progress: number;
}

const EnhancingScreen = ({ progress }: EnhancingScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            AI Magic in Progress
          </h2>
        </div>

        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-600 font-medium">
            {Math.round(progress)}% complete
          </p>
        </div>

        <div className="space-y-3 text-left">
          {[
            "Scanning artwork",
            "Enhancing colors",
            "Creating animation",
            "Preparing AR",
          ].map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  progress > (index + 1) * 25
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : "bg-gray-300"
                }`}
              >
                {progress > (index + 1) * 25 && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="text-gray-700 font-medium">{step}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
          <p className="text-sm text-gray-600">
            ✨ Our AI is bringing your family artwork to life with gentle
            animations and magical enhancements!
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancingScreen;
