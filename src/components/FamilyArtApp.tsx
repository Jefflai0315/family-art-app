"use client";

import React, { useState } from "react";
import WelcomeScreen from "./WelcomeScreen";
import CaptureScreen from "./CaptureScreen";
import ProcessingScreen from "./ProcessingScreen";
import QueueReadyScreen from "./QueueReadyScreen";
import PrintReadyScreen from "./PrintReadyScreen";
import ColoringInstructionsScreen from "./ColoringInstructionsScreen";
import QueueNumberInputScreen from "./QueueNumberInputScreen";
import ArtworkScanScreen from "./ArtworkScanScreen";
import AnimationInputScreen from "./AnimationInputScreen";
import AnimationGalleryScreen from "./AnimationGalleryScreen";
import EnhancingScreen from "./EnhancingScreen";
import FinalResultScreen from "./FinalResultScreen";
import OutlineFailedScreen from "./OutlineFailedScreen";
import AnimationFailedScreen from "./AnimationFailedScreen";
import OutlinePreviewScreen from "./OutlinePreviewScreen";
import { config } from "../lib/config";

interface FamilyData {
  id: string | null;
  queueNumber: string | null;
  photo: string | null;
  outline: string | null;
  artwork: string | null;
  enhanced: string | null;
  animation: string | null;
}

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

