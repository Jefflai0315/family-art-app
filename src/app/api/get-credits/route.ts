import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getCreditManager } from "@/lib/credits";

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const creditManager = await getCreditManager();
    const credits = await creditManager.getCredits(session.user.email);

    return NextResponse.json({
      success: true,
      credits,
    });
  } catch (error) {
    console.error("Error getting credits:", error);
    return NextResponse.json(
      { error: "Failed to get credits" },
      { status: 500 }
    );
  }
}
