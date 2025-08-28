"use client";

import React from "react";
import { Zap, CheckCircle } from "lucide-react";

interface ProcessingScreenProps {
  progress: number;
}

const ProcessingScreen = ({ progress }: ProcessingScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Creating Your Coloring Outline
          </h2>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-600">{Math.round(progress)}% complete</p>
        </div>

        {/* Processing steps */}
        <div className="space-y-3 text-left">
          {[
            "Analyzing family photo...",
            "Generating outline with AI...",
            "Optimizing for printing...",
            "Ready for coloring!",
          ].map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  progress > (index + 1) * 25 ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                {progress > (index + 1) * 25 && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;
