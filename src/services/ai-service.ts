import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-51bfa0b4`;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function for retry logic with exponential backoff
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // If we have retries left and it's a server error (5xx) or rate limit (429), retry
      if (retries > 0 && (response.status >= 500 || response.status === 429)) {
        console.log(`Request failed with status ${response.status}, retrying... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
        return fetchWithRetry<T>(url, options, retries - 1);
      }

      return { error: data.error || 'Request failed', details: data.details };
    }

    return { data };
  } catch (error) {
    // Network error - retry if we have retries left
    if (retries > 0) {
      console.log(`Network error, retrying... (${retries} retries left)`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
      return fetchWithRetry<T>(url, options, retries - 1);
    }

    return {
      error: 'Network error',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  response: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  conversationId: string;
}

export interface ImageAnalysisResponse {
  analysis: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  analysisId: string;
}

export interface Flashcard {
  question: string;
  answer: string;
  hint?: string;
}

export interface FlashcardResponse {
  flashcards: Flashcard[];
  flashcardSetId: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface TextToSpeechResponse {
  audioBase64: string;
  mimeType: string;
}

export interface MetricsSummary {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  successRate: string;
}

export interface MetricsResponse {
  summary: Record<string, MetricsSummary>;
  recentMetrics: Array<{
    apiName: string;
    endpoint: string;
    responseTime: number;
    success: boolean;
    errorMessage?: string;
    timestamp: number;
  }>;
}

export const AIService = {
  // Chat with AI Tutor
  async chat(
    message: string,
    conversationHistory: ChatMessage[] = [],
    subject?: string
  ): Promise<ApiResponse<ChatResponse>> {
    console.log('Sending chat request to AI tutor...', { message, subject });
    
    const result = await fetchWithRetry<ChatResponse>(
      `${API_BASE_URL}/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ message, conversationHistory, subject }),
      }
    );

    if (result.error) {
      console.error('Chat request failed:', result.error, result.details);
    } else {
      console.log('Chat request successful');
    }

    return result;
  },

  // Analyze image with Vision API
  async analyzeImage(
    imageUrl?: string,
    imageBase64?: string,
    prompt?: string
  ): Promise<ApiResponse<ImageAnalysisResponse>> {
    console.log('Sending image analysis request...');
    
    const result = await fetchWithRetry<ImageAnalysisResponse>(
      `${API_BASE_URL}/analyze-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ imageUrl, imageBase64, prompt }),
      }
    );

    if (result.error) {
      console.error('Image analysis request failed:', result.error, result.details);
    } else {
      console.log('Image analysis successful');
    }

    return result;
  },

  // Generate flashcards
  async generateFlashcards(
    topic: string,
    count: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<ApiResponse<FlashcardResponse>> {
    console.log('Generating flashcards...', { topic, count, difficulty });
    
    const result = await fetchWithRetry<FlashcardResponse>(
      `${API_BASE_URL}/generate-flashcards`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ topic, count, difficulty }),
      }
    );

    if (result.error) {
      console.error('Flashcard generation failed:', result.error, result.details);
    } else {
      console.log('Flashcard generation successful');
    }

    return result;
  },

  // Text-to-speech now uses browser's Web Speech API (no server call needed)
  // This method is kept for backwards compatibility but won't be used
  async textToSpeech(
    text: string,
    voice?: string
  ): Promise<ApiResponse<TextToSpeechResponse>> {
    console.log('Text-to-speech now handled by browser Web Speech API');
    return { 
      data: { 
        audioBase64: '', 
        mimeType: 'text/plain' 
      } 
    };
  },

  // Get API performance metrics
  async getMetrics(): Promise<ApiResponse<MetricsResponse>> {
    const result = await fetchWithRetry<MetricsResponse>(
      `${API_BASE_URL}/metrics`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (result.error) {
      console.error('Failed to fetch metrics:', result.error);
    }

    return result;
  },

  // Get study history
  async getHistory(type: 'conversations' | 'flashcards' | 'analyses'): Promise<ApiResponse<{ history: any[] }>> {
    const result = await fetchWithRetry<{ history: any[] }>(
      `${API_BASE_URL}/history?type=${type}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (result.error) {
      console.error('Failed to fetch history:', result.error);
    }

    return result;
  },

  // Save study session
  async saveSession(sessionData: any): Promise<ApiResponse<{ success: boolean; sessionId: string }>> {
    const result = await fetchWithRetry<{ success: boolean; sessionId: string }>(
      `${API_BASE_URL}/save-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ sessionData }),
      }
    );

    if (result.error) {
      console.error('Failed to save session:', result.error);
    }

    return result;
  },
};