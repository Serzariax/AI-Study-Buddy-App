import React from 'react';
import { Brain, MessageSquare, CreditCard, Image, TrendingUp, Clock, Zap, CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ApiStatusBadge } from './ApiStatusBadge';

interface StudyDashboardProps {
  totalTokens: number;
  sessionStart: Date;
}

export function StudyDashboard({ totalTokens, sessionStart }: StudyDashboardProps) {
  const [sessionDuration, setSessionDuration] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - sessionStart.getTime()) / 1000);
      setSessionDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStart]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Tutor Chat',
      description: 'Get instant explanations and answers from your personal AI tutor',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: CreditCard,
      title: 'Smart Flashcards',
      description: 'AI-generated flashcards tailored to your study topics',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Image,
      title: 'Image Analysis',
      description: 'Upload diagrams, notes, or problems for detailed explanations',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      title: 'Performance Monitoring',
      description: 'Track API performance and system health in real-time',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4 animate-in fade-in duration-500">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl mb-2 animate-in fade-in duration-500">AI Study Buddy</h1>
        <p className="text-gray-600 animate-in fade-in duration-500">
          Your comprehensive AI-powered learning companion
        </p>
      </div>

      {/* Groq Info Banner */}
      <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 animate-in slide-in-from-top-2 duration-500">
        <Zap className="h-5 w-5 text-blue-600" />
        <AlertDescription className="ml-2">
          <div className="flex items-center gap-2 flex-wrap justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-blue-900">Powered by Groq AI LPU</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                100% Free
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Zap className="h-3 w-3 mr-1" />
                Ultra-Fast
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Sparkles className="h-3 w-3 mr-1" />
                No Setup
              </Badge>
            </div>
            <ApiStatusBadge />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Using Llama 3.3 70B for chat & flashcards • Llama 3.2 90B Vision for image analysis • Voice via browser
          </p>
        </AlertDescription>
      </Alert>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{formatDuration(sessionDuration)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              API Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{totalTokens.toLocaleString()} tokens</p>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-xl mb-4">Available Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrated AI Technologies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Groq Llama 3.3 70B (Chat)</Badge>
            <Badge variant="secondary">Groq Vision 90B</Badge>
            <Badge variant="secondary">Browser Web Speech API (TTS)</Badge>
            <Badge variant="outline">Supabase Backend</Badge>
            <Badge variant="outline">Real-time Monitoring</Badge>
            <Badge variant="outline">Persistent Storage</Badge>
            <Badge className="bg-green-500">100% Free</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Architecture Info */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-base">System Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Badge className="mt-0.5">Frontend</Badge>
            <span>React with TypeScript, Tailwind CSS, shadcn/ui components</span>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="mt-0.5">Backend</Badge>
            <span>Supabase Edge Functions with Hono web server</span>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="mt-0.5">Storage</Badge>
            <span>Supabase KV store for conversations, flashcards, and metrics</span>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="mt-0.5">AI APIs</Badge>
            <span>Groq Llama 3.3 70B, Vision 90B (free tier) with retry logic and error handling</span>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="mt-0.5 bg-green-500">Free Access</Badge>
            <span>No API key required - uses Groq's generous free tier with fast inference</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}