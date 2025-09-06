# Family Art App

A Next.js application that uses AI to transform family photos into coloring book outlines and animated artwork.

## Features

- 📸 Photo capture and upload
- 🤖 AI-powered outline generation using Google Gemini
- 🎨 Coloring book creation
- ✨ AI enhancement and animation
- 🖨️ Print-ready output

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Get your API keys and credentials:
   - **Gemini API key**: Go to [Google AI Studio](https://aistudio.google.com/)
   - **Cloudinary credentials**: Go to [Cloudinary Console](https://console.cloudinary.com/)
   - **MongoDB URI**: Get from your MongoDB Atlas cluster or local MongoDB instance
   - **Wavespeed AI key**: Get from [Wavespeed AI](https://wavespeed.ai/)
   - Copy all credentials to your `.env.local` file

### Running the App

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start
```

## API Endpoints

### `/api/generate-outline`

Generates an artistic outline from a family photo using Google Gemini AI.

**Request:**
```json
{
  "photoData": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "outlineUrl": "data:image/png;base64,...",
  "source": "gemini",
  "textResponse": "Generated outline description"
}
```

### `/api/save-submission`

Saves the original photo and generated outline to Cloudinary and MongoDB.

**Request:**
```json
{
  "originalPhoto": "data:image/jpeg;base64,...",
  "generatedOutline": "data:image/png;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "submissionId": "mongodb_object_id",
  "originalPhotoUrl": "https://cloudinary.com/...",
  "generatedOutlineUrl": "https://cloudinary.com/...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### `/api/animate-artwork`

Creates an animated video from finished artwork using Wavespeed AI.

**Request:**
```json
{
  "imageUrl": "data:image/jpeg;base64,...",
  "prompt": "Animation prompt description",
  "familyArtId": "mongodb_submission_id"
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "wavespeedai_task_id",
  "downloadUrl": "https://wavespeed.ai/...",
  "cloudinaryVideoUrl": "https://cloudinary.com/...",
  "cloudinaryImageUrl": "https://cloudinary.com/..."
}
```

### `/api/get-animation`

Retrieves animation results from MongoDB by queue number or task ID.

**Request:** `GET /api/get-animation?queueNumber=12345` or `GET /api/get-animation?taskId=wavespeedai_1234567890`

**Response:**
```json
{
  "success": true,
  "animation": {
    "taskId": "wavespeedai_1234567890",
    "status": "success",
    "downloadUrl": "https://wavespeed.ai/...",
    "cloudinaryVideoUrl": "https://cloudinary.com/...",
    "cloudinaryImageUrl": "https://cloudinary.com/...",
    "imageUrl": "https://cloudinary.com/...",
    "prompt": "Animation prompt description",
    "familyArtId": "12345",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:05:00.000Z",
    "errorMessage": null
  }
}
```

### `/api/get-next-queue-number`

Gets the next sequential queue number for new submissions.

**Request:** `GET /api/get-next-queue-number`

**Response:**
```json
{
  "success": true,
  "nextQueueNumber": "10002",
  "currentHighest": "10001"
}
```

## How It Works

1. **Photo Capture**: User takes or uploads a family photo
2. **AI Processing**: Photo is sent to Gemini API to generate an artistic outline
3. **Outline Generation**: AI creates a clean, coloring-book style outline
4. **Cloud Storage**: Both original photo and generated outline are uploaded to Cloudinary
5. **Database Storage**: Submission data is saved to MongoDB with timestamps
6. **Print Ready**: Outline is optimized for printing and coloring
7. **Artwork Upload**: Users upload their completed colored artwork
8. **Animation Generation**: Artwork is sent to Wavespeed AI for animation
9. **Result Storage**: Animation results are saved to MongoDB and Cloudinary
10. **Animation Retrieval**: Users can access their animations anytime using their queue number

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI**: Google Gemini 2.5 Flash Image Preview
- **Cloud Storage**: Cloudinary
- **Database**: MongoDB
- **Image Processing**: React Image Crop
- **Icons**: Lucide React

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `WAVESPEED_API_KEY` | Wavespeed AI API key | Yes |

## Troubleshooting

- **API Key Error**: Ensure your `.env.local` file contains all required API keys
- **Image Generation Fails**: Check the browser console for detailed error messages
- **Slow Processing**: The AI generation may take 10-30 seconds depending on image complexity
- **Cloudinary Upload Fails**: Verify your Cloudinary credentials and cloud name
- **MongoDB Connection Error**: Check your MongoDB URI and ensure the database is accessible
- **Database Creation**: The app will automatically create the `bazgym-photo-submission` database and `submissions` collection

## Database Schema

The app uses MongoDB with the following structure:

**Database**: `bazgym`
**Collections**: `photo-submission` and `anim-upload`

**Photo Submissions**:
```json
{
  "_id": "ObjectId",
  "queueNumber": "10001",
  "originalPhotoUrl": "https://cloudinary.com/...",
  "generatedOutlineUrl": "https://cloudinary.com/...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "status": "completed",
  "source": "gemini"
}
```

**Animation Tasks**:
```json
{
  "_id": "ObjectId",
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

## License

MIT
