# Groq API Integration Guide

## Overview

This application uses **Groq's OpenAI-compatible API** for all AI features. Groq provides ultra-fast LPU (Language Processing Unit) inference with generous free tier limits.

## API Configuration

### Current Setup
- **API Key**: Pre-configured (stored in environment variable `GROQ_API_KEY`)
- **Base URL**: `https://api.groq.com/openai/v1`
- **Authentication**: Bearer token in Authorization header

### Models Used

1. **Chat & Flashcards**: `llama-3.3-70b-versatile`
   - Fast, intelligent responses
   - Perfect for tutoring and content generation
   - Response time: 500-1500ms

2. **Image Analysis**: `llama-3.2-90b-vision-preview`
   - Advanced vision capabilities
   - OCR and diagram analysis
   - Response time: 1000-2000ms

## Features Breakdown

### 1. AI Tutor Chat (`/chat` endpoint)
```typescript
// Backend: /supabase/functions/server/index.tsx
model: 'llama-3.3-70b-versatile'
temperature: 0.7
max_tokens: 1000
```

**What it does:**
- Contextual conversations with subject-specific expertise
- Maintains conversation history
- Provides detailed explanations and examples

**Frontend Integration:**
- Voice input via Web Speech API
- Text-to-speech via Web Speech API (browser-based, no API needed)
- Real-time message streaming

### 2. Flashcard Generation (`/generate-flashcards` endpoint)
```typescript
model: 'llama-3.3-70b-versatile'
temperature: 0.8
max_tokens: 2000
```

**What it does:**
- Generates educational flashcards with Q&A format
- Includes helpful hints
- Adapts to difficulty level (easy/medium/hard)

**Output Format:**
```json
[
  {
    "question": "What is...",
    "answer": "The answer is...",
    "hint": "Think about..."
  }
]
```

### 3. Image Analysis (`/analyze-image` endpoint)
```typescript
model: 'llama-3.2-90b-vision-preview'
max_tokens: 1000
```

**What it does:**
- Visual analysis mode: Explains diagrams, formulas, concepts
- OCR mode: Extracts text from images (handwritten or printed)
- Custom prompts for specific analysis needs

**Supported Formats:**
- Base64 encoded images
- Image URLs
- JPEG, PNG, WebP

## Rate Limits

Groq free tier provides:
- **30 requests per minute**
- **14,400 tokens per minute**
- **6,000 requests per day**

These limits are more than sufficient for individual study sessions.

## Error Handling

The app includes robust error handling:

1. **Automatic Retries**: Up to 3 retries with exponential backoff
2. **User-Friendly Messages**: Clear error descriptions
3. **Performance Tracking**: All API calls are logged for monitoring
4. **Fallback Handling**: Graceful degradation if API is unavailable

## Performance Monitoring

All API calls are tracked with metrics:
- Response time
- Success/failure rate
- Endpoint usage
- Error messages

View these in the **Monitor** tab of the application.

## How to Replace API Key (Optional)

If you want to use your own Groq API key:

1. Get a free API key at [console.groq.com](https://console.groq.com)
2. Set the `GROQ_API_KEY` environment variable in Supabase
3. Restart the edge function

The app will automatically use your key.

## Code Examples

### Making a Chat Request
```typescript
// Frontend: /services/ai-service.ts
const result = await AIService.chat(
  "Explain quantum mechanics",
  conversationHistory,
  "Physics"
);
```

### Analyzing an Image
```typescript
const result = await AIService.analyzeImage(
  undefined,
  base64Image,
  "Extract all text from this image"
);
```

### Generating Flashcards
```typescript
const result = await AIService.generateFlashcards(
  "World War II",
  5,
  "medium"
);
```

## Browser-Based Features (No API)

Some features use browser APIs for zero-cost operation:

### Text-to-Speech
Uses Web Speech API (built into browsers):
```typescript
const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 0.9;
window.speechSynthesis.speak(utterance);
```

### Voice Input
Uses Web Speech Recognition API:
```typescript
const recognition = new webkitSpeechRecognition();
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  // Use transcript...
};
recognition.start();
```

## Benefits of Groq

1. **Speed**: 10-100x faster than traditional cloud AI
2. **Free**: No credit card, generous free tier
3. **Quality**: State-of-the-art Llama models
4. **Compatibility**: OpenAI-compatible API
5. **Reliability**: High uptime and performance

## Additional Resources

- [Groq Documentation](https://console.groq.com/docs)
- [Llama Model Cards](https://www.llama.com/)
- [Groq Console](https://console.groq.com)

---

**Note**: This application is designed to work immediately with the pre-configured API key. No setup required! 🚀
