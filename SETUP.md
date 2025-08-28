# Setup Guide for MongoDB & Cloudinary Integration

## Required Environment Variables

Create a `.env.local` file in your `family-art-app` directory with the following variables:

```bash
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bazgym?retryWrites=true&w=majority

# Wavespeed AI
WAVESPEED_API_KEY=your_wavespeed_api_key_here
```

## Getting Your Credentials

### 1. Gemini API Key
- Go to [Google AI Studio](https://aistudio.google.com/)
- Create a new API key
- Copy the key to `GEMINI_API_KEY`

### 2. Cloudinary Credentials
- Go to [Cloudinary Console](https://console.cloudinary.com/)
- Sign up or log in to your account
- Go to Dashboard → API Keys
- Copy:
  - Cloud Name → `CLOUDINARY_CLOUD_NAME`
  - API Key → `CLOUDINARY_API_KEY`
  - API Secret → `CLOUDINARY_API_SECRET`

### 3. MongoDB Connection String
- **MongoDB Atlas (Cloud)**:
  - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
  - Create a cluster or use existing one
  - Click "Connect" → "Connect your application"
  - Copy the connection string
  - Replace `<password>` with your database password
  - The database `bazgym` will be created automatically

- **Local MongoDB**:
  - Use: `mongodb://localhost:27017/bazgym`

### 4. Wavespeed AI API Key
- Go to [Wavespeed AI](https://wavespeed.ai/)
- Sign up or log in to your account
- Go to API Keys section
- Copy your API key to `WAVESPEED_API_KEY`

## What Happens After Setup

1. **Photo Upload**: User takes/uploads a family photo
2. **AI Generation**: Photo sent to Gemini API for outline generation
3. **Cloud Storage**: Both images uploaded to Cloudinary:
   - Original photo → `family-art-app/original-photos/`
   - Generated outline → `family-art-app/generated-outlines/`
4. **Database Storage**: Submission saved to MongoDB:
   - Database: `bazgym`
   - Collection: `photo-submission`
   - Includes: URLs, timestamps, status, and metadata

5. **Artwork Animation**: After coloring, scan artwork for animation:
   - Uses Wavespeed AI for video generation
   - Creates 5-second animated videos
   - Stores in `anim-upload` collection
   - Links back to original family art submission

## Testing the Integration

1. Start the development server: `npm run dev`
2. Take a photo through the app
3. Check browser console for API responses
4. Verify images appear in Cloudinary dashboard
5. Check MongoDB for new submission records

## Troubleshooting

- **Cloudinary Upload Fails**: Check credentials and cloud name
- **MongoDB Connection Error**: Verify URI and network access
- **API Errors**: Check browser console and server logs
- **Missing Environment Variables**: Ensure `.env.local` exists and is properly formatted

## File Structure

```
src/
├── app/
│   └── api/
│       ├── generate-outline/route.ts    # Gemini AI integration
│       └── save-submission/route.ts     # MongoDB + Cloudinary storage
├── lib/
│   ├── cloudinary.ts                    # Cloudinary configuration
│   └── mongodb.ts                       # MongoDB connection
└── components/
    ├── FamilyArtApp.tsx                 # Main app logic
    ├── OutlineFailedScreen.tsx          # Error handling
    └── PrintReadyScreen.tsx             # Success display
``` 