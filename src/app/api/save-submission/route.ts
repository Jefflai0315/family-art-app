import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import clientPromise from "@/lib/mongodb";
import { config } from "../../../lib/config";

export async function POST(request: NextRequest) {
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
    const { originalPhoto, generatedOutline } = await request.json();

    if (!originalPhoto || !generatedOutline) {
      return NextResponse.json(
        { error: "Both original photo and generated outline are required" },
        { status: 400 }
      );
    }

    console.log("Saving submission to MongoDB...");

    // Upload original photo to Cloudinary
    let originalPhotoUrl: string;
    try {
      const originalResult = await cloudinary.uploader.upload(originalPhoto, {
        folder: "family-art-app/original-photos",
        resource_type: "image",
      });
      originalPhotoUrl = originalResult.secure_url;
      console.log("Original photo uploaded to Cloudinary:", originalPhotoUrl);
    } catch (uploadError) {
      console.error("Error uploading original photo:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload original photo" },
        { status: 500 }
      );
    }

    // Upload generated outline to Cloudinary
    let generatedOutlineUrl: string;
    try {
      const outlineResult = await cloudinary.uploader.upload(generatedOutline, {
        folder: "family-art-app/generated-outlines",
        resource_type: "image",
      });
      generatedOutlineUrl = outlineResult.secure_url;
      console.log(
        "Generated outline uploaded to Cloudinary:",
        generatedOutlineUrl
      );
    } catch (uploadError) {
      console.error("Error uploading generated outline:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload generated outline" },
        { status: 500 }
      );
    }

    // Save to MongoDB
    try {
      const client = await clientPromise;
      const db = client.db("bazgym");
      const collection = db.collection("photo-submission");

      const queueNumber = await generateQueueNumber();

      const submission = {
        originalPhotoUrl,
        generatedOutlineUrl,
        createdAt: new Date(),
        status: "completed",
        source: "gemini",
        queueNumber: queueNumber,
      };

      const result = await collection.insertOne(submission);
      console.log("Submission saved to MongoDB:", result.insertedId);

      return NextResponse.json({
        success: true,
        submissionId: result.insertedId,
        originalPhotoUrl,
        generatedOutlineUrl,
        createdAt: submission.createdAt,
        queueNumber: queueNumber,
      });
    } catch (dbError) {
      console.error("Error saving to MongoDB:", dbError);
      return NextResponse.json(
        { error: "Failed to save submission to database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Save submission error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save submission",
      },
      { status: 500 }
    );
  }
}
async function generateQueueNumber() {
  try {
    const client = await clientPromise;
    const db = client.db("bazgym");
    const collection = db.collection("photo-submission");

    // Find the document with the highest queue number
    const latestSubmission = await collection
      .find({})
      .sort({ queueNumber: -1 })
      .limit(1)
      .toArray();

    let nextQueueNumber = "10000"; // Start with 10000 if no submissions exist

    if (latestSubmission.length > 0 && latestSubmission[0].queueNumber) {
      const currentNumber = parseInt(latestSubmission[0].queueNumber);
      nextQueueNumber = String(currentNumber + 1).padStart(5, "0");
    }

    // Ensure the number is 5 digits
    if (nextQueueNumber.length > 5) {
      // If we exceed 99999, we could either reset or handle overflow
      // For now, we'll reset to 10000
      nextQueueNumber = "10000";
    }

    console.log("Next queue number generated:", nextQueueNumber);
    return nextQueueNumber;
  } catch (error) {
    console.error("Error generating queue number:", error);
    // Fallback to a timestamp-based number if database fails
    return String(Date.now()).slice(-5);
  }
}
