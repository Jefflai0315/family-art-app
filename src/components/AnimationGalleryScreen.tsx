"use client";

import React from "react";
import { Play, Download, Share2, ArrowLeft, Calendar } from "lucide-react";

interface Animation {
  taskId: string;
  status: string;
  downloadUrl?: string;
  cloudinaryVideoUrl?: string;
  cloudinaryImageUrl?: string;
  imageUrl?: string;
  prompt?: string;
  familyArtId: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

interface AnimationGalleryScreenProps {
  animations: Animation[];
  queueNumber: string;
  onBack: () => void;
  onGenerateNew: () => void;
}

const AnimationGalleryScreen = ({
  animations,
  queueNumber,
  onBack,
  onGenerateNew,
}: AnimationGalleryScreenProps) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const successfulAnimations = animations.filter(
    (anim) => anim.status === "success" && anim.cloudinaryVideoUrl
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎬 Your Animation Gallery
          </h1>
          <p className="text-white/80 text-lg">
            Queue Number: <span className="font-semibold">{queueNumber}</span>
          </p>
          <p className="text-white/60">
            Found {successfulAnimations.length} animation
            {successfulAnimations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {successfulAnimations.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Animations Found
            </h2>
            <p className="text-gray-600 mb-8">
              No completed animations found for queue number {queueNumber}
            </p>
            <div className="space-y-4">
              <button
                onClick={onGenerateNew}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Create New Animation
              </button>
              <button
                onClick={onBack}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-colors duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Animation Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {successfulAnimations.map((animation, index) => (
                <div
                  key={animation.taskId}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                  {/* Video Preview */}
                  <div className="aspect-video bg-gray-100">
                    {animation.cloudinaryVideoUrl ? (
                      <video
                        src={animation.cloudinaryVideoUrl}
                        controls
                        className="w-full h-full object-cover"
                        poster={animation.cloudinaryImageUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Animation Info */}
                  <div className="p-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(animation.createdAt)}
                    </div>
                    {animation.prompt && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {animation.prompt}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (animation.cloudinaryVideoUrl && navigator.share) {
                            navigator.share({
                              title: "My Animated Family Artwork",
                              text: "Check out my animated art!",
                              url: animation.cloudinaryVideoUrl,
                            });
                          } else if (animation.cloudinaryVideoUrl) {
                            navigator.clipboard.writeText(
                              animation.cloudinaryVideoUrl
                            );
                            alert("Animation URL copied to clipboard!");
                          }
                        }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={() => {
                          if (animation.cloudinaryVideoUrl) {
                            downloadVideo(
                              animation.cloudinaryVideoUrl,
                              `animation-${queueNumber}-${index + 1}.mp4`
                            );
                          }
                        }}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGenerateNew}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-8 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Create Another Animation
              </button>
              <button
                onClick={onBack}
                className="bg-gray-200 text-gray-700 py-4 px-8 rounded-2xl font-semibold hover:bg-gray-300 transition-colors duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationGalleryScreen;
