import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { TrendingUp, Target, BookOpen, CheckCircle, Clock, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../utils/translations';

export function StudentProgress() {
  const { user } = useAuth();
  const { language } = useSettings();
  const t = useTranslation(language);
  
  const [stats, setStats] = useState({
    sessionsCompleted: 0,
    totalStudyTime: 0,
    flashcardsGenerated: 0,
    imagesAnalyzed: 0,
    questionsAsked: 0,
  });

  useEffect(() => {
    // Load user progress from localStorage
    const saved = localStorage.getItem(`progress_${user?.id}`);
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, [user?.id]);

  const calculateProgress = () => {
    const goals = {
      sessions: 20,
      studyTime: 600, // 10 hours in minutes
      flashcards: 100,
      images: 50,
      questions: 200,
    };

    return {
      sessions: Math.min(100, (stats.sessionsCompleted / goals.sessions) * 100),
      studyTime: Math.min(100, (stats.totalStudyTime / goals.studyTime) * 100),
      flashcards: Math.min(100, (stats.flashcardsGenerated / goals.flashcards) * 100),
      images: Math.min(100, (stats.imagesAnalyzed / goals.images) * 100),
      questions: Math.min(100, (stats.questionsAsked / goals.questions) * 100),
    };
  };

  const progress = calculateProgress();
  const overallProgress = Object.values(progress).reduce((a, b) => a + b, 0) / Object.values(progress).length;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="shadow-lg border-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-600" />
                {t('progressTracking')}
              </CardTitle>
              <CardDescription>Your learning journey so far</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{Math.round(overallProgress)}%</div>
              <div className="text-xs text-gray-500">Overall Progress</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Study Sessions</span>
              </div>
              <Badge variant="secondary">{stats.sessionsCompleted} / 20</Badge>
            </div>
            <Progress value={progress.sessions} className="h-2" />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="font-medium">Study Time</span>
              </div>
              <Badge variant="secondary">{stats.totalStudyTime} min</Badge>
            </div>
            <Progress value={progress.studyTime} className="h-2" />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Flashcards Created</span>
              </div>
              <Badge variant="secondary">{stats.flashcardsGenerated} / 100</Badge>
            </div>
            <Progress value={progress.flashcards} className="h-2" />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Questions Asked</span>
              </div>
              <Badge variant="secondary">{stats.questionsAsked} / 200</Badge>
            </div>
            <Progress value={progress.questions} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.sessionsCompleted >= 5 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-medium">Dedicated Learner</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed 5+ study sessions</div>
                </div>
              </div>
            )}
            {stats.flashcardsGenerated >= 20 && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-medium">Card Master</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Created 20+ flashcards</div>
                </div>
              </div>
            )}
            {stats.questionsAsked >= 50 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="font-medium">Curious Mind</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Asked 50+ questions</div>
                </div>
              </div>
            )}
            {stats.sessionsCompleted === 0 && stats.flashcardsGenerated === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Start learning to unlock achievements!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper to update progress
export function updateStudentProgress(type: 'session' | 'flashcard' | 'image' | 'question', userId?: string) {
  if (!userId) return;
  
  const key = `progress_${userId}`;
  const saved = localStorage.getItem(key);
  const stats = saved ? JSON.parse(saved) : {
    sessionsCompleted: 0,
    totalStudyTime: 0,
    flashcardsGenerated: 0,
    imagesAnalyzed: 0,
    questionsAsked: 0,
  };

  switch (type) {
    case 'session':
      stats.sessionsCompleted++;
      stats.totalStudyTime += Math.floor(Math.random() * 20) + 10; // 10-30 min
      break;
    case 'flashcard':
      stats.flashcardsGenerated++;
      break;
    case 'image':
      stats.imagesAnalyzed++;
      break;
    case 'question':
      stats.questionsAsked++;
      break;
  }

  localStorage.setItem(key, JSON.stringify(stats));
}
