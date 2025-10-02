import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronLeft, ChevronRight, RotateCcw, AlertCircle, CreditCard, HelpCircle, Lightbulb, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AIService, Flashcard } from '../services/ai-service';
import { toast } from 'sonner@2.0.3';
import { exportFlashcardsAsCSV, exportFlashcardsAsPDF, exportFlashcardsAsImages } from '../utils/exportUtils';
import { updateStudentProgress } from './StudentProgress';
import { useAuth } from '../contexts/AuthContext';

interface FlashcardGeneratorProps {
  onUsageUpdate?: (tokens: number) => void;
}

export function FlashcardGenerator({ onUsageUpdate }: FlashcardGeneratorProps) {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState('5');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setFlashcards([]);

    try {
      const result = await AIService.generateFlashcards(
        topic,
        parseInt(count) || 5,
        difficulty
      );

      if (result.error) {
        setError(result.error + (result.details ? `: ${result.details}` : ''));
        toast.error('Failed to generate flashcards', {
          description: result.error,
        });
      } else if (result.data) {
        setFlashcards(result.data.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
        toast.success('Flashcards generated!', {
          description: `Created ${result.data.flashcards.length} flashcards for "${topic}"`,
        });

        if (result.data.usage && onUsageUpdate) {
          onUsageUpdate(result.data.usage.total_tokens);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('Unexpected error', {
        description: 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <Card className="flex flex-col h-full shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-500" />
          AI Flashcard Generator
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Generate custom flashcards on any topic with AI-powered questions and answers!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>Create smart study cards with AI in seconds</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="text-sm mb-1 block font-medium">Topic</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., World War II"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && topic.trim() && handleGenerate()}
              />
            </div>

            <div>
              <label className="text-sm mb-1 block font-medium">Number of Cards</label>
              <Select value={count} onValueChange={setCount} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 cards</SelectItem>
                  <SelectItem value="5">5 cards</SelectItem>
                  <SelectItem value="10">10 cards</SelectItem>
                  <SelectItem value="15">15 cards</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-1 block font-medium">Difficulty</label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">✨ Easy</SelectItem>
                  <SelectItem value="medium">⚡ Medium</SelectItem>
                  <SelectItem value="hard">🔥 Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !topic.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating flashcards...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Flashcards
              </>
            )}
          </Button>
        </div>

        {flashcards.length > 0 && (
          <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-base px-3 py-1">
                Card {currentIndex + 1} of {flashcards.length}
              </Badge>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                      exportFlashcardsAsCSV(flashcards, topic);
                      toast.success('Exported as CSV!');
                    }}>
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      exportFlashcardsAsPDF(flashcards, topic);
                      toast.success('Opening PDF preview...');
                    }}>
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      await exportFlashcardsAsImages(flashcards, topic);
                      toast.success('Exported as images!');
                    }}>
                      Export as Images
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </div>
            </div>

            <div
              onClick={handleFlip}
              className={`flex-1 min-h-[350px] rounded-xl p-8 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center border-4 ${
                isFlipped 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-600'
                  : 'bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300 dark:border-purple-600'
              }`}
            >
              <div className="text-center max-w-2xl">
                <Badge className={`mb-6 text-base px-4 py-1 ${
                  isFlipped ? 'bg-green-500' : 'bg-purple-500'
                }`}>
                  {isFlipped ? '✅ Answer' : '❓ Question'}
                </Badge>
                <p className="text-xl leading-relaxed mb-4 text-gray-900 dark:text-gray-100">
                  {isFlipped
                    ? flashcards[currentIndex].answer
                    : flashcards[currentIndex].question}
                </p>
                {!isFlipped && flashcards[currentIndex].hint && (
                  <div className="mt-6 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg inline-block">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                      <Lightbulb className="h-4 w-4" />
                      <p className="text-sm font-medium">
                        Hint: {flashcards[currentIndex].hint}
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 font-medium">
                  💡 Click card to {isFlipped ? 'see question' : 'reveal answer'}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Badge variant="secondary" className="px-4 py-2">
                {isFlipped ? '✅ Answer Visible' : '❓ Question Visible'}
              </Badge>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentIndex === flashcards.length - 1}
                className="flex-1"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {flashcards.length === 0 && !isLoading && (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-center min-h-[300px]">
            <div className="space-y-4">
              <div className="inline-block p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full">
                <Sparkles className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Ready to create flashcards?</p>
                <p className="text-sm mt-2">Enter a topic and click generate!</p>
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mt-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-xs">
                  <p className="font-medium text-blue-900 dark:text-blue-300">Any Topic</p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded text-xs">
                  <p className="font-medium text-purple-900 dark:text-purple-300">AI-Powered</p>
                </div>
                <div className="p-2 bg-pink-50 dark:bg-pink-900/30 rounded text-xs">
                  <p className="font-medium text-pink-900 dark:text-pink-300">Instant</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}