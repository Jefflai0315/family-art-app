import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { config } from "../../../lib/config";

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const queueNumber = searchParams.get("queueNumber");

    if (!queueNumber) {
      return NextResponse.json(
        { error: "Missing queueNumber parameter" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("bazgym");

    // Get photo submission data
    const photoSubmissionCollection = db.collection("photo-submission");
    const photoSubmission = await photoSubmissionCollection.findOne({
      queueNumber: queueNumber,
    });

    if (!photoSubmission) {
      return NextResponse.json(
        { error: "No submission found for this queue number" },
        { status: 404 }
      );
    }

    // Get animation data
    const animationCollection = db.collection("anim-upload");
    const animations = await animationCollection
      .find({ familyArtId: queueNumber })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      submission: {
        queueNumber: photoSubmission.queueNumber,
        originalPhotoUrl: photoSubmission.originalPhotoUrl,
        generatedOutlineUrl: photoSubmission.generatedOutlineUrl,
        createdAt: photoSubmission.createdAt,
        status: photoSubmission.status,
      },
      animations: animations.map((anim) => ({
        taskId: anim.taskId,
        status: anim.status,
        cloudinaryVideoUrl: anim.cloudinaryVideoUrl,
        cloudinaryImageUrl: anim.cloudinaryImageUrl,
        createdAt: anim.createdAt,
        updatedAt: anim.updatedAt,
        errorMessage: anim.errorMessage,
      })),
    });
  } catch (error) {
    console.error("Get submission error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get submission",
      },
      { status: 500 }
    );
  }
}
