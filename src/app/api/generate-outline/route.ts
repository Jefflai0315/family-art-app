import { NextRequest, NextResponse } from "next/server";
import { MongoClient, Db } from "mongodb";
import cloudinary from "cloudinary";
import { config } from "@/lib/config";
import { GoogleGenAI } from "@google/genai";

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
  db: Db
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
    // Initialize Google GenAI with the official SDK
    const ai = new GoogleGenAI({
      apiKey,
    });

    const config = {
      responseModalities: ["IMAGE", "TEXT"],
    };

    const model = "gemini-2.5-flash-image-preview";
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: "Generate a simple outline drawing from this family photo, suitable for coloring. Make it clean with clear lines and good contrast for easy tracing.",
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: photoData.split(",")[1], // Remove data:image/jpeg;base64, prefix
            },
          },
        ],
      },
    ];

    console.log("Generating outline with Gemini using model:", model);

    // Generate content with streaming response
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let generatedImage: string | null = null;
    let generatedText: string = "";

    // Process the streaming response
    for await (const chunk of response) {
      if (
        !chunk.candidates ||
        !chunk.candidates[0].content ||
        !chunk.candidates[0].content.parts
      ) {
        continue;
      }

      const part = chunk.candidates[0].content.parts[0];

      if (part.inlineData) {
        // Extract image data
        const inlineData = part.inlineData;
        const mimeType = inlineData.mimeType || "image/png";
        const base64Data = inlineData.data || "";

        if (base64Data) {
          generatedImage = `data:${mimeType};base64,${base64Data}`;
          console.log("Gemini generated outline successfully");
        }
      } else if (part.text) {
        // Extract any text response
        generatedText += part.text;
      }
    }

    if (generatedImage) {
      return generatedImage;
    } else {
      console.log("Gemini did not generate an outline image");
      console.log("Text response:", generatedText);
      return null;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);

    // Log more details about the error
    if (error && typeof error === "object" && "error" in error) {
      const apiError = error.error as {
        code?: string;
        message?: string;
        status?: string;
      };
      console.error("API Error details:", {
        code: apiError.code,
        message: apiError.message,
        status: apiError.status,
      });
    }

    return null;
  }
}
