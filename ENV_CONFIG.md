# Environment Configuration Guide

## App Modes

The Family Art App can run in two modes:

### 🎭 **Simulated Mode** (Default for Development)
- Uses placeholder data and simulated processing
- No external API calls
- Perfect for development and testing
- No API keys required

### 🚀 **Real API Mode** (Production)
- Uses real Gemini AI, Cloudinary, MongoDB, and Wavespeed AI
- Requires all API keys and database connections
- Production-ready functionality

## Environment Variables

### **Mode Control**
```bash
# Force specific mode (optional)
FORCE_APP_MODE=simulated    # Force simulated mode
FORCE_APP_MODE=real         # Force real API mode

# If FORCE_APP_MODE is not set, NODE_ENV controls the mode:
# NODE_ENV=development → simulated mode
# NODE_ENV=production → real API mode
```

### **Real API Mode Requirements**
```bash
# Required for real API mode
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
MONGODB_URI=your_mongodb_connection_string
WAVESPEED_API_KEY=your_wavespeed_api_key
```

## Configuration Examples

### **Development (Simulated)**
```bash
# .env.local
NODE_ENV=development
# No other variables needed
```

### **Development with Real APIs**
```bash
# .env.local
NODE_ENV=development
FORCE_APP_MODE=real
GEMINI_API_KEY=your_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGODB_URI=your_mongodb_uri
WAVESPEED_API_KEY=your_wavespeed_key
```

### **Production (Real APIs)**
```bash
# .env.local
NODE_ENV=production
GEMINI_API_KEY=your_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGODB_URI=your_mongodb_uri
WAVESPEED_API_KEY=your_wavespeed_key
```

## How It Works

### **Mode Detection Logic**
```typescript
// Check if we're in simulated mode
isSimulated(): boolean {
  const forceMode = process.env.FORCE_APP_MODE;
  if (forceMode === 'simulated') return true;
  if (forceMode === 'real') return false;
  return process.env.NODE_ENV !== 'production';
}
```

### **API Route Behavior**
```typescript
export async function GET(request: NextRequest) {
  // Check if we should use real API or simulated mode
  if (config.isSimulated()) {
    return new Response(JSON.stringify({
      success: false,
      error: "API disabled - using simulated mode"
    }), { status: 503 });
  }

  // Real API logic here...
}
```

## Switching Modes

### **Quick Switch to Real APIs**
```bash
# Add to .env.local
FORCE_APP_MODE=real
# Add all required API keys
# Restart the app
```

### **Quick Switch to Simulated**
```bash
# Add to .env.local
FORCE_APP_MODE=simulated
# Remove or comment out API keys
# Restart the app
```

### **Reset to Auto-Detect**
```bash
# Remove FORCE_APP_MODE from .env.local
# App will use NODE_ENV to determine mode
# Restart the app
```

## Benefits

- ✅ **Easy Development**: Start with simulated mode, no setup required
- ✅ **Flexible Testing**: Switch to real APIs when ready to test
- ✅ **Production Ready**: Automatically uses real APIs in production
- ✅ **No Code Changes**: Switch modes with environment variables only
- ✅ **Fallback Safety**: Falls back to simulated mode if APIs fail

## Troubleshooting

### **Mode Not Changing**
- Check `.env.local` file exists
- Restart the development server
- Check console logs for mode detection

### **Real APIs Not Working**
- Verify all required environment variables are set
- Check API keys are valid
- Ensure database connections are working
- Check console logs for API errors

### **Simulated Mode Issues**
- Set `FORCE_APP_MODE=simulated`
- Remove or comment out API keys
- Restart the development server 