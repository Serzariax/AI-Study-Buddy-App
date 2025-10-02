import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Moon, Sun, Type, Globe, Accessibility, Mic, CheckCircle, XCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../utils/translations';
import { toast } from 'sonner@2.0.3';

export function SettingsPanel() {
  const {
    darkMode,
    toggleDarkMode,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    language,
    setLanguage,
  } = useSettings();

  const t = useTranslation(language);
  const [micStatus, setMicStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const testMicrophone = async () => {
    setMicStatus('testing');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      setMicStatus('success');
      toast.success('Microphone working!', {
        description: 'Your microphone is connected and accessible.',
      });
      
      setTimeout(() => setMicStatus('idle'), 3000);
    } catch (error: any) {
      setMicStatus('error');
      
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied', {
          description: 'Please allow microphone access in your browser settings.',
          duration: 5000,
        });
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found', {
          description: 'Please connect a microphone to your device.',
        });
      } else {
        toast.error('Microphone test failed', {
          description: 'Please check your microphone settings.',
        });
      }
      
      setTimeout(() => setMicStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-blue-600" />
            {t('settings')}
          </CardTitle>
          <CardDescription>{t('appearance')} & {t('accessibility')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Dark Mode */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="h-5 w-5 text-purple-600" /> : <Sun className="h-5 w-5 text-yellow-600" />}
                <div>
                  <Label>{t('darkMode')}</Label>
                  <p className="text-xs text-gray-500">Toggle between light and dark themes</p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <Label>{t('fontSize')}: {fontSize}px</Label>
                <p className="text-xs text-gray-500">Adjust text size for better readability</p>
              </div>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => setFontSize(value)}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>12px (Small)</span>
              <span>16px (Default)</span>
              <span>24px (Large)</span>
            </div>
          </div>

          <Separator />

          {/* Font Style */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <Label>{t('fontStyle')}</Label>
                <p className="text-xs text-gray-500">Choose a font that works best for you</p>
              </div>
            </div>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Sans-serif)</SelectItem>
                <SelectItem value="dyslexic">OpenDyslexic (Dyslexia-friendly)</SelectItem>
                <SelectItem value="serif">Serif (Traditional)</SelectItem>
                <SelectItem value="mono">Monospace (Code-style)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Language */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <Label>{t('language')}</Label>
                <p className="text-xs text-gray-500">Select your preferred language</p>
              </div>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="es">🇪🇸 Español (Spanish)</SelectItem>
                <SelectItem value="fr">🇫🇷 Français (French)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Microphone Test */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <Label>Microphone Test</Label>
                <p className="text-xs text-gray-500">Check if your microphone is working</p>
              </div>
            </div>
            <Button
              onClick={testMicrophone}
              disabled={micStatus === 'testing'}
              variant={micStatus === 'success' ? 'default' : micStatus === 'error' ? 'destructive' : 'outline'}
              className="w-full"
            >
              {micStatus === 'testing' && (
                <>
                  <Mic className="mr-2 h-4 w-4 animate-pulse" />
                  Testing...
                </>
              )}
              {micStatus === 'success' && (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Microphone Working!
                </>
              )}
              {micStatus === 'error' && (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Microphone Error
                </>
              )}
              {micStatus === 'idle' && (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Test Microphone
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Having issues? Check the{' '}
              <a
                href="/MICROPHONE_TROUBLESHOOTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Microphone Troubleshooting Guide
              </a>
            </p>
          </div>

          {/* Preview Text */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <p className="leading-relaxed">
              The quick brown fox jumps over the lazy dog. This is how your text will appear with current settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
