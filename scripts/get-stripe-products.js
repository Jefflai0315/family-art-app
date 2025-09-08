#!/usr/bin/env node

/**
 * Script to get Stripe product IDs and price IDs
 * Run this after setting up your Stripe products
 *
 * Usage: node scripts/get-stripe-products.js
 */

const Stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY environment variable is required");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getStripeProducts() {
  try {
    console.log("🔍 Fetching Stripe products...\n");

    // Get all products
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });

    console.log("📦 Found Products:");
    console.log("==================");

    for (const product of products.data) {
      console.log(`\n🏷️  Product: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Description: ${product.description || "No description"}`);
      console.log(
        `   Created: ${new Date(product.created * 1000).toLocaleDateString()}`
      );

      // Get prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });

      console.log("   💰 Prices:");
      for (const price of prices.data) {
        const amount = (price.unit_amount / 100).toFixed(2);
        const currency = price.currency.toUpperCase();
        console.log(`      - ${currency} ${amount} (ID: ${price.id})`);
        console.log(
          `        Type: ${price.type}, Recurring: ${
            price.recurring ? "Yes" : "No"
          }`
        );
      }
    }

    console.log(
      "\n✅ Update your src/lib/stripe.ts file with the correct product IDs:"
    );
    console.log(
      "==============================================================="
    );

    for (const product of products.data) {
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });

      if (prices.data.length > 0) {
        const price = prices.data[0]; // Use first price
        console.log(`\n// ${product.name}`);
        console.log(`stripeProductId: "${price.id}", // ${product.name}`);
      }
    }
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    process.exit(1);
  }
}

getStripeProducts();
