"use client";

import React from "react";
import { Play, Share2, Download } from "lucide-react";

interface FinalResultScreenProps {
  onRestart: () => void;
  animationUrl?: string | null;
}

const FinalResultScreen = ({
  onRestart,
  animationUrl,
}: FinalResultScreenProps) => {
  const downloadVideo = async (url: string, filename: string) => {
    try {
      // If it's a data URL, download directly
      if (url.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // If it's an external URL, fetch and download as blob
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading video:", error);
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Play className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Your Masterpiece!
          </h2>
          <p className="text-gray-600">Watch your art come alive</p>
        </div>

        {/* Animation preview */}
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6 mb-6">
          {animationUrl ? (
            <div className="bg-white rounded-xl overflow-hidden">
              {animationUrl.includes("video") ||
              animationUrl.includes("mp4") ? (
                <video
                  src={animationUrl}
                  controls
                  className="w-full h-48 object-cover"
                  poster="https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Loading+Video..."
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={animationUrl}
                  alt="Animated family artwork"
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl h-48 flex items-center justify-center border-4 border-dashed border-purple-300">
              <div className="text-center text-purple-600">
                <Play className="w-16 h-16 mx-auto mb-2 animate-pulse" />
                <p className="font-semibold">Animated Family Portrait</p>
                <p className="text-sm opacity-75">Tap to play</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => {
              if (animationUrl && navigator.share) {
                navigator.share({
                  title: "My Animated Family Artwork",
                  text: "Check out my animated art at BazGym!",
                  url: animationUrl,
                });
              } else if (animationUrl) {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(animationUrl);
                alert("Animation URL copied to clipboard!");
              }
            }}
            disabled={!animationUrl}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="w-5 h-5 inline mr-2" />
            Share
          </button>
          <button
            onClick={() => {
              if (animationUrl) {
                downloadVideo(animationUrl, "animated-family-artwork.mp4");
              }
            }}
            disabled={!animationUrl}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5 inline mr-2" />
            Save
          </button>
        </div>

        {/* <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <p className="text-yellow-800 text-sm font-medium mb-1">
            🎯 Try AR Experience!
          </p>
          <p className="text-yellow-700 text-xs">
            Point your phone at the printed AR marker to see your art in 3D
            space!
          </p>
        </div> */}

        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Create Another Masterpiece
        </button>
      </div>
    </div>
  );
};

export default FinalResultScreen;
