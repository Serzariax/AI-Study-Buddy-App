import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Brain, Loader2, AlertCircle, GraduationCap, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../utils/translations';

interface LoginPageProps {
  onSwitchToSignup: () => void;
}

export function LoginPage({ onSwitchToSignup }: LoginPageProps) {
  const { login } = useAuth();
  const { language } = useSettings();
  const t = useTranslation(language);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">{t('welcomeBack')}</CardTitle>
          <CardDescription>AI Study Buddy - {t('login')}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('loading')}
                </>
              ) : (
                t('login')
              )}
            </Button>

            {/* Demo accounts info */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Quick Demo Access:</p>
              <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-3 w-3" />
                  <span><strong>{t('student')}:</strong> student@demo.com / demo123</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <span><strong>{t('moderator')}:</strong> mod@demo.com / demo123</span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-600 dark:text-gray-400">
              {t('dontHaveAccount')}{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {t('signup')}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
