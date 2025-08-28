"use client";

import React from "react";
import { Palette, ArrowRight } from "lucide-react";

interface ColoringInstructionsScreenProps {
  onScanArtwork: () => void;
  queueNumber?: string | null;
}

const ColoringInstructionsScreen = ({
  onScanArtwork,
  queueNumber,
}: ColoringInstructionsScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-400 to-red-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Palette className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Time to Color!
          </h2>
          <p className="text-gray-600">Make it uniquely yours</p>
        </div>

        {/* Queue Number Reminder */}
        {queueNumber && (
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 mb-4 border border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                #{queueNumber}
              </div>
              <p className="text-blue-700 text-sm">
                Remember your queue number for later submission
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 rounded-2xl p-4 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">Coloring Tips:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Use bright, vibrant colors</li>
              <li>• Each family member picks their outfit colors</li>
              <li>• Don&apos;t worry about staying inside the lines!</li>
              <li>• Have fun and be creative together</li>
            </ul>
          </div>

          <div className="bg-purple-50 rounded-2xl p-4 text-left">
            <h3 className="font-semibold text-purple-800 mb-2">
              When you&apos;re done:
            </h3>
            <p className="text-purple-700 text-sm">
              Come back here and scan your finished artwork to see the magic
              happen!
            </p>
          </div>
        </div>

        <button
          onClick={onScanArtwork}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Scan Finished Artwork <ArrowRight className="inline w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ColoringInstructionsScreen;
