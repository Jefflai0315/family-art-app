"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PolaroidCard from "./PolaroidCard";

interface Submission {
  queueNumber: string;
  cloudinaryImageUrl?: string;
  cloudinaryVideoUrl?: string;
  createdAt: string;
  status: string;
  animations: Array<{
    taskId: string;
    status: string;
    cloudinaryVideoUrl?: string;
    cloudinaryImageUrl?: string;
    createdAt: string;
  }>;
}

interface FloatingPolaroidPairsProps {
  submissions: Submission[];
}

const FloatingPolaroidPairs = ({ submissions }: FloatingPolaroidPairsProps) => {
  const [loadedSubmissions, setLoadedSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    // Load submissions progressively to avoid overwhelming the UI
    const loadSubmissions = async () => {
      // Deduplicate submissions by queueNumber to avoid duplicate keys
      const uniqueSubmissions = submissions.reduce((acc, submission) => {
        if (!acc.find((s) => s.queueNumber === submission.queueNumber)) {
          acc.push(submission);
        }
        return acc;
      }, [] as Submission[]);

      for (let i = 0; i < Math.min(uniqueSubmissions.length, 5); i++) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setLoadedSubmissions((prev) => [...prev, uniqueSubmissions[i]]);
      }
    };

    loadSubmissions();
  }, [submissions]);

  // Pre-defined positions for scattered polaroid pairs (5 positions, well-spaced)
  const POSITIONS = [
    { top: "10%", left: "5%", rotate: -8, delay: 0 },
    { top: "10%", left: "80%", rotate: 12, delay: 0.3 },
    { top: "40%", left: "30%", rotate: -15, delay: 0.6 },
    { top: "55%", left: "50%", rotate: 6, delay: 0.9 },
    { top: "75%", left: "5%", rotate: -10, delay: 1.2 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {loadedSubmissions.map((submission, index) => {
        const position = POSITIONS[index % POSITIONS.length];
        const hasAnimation = submission.animations.length > 0;
        const randomAnimation = hasAnimation
          ? submission.animations[
              Math.floor(Math.random() * submission.animations.length)
            ]
          : null;

        return (
          <motion.div
            key={`${submission.queueNumber}-${index}`}
            className="absolute"
            style={{
              top: position.top,
              left: position.left,
            }}
            initial={{
              opacity: 0,
              scale: 0.3,
              rotate: position.rotate,
              y: 100,
            }}
            animate={{
              opacity: 0.8,
              scale: 0.8,
              rotate: position.rotate,
              y: 0,
            }}
            transition={{
              delay: position.delay,
              duration: 1.5,
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
          >
            {/* Image Polaroid */}
            <motion.div
              className="mb-6"
              animate={{
                y: [0, -15, 0],
                rotate: [position.rotate, position.rotate + 2, position.rotate],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <PolaroidCard
                caption={`#${submission.queueNumber}`}
                status="done"
                imageUrl={submission.cloudinaryImageUrl}
                isMobile={true}
                className="w-48 md:w-56"
                aspectRatio="4:3"
              />
            </motion.div>

            {/* Animation Polaroid (if available) */}
            {submission.cloudinaryVideoUrl && (
              <motion.div
                className="ml-8 -mt-8"
                animate={{
                  y: [0, 15, 0],
                  rotate: [
                    position.rotate + 5,
                    position.rotate + 3,
                    position.rotate + 5,
                  ],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <PolaroidCard
                  caption="Animation"
                  status="done"
                  imageUrl={submission.cloudinaryImageUrl}
                  videoUrl={submission.cloudinaryVideoUrl}
                  isMobile={true}
                  className="w-48 md:w-56"
                  aspectRatio="4:3"
                />
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingPolaroidPairs;
