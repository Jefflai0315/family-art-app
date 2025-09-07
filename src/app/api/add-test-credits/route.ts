import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getCreditManager } from "@/lib/credits";

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  // Check authentication
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { amount = 10 } = body;

    const creditManager = await getCreditManager();

    // Add test credits
    const success = await creditManager.refundCredits(
      session.user.email,
      amount,
      `Test credits added in development - ${amount} credits`
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to add credits" },
        { status: 500 }
      );
    }

    const newBalance = await creditManager.getCredits(session.user.email);

    return NextResponse.json({
      success: true,
      creditsAdded: amount,
      newBalance,
      message: `Added ${amount} test credits. New balance: ${newBalance}`,
    });
  } catch (error) {
    console.error("Error adding test credits:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
