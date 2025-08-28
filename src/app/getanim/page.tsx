"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import QueueNumberInputScreen from "../../components/QueueNumberInputScreen";
import ArtworkScanScreen from "../../components/ArtworkScanScreen";
import ProcessingScreen from "../../components/ProcessingScreen";
import FinalResultScreen from "../../components/FinalResultScreen";
import AnimationFailedScreen from "../../components/AnimationFailedScreen";
import { config } from "../../lib/config";

interface AnimationData {
  queueNumber: string | null;
  artwork: string | null;
  animation: string | null;
}

const GetAnimPage = () => {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState("queue-input");
  const [animationData, setAnimationData] = useState<AnimationData>({
    queueNumber: null,
    artwork: null,
    animation: null,
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Check if queue number is provided in URL
  useEffect(() => {
    const queueFromUrl = searchParams.get("queue");
    if (queueFromUrl) {
      setAnimationData((prev) => ({ ...prev, queueNumber: queueFromUrl }));
      setCurrentStep("artwork-scan");
    }
  }, [searchParams]);

  const processArtworkAnimation = async (animationUrl: string) => {
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
};

export default GetAnimPage;
