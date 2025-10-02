import React, { useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { Brain, MessageSquare, CreditCard, Image, Home, Settings, LogOut, TrendingUp, BarChart3, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { useTranslation } from './utils/translations';

// Lazy load heavy components to prevent timeout
const StudyDashboard = lazy(() => import('./components/StudyDashboard').then(m => ({ default: m.StudyDashboard })));
const ChatInterface = lazy(() => import('./components/ChatInterface').then(m => ({ default: m.ChatInterface })));
const FlashcardGenerator = lazy(() => import('./components/FlashcardGenerator').then(m => ({ default: m.FlashcardGenerator })));
const ImageAnalyzer = lazy(() => import('./components/ImageAnalyzer').then(m => ({ default: m.ImageAnalyzer })));
const OnboardingTutorial = lazy(() => import('./components/OnboardingTutorial').then(m => ({ default: m.OnboardingTutorial })));
const SettingsPanel = lazy(() => import('./components/SettingsPanel').then(m => ({ default: m.SettingsPanel })));
const StudentProgress = lazy(() => import('./components/StudentProgress').then(m => ({ default: m.StudentProgress })));
const ModeratorAnalytics = lazy(() => import('./components/ModeratorAnalytics').then(m => ({ default: m.ModeratorAnalytics })));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function MainApp() {
  const { user, logout, isLoading } = useAuth();
  const { language, darkMode } = useSettings();
  const t = useTranslation(language);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [totalTokens, setTotalTokens] = useState(0);
  const [sessionStart] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleUsageUpdate = (tokens: number) => {
    setTotalTokens(prev => prev + tokens);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  const handleTutorialComplete = () => {
    toast.success(`${t('welcomeMessage')}! 🎓`, {
      description: t('poweredBy'),
      duration: 5000,
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screens if not logged in
  if (!user) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
      }>
        {authMode === 'login' ? (
          <LoginPage onSwitchToSignup={() => setAuthMode('signup')} />
        ) : (
          <SignupPage onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </Suspense>
    );
  }

  // Determine tabs based on user role
  const isStudent = user.role === 'student';
  const isModerator = user.role === 'moderator';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {isStudent && (
        <Suspense fallback={null}>
          <OnboardingTutorial onComplete={handleTutorialComplete} />
        </Suspense>
      )}
      
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg border-2 transition-colors">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Study Buddy
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                <div className="flex items-center gap-2 justify-end">
                  <Badge variant={isStudent ? 'default' : 'secondary'}>
                    {isStudent ? (
                      <><GraduationCap className="h-3 w-3 mr-1" /> {t('student')}</>
                    ) : (
                      <><BarChart3 className="h-3 w-3 mr-1" /> {t('moderator')}</>
                    )}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">{t('welcomeMessage')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sticky top-4 z-10 border-2 transition-colors">
            <TabsList className={`grid w-full gap-2 ${isStudent ? 'grid-cols-6' : 'grid-cols-5'}`}>
              <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">{t('home')}</span>
              </TabsTrigger>
              
              {isStudent && (
                <>
                  <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('chat')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="flashcards" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('flashcards')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                    <Image className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('image')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('progress')}</span>
                  </TabsTrigger>
                </>
              )}

              {isModerator && (
                <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('analytics')}</span>
                </TabsTrigger>
              )}
              
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{t('settings')}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="dashboard" className="m-0">
            <Suspense fallback={<LoadingFallback />}>
              <StudyDashboard
                totalTokens={totalTokens}
                sessionStart={sessionStart}
              />
            </Suspense>
          </TabsContent>

          {isStudent && (
            <>
              <TabsContent value="chat" className="m-0 min-h-[600px]">
                <Suspense fallback={<LoadingFallback />}>
                  <ChatInterface onUsageUpdate={handleUsageUpdate} />
                </Suspense>
              </TabsContent>

              <TabsContent value="flashcards" className="m-0 min-h-[600px]">
                <Suspense fallback={<LoadingFallback />}>
                  <FlashcardGenerator onUsageUpdate={handleUsageUpdate} />
                </Suspense>
              </TabsContent>

              <TabsContent value="image" className="m-0 min-h-[600px]">
                <Suspense fallback={<LoadingFallback />}>
                  <ImageAnalyzer onUsageUpdate={handleUsageUpdate} />
                </Suspense>
              </TabsContent>

              <TabsContent value="progress" className="m-0 min-h-[600px]">
                <Suspense fallback={<LoadingFallback />}>
                  <StudentProgress />
                </Suspense>
              </TabsContent>
            </>
          )}

          {isModerator && (
            <TabsContent value="analytics" className="m-0 min-h-[600px]">
              <Suspense fallback={<LoadingFallback />}>
                <ModeratorAnalytics />
              </Suspense>
            </TabsContent>
          )}

          <TabsContent value="settings" className="m-0 min-h-[600px]">
            <Suspense fallback={<LoadingFallback />}>
              <SettingsPanel />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border-2 transition-colors">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-700 dark:text-gray-300">AI Study Buddy - Learning Made Easy</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Powered by Groq AI (Free & Fast) • Built with React & Supabase
          </p>
        </footer>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SettingsProvider>
  );
}
