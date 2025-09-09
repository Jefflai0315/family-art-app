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
import FinalResultScreen from "./FinalResultScreen";
import OutlineFailedScreen from "./OutlineFailedScreen";
import AnimationFailedScreen from "./AnimationFailedScreen";
import OutlinePreviewScreen from "./OutlinePreviewScreen";
import UserProfile from "./UserProfile";
import ErrorDisplay from "./ErrorDisplay";
import { config } from "../lib/config";
import { useErrorHandling } from "../hooks/useErrorHandling";
import { handleApiCall } from "../lib/errorHandling";
import { signIn } from "next-auth/react";

interface ApiResponse {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

interface GenerateOutlineResponse extends ApiResponse {
  success: boolean;
  outlineUrl?: string;
  queueNumber?: string;
  source?: string;
}

interface AnimationResponse extends ApiResponse {
  success: boolean;
  taskId?: string;
  cloudinaryVideoUrl?: string;
  downloadUrl?: string;
}

interface FamilyData {
  id: string | null;
  queueNumber: string | null;
  photo: string | null;
  outline: string | null;
  artwork: string | null;
  enhanced: string | null;
  animation: string | null;
  aspectRatio: "4:3" | "1:1" | "16:9";
}

interface Animation {
  taskId: string;
  status: string;
  downloadUrl?: string;
  cloudinaryVideoUrl?: string;
  cloudinaryImageUrl?: string;
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
    aspectRatio: "4:3",
  });
  const [artworkData, setArtworkData] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [currentQueueNumber, setCurrentQueueNumber] = useState<string>("");

  // Error handling
  const { errorState, isRetrying, clearError, retry, handleApiError } =
    useErrorHandling();

  const processPhoto = async (photoData?: string) => {
    setProcessing(true);
    setCurrentStep("processing");
    clearError(); // Clear any previous errors

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

        // Use passed photoData or fall back to familyData.photo
        const currentPhoto = photoData || familyData.photo;

        console.log(
          "Processing photo:",
          currentPhoto ? "Photo available" : "No photo"
        );
        if (currentPhoto) {
          const { data, error } = await handleApiCall<GenerateOutlineResponse>(
            async () => {
              return fetch("/api/generate-outline", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  photoData: currentPhoto,
                }),
              });
            }
          );

          if (error) {
            handleApiError(error);
            setProcessing(false);
            return;
          }

          if (data?.success && data.outlineUrl) {
            setFamilyData((prev) => ({
              ...prev,
              outline: data.outlineUrl || null,
              queueNumber: data.queueNumber || null,
            }));
            setCurrentQueueNumber(data.queueNumber || "");
            console.log("Outline generated successfully:", data.source);
            outlineGenerated = true;
          } else {
            console.error("Failed to generate outline:", data?.error);
            handleApiError({
              status: 500,
              message: data?.error || "Failed to generate outline",
              type: "server",
            });
            setProcessing(false);
            return;
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
      handleApiError({
        status: 500,
        message: "An unexpected error occurred while processing your photo",
        type: "server",
      });
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

  const handlePhotoCapture = (
    photoData: string,
    aspectRatio: "4:3" | "1:1" | "16:9"
  ) => {
    setFamilyData((prev) => ({ ...prev, photo: photoData, aspectRatio }));
    processPhoto(photoData);
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
      aspectRatio: "4:3",
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
    console.log("Generating animation for queue:", queueNumber);
    setFamilyData((prev) => ({ ...prev, queueNumber }));
    setArtworkData(imageData);
    clearError(); // Clear any previous errors

    // Show loading screen immediately
    setCurrentStep("animation-processing");
    setProcessing(true);
    setProgress(0);

    const { data, error } = await handleApiCall<AnimationResponse>(async () => {
      return fetch("/api/animate-artwork", {
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
    });

    if (error) {
      handleApiError(error);
      setProcessing(false);
      return;
    }

    if (data?.success) {
      console.log("Animation submitted successfully:", data.taskId);

      // Simulate animation processing with progress updates
      const totalSteps = 5;
      for (let i = 0; i < totalSteps; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProgress(((i + 1) / totalSteps) * 100);
      }

      // Set the animation URL and move to enhancing screen
      setFamilyData((prev) => ({
        ...prev,
        animation: data.cloudinaryVideoUrl || data.downloadUrl || "placeholder",
      }));

      setProcessing(false);
      setCurrentStep("final-result");
    } else {
      handleApiError({
        status: 500,
        message: data?.error || "Failed to generate animation",
        type: "server",
      });
      setProcessing(false);
    }
  };

  const handleGoToGenerateNew = () => {
    setCurrentStep("animation-input");
  };

  const handleRetry = async () => {
    if (currentStep === "processing") {
      await retry(() => processPhoto());
    } else if (currentStep === "animation-processing") {
      await retry(() =>
        handleGenerateAnimation(familyData.queueNumber || "", artworkData || "")
      );
    }
  };

  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const handleAddCredits = () => {
    // Navigate to credits page or show credits modal
    window.location.href = "/credits";
  };

  const renderCurrentStep = () => {
    // Show error display if there's an error
    if (errorState.hasError && errorState.error) {
      return (
        <ErrorDisplay
          error={errorState.error}
          onRetry={handleRetry}
          onSignIn={handleSignIn}
          onAddCredits={handleAddCredits}
          retryCount={errorState.retryCount}
          isRetrying={isRetrying}
        />
      );
    }

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
            aspectRatio={familyData.aspectRatio}
            onProceed={() => setCurrentStep("animation-input")}
            onRegenerate={handleRegenerateOutline}
            onBack={() => setCurrentStep("capture")}
          />
        );
      case "queue-ready":
        return (
          <QueueReadyScreen
            queueNumber={familyData.queueNumber || "00000"}
            onUploadAnother={() => setCurrentStep("capture")}
            onProceedToArtwork={() => setCurrentStep("animation-input")}
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
      case "animation-processing":
        return (
          <ProcessingScreen
            progress={progress}
            steps={[
              "Analyzing your artwork...",
              "Preparing animation frames...",
              "Generating smooth motion...",
              "Adding magical effects...",
              "Finalizing your animation...",
            ]}
            title="🎬 Creating Animation"
            subtitle="Your artwork is coming to life"
          />
        );
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
            onCreateAnotherAnimation={handleGoToGenerateNew}
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

  return (
    <main className="bg-black text-neutral-200 min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 relative">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]"></div>

      {/* User Profile - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <UserProfile />
      </div>

      <div className="z-10 flex flex-col items-center justify-center w-full flex-1 mt-20 sm:mt-0">
        {renderCurrentStep()}
      </div>
    </main>
  );
};

export default FamilyArtApp;
