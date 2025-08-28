# Placeholder Mode - Family Art App

## Current Status: APIs Disabled

The app is currently running in **placeholder mode** with all external API calls disabled. This allows you to test the complete user flow without requiring API keys or external services.

## What's Working (Placeholder Mode)

### ✅ **Photo Capture & Processing**
- Camera capture and file upload functionality
- Photo cropping and editing
- Simulated AI outline generation (uses original photo as placeholder)
- Mock submission ID generation
- Progress tracking and user feedback

### ✅ **Artwork Scanning**
- New artwork capture/upload interface
- Image cropping functionality
- Simulated animation processing
- Placeholder animation video/image display

### ✅ **Complete User Flow**
1. **Welcome** → **Photo Capture** → **Processing** → **Print Ready**
2. **Coloring Instructions** → **Artwork Scan** → **Animation Processing** → **Final Result**

## What's Disabled (Commented Out)

### 🔴 **Gemini AI API** (`/api/generate-outline`)
- AI-powered outline generation
- Currently returns placeholder response

### 🔴 **Cloudinary Integration** (`/lib/cloudinary.ts`)
- Image upload and storage
- Cloud image hosting

### 🔴 **MongoDB Integration** (`/lib/mongodb.ts`)
- Database storage
- Submission tracking

### 🔴 **Wavespeed AI API** (`/api/animate-artwork`)
- Video animation generation
- Currently returns placeholder response

### 🔴 **Save Submission API** (`/api/save-submission`)
- Database persistence
- Cloud storage integration

## Placeholder Content

### **Outline Generation**
- Uses original photo as "generated outline"
- Creates mock submission ID: `mock_${timestamp}`
- Generates sequential queue numbers (currently timestamp-based, will be database-driven)

### **Animation Processing**
- Simulates processing steps with delays
- Shows placeholder video: `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Animated+Artwork+Video`

### **Database Operations**
- Mock IDs generated locally
- No actual persistence

## How to Enable Real APIs

### 1. **Uncomment API Routes**
Remove the `/*` and `*/` comment blocks from:
- `src/app/api/generate-outline/route.ts`
- `src/app/api/save-submission/route.ts`
- `src/app/api/animate-artwork/route.ts`

### 2. **Uncomment Frontend API Calls**
In `src/components/FamilyArtApp.tsx`:
- Remove comment blocks around `processPhoto()` API calls
- Remove comment blocks around `processArtworkAnimation()` API calls

### 3. **Set Environment Variables**
Create `.env.local` with:
```bash
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGODB_URI=your_mongodb_connection_string
WAVESPEED_API_KEY=your_wavespeed_api_key
```

### 4. **Install Dependencies**
```bash
npm install @google/genai cloudinary mongodb
```

## Testing the Current Placeholder Mode

1. **Start the app**: `npm run dev`
2. **Complete the flow**:
   - Take/upload a family photo
   - Wait for "processing" (simulated)
   - View the "generated outline" (original photo)
   - Go through coloring instructions
   - Scan finished artwork
   - Wait for animation processing (simulated)
   - View final result with placeholder animation

## Benefits of Placeholder Mode

- ✅ **No API costs** during development
- ✅ **Fast iteration** on UI/UX
- ✅ **Complete flow testing** without external dependencies
- ✅ **Easy to enable** real APIs when ready
- ✅ **Development team** can work independently

## When to Enable Real APIs

- **Development complete** and ready for testing
- **API keys obtained** from all services
- **Database infrastructure** ready
- **Production deployment** planned

## File Structure

```
src/
├── app/api/                    # API routes (currently disabled)
│   ├── generate-outline/       # Gemini AI integration
│   ├── save-submission/        # MongoDB + Cloudinary storage
│   └── animate-artwork/        # Wavespeed AI integration
├── lib/                        # External service configs
│   ├── cloudinary.ts           # Cloudinary setup
│   └── mongodb.ts              # MongoDB connection
└── components/                 # UI components (fully functional)
    ├── FamilyArtApp.tsx        # Main app logic
    ├── ArtworkScanScreen.tsx   # Artwork scanning
    ├── FinalResultScreen.tsx   # Results display
    └── ...                     # Other components
```

The app is fully functional in placeholder mode and ready for real API integration when you're ready! 