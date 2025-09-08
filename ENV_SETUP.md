# Environment Setup Guide

## Quick Start

1. **Copy this file to `.env.local`** in your project root
2. **Choose your mode** (simulated or real APIs)
3. **Add your API keys** if using real mode
4. **Add Google OAuth credentials** for authentication
5. **Restart your development server**

## Mode Configuration

### 🎭 **Simulated Mode (Default)**
```bash
# .env.local
FORCE_APP_MODE=simulated
# No API keys needed!
```

### 🚀 **Real API Mode**
```bash
# .env.local
FORCE_APP_MODE=real
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGODB_URI=your_mongodb_connection_string
WAVESPEED_API_KEY=your_wavespeed_key
```

### 🔄 **Auto-Detect Mode**
```bash
# .env.local
# Remove FORCE_APP_MODE line
# App will use NODE_ENV:
# NODE_ENV=development → simulated mode
# NODE_ENV=production → real API mode
```

## Required API Keys (Real Mode Only)

### **Google Gemini AI**
- **Purpose**: Generate coloring book outlines from photos
- **Get Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Cost**: Free tier available

### **Cloudinary**
- **Purpose**: Store original photos, outlines, and animated videos
- **Get Keys**: [Cloudinary Console](https://cloudinary.com/console)
- **Cost**: Free tier available

### **MongoDB**
- **Purpose**: Store submission data and queue numbers
- **Get URI**: [MongoDB Atlas](https://cloud.mongodb.com/)
- **Cost**: Free tier available

### **Wavespeed AI**
- **Purpose**: Generate animated videos from artwork
- **Get Key**: [Wavespeed AI](https://wavespeed.ai/)
- **Cost**: Pay-per-use

## Authentication Setup (Required for All Modes)

### **Google OAuth 2.0**
- **Purpose**: User authentication and account management
- **Get Credentials**: [Google Cloud Console](https://console.cloud.google.com/)
- **Cost**: Free

#### **Step-by-Step Setup:**

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"

4. **Configure OAuth Consent Screen**
   - Set app name: "Family Art App"
   - Add your email as developer contact
   - Add scopes: `email`, `profile`, `openid`

5. **Set Authorized Redirect URIs**
   - Add: `http://localhost:3000/api/auth/callback/google` (development)
   - Add: `https://yourdomain.com/api/auth/callback/google` (production)

6. **Copy Credentials**
   - Copy Client ID and Client Secret
   - Add to `.env.local`:

```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

#### **Generate NEXTAUTH_SECRET:**
```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```

## Complete .env.local Example

```bash
# App Mode
FORCE_APP_MODE=real

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
WAVESPEED_API_KEY=your_wavespeed_api_key_here

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Database
MONGODB_URI=your_mongodb_connection_string_here
```

## Database Setup

### **MongoDB Collections**
```javascript
// Database: bazgym

// Collection: users (new - for authentication)
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "name": "John Doe",
  "image": "https://...",
  "credits": 10,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}

// Collection: photo-submission
{
  "_id": "ObjectId",
  "userId": "user_id_from_auth",
  "queueNumber": "10001",
  "originalPhotoUrl": "https://cloudinary.com/...",
  "generatedOutlineUrl": "https://cloudinary.com/...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "status": "completed",
  "source": "gemini"
}

// Collection: anim-upload
{
  "_id": "ObjectId",
  "userId": "user_id_from_auth",
  "taskId": "wavespeedai_timestamp",
  "queueNumber": "10001",
  "status": "queuing|processing|success|failed",
  "imageUrl": "data:image/jpeg;base64,...",
  "prompt": "Animation description",
  "model": "wavespeedai",
  "duration": 5,
  "resolution": "480P",
  "familyArtId": "mongodb_submission_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "downloadUrl": "https://wavespeed.ai/...",
  "cloudinaryVideoUrl": "https://cloudinary.com/...",
  "cloudinaryImageUrl": "https://cloudinary.com/...",
  "errorMessage": "Error description if failed"
}
```

## What Happens After Setup

1. **User Authentication**: Users must sign in with Google to access the app
2. **Credit System**: New users get 10 free credits, each AI operation costs 1 credit
3. **Photo Upload**: User takes/uploads a family photo (requires 1 credit)
4. **AI Generation**: Photo sent to Gemini API for outline generation
5. **Cloud Storage**: Both images uploaded to Cloudinary
6. **Database Storage**: Submission saved to MongoDB with user ID
7. **Artwork Animation**: After coloring, scan artwork for animation (requires 1 credit)
8. **Credit Management**: Users can purchase more credits when they run out

## Testing the Integration

1. Start the development server: `npm run dev`
2. Visit the app - you'll be redirected to Google sign-in
3. Sign in with your Google account
4. Complete the photo upload and AI generation flow
5. Check MongoDB for new user and submission records
6. Verify credit deduction after each AI operation

## Troubleshooting

- **Google OAuth Error**: Check client ID/secret and redirect URIs
- **NEXTAUTH_SECRET Missing**: Generate a new secret with `openssl rand -base64 32`
- **Database Connection**: Verify MongoDB URI and network access
- **Credit System**: Check user collection for credit balance
- **Authentication Flow**: Ensure all environment variables are set correctly

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/                    # NextAuth.js authentication
│   │   │   └── [...nextauth]/      # OAuth callback routes
│   │   ├── generate-outline/        # Gemini AI integration
│   │   └── save-submission/         # MongoDB + Cloudinary storage
│   ├── auth/                        # Authentication pages
│   │   ├── signin/                  # Google sign-in page
│   │   └── error/                   # Auth error handling
│   └── credits/                     # Credit purchase page
├── components/
│   ├── ProtectedRoute.tsx           # Authentication guard
│   ├── Providers.tsx                # NextAuth session provider
│   └── FamilyArtApp.tsx             # Main app logic
├── lib/
│   ├── mongodb.ts                   # MongoDB connection
│   └── config.ts                    # App configuration
└── types/
    └── next-auth.d.ts               # TypeScript definitions
``` 