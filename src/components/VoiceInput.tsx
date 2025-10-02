import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from 'sonner@2.0.3';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      toast.success('Voice captured!', {
        description: `"${transcript.slice(0, 50)}${transcript.length > 50 ? '...' : ''}"`,
      });
      setIsListening(false);
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      setIsListening(false);
      
      // Handle different error types with appropriate messages
      if (event.error === 'not-allowed') {
        // Show a gentle message encouraging user to allow microphone access
        toast.error('Microphone access required', {
          description: 'Please allow microphone access and try again.',
          duration: 4000,
        });
      } else if (event.error === 'no-speech') {
        toast.warning('No speech detected', {
          description: 'Please try again and speak clearly.',
        });
      } else if (event.error === 'aborted') {
        // Don't show toast for aborted - user intentionally stopped
        return;
      } else if (event.error === 'audio-capture') {
        toast.error('Microphone error', {
          description: 'Could not access microphone. Check if another app is using it.',
        });
      } else if (event.error === 'network') {
        toast.error('Network error', {
          description: 'Check your internet connection and try again.',
        });
      } else if (event.error === 'service-not-allowed') {
        toast.warning('Speech recognition not available', {
          description: 'Speech recognition service is not allowed in this context.',
        });
      } else {
        // Show generic errors for unexpected issues
        toast.error('Voice input error', {
          description: `Error: ${event.error}. Please try again.`,
        });
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.onstart = () => {
      setIsListening(true);
      // Only show listening toast if we successfully started
      toast.success('🎤 Listening...', {
        description: 'Speak clearly into your microphone.',
        duration: 3000,
      });
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [onTranscript]);

  const checkMicrophonePermissions = async () => {
    try {
      // Check if we're on HTTPS or localhost
      const isSecureContext = window.isSecureContext || 
        window.location.protocol === 'https:' || 
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      if (!isSecureContext) {
        toast.error('Microphone requires HTTPS', {
          description: 'Voice input requires a secure connection. Please use HTTPS.',
          duration: 6000,
        });
        return false;
      }

      // Check if microphone permission is available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          
          // Only block if explicitly denied by user
          if (permissionStatus.state === 'denied') {
            toast.error('Microphone access denied', {
              description: 'Please allow microphone access in your browser settings and try again.',
              duration: 6000,
            });
            return false;
          }
          
          // For 'prompt' or 'granted' states, continue - let the browser handle the permission request
          console.log('Microphone permission state:', permissionStatus.state);
        } catch (e) {
          // Permission query might not be supported, continue anyway
          console.log('Permission query not supported, continuing...');
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking microphone permissions:', error);
      return true; // Continue anyway if we can't check
    }
  };

  const toggleListening = async () => {
    if (!recognition) {
      toast.error('Voice input not supported', {
        description: 'Your browser does not support speech recognition. Try Chrome or Edge.',
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    // Check basic prerequisites (HTTPS, browser support)
    const hasBasicSupport = await checkMicrophonePermissions();
    if (!hasBasicSupport) {
      return;
    }

    try {
      // Start recognition - the browser will handle permission requests automatically
      // If the user denies permission, it will trigger the onerror callback with 'not-allowed'
      recognition.start();
      
      // Don't show "Listening..." toast here - let onstart handle it
    } catch (error: any) {
      console.error('Error starting recognition:', error);
      
      // Handle specific startup errors
      if (error.message?.includes('already started')) {
        // If already started, just show listening state
        setIsListening(true);
        toast.info('🎤 Already listening...', {
          description: 'Speak clearly into your microphone.',
          duration: 3000,
        });
      } else if (error.name === 'InvalidStateError') {
        // Recognition is in an invalid state, try to restart
        console.log('Recognition in invalid state, attempting restart...');
        setTimeout(() => {
          try {
            recognition.start();
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            toast.error('Voice input unavailable', {
              description: 'Please refresh the page and try again.',
            });
          }
        }, 100);
      } else {
        toast.error('Could not start voice input', {
          description: 'Make sure your microphone is connected and accessible.',
        });
        setIsListening(false);
      }
    }
  };

  const isBrowserSupported = !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;

  const getTooltipText = () => {
    if (!isBrowserSupported) {
      return 'Voice input not supported. Use Chrome, Edge, or Safari.';
    }
    if (disabled) {
      return 'Voice input is currently disabled';
    }
    if (isListening) {
      return 'Click to stop listening';
    }
    
    // Check if we're on a secure context
    const isSecureContext = window.isSecureContext || 
      window.location.protocol === 'https:' || 
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    
    if (!isSecureContext) {
      return 'Voice input requires HTTPS or localhost';
    }
    
    return 'Click to start voice input (microphone permission required)';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={isListening ? 'destructive' : 'outline'}
            size="icon"
            onClick={toggleListening}
            disabled={disabled || !isBrowserSupported}
            className="relative"
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </>
            ) : (
              <Mic className={`h-4 w-4 ${!isBrowserSupported ? 'opacity-50' : ''}`} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-center">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
