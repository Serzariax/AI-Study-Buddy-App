import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, MessageSquare, CreditCard, Image, Mic, Volume2, Eye, Sparkles } from 'lucide-react';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the tutorial
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setOpen(true);
    }
  }, []);

  const steps = [
    {
      title: 'Welcome to AI Study Buddy! 🎓',
      description: 'Your personal AI-powered learning companion',
      icon: <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />,
      content: (
        <div className="space-y-4">
          <p className="text-center">
            This app uses cutting-edge AI to help you learn faster and more effectively. 
            Let's take a quick tour of the features!
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>No Setup</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
              <CheckCircle2 className="h-4 w-4 text-orange-600" />
              <span>Easy to Use</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'AI Tutor Chat 💬',
      description: 'Get instant help on any subject',
      icon: <MessageSquare className="h-12 w-12 text-green-500 mx-auto mb-4" />,
      content: (
        <div className="space-y-3">
          <p>Ask questions and get detailed explanations on any topic!</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
              <Mic className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Voice Input</p>
                <p className="text-sm text-gray-600">Click the mic button to speak your questions</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
              <Volume2 className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Text-to-Speech</p>
                <p className="text-sm text-gray-600">Listen to AI responses read aloud</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Smart Flashcards 🃏',
      description: 'AI-generated study cards',
      icon: <CreditCard className="h-12 w-12 text-purple-500 mx-auto mb-4" />,
      content: (
        <div className="space-y-3">
          <p>Generate custom flashcards on any topic with AI!</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Enter any topic you want to study
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Choose difficulty level (Easy, Medium, Hard)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Get instant flashcards with questions & answers
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Flip cards to reveal answers and hints
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Image Analysis 📸',
      description: 'AI vision for study materials',
      icon: <Image className="h-12 w-12 text-orange-500 mx-auto mb-4" />,
      content: (
        <div className="space-y-3">
          <p>Upload images and let AI analyze them!</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
              <Eye className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Visual Analysis</p>
                <p className="text-sm text-gray-600">Understand diagrams, charts, and formulas</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
              <MessageSquare className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">OCR Text Extraction</p>
                <p className="text-sm text-gray-600">Extract text from handwritten notes or books</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'You\'re All Set! 🚀',
      description: 'Start learning now',
      icon: <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />,
      content: (
        <div className="space-y-4">
          <p className="text-center">
            You're ready to supercharge your learning! Here are some tips:
          </p>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-blue-50 rounded">
              <p className="font-medium text-blue-900">💡 Tip: Be Specific</p>
              <p className="text-blue-700">Ask detailed questions for better answers</p>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <p className="font-medium text-green-900">💡 Tip: Use Voice</p>
              <p className="text-green-700">Speak naturally - it's faster than typing!</p>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <p className="font-medium text-purple-900">💡 Tip: Upload Images</p>
              <p className="text-purple-700">Take photos of homework or textbooks for help</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2">
            {currentStep.icon}
          </div>
          <DialogTitle className="text-center">{currentStep.title}</DialogTitle>
          <DialogDescription className="text-center">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {currentStep.content}
        </div>

        <div className="flex justify-center gap-1 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === step ? 'bg-blue-500 w-4' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tutorial
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {step < steps.length - 1 ? 'Next' : 'Get Started!'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
