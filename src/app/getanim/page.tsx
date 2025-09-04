"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import QueueNumberInputScreen from "../../components/QueueNumberInputScreen";
import ArtworkScanScreen from "../../components/ArtworkScanScreen";
import ProcessingScreen from "../../components/ProcessingScreen";
import FinalResultScreen from "../../components/FinalResultScreen";
import AnimationFailedScreen from "../../components/AnimationFailedScreen";

interface AnimationData {
  queueNumber: string | null;
  artwork: string | null;
  animation: string | null;
}

function GetAnimPageContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState("queue-input");
  const [animationData, setAnimationData] = useState<AnimationData>({
    queueNumber: null,
    artwork: null,
    animation: null,
  });
  const [progress, setProgress] = useState(0);

  const fetchExistingAnimation = useCallback(async (queueNumber: string) => {
    try {
      console.log("Fetching existing animation for queue:", queueNumber);
      const response = await fetch(
        `/api/get-animation?queueNumber=${queueNumber}`
      );
      console.log("Response status:", response.status);
      if (response.ok) {
        const result = await response.json();
        console.log("Fetch result:", result);
        if (result.success && result.animation) {
          const animation = result.animation;
          console.log("Animation data:", animation);
          // If animation is completed, show the result directly
          if (animation.status === "success" && animation.cloudinaryVideoUrl) {
            console.log(
              "Animation is complete! Setting video URL:",
              animation.cloudinaryVideoUrl
            );
            setAnimationData((prev) => ({
              ...prev,
              animation: animation.cloudinaryVideoUrl,
            }));
            setCurrentStep("final-result");
            return;
          }
          // If animation is still processing, show processing screen
          else if (["queuing", "processing"].includes(animation.status)) {
            console.log("Animation is processing, starting polling");
            setCurrentStep("processing");
            // Poll for updates
            pollAnimationStatus(queueNumber);
            return;
          }
          // If animation failed, show failed screen
          else if (animation.status === "failed") {
            console.log("Animation failed");
            setCurrentStep("animation-failed");
            return;
          }
        }
      }
      // If no existing animation found, go to artwork scan
      console.log("No existing animation found, going to artwork scan");
      setCurrentStep("artwork-scan");
    } catch (error) {
      console.error("Error fetching existing animation:", error);
      setCurrentStep("artwork-scan");
    }
  }, []);

  // Check if queue number is provided in URL and fetch existing animation
  useEffect(() => {
    console.log("useEffect running, searchParams:", searchParams.toString());
    const queueFromUrl = searchParams.get("queue");
    console.log("Queue from URL:", queueFromUrl);
    if (queueFromUrl) {
      console.log("Setting queue number and fetching animation");
      setAnimationData((prev) => ({ ...prev, queueNumber: queueFromUrl }));
      fetchExistingAnimation(queueFromUrl);
    } else {
      console.log("No queue parameter in URL");
    }
  }, [searchParams, fetchExistingAnimation]);

  const pollAnimationStatus = async (queueNumber: string) => {
    console.log("Starting to poll animation status for queue:", queueNumber);
    const pollInterval = setInterval(async () => {
      try {
        console.log("Polling animation status...");
        const response = await fetch(
          `/api/get-animation?queueNumber=${queueNumber}`
        );
        if (response.ok) {
          const result = await response.json();
          console.log("Poll response:", result);
          if (result.success && result.animation) {
            const animation = result.animation;
            console.log("Animation status:", animation.status);
            if (
              animation.status === "success" &&
              animation.cloudinaryVideoUrl
            ) {
              console.log(
                "Animation completed! Video URL:",
                animation.cloudinaryVideoUrl
              );
              setAnimationData((prev) => ({
                ...prev,
                animation: animation.cloudinaryVideoUrl,
              }));
              setCurrentStep("final-result");
              clearInterval(pollInterval);
            } else if (animation.status === "failed") {
              console.log("Animation failed:", animation.errorMessage);
              setCurrentStep("animation-failed");
              clearInterval(pollInterval);
            }
          }
        }
      } catch (error) {
        console.error("Error polling animation status:", error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  const processArtworkAnimation = async (animationUrl: string) => {
    console.log("Processing animation with URL:", animationUrl);

    if (animationUrl === "processing") {
      // Animation was just submitted, start polling
      setCurrentStep("processing");
      if (animationData.queueNumber) {
        pollAnimationStatus(animationData.queueNumber);
      }
      return;
    }

    // Store the animation URL and proceed to the final result
    setAnimationData((prev) => ({
      ...prev,
      artwork: prev.artwork, // Keep existing artwork
      animation: animationUrl,
    }));

    // Go directly to final result since the wavespeed API already completed the processing
    setCurrentStep("final-result");
  };

  const handleQueueNumberSubmit = (queueNumber: string) => {
    // TODO: In real implementation, validate queue number exists in database
    console.log("Queue number submitted:", queueNumber);
    setAnimationData((prev) => ({ ...prev, queueNumber }));
    setCurrentStep("artwork-scan");
  };

  const handleRestart = () => {
    setCurrentStep("queue-input");
    setAnimationData({
      queueNumber: null,
      artwork: null,
      animation: null,
    });
    setProgress(0);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "queue-input":
        return (
          <QueueNumberInputScreen
            onQueueNumberSubmit={handleQueueNumberSubmit}
            onBack={() => (window.location.href = "/")}
            initialQueueNumber={animationData.queueNumber || undefined}
          />
        );
      case "artwork-scan":
        return (
          <ArtworkScanScreen
            onArtworkScanned={processArtworkAnimation}
            onBack={() => setCurrentStep("queue-input")}
            queueNumber={animationData.queueNumber || undefined}
          />
        );
      case "processing":
        return <ProcessingScreen progress={progress} />;
      case "animation-failed":
        return (
          <AnimationFailedScreen
            onRetry={() => setCurrentStep("artwork-scan")}
            onBack={() => setCurrentStep("artwork-scan")}
          />
        );
      case "final-result":
        return (
          <FinalResultScreen
            onRestart={handleRestart}
            animationUrl={animationData.animation}
          />
        );
      default:
        return (
          <QueueNumberInputScreen
            onQueueNumberSubmit={handleQueueNumberSubmit}
            onBack={() => (window.location.href = "/")}
            initialQueueNumber={animationData.queueNumber || undefined}
          />
        );
    }
  };

  return (
    <div className="font-sans">
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400">
        {renderCurrentStep()}
      </div>
    </div>
  );
}

function GetAnimPageFallback() {
  return (
    <div className="font-sans">
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Loading Animation Page...</h1>
          <p>Please wait while we prepare the animation tools.</p>
        </div>
      </div>
    </div>
  );
}

const GetAnimPage = () => {
  return (
    <Suspense fallback={<GetAnimPageFallback />}>
      <GetAnimPageContent />
    </Suspense>
  );
};

export default GetAnimPage;
