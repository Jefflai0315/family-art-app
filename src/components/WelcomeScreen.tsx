"use client";

import React from "react";
import { Palette, Camera, Sparkles, ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
  onSubmitArtwork: () => void;
}

const WelcomeScreen = ({ onStart, onSubmitArtwork }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform hover:scale-105 transition-all duration-300">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Palette className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Family Art Magic
          </h1>
          <p className="text-gray-600">
            Turn your family photo into a masterpiece!
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 text-left">
            <Camera className="w-6 h-6 text-purple-500 flex-shrink-0" />
            <span className="text-gray-700">Take a family photo</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <Palette className="w-6 h-6 text-pink-500 flex-shrink-0" />
            <span className="text-gray-700">Color it together</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <Sparkles className="w-6 h-6 text-orange-500 flex-shrink-0" />
            <span className="text-gray-700">Watch it come alive!</span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Start Creating <ArrowRight className="inline w-5 h-5 ml-2" />
          </button>

          <button
            onClick={onSubmitArtwork}
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Submit Finished Artwork{" "}
            <ArrowRight className="inline w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
