"use client";

import React from "react";
import { CheckCircle, Clock, ArrowRight, Users } from "lucide-react";

interface PrintReadyScreenProps {
  onContinue: () => void;
  outlineImage?: string | null;
  queueNumber?: string | null;
}

const PrintReadyScreen = ({
  onContinue,
  outlineImage,
  queueNumber,
}: PrintReadyScreenProps) => {
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
          <p className="text-gray-600">Your coloring page is printing now</p>
        </div>

        {/* Queue Number Display */}
        {queueNumber && (
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 mb-6 border-2 border-blue-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                #{queueNumber}
              </div>
              <p className="text-blue-700 font-semibold mb-1">
                Your Queue Number
              </p>
              <p className="text-blue-600 text-sm">
                Save this number for later submission
              </p>
            </div>
          </div>
        )}

        {/* Generated outline preview */}
        <div className="bg-gray-100 rounded-2xl p-6 mb-6">
          {outlineImage ? (
            <div className="rounded-xl overflow-hidden">
              <img
                src={outlineImage}
                alt="Generated family outline for coloring"
                className="w-full h-auto max-h-80 object-contain"
              />
            </div>
          ) : (
            <div className="border-2 border-gray-300 border-dashed rounded-xl h-40 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Your Family Outline</p>
                <p className="text-xs opacity-75">Ready for coloring!</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Next Steps:</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Collect your printed outline and start coloring together as a
              family!
            </p>
          </div>

          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Continue to Coloring <ArrowRight className="inline w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintReadyScreen;
