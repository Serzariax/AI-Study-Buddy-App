import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Volume2, VolumeX, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AIService, ChatMessage } from '../services/ai-service';
import { VoiceInput } from './VoiceInput';
import { updateStudentProgress } from './StudentProgress';
import { useAuth } from '../contexts/AuthContext';

interface ChatInterfaceProps {
  onUsageUpdate?: (tokens: number) => void;
}

export function ChatInterface({ onUsageUpdate }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('General');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [showMicInfo, setShowMicInfo] = useState(() => {
    const dismissed = localStorage.getItem('micInfoDismissed');
    return !dismissed;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await AIService.chat(input, messages, subject);

      if (result.error) {
        setError(result.error + (result.details ? `: ${result.details}` : ''));
        // Remove the user message if the request failed
        setMessages(prev => prev.slice(0, -1));
      } else if (result.data) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: result.data.response,
        };
        setMessages(prev => [...prev, assistantMessage]);

        if (result.data.usage && onUsageUpdate) {
          onUsageUpdate(result.data.usage.total_tokens);
        }

        // Update student progress
        updateStudentProgress('question', user?.id);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string, index: number) => {
    // Use browser's built-in Web Speech API (free, no API key needed!)
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech is not supported in your browser');
      return;
    }

    // If already speaking this message, stop it
    if (isSpeaking === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    setIsSpeaking(index);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a pleasant voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && (voice.name.includes('Female') || voice.name.includes('Samantha'))
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(null);
    };

    utterance.onerror = () => {
      setError('Failed to play audio');
      setIsSpeaking(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = (transcript: string) => {
    setInput(transcript);
  };

  return (
    <Card className="flex flex-col h-full shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              AI Tutor Chat
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Ask questions in text or voice, and get AI-powered answers with audio playback!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>Get instant help on any subject</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Subject:</span>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Programming">Programming</SelectItem>
                <SelectItem value="Languages">Languages</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {showMicInfo && (
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-center justify-between gap-2">
              <span className="text-sm text-blue-900 dark:text-blue-100">
                🎤 <strong>Voice Input:</strong> Click the microphone button to speak your questions. Your browser will request permission when you first use it. Voice input requires HTTPS or localhost.
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-600 hover:text-blue-700"
                onClick={() => {
                  setShowMicInfo(false);
                  localStorage.setItem('micInfoDismissed', 'true');
                }}
              >
                Got it
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-4 min-h-[400px]">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8 space-y-4">
              <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
                <Sparkles className="h-12 w-12 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Start a conversation with your AI tutor!</p>
                <p className="text-sm mt-2">Ask questions, request explanations, or discuss any topic.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mt-6">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left">
                  <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">💬 Type or Speak</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Click the microphone icon to use voice input (browser permission required)</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-left">
                  <p className="font-medium text-purple-900 text-sm">🔊 Listen to Answers</p>
                  <p className="text-xs text-purple-700 mt-1">Click the speaker icon to hear AI responses</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : `bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 ${
                        isSpeaking === index ? 'ring-2 ring-purple-400 ring-offset-2' : ''
                      }`
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Badge 
                      variant={message.role === 'user' ? 'secondary' : 'default'} 
                      className={`mb-2 ${message.role === 'assistant' ? 'bg-blue-500' : ''}`}
                    >
                      {message.role === 'user' ? '👤 You' : '🤖 AI Tutor'}
                    </Badge>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === 'assistant' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSpeak(message.content, index)}
                            className={`${isSpeaking === index ? 'bg-purple-100' : ''}`}
                          >
                            {isSpeaking === index ? (
                              <VolumeX className="h-4 w-4 text-purple-600 animate-pulse" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isSpeaking === index ? 'Stop speaking' : 'Listen to answer'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-gray-700">AI Tutor is thinking...</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 bg-gray-50 p-3 rounded-lg border-2 border-gray-200 focus-within:border-blue-400 transition-colors">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && input.trim() && handleSend()}
            placeholder="Type your question or use the mic..."
            disabled={isLoading}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <VoiceInput onTranscript={handleVoiceInput} disabled={isLoading} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send message (Enter)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}