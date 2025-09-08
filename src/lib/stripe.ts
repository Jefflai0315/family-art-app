import Stripe from "stripe";

// Only initialize Stripe if the secret key is available
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
      typescript: true,
    })
  : null;

// Credit packages with pricing (SGD)
// These IDs should match your Stripe product IDs
export const CREDIT_PACKAGES = [
  {
    id: "credits-10",
    stripeProductId: process.env.STRIPE_PRODUCT_ID_10_CREDITS, // Replace with your actual Stripe product ID
    name: "10 Credits",
    credits: 10,
    price: 500, // SGD $5.00 in cents
    description: "Perfect for trying out the app",
    popular: false,
  },
  {
    id: "credits-20",
    stripeProductId: process.env.STRIPE_PRODUCT_ID_20_CREDITS, // Replace with your actual Stripe product ID
    name: "20 Credits",
    credits: 20,
    price: 1000, // SGD $10.00 in cents
    description: "Great for regular use",
    popular: false,
  },
  {
    id: "credits-42",
    stripeProductId: process.env.STRIPE_PRODUCT_ID_42_CREDITS, // Replace with your actual Stripe product ID
    name: "42 Credits",
    credits: 42,
    price: 2000, // SGD $20.00 in cents
    description: "Best value for families",
    popular: true,
  },
] as const;

export type CreditPackage = (typeof CREDIT_PACKAGES)[number];
