import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import cloudinary from "cloudinary";
import { config } from "@/lib/config";

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
    folder: "family-art-app",
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

  let client: MongoClient | null = null;

  try {
    // Check required environment variables
    const uri = process.env.MONGODB_URI;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!uri) throw new Error("Please add your Mongo URI to .env");
    if (!GEMINI_API_KEY)
      throw new Error("Please add your Gemini API key to .env");

    // Create MongoDB client
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    const body = await request.json();
    const { photoData } = body;

    if (!photoData) {
      return NextResponse.json({ error: "Missing photoData" }, { status: 400 });
    }

    await client.connect();
    const db = client.db("bazgym");
    const submissionsCollection = db.collection("photo-submission");

    // Generate queue number
    const queueNumber = await generateQueueNumber(client, db);

    // Upload original photo to Cloudinary
    let cloudinaryPhotoUrl = photoData;
    if (!photoData.includes("cloudinary.com")) {
      try {
        const photoUploadResult = await uploadToCloudinary(photoData, "image");
        cloudinaryPhotoUrl = photoUploadResult.secure_url;
      } catch (err) {
        console.error("Cloudinary photo upload failed:", err);
        cloudinaryPhotoUrl = photoData;
      }
    }

    // Call Gemini API to generate outline
    const outlineUrl = await generateOutlineWithGemini(
      photoData,
      GEMINI_API_KEY
    );

    if (!outlineUrl) {
      throw new Error("Failed to generate outline with Gemini API");
    }

    // Save submission to MongoDB
    const submission = {
      originalPhoto: cloudinaryPhotoUrl,
      generatedOutline: outlineUrl,
      queueNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await submissionsCollection.insertOne(submission);
    const submissionId = result.insertedId;

    await client.close();

    return NextResponse.json({
      success: true,
      submissionId,
      queueNumber,
      outlineUrl,
      source: "gemini",
    });
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

async function generateQueueNumber(
  client: MongoClient,
  db: any
): Promise<string> {
  try {
    // Get the latest queue number from database and increment
    const submissionsCollection = db.collection("photo-submission");
    const latestSubmission = await submissionsCollection
      .find({})
      .sort({ queueNumber: -1 })
      .limit(1)
      .toArray();

    if (latestSubmission.length > 0) {
      const lastQueueNumber = parseInt(latestSubmission[0].queueNumber);
      return String(lastQueueNumber + 1).padStart(5, "0");
    } else {
      return "10001"; // Start with 10001
    }
  } catch (error) {
    console.error("Error generating queue number:", error);
    // Fallback to timestamp-based number
    const timestamp = Date.now();
    return String((timestamp % 90000) + 10000).slice(-5);
  }
}

async function generateOutlineWithGemini(
  photoData: string,
  apiKey: string
): Promise<string | null> {
  try {
    // This is a placeholder for the actual Gemini API call
    // You'll need to implement the actual Gemini API integration here
    // For now, returning a placeholder outline URL

    // TODO: Implement actual Gemini API call
    // const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     contents: [{
    //       parts: [
    //         { text: "Generate a simple outline drawing from this family photo, suitable for coloring" },
    //         { inline_data: { mime_type: "image/jpeg", data: photoData.split(',')[1] } }
    //       ]
    //     }]
    //   })
    // });

    // Placeholder: Return a sample outline URL
    return "https://res.cloudinary.com/drb3jrfq1/image/upload/v1756358078/family-art-app/generated-outlines/cmwxuqxfj68yz10g0v4q.png";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}
