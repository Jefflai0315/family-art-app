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
        if (familyData.photo) {
          try {
            // const response = await fetch("/api/generate-outline", {
            //   method: "POST",
            //   headers: {
            //     "Content-Type": "application/json",
            //   },
            //   body: JSON.stringify({
            //     photoData: familyData.photo,
            //   }),
            // });

            // if (response.ok) {

            // const result = await response.json();
            if (true) {
              const result = {
                success: true,
                source: "gemini",
                outlineUrl:
                  "https://res.cloudinary.com/drb3jrfq1/image/upload/v1756358078/family-art-app/generated-outlines/cmwxuqxfj68yz10g0v4q.png",
              };
              if (result.success && result.outlineUrl) {
                setFamilyData((prev) => ({
                  ...prev,
                  outline: result.outlineUrl,
                }));
                console.log("Outline generated successfully:", result.source);
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
                // console.error("Failed to generate outline:", result.error);
              }
            } else {
              // console.error("API request failed:", response.status);
            }
          } catch (apiError) {
            console.error("API call error:", apiError);
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

  const handleArtworkScanned = (artwork: string) => {
    setArtworkData(artwork);
    setCurrentStep("artwork-scan");
  };

  const simulateEnhancement = async () => {
    setProcessing(true);
    setCurrentStep("enhancing");

    const steps = [
      { text: "Scanning your artwork...", delay: 1000 },
      { text: "AI enhancing colors...", delay: 2500 },
      { text: "Creating animation...", delay: 3000 },
      { text: "Generating AR experience...", delay: 1500 },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, steps[i].delay));
      setProgress(((i + 1) / steps.length) * 100);
    }

    setProcessing(false);
    setCurrentStep("final-result");
  };

  const processArtworkAnimation = async () => {
    if (!artworkData || !familyData.id) {
      console.error("Missing artwork data or family ID");
      return;
    }

    setProcessing(true);
    setCurrentStep("enhancing");

    try {
      // Call the animation API (if in real mode)
      if (config.isReal()) {
        const response = await fetch("/api/animate-artwork", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: artworkData,
            prompt:
              "Bring this family artwork to life with gentle animation and flowing colors",
            familyArtId: familyData.id,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log("Animation created successfully:", result.taskId);
            setFamilyData((prev) => ({
              ...prev,
              animation: result.cloudinaryVideoUrl || result.downloadUrl,
            }));
            setCurrentStep("final-result");
            return; // Exit early on success
          } else {
            console.error("Animation failed:", result.error);
            setCurrentStep("animation-failed");
            return; // Exit early on failure
          }
        } else {
          console.error("Animation API request failed:", response.status);
          setCurrentStep("animation-failed");
          return; // Exit early on failure
        }
      }

      // Placeholder: Simulate animation processing (if in simulated mode or API failed)
      if (config.isSimulated()) {
        console.log("Using placeholder animation (simulated mode)");

        // Simulate processing steps
        const steps = [
          { text: "Scanning your artwork...", delay: 1000 },
          { text: "AI enhancing colors...", delay: 2500 },
          { text: "Creating animation...", delay: 3000 },
          { text: "Generating AR experience...", delay: 1500 },
        ];

        for (let i = 0; i < steps.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, steps[i].delay));
          setProgress(((i + 1) / steps.length) * 100);
        }

        // Set placeholder animation URL
        setFamilyData((prev) => ({
          ...prev,
          animation:
            "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Animated+Artwork+Video",
        }));

        setProcessing(false);
        setCurrentStep("final-result");
      }
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
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <WelcomeScreen
            onStart={() => setCurrentStep("capture")}
            onSubmitArtwork={() => setCurrentStep("queue-input")}
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
            onRetry={() => processArtworkAnimation()}
            onBack={() => setCurrentStep("artwork-scan")}
          />
        );
      case "final-result":
        return <FinalResultScreen onRestart={handleRestart} />;
      default:
        return (
          <WelcomeScreen
            onStart={() => setCurrentStep("capture")}
            onSubmitArtwork={() => setCurrentStep("queue-input")}
          />
        );
    }
  };

  return <div className="font-sans">{renderCurrentStep()}</div>;
};

export default FamilyArtApp;
