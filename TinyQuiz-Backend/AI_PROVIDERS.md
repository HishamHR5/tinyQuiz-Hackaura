# 🤖 AI Providers Guide - TinyQuiz Backend

## Overview

TinyQuiz now supports **multiple AI providers** for quiz generation, giving you flexibility and redundancy. Choose between Google Gemini and NVIDIA Nemotron/LLaMA based on your preferences and requirements.

## Available Providers

### 1. 🟢 Google Gemini (Default)
- **Model**: `gemini-1.5-pro-latest`
- **Strengths**: Excellent educational content, reliable, good reasoning
- **Free Tier**: Generous limits for development
- **Setup**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2. 🟡 NVIDIA Nemotron/LLaMA
- **Model**: `nvidia/llama-3.1-nemotron-ultra-253b-v1`
- **Strengths**: Fast inference, good for quiz generation, free tier available
- **Free Tier**: Available through NVIDIA's integration platform
- **Setup**: Get API key from [NVIDIA Integration Platform](https://integrate.api.nvidia.com/)

## Quick Setup

### Environment Variables
Add to your `.env` file:

```bash
# Choose one or both providers
GEMINI_API_KEY=your_gemini_api_key_here
NVIDIA_API_KEY=your_nvidia_api_key_here
```

### Get API Keys

#### Google Gemini
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file

#### NVIDIA Nemotron
1. Visit [NVIDIA Integration Platform](https://integrate.api.nvidia.com/)
2. Sign up for free account
3. Navigate to API Keys section
4. Generate new API key
5. Copy the key to your `.env` file

## API Usage

### New Provider Selection

#### Check Available Providers
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
      "description": "Google's advanced language model, great for educational content",
      "requiresApiKey": "GEMINI_API_KEY",
      "available": true
    },
    {
      "id": "nvidia",
      "name": "NVIDIA Nemotron/LLaMA",
      "description": "NVIDIA's LLaMA-based model, excellent for quiz generation",
      "requiresApiKey": "NVIDIA_API_KEY",
      "available": true
    }
  ],
  "default": "gemini",
  "message": "Available AI providers for quiz generation"
}
```

#### Generate Quiz with Specific Provider
```http
POST /api/quiz/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "topic": "JavaScript Fundamentals",
  "questionCount": 5,
  "provider": "nvidia"
}
```

**Provider Options:**
- `"gemini"` - Use Google Gemini (default)
- `"nvidia"` - Use NVIDIA Nemotron/LLaMA

## Updated Postman Examples

### 1. Test Available Providers
```
GET {{baseUrl}}/api/providers
```

### 2. Generate Quiz with Gemini
```json
{
  "topic": "React Hooks",
  "questionCount": 5,
  "provider": "gemini"
}
```

### 3. Generate Quiz with NVIDIA
```json
{
  "topic": "Node.js Basics",
  "questionCount": 7,
  "provider": "nvidia"
}
```

### 4. Generate Quiz (Default Provider)
```json
{
  "topic": "CSS Flexbox",
  "questionCount": 4
}
```

## Response Format

Both providers return the same standardized format:

```json
{
  "id": "quiz_id",
  "topic": "JavaScript Fundamentals",
  "questionCount": 5,
  "aiProvider": "nvidia",
  "aiProviderName": "NVIDIA Nemotron/LLaMA",
  "expiresAt": "2024-01-20T11:00:00.000Z",
  "message": "Quiz generated successfully using NVIDIA Nemotron/LLaMA",
  "sharing": {
    "quizUrl": "http://localhost:5000/quiz/quiz_id",
    "apiUrl": "http://localhost:5000/api/quiz/quiz_id",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/...",
    "instructions": "Share this link with students to take the quiz",
    "expiresIn": "30 minutes"
  }
}
```

## Error Handling

### Provider Not Available
```json
{
  "error": "NVIDIA Nemotron/LLaMA is not available. Please check NVIDIA_API_KEY environment variable."
}
```

### Invalid Provider
```json
{
  "error": "Invalid AI provider. Available providers: gemini, nvidia"
}
```

### API Key Missing
```json
{
  "error": "AI service configuration error. Please check your API keys."
}
```

## Best Practices

### 1. **Fallback Strategy**
Configure both providers for redundancy:
```javascript
// Frontend example
const providers = ['nvidia', 'gemini'];
let quiz;
for (const provider of providers) {
  try {
    quiz = await generateQuiz(topic, count, provider);
    break;
  } catch (error) {
    console.log(`${provider} failed, trying next...`);
  }
}
```

### 2. **Provider Selection Logic**
- **Gemini**: Better for complex educational topics
- **NVIDIA**: Faster for general knowledge quizzes
- **Default**: Falls back to Gemini if no provider specified

### 3. **Rate Limiting**
- Both providers have free tier limits
- Monitor usage and implement proper error handling
- Consider caching quiz results

## Migration from Single Provider

### Backward Compatibility ✅
- Existing quiz generation calls still work
- Default provider is Gemini (maintains current behavior)
- No breaking changes to existing API contracts

### Database Updates
- New `aiProvider` field added to quiz model
- Existing quizzes default to `'gemini'`
- No data migration required

## Troubleshooting

### Common Issues

1. **Provider Not Available**
   - Check API key in `.env` file
   - Verify key validity with provider
   - Check network connectivity

2. **Rate Limiting**
   - Implement exponential backoff
   - Use multiple providers for load distribution
   - Cache frequently requested quizzes

3. **Quality Differences**
   - Test both providers with your content
   - NVIDIA might excel at technical topics
   - Gemini might be better for creative subjects

### Debug Mode
Set `NODE_ENV=development` to see detailed logs:
```bash
Generating 5 questions for topic: "JavaScript" using NVIDIA Nemotron/LLaMA
Successfully generated 5 questions using NVIDIA for topic
```

## Performance Comparison

| Provider | Avg Response Time | Question Quality | Free Tier Limits |
|----------|------------------|------------------|------------------|
| Gemini   | 2-4 seconds      | Excellent        | Generous         |
| NVIDIA   | 1-3 seconds      | Very Good        | Good             |

## Future Enhancements

- 🔄 **Auto-failover**: Automatic provider switching on failure
- 📊 **Usage Analytics**: Track provider performance and costs
- 🎯 **Smart Selection**: AI-powered provider selection based on topic
- 🔧 **Custom Models**: Support for fine-tuned models

---

## Summary

You now have a robust multi-provider AI system that offers:
- ✅ **Flexibility**: Choose the best provider for each use case
- ✅ **Reliability**: Fallback options if one provider fails
- ✅ **Performance**: Select faster or higher-quality options
- ✅ **Cost Optimization**: Use free tiers more effectively

Happy quiz generating! 🎯