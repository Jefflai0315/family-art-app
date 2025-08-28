"use client";

import React, { useState } from "react";
import { Hash, ArrowRight, ArrowLeft } from "lucide-react";

interface QueueNumberInputScreenProps {
  onQueueNumberSubmit: (queueNumber: string) => void;
  onBack: () => void;
}

const QueueNumberInputScreen = ({
  onQueueNumberSubmit,
  onBack,
}: QueueNumberInputScreenProps) => {
  const [queueNumber, setQueueNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!queueNumber.trim()) {
      setError("Please enter your queue number");
      return;
    }

    if (!/^\d+$/.test(queueNumber.trim())) {
      setError("Queue number should only contain numbers");
      return;
    }

    setError("");
    onQueueNumberSubmit(queueNumber.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Hash className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Enter Your Queue Number
          </h2>
          <p className="text-gray-600 mb-6">
            Enter the queue number you received when your outline was generated
            to submit your finished artwork
          </p>
        </div>

        {/* Queue Number Input */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-xl">#</span>
            </div>
            <input
              type="text"
              value={queueNumber}
              onChange={(e) => setQueueNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="12345"
              className="w-full pl-10 pr-4 py-4 text-center text-2xl font-bold border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
              maxLength={10}
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <p className="text-blue-700 text-sm">
            <strong>Tip:</strong> Your queue number was displayed when your
            outline was ready. It should be a number like #12345.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleSubmit}
            disabled={!queueNumber.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>Continue to Artwork Upload</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onBack}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueNumberInputScreen;
