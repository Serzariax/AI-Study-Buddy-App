import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS and logging middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Supabase client setup
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to track API performance
async function trackAPIPerformance(
  apiName: string,
  endpoint: string,
  responseTime: number,
  success: boolean,
  errorMessage?: string
) {
  const timestamp = Date.now();
  const metricKey = `api_metric:${apiName}:${timestamp}`;
  
  await kv.set(metricKey, {
    apiName,
    endpoint,
    responseTime,
    success,
    errorMessage,
    timestamp,
  });
}

// Helper function to get Groq API key
// Using free Groq API - get your own free key at https://console.groq.com
function getGroqKey(): string {
  const key = Deno.env.get('GROQ_API_KEY') || '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';
  return key;
}

// Route: Health check
app.get('/make-server-51bfa0b4/health', (c) => {
  return c.json({ status: 'healthy', timestamp: Date.now() });
});

// Route: Sign up new user
app.post('/make-server-51bfa0b4/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    if (!email || !password || !name || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (!['student', 'moderator'].includes(role)) {
      return c.json({ error: 'Invalid role. Must be student or moderator' }, 400);
    }

    // Create user with Supabase Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true, // Auto-confirm since we don't have email configured
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    const userKey = `user:${data.user.id}`;
    await kv.set(userKey, {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: Date.now(),
    });

    return c.json({ success: true, userId: data.user.id });
  } catch (error) {
    const errorMessage = `Signup endpoint error: ${error instanceof Error ? error.message : String(error)}`;
    console.log(errorMessage);
    return c.json({ error: 'Internal server error during signup', details: errorMessage }, 500);
  }
});

// Route: Chat with AI Tutor (Groq AI - Llama 3.3 70B)
app.post('/make-server-51bfa0b4/chat', async (c) => {
  const startTime = Date.now();
  
  try {
    const { message, conversationHistory, subject } = await c.req.json();
    
    if (!message || typeof message !== 'string') {
      return c.json({ error: 'Message is required and must be a string' }, 400);
    }

    const groqKey = getGroqKey();
    
    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `You are an expert AI tutor specializing in ${subject || 'various subjects'}. Your role is to:
- Explain concepts clearly and thoroughly
- Break down complex topics into understandable parts
- Provide examples and analogies
- Ask probing questions to check understanding
- Encourage critical thinking
- Adapt your teaching style to the student's level
Be patient, encouraging, and always verify the student understands before moving on.`
      },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.text();
      console.log(`Groq Chat API error: ${response.status} - ${errorData}`);
      await trackAPIPerformance('Groq Chat', '/chat/completions', responseTime, false, errorData);
      return c.json({ error: 'Failed to get response from AI tutor', details: errorData }, response.status);
    }

    const data = await response.json();
    await trackAPIPerformance('Groq Chat', '/chat/completions', responseTime, true);

    // Store conversation in KV store
    const conversationKey = `conversation:${Date.now()}`;
    await kv.set(conversationKey, {
      subject,
      message,
      response: data.choices[0].message.content,
      timestamp: Date.now(),
    });

    return c.json({
      response: data.choices[0].message.content,
      usage: data.usage,
      conversationId: conversationKey,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = `Chat endpoint error: ${error instanceof Error ? error.message : String(error)}`;
    console.log(errorMessage);
    await trackAPIPerformance('Groq Chat', '/chat/completions', responseTime, false, errorMessage);
    
    return c.json({ 
      error: 'Internal server error during chat request',
      details: errorMessage 
    }, 500);
  }
});

// Route: Analyze image (Groq AI - Llama 4 Scout Vision)
app.post('/make-server-51bfa0b4/analyze-image', async (c) => {
  const startTime = Date.now();
  
  try {
    const { imageUrl, imageBase64, prompt } = await c.req.json();
    
    if (!imageUrl && !imageBase64) {
      return c.json({ error: 'Either imageUrl or imageBase64 is required' }, 400);
    }

    const groqKey = getGroqKey();
    
    const imageContent = imageUrl 
      ? { type: 'image_url', image_url: { url: imageUrl } }
      : { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } };

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt || 'Analyze this image in detail. If it contains educational content, diagrams, notes, or problems, explain them thoroughly. Identify key concepts, formulas, or information.'
          },
          imageContent
        ]
      }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages,
        max_tokens: 1000,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.text();
      console.log(`Groq Vision API error: ${response.status} - ${errorData}`);
      await trackAPIPerformance('Groq Vision', '/chat/completions', responseTime, false, errorData);
      return c.json({ error: 'Failed to analyze image', details: errorData }, response.status);
    }

    const data = await response.json();
    await trackAPIPerformance('Groq Vision', '/chat/completions', responseTime, true);

    // Store analysis in KV store
    const analysisKey = `analysis:${Date.now()}`;
    await kv.set(analysisKey, {
      prompt,
      analysis: data.choices[0].message.content,
      timestamp: Date.now(),
    });

    return c.json({
      analysis: data.choices[0].message.content,
      usage: data.usage,
      analysisId: analysisKey,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = `Image analysis endpoint error: ${error instanceof Error ? error.message : String(error)}`;
    console.log(errorMessage);
    await trackAPIPerformance('Groq Vision', '/chat/completions', responseTime, false, errorMessage);
    
    return c.json({ 
      error: 'Internal server error during image analysis',
      details: errorMessage 
    }, 500);
  }
});

