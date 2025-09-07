import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { config } from "../../../lib/config";

export async function GET() {
  // Check if we should use real API or simulated mode
  if (config.isSimulated()) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "API disabled - using simulated mode",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("bazgym");

    // Get recent animations directly from anim-upload collection
    const animationCollection = db.collection("anim-upload");
    const recentAnimations = await animationCollection
      .find({ status: "success" })
      .sort({ createdAt: -1 })
      .limit(20) // Get more to account for potential duplicates
      .toArray();

    // Deduplicate by familyArtId (queueNumber), keeping the most recent
    const uniqueAnimations = recentAnimations
      .reduce((acc, animation) => {
        if (!acc.find((a) => a.familyArtId === animation.familyArtId)) {
          acc.push(animation);
        }
        return acc;
      }, [] as typeof recentAnimations)
      .slice(0, 5); // Take only first 5 unique

    // Format for the component
    const submissions = uniqueAnimations.map((animation) => ({
      queueNumber: animation.familyArtId,
      cloudinaryImageUrl: animation.cloudinaryImageUrl,
      cloudinaryVideoUrl: animation.cloudinaryVideoUrl,
      createdAt: animation.createdAt,
      status: animation.status,
      animations: [
        {
          taskId: animation.taskId,
          status: animation.status,
          cloudinaryVideoUrl: animation.cloudinaryVideoUrl,
          cloudinaryImageUrl: animation.cloudinaryImageUrl,
          createdAt: animation.createdAt,
        },
      ],
    }));

    return NextResponse.json({
      success: true,
      submissions: submissions,
      count: submissions.length,
    });
  } catch (error) {
    console.error("Get recent submissions error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get recent submissions",
      },
      { status: 500 }
    );
  }
}
