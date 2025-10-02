import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Activity, TrendingUp, Database, Clock, AlertCircle } from 'lucide-react';
import { AIService } from '../services/ai-service';
import { PerformanceMonitor } from './PerformanceMonitor';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../utils/translations';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function ModeratorAnalytics() {
  const { language } = useSettings();
  const t = useTranslation(language);
  
  const [timeRange, setTimeRange] = useState('7d');
  const [studentData, setStudentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    // Simulate loading student data - in real app, fetch from backend
    // For demo, generate mock data based on localStorage
    const mockData = generateMockStudentData();
    setStudentData(mockData);
    
    setLoading(false);
  };

  const generateMockStudentData = () => {
    const students = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Eve Davis'];
    return students.map((name, i) => {
      const key = `progress_student_${i}`;
      const saved = localStorage.getItem(key);
      const progress = saved ? JSON.parse(saved) : {
        sessionsCompleted: Math.floor(Math.random() * 25),
        totalStudyTime: Math.floor(Math.random() * 300),
        flashcardsGenerated: Math.floor(Math.random() * 80),
        imagesAnalyzed: Math.floor(Math.random() * 40),
        questionsAsked: Math.floor(Math.random() * 150),
      };

      return {
        name,
        id: `student_${i}`,
        ...progress,
        avgScore: Math.floor(Math.random() * 30) + 70,
        lastActive: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      };
    });
  };

  const activityData = [
    { day: 'Mon', sessions: 12, questions: 45, flashcards: 28 },
    { day: 'Tue', sessions: 15, questions: 58, flashcards: 32 },
    { day: 'Wed', sessions: 18, questions: 62, flashcards: 41 },
    { day: 'Thu', sessions: 14, questions: 51, flashcards: 35 },
    { day: 'Fri', sessions: 20, questions: 71, flashcards: 48 },
    { day: 'Sat', sessions: 10, questions: 38, flashcards: 22 },
    { day: 'Sun', sessions: 8, questions: 29, flashcards: 18 },
  ];

  const featureUsage = [
    { name: 'Chat Tutor', value: 45, color: '#3b82f6' },
    { name: 'Flashcards', value: 30, color: '#8b5cf6' },
    { name: 'Image Analysis', value: 15, color: '#ec4899' },
    { name: 'Progress', value: 10, color: '#f59e0b' },
  ];

  const totalStudents = studentData.length;
  const totalSessions = studentData.reduce((sum, s) => sum + s.sessionsCompleted, 0);
  const avgStudyTime = Math.round(studentData.reduce((sum, s) => sum + s.totalStudyTime, 0) / totalStudents);
  const activeThisWeek = studentData.filter(s => Date.now() - s.lastActive < 7 * 24 * 60 * 60 * 1000).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{t('analytics')} Dashboard</h2>
          <p className="text-gray-500">Monitor student performance and system usage</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
              </div>
              <Users className="h-12 w-12 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="text-3xl font-bold text-purple-600">{totalSessions}</p>
              </div>
              <Activity className="h-12 w-12 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Study Time</p>
                <p className="text-3xl font-bold text-green-600">{avgStudyTime}m</p>
              </div>
              <Clock className="h-12 w-12 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active This Week</p>
                <p className="text-3xl font-bold text-orange-600">{activeThisWeek}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="performance">System</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Weekly Activity Trends</CardTitle>
              <CardDescription>Student engagement over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} name="Sessions" />
                  <Line type="monotone" dataKey="questions" stroke="#8b5cf6" strokeWidth={2} name="Questions" />
                  <Line type="monotone" dataKey="flashcards" stroke="#ec4899" strokeWidth={2} name="Flashcards" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
              <CardDescription>Individual student metrics and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentData.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-500">
                            Last active: {new Date(student.lastActive).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-sm text-gray-500">Sessions</div>
                        <div className="font-bold text-blue-600">{student.sessionsCompleted}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Time</div>
                        <div className="font-bold text-green-600">{student.totalStudyTime}m</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Cards</div>
                        <div className="font-bold text-purple-600">{student.flashcardsGenerated}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Score</div>
                        <Badge variant={student.avgScore >= 80 ? 'default' : 'secondary'}>
                          {student.avgScore}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Feature Usage Distribution</CardTitle>
              <CardDescription>How students are using different features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={featureUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {featureUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col justify-center space-y-3">
                  {featureUsage.map((feature) => (
                    <div key={feature.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: feature.color }} />
                        <span>{feature.name}</span>
                      </div>
                      <Badge>{feature.value}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