const FamilyArtApp = () => {
  const [currentStep, setCurrentStep] = useState("welcome");
  const [familyData, setFamilyData] = useState<FamilyData>({
    id: null,
    queueNumber: null,
    photo: null,
    outline: null,
    artwork: null,
    enhanced: null,
    animation: null,
  });
  const [artworkData, setArtworkData] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [currentQueueNumber, setCurrentQueueNumber] = useState<string>("");

  const processPhoto = async () => {
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
        if (familyData.photo) {
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
                    photoData: familyData.photo,
                  }),
                });

                if (response.ok) {
                  const result = await response.json();
                  if (result.success && result.outlineUrl) {
                    setFamilyData((prev) => ({
                      ...prev,
                      outline: result.outlineUrl,
                    }));
                    console.log(
                      "Outline generated successfully:",
                      result.source
                    );
                    outlineGenerated = true;

                    // Save submission to MongoDB after successful generation
                    try {
                      const saveResponse = await fetch("/api/save-submission", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          originalPhoto: familyData.photo,
                          generatedOutline: result.outlineUrl,
                        }),
                      });

                      if (saveResponse.ok) {
                        const saveResult = await saveResponse.json();
                        console.log(
                          "Submission saved successfully:",
                          saveResult.submissionId
                        );
                        // Update family data with the saved URLs and queue number
                        setFamilyData((prev) => ({
                          ...prev,
                          id: saveResult.submissionId.toString(),
                          queueNumber: saveResult.queueNumber,
                        }));
                        console.log(
                          "Queue number assigned:",
                          saveResult.queueNumber
                        );
                      } else {
                        console.error(
                          "Failed to save submission:",
                          saveResponse.status
                        );
                      }
                    } catch (saveError) {
                      console.error("Error saving submission:", saveError);
                    }
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
        outlineGenerated = true; // Mark as successful for simulated mode

        if (familyData.photo) {
          setFamilyData((prev) => ({
            ...prev,
            outline: familyData.photo, // Use original photo as placeholder outline
          }));

          // Generate a mock submission ID and queue number
          const mockId = `mock_${Date.now()}`;
          const queueNumber = await generateQueueNumber();
          setFamilyData((prev) => ({
            ...prev,
            id: mockId,
            queueNumber: queueNumber,
          }));

          console.log("Generated queue number:", queueNumber);
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

  const processArtworkAnimation = async (artworkData: string) => {
    console.log("processArtworkAnimation called with:", artworkData);

    // If we already have a video URL (from existing animation), use it directly
    if (artworkData && artworkData.startsWith("http")) {
      console.log("Using existing animation URL:", artworkData);
      setFamilyData((prev) => ({
        ...prev,
        animation: artworkData,
      }));
      setCurrentStep("final-result");
      return;
    }

    // If it's "processing", show processing screen
    if (artworkData === "processing") {
      console.log("Animation is processing, showing processing screen");
      setProcessing(true);
      setCurrentStep("enhancing");

      // Simulate processing steps for the animation
      const steps = [
        { text: "Processing your artwork...", delay: 1000 },
        { text: "AI analyzing colors...", delay: 2000 },
        { text: "Creating animation...", delay: 3000 },
        { text: "Finalizing...", delay: 1500 },
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, steps[i].delay));
        setProgress(((i + 1) / steps.length) * 100);
      }

      // Set placeholder animation URL for now
      setFamilyData((prev) => ({
        ...prev,
        animation:
          "https://res.cloudinary.com/drb3jrfq1/video/upload/v1754711869/mural-app/ydcgrehf44vmyequiuxs.mp4g",
      }));

      setProcessing(false);
      setCurrentStep("final-result");
      return;
    }

    // Default case: process new artwork
    setArtworkData(artworkData);
    setProcessing(true);
    setCurrentStep("enhancing");

    try {
      // Simulate processing steps for the animation
      const steps = [
        { text: "Processing your artwork...", delay: 1000 },
        { text: "AI analyzing colors...", delay: 2000 },
        { text: "Creating animation...", delay: 3000 },
        { text: "Finalizing...", delay: 1500 },
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, steps[i].delay));
        setProgress(((i + 1) / steps.length) * 100);
      }

      // Set placeholder animation URL for now
      setFamilyData((prev) => ({
        ...prev,
        artwork: artworkData,
        animation:
          "https://res.cloudinary.com/drb3jrfq1/video/upload/v1754711869/mural-app/ydcgrehf44vmyequiuxs.mp4g",
      }));

      setProcessing(false);
      setCurrentStep("final-result");
    } catch (error) {
      console.error("Error processing animation:", error);
      setCurrentStep("animation-failed");
    } finally {
      setProcessing(false);
    }
  };

  const generateQueueNumber = async () => {
    try {
      if (config.isReal()) {
        // Fetch the latest queue number from database and increment
        const response = await fetch("/api/get-next-queue-number", {
          method: "GET",
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log("Generated real queue number:", result.nextQueueNumber);
            return result.nextQueueNumber;
          }
        }

        console.error(
          "Failed to get queue number from API, falling back to simulated"
        );
      }

      // Simulated mode or fallback: Generate sequential number
      console.log("Using simulated queue number generation");

      // For simulated mode, use timestamp-based number
      const timestamp = Date.now();
      const queueNumber = String((timestamp % 90000) + 10000).slice(-5);
      return queueNumber;
    } catch (error) {
      console.error("Error generating queue number:", error);
      // Fallback to timestamp-based number
      const timestamp = Date.now();
      const queueNumber = String((timestamp % 90000) + 10000).slice(-5);
      return queueNumber;
    }
  };

  const handlePhotoCapture = (photoData: string) => {
    setFamilyData((prev) => ({ ...prev, photo: photoData }));
    processPhoto();
  };

  const handleRegenerateOutline = () => {
    // Reset the outline and go back to processing
    setFamilyData((prev) => ({ ...prev, outline: null }));
    processPhoto();
  };

  const handleQueueNumberSubmit = (queueNumber: string) => {
    // TODO: In real implementation, validate queue number exists in database
    console.log("Queue number submitted:", queueNumber);
    setFamilyData((prev) => ({ ...prev, queueNumber }));
    setCurrentStep("artwork-scan");
  };

  const handleRestart = () => {
    setCurrentStep("welcome");
    setFamilyData({
      id: null,
      queueNumber: null,
      photo: null,
      outline: null,
      artwork: null,
      enhanced: null,
      animation: null,
    });
    setProgress(0);
    setAnimations([]);
    setCurrentQueueNumber("");
  };

  // New functions for improved animation flow
  const handleRetrieveAnimations = async (queueNumber: string) => {
    try {
      console.log("Retrieving animations for queue:", queueNumber);
      const response = await fetch(
        `/api/get-animation?queueNumber=${queueNumber}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.animations) {
          setAnimations(result.animations);
          setCurrentQueueNumber(queueNumber);
          setCurrentStep("animation-gallery");
        } else {
          alert("No animations found for this queue number");
        }
      } else {
        alert("Failed to retrieve animations. Please try again.");
      }
    } catch (error) {
      console.error("Error retrieving animations:", error);
      alert("An error occurred while retrieving animations. Please try again.");
    }
  };

  const handleGenerateAnimation = async (
    queueNumber: string,
    imageData: string
  ) => {
    try {
      console.log("Generating animation for queue:", queueNumber);
      setFamilyData((prev) => ({ ...prev, queueNumber }));
      setArtworkData(imageData);

      // Call the animation API
      const response = await fetch("/api/animate-artwork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: imageData,
          prompt:
            "Bring this family artwork to life with gentle animation and flowing colors",
          familyArtId: queueNumber,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log("Animation submitted successfully:", result.taskId);
          setCurrentStep("enhancing");
          setProcessing(true);

          // Simulate processing
          const steps = [
            { text: "Processing your artwork...", delay: 1000 },
            { text: "AI analyzing colors...", delay: 2000 },
            { text: "Creating animation...", delay: 3000 },
            { text: "Finalizing...", delay: 1500 },
          ];

          for (let i = 0; i < steps.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, steps[i].delay));
            setProgress(((i + 1) / steps.length) * 100);
          }

          // Set the animation URL
          setFamilyData((prev) => ({
            ...prev,
            animation:
              result.cloudinaryVideoUrl || result.downloadUrl || "placeholder",
          }));

          setProcessing(false);
          setCurrentStep("final-result");
        } else {
          alert("Failed to generate animation. Please try again.");
        }
      } else {
        alert("Failed to submit animation request. Please try again.");
      }
    } catch (error) {
      console.error("Error generating animation:", error);
      alert("An error occurred while generating animation. Please try again.");
    }
  };

  const handleGoToAnimationInput = () => {
    setCurrentStep("animation-input");
  };

  const handleGoToGenerateNew = () => {
    setCurrentStep("animation-input");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <WelcomeScreen
            onStart={() => setCurrentStep("capture")}
            onSubmitArtwork={() => setCurrentStep("animation-input")}
          />
        );
      case "capture":
        return (
          <CaptureScreen
            onPhotoCapture={handlePhotoCapture}
            onBack={() => setCurrentStep("welcome")}
          />
        );
      case "processing":
        return <ProcessingScreen progress={progress} />;
      case "outline-preview":
        return (
          <OutlinePreviewScreen
            originalPhoto={familyData.photo}
            generatedOutline={familyData.outline}
            queueNumber={familyData.queueNumber || "00000"}
            onProceed={() => setCurrentStep("queue-ready")}
            onRegenerate={handleRegenerateOutline}
            onBack={() => setCurrentStep("capture")}
          />
        );
      case "queue-ready":
        return (
          <QueueReadyScreen
            queueNumber={familyData.queueNumber || "00000"}
            onUploadAnother={() => setCurrentStep("capture")}
            onProceedToArtwork={() => setCurrentStep("queue-input")}
          />
        );
      case "queue-input":
        return (
          <QueueNumberInputScreen
            onQueueNumberSubmit={handleQueueNumberSubmit}
            onBack={() => setCurrentStep("welcome")}
          />
        );
      case "print-ready":
        return (
          <PrintReadyScreen
            onContinue={() => setCurrentStep("coloring-instructions")}
            outlineImage={familyData.outline}
            queueNumber={familyData.queueNumber || "00000"}
          />
        );
      case "coloring-instructions":
        return (
          <ColoringInstructionsScreen
            onScanArtwork={() => setCurrentStep("artwork-scan")}
            queueNumber={familyData.queueNumber || "00000"}
          />
        );
      case "artwork-scan":
        return (
          <ArtworkScanScreen
            onArtworkScanned={processArtworkAnimation}
            onBack={() => setCurrentStep("coloring-instructions")}
            queueNumber={familyData.queueNumber || undefined}
          />
        );
      case "enhancing":
        return <EnhancingScreen progress={progress} />;
      case "outline-failed":
        return (
          <OutlineFailedScreen
            onRetry={() => processPhoto()}
            onBack={() => setCurrentStep("capture")}
          />
        );
      case "animation-failed":
        return (
          <AnimationFailedScreen
            onRetry={() => setCurrentStep("artwork-scan")}
            onBack={() => setCurrentStep("artwork-scan")}
          />
        );
      case "animation-input":
        return (
          <AnimationInputScreen
            onRetrieveAnimations={handleRetrieveAnimations}
            onGenerateAnimation={handleGenerateAnimation}
            onBack={() => setCurrentStep("welcome")}
          />
        );
      case "animation-gallery":
        return (
          <AnimationGalleryScreen
            animations={animations}
            queueNumber={currentQueueNumber}
            onBack={() => setCurrentStep("animation-input")}
            onGenerateNew={handleGoToGenerateNew}
          />
        );
      case "final-result":
        return (
          <FinalResultScreen
            onRestart={handleRestart}
            animationUrl={familyData.animation}
          />
        );
      default:
        return (
          <WelcomeScreen
            onStart={() => setCurrentStep("capture")}
            onSubmitArtwork={() => setCurrentStep("animation-input")}
          />
        );
    }
  };

  return <div className="font-sans">{renderCurrentStep()}</div>;
};

export default FamilyArtApp;
