# Environment Setup Guide

## Quick Start

1. **Copy this file to `.env.local`** in your project root
2. **Choose your mode** (simulated or real APIs)
3. **Add your API keys** if using real mode
4. **Restart your development server**

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

## Database Setup

### **MongoDB Collections**
```javascript
// Database: bazgym

// Collection: photo-submission
{
  "_id": "ObjectId",
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
  "taskId": "wavespeedai_timestamp",
  "queueNumber": "10001",
  "status": "success",
  "imageUrl": "data:image/jpeg;base64,...",
  "prompt": "Animation description",
  "model": "wavespeedai",
  "familyArtId": "mongodb_submission_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "cloudinaryVideoUrl": "https://cloudinary.com/...",
  "cloudinaryImageUrl": "https://cloudinary.com/..."
}
```

## Testing Your Setup

### **1. Check Mode Detection**
```bash
# Start your app and check console logs
npm run dev

# You should see:
# 🚀 App running in simulated mode
# OR
# 🚀 App running in real mode
```

### **2. Test Simulated Mode**
- Upload a photo
- Should see placeholder processing
- No API calls made
- Queue numbers generated locally

### **3. Test Real API Mode**
- Set `FORCE_APP_MODE=real`
- Add all required API keys
- Restart server
- Upload a photo
- Should see real API calls
- Check MongoDB for data

## Troubleshooting

### **Mode Not Changing**
- Check `.env.local` file exists
- Restart development server
- Check console logs for mode detection

### **API Errors**
- Verify API keys are correct
- Check API service status
- Ensure database connections work
- Check console logs for specific errors

### **Build Errors**
- Run `npm run build` to check for issues
- Fix any TypeScript/linting errors
- Ensure all imports are correct

## Security Notes

- **Never commit `.env.local`** to version control
- **Use environment variables** for all sensitive data
- **Rotate API keys** regularly
- **Monitor API usage** to control costs 