// Route: Generate flashcards
app.post('/make-server-51bfa0b4/generate-flashcards', async (c) => {
  const startTime = Date.now();
  
  try {
    const { topic, count = 5, difficulty = 'medium' } = await c.req.json();
    
    if (!topic) {
      return c.json({ error: 'Topic is required' }, 400);
    }

    const groqKey = getGroqKey();
    
    const prompt = `Generate ${count} flashcards for studying "${topic}" at ${difficulty} difficulty level.
Return the response as a JSON array of objects, where each object has:
- "question": the question or prompt
- "answer": the detailed answer
- "hint": a helpful hint (optional)

Make the flashcards educational, clear, and appropriate for the difficulty level.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates educational flashcards. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.text();
      console.log(`Groq Flashcard Generation API error: ${response.status} - ${errorData}`);
      await trackAPIPerformance('Groq Flashcards', '/chat/completions', responseTime, false, errorData);
      return c.json({ error: 'Failed to generate flashcards', details: errorData }, response.status);
    }

    const data = await response.json();
    await trackAPIPerformance('Groq Flashcards', '/chat/completions', responseTime, true);

    let flashcards;
    try {
      const content = data.choices[0].message.content;
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\[[\s\S]*\]/);
      flashcards = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : content);
    } catch (parseError) {
      console.log(`Failed to parse flashcards JSON: ${parseError}`);
      return c.json({ error: 'Failed to parse generated flashcards', details: data.choices[0].message.content }, 500);
    }

    // Store flashcards in KV store
    const flashcardSetKey = `flashcards:${topic}:${Date.now()}`;
    await kv.set(flashcardSetKey, {
      topic,
      difficulty,
      flashcards,
      timestamp: Date.now(),
    });

    return c.json({
      flashcards,
      flashcardSetId: flashcardSetKey,
      usage: data.usage,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = `Flashcard generation endpoint error: ${error instanceof Error ? error.message : String(error)}`;
    console.log(errorMessage);
    await trackAPIPerformance('Groq Flashcards', '/chat/completions', responseTime, false, errorMessage);
    
    return c.json({ 
      error: 'Internal server error during flashcard generation',
      details: errorMessage 
    }, 500);
  }
});

// Route: Text to speech - Now using browser's Web Speech API (no server needed)
// This endpoint is kept for compatibility but returns a message to use browser TTS
app.post('/make-server-51bfa0b4/text-to-speech', async (c) => {
  return c.json({ 
    useBrowserTTS: true,
    message: 'Text-to-speech is now handled by the browser\'s built-in Web Speech API - no API key required!'
  });
});

// Route: Get API performance metrics
app.get('/make-server-51bfa0b4/metrics', async (c) => {
  try {
    const metrics = await kv.getByPrefix('api_metric:');
    
    // Sort by timestamp descending and limit to last 100
    const sortedMetrics = metrics
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);

    // Calculate summary statistics
    const summary: Record<string, any> = {};
    
    sortedMetrics.forEach((metric) => {
      const { apiName, responseTime, success } = metric;
      
      if (!summary[apiName]) {
        summary[apiName] = {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          totalResponseTime: 0,
          avgResponseTime: 0,
          minResponseTime: Infinity,
          maxResponseTime: 0,
        };
      }
      
      summary[apiName].totalCalls++;
      summary[apiName].totalResponseTime += responseTime;
      summary[apiName].minResponseTime = Math.min(summary[apiName].minResponseTime, responseTime);
      summary[apiName].maxResponseTime = Math.max(summary[apiName].maxResponseTime, responseTime);
      
      if (success) {
        summary[apiName].successfulCalls++;
      } else {
        summary[apiName].failedCalls++;
      }
    });

    // Calculate averages
    Object.keys(summary).forEach(apiName => {
      summary[apiName].avgResponseTime = Math.round(
        summary[apiName].totalResponseTime / summary[apiName].totalCalls
      );
      summary[apiName].successRate = (
        (summary[apiName].successfulCalls / summary[apiName].totalCalls) * 100
      ).toFixed(2);
    });

    return c.json({
      summary,
      recentMetrics: sortedMetrics.slice(0, 20),
    });

  } catch (error) {
    const errorMessage = `Metrics endpoint error: ${error instanceof Error ? error.message : String(error)}`;
    console.log(errorMessage);
    return c.json({ 
      error: 'Failed to retrieve metrics',
      details: errorMessage 
    }, 500);
  }
});

// Route: Get study history
app.get('/make-server-51bfa0b4/history', async (c) => {
  try {
    const { type } = c.req.query();
    
    let prefix = '';
    switch (type) {
      case 'conversations':
        prefix = 'conversation:';
        break;
      case 'flashcards':
        prefix = 'flashcards:';
        break;
      case 'analyses':
        prefix = 'analysis:';
        break;
      default:
        return c.json({ error: 'Invalid type. Must be: conversations, flashcards, or analyses' }, 400);
    }

    const history = await kv.getByPrefix(prefix);
    
    // Sort by timestamp descending
    const sortedHistory = history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);

    return c.json({ history: sortedHistory });

  } catch (error) {
    const errorMessage = `History endpoint error: ${error instanceof Error ? error.message : String(error)}`;
    console.log(errorMessage);
    return c.json({ 
      error: 'Failed to retrieve history',
      details: errorMessage 
    }, 500);
  }
});

// Route: Save study session
app.post('/make-server-51bfa0b4/save-session', async (c) => {
  try {
    const { sessionData } = await c.req.json();
    
    if (!sessionData) {
      return c.json({ error: 'Session data is required' }, 400);
    }

    const sessionKey = `session:${Date.now()}`;
    await kv.set(sessionKey, {
      ...sessionData,
      timestamp: Date.now(),
    });

    return c.json({ success: true, sessionId: sessionKey });

  } catch (error) {
    const errorMessage = `Save session endpoint error: ${error instanceof Error ? error.message : String(error)}`;
    console.log(errorMessage);
    return c.json({ 
      error: 'Failed to save session',
      details: errorMessage 
    }, 500);
  }
});

Deno.serve(app.fetch);