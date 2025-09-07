import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
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

  let client: MongoClient | null = null;

  try {
    // Check required environment variables
    const uri = process.env.MONGODB_URI;

    if (!uri) throw new Error("Please add your Mongo URI to .env");

    // Create MongoDB client
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    const { searchParams } = new URL(request.url);
    const queueNumber = searchParams.get("queueNumber");
    const taskId = searchParams.get("taskId");

    if (!queueNumber && !taskId) {
      return NextResponse.json(
        { error: "Missing queueNumber or taskId parameter" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("bazgym");
    const animationTasksCollection = db.collection("anim-upload");

    // Build query based on available parameters
    const query: Record<string, string | number> = {};
    if (queueNumber) {
      query.familyArtId = queueNumber;
    }
    if (taskId) {
      query.taskId = taskId;
    }

    console.log("Searching for animation with query:", query);

    // Find all animation tasks for this queue number, sorted by creation time (newest first)
    let animationTasks = await animationTasksCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // If not found and queueNumber is provided, try with different data types
    if (animationTasks.length === 0 && queueNumber) {
      console.log("Trying alternative queries for queueNumber:", queueNumber);

      // Try with queueNumber as number
      const numericQuery = { familyArtId: parseInt(queueNumber) };
      animationTasks = await animationTasksCollection
        .find(numericQuery)
        .sort({ createdAt: -1 })
        .toArray();

      // Try with queueNumber as string
      if (animationTasks.length === 0) {
        const stringQuery = { familyArtId: queueNumber.toString() };
        animationTasks = await animationTasksCollection
          .find(stringQuery)
          .sort({ createdAt: -1 })
          .toArray();
      }
    }

    console.log("Found animation tasks:", animationTasks.length);

    await client.close();

    if (animationTasks.length === 0) {
      return NextResponse.json(
        { error: "No animations found for this queue number" },
        { status: 404 }
      );
    }

    // Return all animations, sorted by creation time (newest first)
    const animations = animationTasks.map((task) => ({
      taskId: task.taskId,
      status: task.status,
      downloadUrl: task.downloadUrl,
      cloudinaryVideoUrl: task.cloudinaryVideoUrl,
      cloudinaryImageUrl: task.cloudinaryImageUrl,
      prompt: task.prompt,
      familyArtId: task.familyArtId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      errorMessage: task.errorMessage,
    }));

    return NextResponse.json({
      success: true,
      animations: animations,
      count: animations.length,
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
