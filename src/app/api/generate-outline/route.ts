import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { config } from "../../../lib/config";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Please add your Gemini API key to .env as GEMINI_API_KEY");
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

  try {
    const { photoData } = await request.json();

    if (!photoData) {
      return NextResponse.json(
        { error: "Photo data is required" },
        { status: 400 }
      );
    }

    console.log("Generating outline with Gemini for family photo");

    // Initialize Google GenAI with the official SDK
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
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
            text: `Create a simple, clean outline drawing from this family photo that's perfect for coloring. Make it:
- Simple line art with clear, bold outlines
- Minimal details - just the essential shapes and lines
- High contrast black lines on white background
- Suitable for children to color
- Clean and artistic, not too complex`,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: photoData.split(",")[1], // Remove the data:image/jpeg;base64, prefix
            },
          },
        ],
      },
    ];

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
      return NextResponse.json({
        success: true,
        outlineUrl: generatedImage,
        source: "gemini",
        textResponse: generatedText || null,
      });
    } else {
      console.log("Gemini did not generate an outline, triggering fallback");
      return NextResponse.json({
        error: "Gemini API did not generate an outline",
        fallback: true,
        textResponse: generatedText || null,
      });
    }
  } catch (error) {
    console.error("Gemini API error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Gemini API failed",
        fallback: true,
      },
      { status: 500 }
    );
  }
}
