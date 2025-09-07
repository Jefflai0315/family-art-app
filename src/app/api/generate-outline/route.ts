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
    const outline = await generateOutlineWithGemini(photoData, GEMINI_API_KEY);

    if (!outline) {
      throw new Error("Failed to generate outline with Gemini API");
    }

    const outlineUrl = await uploadToCloudinary(outline, "image");

    // Save submission to MongoDB
    const submission = {
      originalPhotoUrl: cloudinaryPhotoUrl,
      generatedOutlineUrl: outlineUrl,
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
    // Validate and clean the photo data
    let cleanPhotoData = photoData;
    if (photoData.includes(",")) {
      cleanPhotoData = photoData.split(",")[1]; // Remove data:image/jpeg;base64, prefix
    }

    // Validate base64 data
    if (!cleanPhotoData || cleanPhotoData.length < 100) {
      console.error("Invalid or too small photo data");
      return null;
    }

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
            text: "Generate a simple outline drawing from this family photo, suitable for coloring. Make it clean with clear lines and good contrast for easy tracing. Focus on the main subjects and create a coloring book style outline.",
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanPhotoData,
            },
          },
        ],
      },
    ];

    console.log("Generating outline with Gemini using model:", model);
    console.log("Photo data length:", cleanPhotoData.length);

    // Add timeout and retry logic
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Gemini API timeout")), 60000); // 60 second timeout
    });

    const generatePromise = ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    // Race between generation and timeout
    const response = await Promise.race([generatePromise, timeoutPromise]);

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

        if (base64Data && base64Data.length > 100) {
          generatedImage = `data:${mimeType};base64,${base64Data}`;
          console.log("Gemini generated outline successfully");
          console.log("Generated image size:", base64Data.length);
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

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        console.error("Gemini API request timed out");
      } else if (error.message.includes("quota")) {
        console.error("Gemini API quota exceeded");
      } else if (error.message.includes("invalid")) {
        console.error("Invalid request to Gemini API");
      }
    }

    return null;
  }
}
