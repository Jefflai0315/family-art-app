import React from "react";

interface OutlinePreviewScreenProps {
  originalPhoto: string | null;
  generatedOutline: string | null;
  queueNumber?: string | null;
  onProceed: () => void;
  onRegenerate: () => void;
  onBack: () => void;
}

const OutlinePreviewScreen: React.FC<OutlinePreviewScreenProps> = ({
  originalPhoto,
  generatedOutline,
  queueNumber,
  onProceed,
  onRegenerate,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎨 Outline Generated!
          </h1>
          <p className="text-lg text-gray-600">
            Here&apos;s your AI-generated coloring book outline. Take a look and
            decide what to do next!
          </p>
        </div>

        {/* Queue Number Display */}
        {queueNumber && (
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 border-2 border-blue-200">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-3">
                  #{queueNumber}
                </div>
                <p className="text-blue-700 font-semibold text-lg mb-2">
                  Your Queue Number
                </p>
                <p className="text-blue-600 text-sm">
                  Save this number! You&apos;ll need it to submit your finished
                  artwork later.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Generated Outline */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              ✏️ Generated Outline
            </h3>
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {generatedOutline && (
                <img
                  src={generatedOutline}
                  alt="Generated coloring outline"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Next Steps Instructions */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 border-2 border-green-200 mb-8">
          <h3 className="text-xl font-semibold text-green-800 mb-3 text-center">
            🎯 Next Steps
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                1
              </div>
              <p className="text-green-700 font-medium">Print & Color</p>
              <p className="text-green-600 text-sm">
                Print your outline and color it in
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                2
              </div>
              <p className="text-blue-700 font-medium">Take Photo</p>
              <p className="text-blue-600 text-sm">
                Take a photo of your finished artwork
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                3
              </div>
              <p className="text-purple-700 font-medium">Get Animation</p>
              <p className="text-purple-600 text-sm">Submit for AI animation</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            ← Go Back
          </button>

          <button
            onClick={onRegenerate}
            className="px-8 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            🔄 Regenerate
          </button>

          <button
            onClick={onProceed}
            className="px-8 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            🎬 Get Animation →
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutlinePreviewScreen;
