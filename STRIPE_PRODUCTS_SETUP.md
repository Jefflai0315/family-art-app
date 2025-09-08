# Stripe Products Setup Guide

This guide will help you configure your Stripe integration to use your existing products and ensure credits are properly added after successful payment.

## 🎯 Your Credit Packages

| Package | Credits | Price | Stripe Product |
|---------|---------|-------|----------------|
| **10 Credits** | 10 | SGD $5.00 | Your existing product |
| **20 Credits** | 20 | SGD $10.00 | Your existing product |
| **42 Credits** | 42 | SGD $20.00 | Your existing product |

## 🔧 Step 1: Get Your Stripe Product IDs

### **Option A: Use the Helper Script**
1. Make sure your `.env.local` has your Stripe secret key:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   ```

2. Run the helper script:
   ```bash
   node scripts/get-stripe-products.js
   ```

3. This will show you all your products and their price IDs.

### **Option B: Manual Method**
1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **All products**
3. Find your 3 credit products
4. Click on each product to get the **Price ID** (starts with `price_`)

## 🔧 Step 2: Update Product IDs

Edit `src/lib/stripe.ts` and replace the placeholder IDs with your actual Stripe price IDs:

```typescript
export const CREDIT_PACKAGES = [
  {
    id: "credits-10",
    stripeProductId: "price_1234567890abcdef", // Replace with your actual price ID
    name: "10 Credits",
    credits: 10,
    price: 500, // SGD $5.00 in cents
    description: "Perfect for trying out the app",
    popular: false,
  },
  {
    id: "credits-20",
    stripeProductId: "price_abcdef1234567890", // Replace with your actual price ID
    name: "20 Credits",
    credits: 20,
    price: 1000, // SGD $10.00 in cents
    description: "Great for regular use",
    popular: true,
  },
  {
    id: "credits-42",
    stripeProductId: "price_9876543210fedcba", // Replace with your actual price ID
    name: "42 Credits",
    credits: 42,
    price: 2000, // SGD $20.00 in cents
    description: "Best value for families",
    popular: false,
  },
] as const;
```

## 🔧 Step 3: Set Up Webhook

1. In your Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
4. Select events: `checkout.session.completed`
5. Copy the **Webhook Secret** (starts with `whsec_`)

## 🔧 Step 4: Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Make sure NEXTAUTH_URL is set for redirects
NEXTAUTH_URL=http://localhost:3000  # or your production URL
```

## 🧪 Step 5: Test the Integration

### **Test the Purchase Flow:**
1. Start your development server: `npm run dev`
2. Navigate to `/credits` page
3. Try purchasing credits using Stripe test cards:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`

### **Verify Credits are Added:**
1. Complete a test purchase
2. Check your user profile to see if credits were added
3. Check your server logs for webhook processing messages

## 🔍 How Credit Addition Works

### **Purchase Flow:**
1. User selects a credit package on `/credits` page
2. User is redirected to Stripe Checkout
3. User completes payment with Stripe
4. Stripe sends webhook to `/api/webhooks/stripe`
5. Webhook processes the payment and adds credits to user account
6. User is redirected back to app with success message

### **Webhook Processing:**
The webhook handler (`/api/webhooks/stripe/route.ts`) does the following:

1. **Verifies** the webhook signature for security
2. **Extracts** user email and package information
3. **Determines** credits to add based on package ID
4. **Adds credits** to user account using `creditManager.refundCredits()`
5. **Logs** the transaction for debugging

### **Credit Addition Logic:**
```typescript
// The webhook will add credits based on the package:
if (packageId === "credits-10") {
  // Add 10 credits
} else if (packageId === "credits-20") {
  // Add 20 credits  
} else if (packageId === "credits-42") {
  // Add 42 credits
}
```

## 🚀 Production Deployment

### **1. Switch to Live Mode**
1. Get your **live** Stripe API keys from the dashboard
2. Update environment variables with live keys
3. Update webhook endpoint to production URL
4. Test with real payment methods

### **2. Environment Variables for Production**
```bash
# Production Stripe Keys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# Production URL
NEXTAUTH_URL=https://yourdomain.com
```

## 🔍 Troubleshooting

### **Common Issues:**

1. **"Stripe is not configured" error**
   - Check that `STRIPE_SECRET_KEY` is set correctly
   - Restart your development server

2. **Payment succeeds but credits not added**
   - Check webhook is receiving events in Stripe Dashboard
   - Verify webhook secret matches
   - Check server logs for webhook processing errors

3. **Wrong product ID error**
   - Verify the `stripeProductId` values match your Stripe price IDs
   - Use the helper script to get correct IDs

4. **Webhook not receiving events**
   - Check webhook URL is correct and accessible
   - Verify webhook events are selected (`checkout.session.completed`)
   - Test webhook endpoint manually

### **Debug Mode:**
Check your server logs for webhook processing:

```bash
# Look for these log messages:
✅ Successfully added 10 credits to user@example.com
Processing checkout.session.completed event: {...}
```

### **Test Webhook Locally:**
Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 📊 Monitoring

### **Check Webhook Logs:**
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View **Recent deliveries** to see webhook events
4. Check for any failed deliveries

### **Verify Credits:**
1. Check your database for credit transactions
2. Look for entries with description: `Credits purchased via Stripe - Package: credits-XX`

## 🎉 You're All Set!

Your Stripe integration is now configured to:
- ✅ Use your existing Stripe products
- ✅ Process payments in SGD
- ✅ Automatically add credits after successful payment
- ✅ Handle errors gracefully
- ✅ Provide detailed logging for debugging

Users can now purchase credits securely and start creating amazing family artwork with AI!
