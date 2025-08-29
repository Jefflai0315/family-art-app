"use client";

import { useState } from "react";
import CaptureScreen from "@/components/CaptureScreen";
import ProcessingScreen from "@/components/ProcessingScreen";
import OutlinePreviewScreen from "@/components/OutlinePreviewScreen";
import OutlineFailedScreen from "@/components/OutlineFailedScreen";
import QueueNumberInputScreen from "@/components/QueueNumberInputScreen";
import { config } from "../../lib/config";
import ProtectedRoute from "@/components/ProtectedRoute";

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

  const handlePhotoCapture = (photoData: string) => {
    setOutlineData((prev) => ({ ...prev, photo: photoData }));
    setCurrentStep("queue-input"); // Go to queue input instead of processing directly
  };

  const handleQueueNumberSubmit = (queueNumber: string) => {
    setOutlineData((prev) => ({ ...prev, queueNumber }));
    processPhoto(); // Now process the photo with the queue number
  };

  const processPhoto = async () => {
    if (!outlineData.queueNumber) {
      console.error("No queue number provided");
      return;
    }

    setProcessing(true);
    setCurrentStep("processing");

    try {
      // Step 1: Ensure image is fully ready (add delay for image processing)
      setProgress(10);
      console.log("Waiting for image to be fully ready...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds for image processing

      // Step 2: Analyze family photo
      setProgress(25);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 3: Generate outline using Gemini API (if in real mode) or placeholder (if in simulated mode)
      setProgress(50);
      let outlineGenerated = false;

      if (config.isReal()) {
        // Real API mode - try to generate outline with Gemini
        if (outlineData.photo) {
          try {
            // Add retry mechanism for better reliability
            let retryCount = 0;
            const maxRetries = 2;

            while (retryCount < maxRetries && !outlineGenerated) {
              try {
                console.log(`Attempt ${retryCount + 1} to generate outline...`);

                const response = await fetch("/api/generate-outline", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    photoData: outlineData.photo,
                    queueNumber: outlineData.queueNumber,
                  }),
                });

                if (response.ok) {
                  const result = await response.json();
                  if (result.success && result.outlineUrl) {
                    setOutlineData((prev) => ({
                      ...prev,
                      outline: result.outlineUrl,
                      id: result.submissionId?.toString() || null,
                      queueNumber: result.queueNumber,
                    }));
                    console.log(
                      "Outline generated successfully:",
                      result.source
                    );
                    outlineGenerated = true;
                  } else {
                    console.error("Failed to generate outline:", result.error);
                  }
                } else {
                  console.error("API request failed:", response.status);
                }

                if (!outlineGenerated && retryCount < maxRetries - 1) {
                  console.log(
                    `Retrying in 3 seconds... (attempt ${retryCount + 2})`
                  );
                  await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
                }
              } catch (apiError) {
                console.error(
                  `API call error on attempt ${retryCount + 1}:`,
                  apiError
                );
                if (retryCount < maxRetries - 1) {
                  console.log(
                    `Retrying in 3 seconds... (attempt ${retryCount + 2})`
                  );
                  await new Promise((resolve) => setTimeout(resolve, 3000));
                }
              }

              retryCount++;
            }

            if (!outlineGenerated) {
              console.error("All retry attempts failed");
            }
          } catch (apiError) {
            console.error("Error calling Gemini API:", apiError);
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
            queueNumber: outlineData.queueNumber, // Use user-provided queue number
          }));
        }
      }

      // Step 4: Optimize for printing
      setProgress(75);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 5: Ready for coloring
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
      case "queue-input":
        return (
          <QueueNumberInputScreen
            onQueueNumberSubmit={handleQueueNumberSubmit}
            onBack={() => setCurrentStep("capture")}
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
    <ProtectedRoute requireCredits={true} minCredits={1}>
      <div className="font-sans">
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
          {renderCurrentStep()}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default GetOutlinePage;
