# AI Study Buddy - Setup Guide

## 🎉 Quick Start - No Setup Required!

This application is **ready to use immediately** with no API key configuration needed!

### Why No Setup?

We've switched from OpenAI to **Groq AI**, which offers:
- ✅ **100% Free** - Generous free tier with no credit card required
- ✅ **No API Key Needed** - Works out of the box
- ✅ **Lightning Fast** - Groq's LPU inference is incredibly fast
- ✅ **Powerful Models** - Llama 3.3 70B for chat, Llama 3.2 90B for vision
- ✅ **Browser-Based TTS** - Uses your browser's built-in speech synthesis

## Features Available

### 1. AI Tutor Chat 💬
- Powered by **Llama 3.3 70B Versatile**
- Subject-specific tutoring (Math, Science, History, Programming, etc.)
- Context-aware conversations
- Real-time text-to-speech using browser API

### 2. Smart Flashcards 🃏
- AI-generated flashcards on any topic
- Multiple difficulty levels (Easy, Medium, Hard)
- Interactive flip cards
- Customizable card count (3-15 cards)

### 3. Image Analysis 🖼️
- Powered by **Llama 3.2 90B Vision**
- Upload diagrams, notes, or study materials
- AI analyzes and explains content
- Support for handwritten notes, charts, and problems

### 4. Performance Monitor 📊
- Real-time API metrics
- Success rate tracking
- Response time analytics
- System health visualization

## Optional: Get Your Own Free Groq API Key

While the app works with a demo key, you can get your own **free API key** for better reliability:

### Steps to Get Free Groq API Key:

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account (no credit card required)
3. Navigate to API Keys section
4. Create a new API key
5. Copy your API key

### Add Your Key to Supabase:

1. Go to your Supabase project settings
2. Navigate to Edge Functions > Environment Variables
3. Add a new variable:
   - Name: `GROQ_API_KEY`
   - Value: Your Groq API key
4. Save and the app will automatically use your key

## Rate Limits (Free Tier)

Groq's free tier includes:
- **30 requests per minute** for Llama 3.3 70B
- **30 requests per minute** for Llama 3.2 90B Vision
- **14,400 tokens per minute**

This is more than enough for typical study sessions!

## Browser Compatibility

### Text-to-Speech Requirements:
The browser-based TTS feature requires:
- ✅ Chrome/Edge (Excellent support)
- ✅ Safari (Good support)
- ✅ Firefox (Basic support)
- ⚠️ Mobile browsers (Variable support)

If TTS doesn't work in your browser, you can still use all other features!

## Technology Stack

### Frontend:
- **React 18+** with TypeScript
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- **Lucide React** for icons

### Backend:
- **Supabase Edge Functions** (serverless)
- **Hono** web framework
- **Deno** runtime

### AI Services:
- **Groq API** - Chat and Vision
- **Web Speech API** - Text-to-speech

### Storage:
- **Supabase KV Store** - Conversations, flashcards, metrics

## Architecture Benefits

### 1. Zero Configuration
- No API keys to manage (unless you want better limits)
- No billing setup
- No credit card required

### 2. Cost-Effective
- Completely free for learning and prototyping
- No hidden costs
- Generous rate limits

### 3. Fast Performance
- Groq's LPU technology provides ultra-fast inference
- Typical response times: 500-2000ms
- Much faster than traditional GPU-based inference

### 4. Privacy-Friendly
- No user accounts required
- Data stored temporarily in KV store
- Can be easily cleared

## Troubleshooting

### "Failed to get response from AI tutor"
- **Cause**: Rate limit exceeded or network issue
- **Solution**: Wait a minute and try again. The app has automatic retry logic.

### "Text-to-speech is not supported"
- **Cause**: Browser doesn't support Web Speech API
- **Solution**: Use Chrome, Edge, or Safari for TTS support

### "Failed to analyze image"
- **Cause**: Image too large or unsupported format
- **Solution**: Use images under 10MB, formats: JPG, PNG, WebP

### Performance is slow
- **Cause**: Network latency or high API load
- **Solution**: Check the Performance Monitor tab to see metrics

## Advanced Usage

### Custom Prompts for Image Analysis
You can provide custom prompts when analyzing images:
- "Explain the mathematical formulas in this diagram"
- "Translate the handwritten notes"
- "Solve the problems shown in this image"

### Subject-Specific Tutoring
Change the subject in the chat interface for specialized help:
- Mathematics - Algebra, calculus, statistics
- Science - Physics, chemistry, biology
- Programming - Python, JavaScript, algorithms
- History - Events, timelines, analysis
- English - Grammar, writing, literature

### Optimal Flashcard Generation
For best results:
- Be specific with topics (e.g., "Photosynthesis process" vs "Biology")
- Choose appropriate difficulty level
- Start with 5 cards to test, then generate more

## Development & Extension

### Adding New Features
The app is designed to be extensible:

1. **New AI Capabilities**: Add new endpoints in `/supabase/functions/server/index.tsx`
2. **New UI Components**: Create components in `/components/`
3. **New Data Types**: Use KV store with custom prefixes

### Local Development
```bash
# The app runs in Figma Make environment
# All changes are reflected immediately
# Backend runs on Supabase Edge Functions
```

## Support & Resources

### Groq Resources:
- [Groq Documentation](https://console.groq.com/docs)
- [Groq Playground](https://console.groq.com/playground)
- [Model Information](https://console.groq.com/docs/models)

### Web Speech API:
- [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Browser Support](https://caniuse.com/speech-synthesis)

## Comparison: Groq vs OpenAI

| Feature | Groq (Current) | OpenAI (Previous) |
|---------|----------------|-------------------|
| Cost | **Free** | Paid ($0.01-0.03/1K tokens) |
| Setup | **None** | API key required |
| Speed | **Very Fast** (LPU) | Moderate (GPU) |
| Models | Llama 3.3 70B | GPT-4 |
| Rate Limits | 30 req/min | Varies by tier |
| Vision | Llama 3.2 90B | GPT-4 Vision |
| Best For | Learning, Prototyping | Production, Advanced |

## Future Enhancements

Potential additions:
- [ ] User authentication for personal study history
- [ ] Export flashcards to Anki format
- [ ] Spaced repetition system
- [ ] Voice input for hands-free studying
- [ ] Study group collaboration
- [ ] Progress tracking and analytics
- [ ] Quiz generation
- [ ] Multi-language support

## License & Credits

This is a demonstration project showing integration of:
- Groq AI (Free tier)
- Supabase (Backend & Storage)
- React & TypeScript (Frontend)
- shadcn/ui (UI Components)

Built for educational purposes to help students learn more effectively with AI assistance.

---

**Ready to Learn?** Just start using the app - no setup needed! 🚀