import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import cloudinary from "cloudinary";
import { videoPrompts } from "@/app/utils/constants";
import { config } from "@/lib/config";

// Environment variables and client will be created when the function is called

interface AnimationTask {
  taskId: string;
  status: "queuing" | "processing" | "success" | "failed";
  downloadUrl?: string;
  imageUrl: string;
  prompt?: string;
  model: string;
  duration: number;
  resolution: string;
  familyArtId: string; // Reference to the original family art submission
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
}

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload to Cloudinary
async function uploadToCloudinary(
  url: string,
  resource_type: "image" | "video"
) {
  return await cloudinary.v2.uploader.upload(url, {
    resource_type,
    folder: "family-art-app/animations",
  });
}

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

  // Declare client variable outside try block so it's accessible in catch
  let client: MongoClient | null = null;

  try {
    // Check required environment variables
    const uri = process.env.MONGODB_URI;
    const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;

    if (!uri) throw new Error("Please add your Mongo URI to .env");
    if (!WAVESPEED_API_KEY)
      throw new Error("Please add your Wavespeed API key to .env");

    // Create MongoDB client
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    const body = await request.json();
    const { imageUrl, prompt, familyArtId } = body;

    if (!imageUrl || !familyArtId) {
      return NextResponse.json(
        { error: "Missing imageUrl or familyArtId" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("bazgym");
    const animationTasksCollection = db.collection("anim-upload");

    // Create initial task in DB
    const now = new Date();
    const initialTask: AnimationTask = {
      taskId: `wavespeedai_${Date.now()}`,
      status: "queuing",
      imageUrl,
      prompt,
      model: "wavespeedai",
      duration: 5,
      resolution: "480P",
      familyArtId,
      createdAt: now,
      updatedAt: now,
    };
    await animationTasksCollection.insertOne(initialTask);
    const taskId = initialTask.taskId;

    // Prepare payload for WavespeedAI
    const apiUrl =
      "https://api.wavespeed.ai/api/v3/bytedance/seedance-v1-lite-i2v-480p";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WAVESPEED_API_KEY}`,
    };
    const payload = {
      duration: 5,
      image: imageUrl,
      prompt: prompt || videoPrompts[0],
      seed: -1,
    };

    // Call WavespeedAI
    let requestId = "";
    let downloadUrl = "";
    let errorMessage = "";
    let status: AnimationTask["status"] = "processing";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        errorMessage = await response.text();
        status = "failed";
      } else {
        const result = await response.json();
        requestId = result.data.id;
        status = "processing";
      }
    } catch (err) {
      errorMessage = `WavespeedAI request error: ${
        err instanceof Error ? err.message : String(err)
      }`;
      status = "failed";
    }

    // Update DB with requestId and status
    await animationTasksCollection.updateOne(
      { taskId },
      { $set: { status, updatedAt: new Date(), errorMessage, requestId } }
    );

    // If failed, return
    if (status === "failed") {
      return NextResponse.json(
        { success: false, taskId, error: errorMessage },
        { status: 500 }
      );
    }

    // Poll for result
    let pollStatus = "created";
    let pollCount = 0;

    while (["created", "processing", "queued"].includes(pollStatus)) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      pollCount++;

      const pollRes = await fetch(
        `https://api.wavespeed.ai/api/v3/predictions/${requestId}/result`,
        { headers: { Authorization: `Bearer ${WAVESPEED_API_KEY}` } }
      );

      const pollData = await pollRes.json();
      console.log("WavespeedAI poll response:", JSON.stringify(pollData));

      if (!pollRes.ok) {
        errorMessage = JSON.stringify(pollData);
        pollStatus = "failed";
        break;
      }

      pollStatus = pollData.data.status;

      if (pollStatus === "completed") {
        if (pollData.data.outputs && pollData.data.outputs.length > 0) {
          downloadUrl = pollData.data.outputs[0];
          status = "success";
        } else {
          errorMessage =
            "No outputs found in WavespeedAI response: " +
            JSON.stringify(pollData);
          status = "failed";
        }
        break;
      } else if (pollStatus === "failed") {
        errorMessage = pollData.data.error || "WavespeedAI task failed";
        status = "failed";
        break;
      }

      // Update status in DB every few polls
      if (pollCount % 3 === 0) {
        await animationTasksCollection.updateOne(
          { taskId },
          { $set: { status: pollStatus, updatedAt: new Date() } }
        );
      }
    }

    // Final DB update
    await animationTasksCollection.updateOne(
      { taskId },
      {
        $set: {
          status,
          updatedAt: new Date(),
          downloadUrl,
          errorMessage,
        },
      }
    );

    let cloudinaryVideoUrl = "";
    let cloudinaryImageUrl = "";

    if (status === "success") {
      // Try to upload video to Cloudinary
      try {
        const videoUploadResult = await uploadToCloudinary(
          downloadUrl,
          "video"
        );
        cloudinaryVideoUrl = videoUploadResult.secure_url;
      } catch (err) {
        errorMessage +=
          " | Cloudinary video upload failed: " +
          (err instanceof Error ? err.message : String(err));
        cloudinaryVideoUrl = downloadUrl;
        console.error(
          "Cloudinary video upload failed, using fallback URL:",
          downloadUrl
        );
      }

      // Upload image to Cloudinary if not already a Cloudinary URL
      if (!imageUrl.includes("cloudinary.com")) {
        try {
          const imageUploadResult = await uploadToCloudinary(imageUrl, "image");
          cloudinaryImageUrl = imageUploadResult.secure_url;
        } catch (err) {
          errorMessage +=
            " | Cloudinary image upload failed: " +
            (err instanceof Error ? err.message : String(err));
          cloudinaryImageUrl = imageUrl;
          console.error(
            "Cloudinary image upload failed, using fallback URL:",
            imageUrl
          );
        }
      } else {
        cloudinaryImageUrl = imageUrl;
      }
    }

    // Update MongoDB with Cloudinary URLs and status
    await animationTasksCollection.updateOne(
      { taskId },
      {
        $set: {
          status,
          updatedAt: new Date(),
          downloadUrl,
          cloudinaryVideoUrl,
          cloudinaryImageUrl,
          errorMessage,
        },
      }
    );

    await client.close();

    if (status === "success") {
      return NextResponse.json({
        success: true,
        taskId,
        downloadUrl,
        cloudinaryVideoUrl,
        cloudinaryImageUrl,
      });
    } else {
      return NextResponse.json(
        { success: false, taskId, error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    try {
      if (client) {
        await client.close();
      }
    } catch (closeError) {
      console.error("Error closing MongoDB client:", closeError);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
