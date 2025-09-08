import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCreditManager } from "@/lib/credits";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("Processing checkout.session.completed event:", {
        sessionId: session.id,
        customerEmail: session.customer_email,
        metadata: session.metadata,
        paymentStatus: session.payment_status,
      });

      // Get the metadata
      const { userEmail, packageId, credits } = session.metadata || {};

      // Determine user email (from metadata or customer_email)
      const email = userEmail || session.customer_email;

      if (!email) {
        console.error("No user email found in session:", {
          sessionId: session.id,
          metadata: session.metadata,
          customerEmail: session.customer_email,
        });
        return NextResponse.json(
          { error: "No user email found" },
          { status: 400 }
        );
      }

      // Determine credits to add
      let creditsToAdd = 0;

      if (credits) {
        // Use credits from metadata
        creditsToAdd = parseInt(credits);
        console.log(`Using credits from metadata: ${creditsToAdd}`);
      } else if (packageId) {
        // Find package by ID and get credits
        const { CREDIT_PACKAGES } = await import("@/lib/stripe");
        const creditPackage = CREDIT_PACKAGES.find(
          (pkg) => pkg.id === packageId
        );
        if (creditPackage) {
          creditsToAdd = creditPackage.credits;
          console.log(
            `Using credits from package ${packageId}: ${creditsToAdd}`
          );
        }
      }

      if (creditsToAdd === 0) {
        console.error("Could not determine credits to add:", {
          sessionId: session.id,
          packageId,
          credits,
          metadata: session.metadata,
        });
        return NextResponse.json(
          { error: "Could not determine credits to add" },
          { status: 400 }
        );
      }

      // Add credits to user account
      const creditManager = await getCreditManager();
      const success = await creditManager.refundCredits(
        email,
        creditsToAdd,
        `Credits purchased via Stripe - Package: ${
          packageId || "unknown"
        } - Session: ${session.id}`
      );

      if (!success) {
        console.error("Failed to add credits for user:", email);
        return NextResponse.json(
          { error: "Failed to add credits" },
          { status: 500 }
        );
      }

      console.log(`✅ Successfully added ${creditsToAdd} credits to ${email}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
