"use client";

import React, { useState } from "react";
import CaptureScreen from "../../components/CaptureScreen";
import ProcessingScreen from "../../components/ProcessingScreen";
import OutlinePreviewScreen from "../../components/OutlinePreviewScreen";
import OutlineFailedScreen from "../../components/OutlineFailedScreen";
import { config } from "../../lib/config";

interface OutlineData {
  id: string | null;
  queueNumber: string | null;
  photo: string | null;
  outline: string | null;
}

const GetOutlinePage = () => {
  const [currentStep, setCurrentStep] = useState("capture");
  const [outlineData, setOutlineData] = useState<OutlineData>({
    id: null,
    queueNumber: null,
    photo: null,
    outline: null,
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processPhoto = async () => {
    setProcessing(true);
    setCurrentStep("processing");

    try {
      // Step 1: Analyze family photo
      setProgress(25);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Generate outline using Gemini API (if in real mode) or placeholder (if in simulated mode)
      setProgress(50);
      let outlineGenerated = false;

      if (config.isReal()) {
        // Real API mode - try to generate outline with Gemini
        if (outlineData.photo) {
          try {
            const response = await fetch("/api/generate-outline", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                photoData: outlineData.photo,
              }),
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success && result.outlineUrl) {
                setOutlineData((prev) => ({
                  ...prev,
                  outline: result.outlineUrl,
                  id: result.submissionId.toString(),
                  queueNumber: result.queueNumber,
                }));
                console.log("Outline generated successfully:", result.source);
                outlineGenerated = true;
              } else {
                console.error("Failed to generate outline:", result.error);
              }
            } else {
              console.error("API request failed:", response.status);
            }
          } catch (apiError) {
            console.error("API call error:", apiError);
          }
        }
      } else {
        // Simulated mode - use placeholder outline
        console.log("Using placeholder outline (simulated mode)");
        outlineGenerated = true;

        if (outlineData.photo) {
          setOutlineData((prev) => ({
            ...prev,
            outline: outlineData.photo, // Use original photo as placeholder outline
            id: `mock_${Date.now()}`,
            queueNumber: "12345", // Mock queue number
          }));
        }
      }

      // Step 3: Optimize for printing
      setProgress(75);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 4: Ready for coloring
      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProcessing(false);

      if (outlineGenerated) {
        setCurrentStep("outline-preview");
      } else {
        // If outline generation failed, show error state
        setCurrentStep("outline-failed");
      }
    } catch (error) {
      console.error("Error processing photo:", error);
      setProcessing(false);
      setCurrentStep("outline-failed");
    }
  };

  const handlePhotoCapture = (photoData: string) => {
    setOutlineData((prev) => ({ ...prev, photo: photoData }));
    processPhoto();
  };

  const handleRegenerateOutline = () => {
    // Reset the outline and go back to processing
    setOutlineData((prev) => ({ ...prev, outline: null }));
    processPhoto();
  };

  const handleRestart = () => {
    setCurrentStep("capture");
    setOutlineData({
      id: null,
      queueNumber: null,
      photo: null,
      outline: null,
    });
    setProgress(0);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "capture":
        return (
          <CaptureScreen
            onPhotoCapture={handlePhotoCapture}
            onBack={() => (window.location.href = "/")}
          />
        );
      case "processing":
        return <ProcessingScreen progress={progress} />;
      case "outline-preview":
        return (
          <OutlinePreviewScreen
            originalPhoto={outlineData.photo}
            generatedOutline={outlineData.outline}
            queueNumber={outlineData.queueNumber || "00000"}
            onProceed={() => {
              // Redirect to the animation page with queue number
              window.location.href = `/getanim?queue=${outlineData.queueNumber}`;
            }}
            onRegenerate={handleRegenerateOutline}
            onBack={() => setCurrentStep("capture")}
          />
        );
      case "outline-failed":
        return (
          <OutlineFailedScreen
            onRetry={() => processPhoto()}
            onBack={() => setCurrentStep("capture")}
          />
        );
      default:
        return (
          <CaptureScreen
            onPhotoCapture={handlePhotoCapture}
            onBack={() => (window.location.href = "/")}
          />
        );
    }
  };

  return (
    <div className="font-sans">
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default GetOutlinePage;
