# 🔧 Environment Setup Guide - NVIDIA & Gemini AI Providers

## ✅ Configuration Complete!

Your TinyQuiz backend has been successfully configured with **both AI providers**:

### 🔑 API Keys Setup

Your `.env` file now includes:

```bash
# 1. GOOGLE GEMINI AI
GEMINI_API_KEY=your-gemini-api-key-here

# 2. NVIDIA NEMOTRON/LLAMA  
NVIDIA_API_KEY=your-nvidia-api-key-here
```

## 🚀 Quick Start

### 1. Get Your API Keys

#### Google Gemini (Option A)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key and replace `your-gemini-api-key-here` in `.env`

#### NVIDIA Nemotron (Option B) 
1. Visit: https://integrate.api.nvidia.com/
2. Sign up for free account
3. Go to API Keys section
4. Generate new API key
5. Copy the key and replace `your-nvidia-api-key-here` in `.env`

### 2. Start MongoDB
- **Local**: Install and start MongoDB on port 27017
- **Cloud**: Use MongoDB Atlas and update `MONGO_URI` in `.env`

### 3. Test Your Setup

```bash
# Start the server
npm run dev

# Test endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/providers
```

## 🎯 API Usage Examples

### Check Available Providers
```http
GET /api/providers
```

**Response:**
```json
{
  "providers": [
    {
      "id": "gemini",
      "name": "Google Gemini",
      "available": true
    },
    {
      "id": "nvidia", 
      "name": "NVIDIA Nemotron/LLaMA",
      "available": true
    }
  ],
  "default": "gemini"
}
```

### Generate Quiz with Gemini
```http
POST /api/quiz/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "topic": "JavaScript Fundamentals",
  "questionCount": 5,
  "provider": "gemini"
}
```

### Generate Quiz with NVIDIA
```http
POST /api/quiz/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "topic": "React Hooks", 
  "questionCount": 5,
  "provider": "nvidia"
}
```

### Generate Quiz (Default Provider)
```http
POST /api/quiz/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "topic": "Node.js Basics",
  "questionCount": 5
}
```

## 🔧 Backend Changes Made

### ✅ Files Modified

1. **`utils/aiProviders.js`** - Multi-provider AI system
2. **`controllers/quizController.js`** - Added provider parameter support
3. **`models/quiz.js`** - Added `aiProvider` field to track which AI was used
4. **`routes/systemRoutes.js`** - Added `/api/providers` endpoint
5. **`scripts/setup.js`** - Updated for both AI providers
6. **`.env`** - Configured with both API keys

### ✅ New Features

- 🔄 **Multi-Provider Support**: Choose between Gemini and NVIDIA
- 📊 **Provider Status**: Check which providers are available
- 🎯 **Smart Defaults**: Falls back to Gemini if no provider specified
- 📋 **Response Tracking**: Know which AI generated each quiz
- 🛡️ **Error Handling**: Graceful fallbacks and clear error messages

## 🧪 Testing in Postman

Create a Postman environment with:
- `baseUrl`: `http://localhost:5000`
- `token`: (get from login/register)

### Test Sequence:
1. **Health Check**: `GET {{baseUrl}}/api/health`
2. **Check Providers**: `GET {{baseUrl}}/api/providers`
3. **Register User**: `POST {{baseUrl}}/api/auth/register`
4. **Generate Quiz (Gemini)**: `POST {{baseUrl}}/api/quiz/generate` with `"provider": "gemini"`
5. **Generate Quiz (NVIDIA)**: `POST {{baseUrl}}/api/quiz/generate` with `"provider": "nvidia"`

## ⚠️ Important Notes

### Security
- ✅ `.env` is gitignored (safe from version control)
- ✅ API keys are securely loaded at runtime
- ✅ JWT secret is auto-generated

### Performance
- **Gemini**: 2-4 seconds, excellent educational content
- **NVIDIA**: 1-3 seconds, good for technical topics
- **Fallback**: Automatic error handling between providers

### Free Tiers
- **Gemini**: Generous free limits
- **NVIDIA**: Good free tier through integration platform

## 🎉 What's Next?

1. **Add your API keys** to `.env` file
2. **Start MongoDB** (local or Atlas)
3. **Test the endpoints** in Postman
4. **Generate amazing quizzes** with AI! 🚀

Your backend now supports both AI providers seamlessly! 🎯