import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { AIService, MetricsResponse } from '../services/ai-service';

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AIService.getMetrics();

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setMetrics(result.data);
      }
    } catch (err) {
      setError('Failed to fetch metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getSuccessRateColor = (rate: string) => {
    const numRate = parseFloat(rate);
    if (numRate >= 95) return 'text-green-600';
    if (numRate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateBadge = (rate: string) => {
    const numRate = parseFloat(rate);
    if (numRate >= 95) return 'default';
    if (numRate >= 80) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Performance Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMetrics}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {!metrics && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No metrics available yet</p>
            <p className="text-sm mt-2">Start using the AI features to see performance data</p>
          </div>
        )}

        {metrics && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(metrics.summary).map(([apiName, data]) => (
                <div
                  key={apiName}
                  className="border rounded-lg p-4 bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{apiName}</h3>
                    <Badge variant={getSuccessRateBadge(data.successRate)}>
                      {data.successRate}%
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Calls:</span>
                      <span>{data.totalCalls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Successful:</span>
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {data.successfulCalls}
                      </span>
                    </div>
                    {data.failedCalls > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Failed:</span>
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {data.failedCalls}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Avg Response:</span>
                        <span>{data.avgResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Min: {data.minResponseTime}ms</span>
                        <span>Max: {data.maxResponseTime}ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            {metrics.recentMetrics && metrics.recentMetrics.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Recent API Calls
                </h3>
                <div className="space-y-2">
                  {metrics.recentMetrics.slice(0, 10).map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {metric.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{metric.apiName}</div>
                          <div className="text-xs text-gray-500">
                            {metric.endpoint}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={metric.success ? 'text-gray-700' : 'text-red-600'}>
                          {metric.responseTime}ms
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System Health Indicator */}
            <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="font-medium mb-3">System Health</h3>
              <div className="space-y-3">
                {Object.entries(metrics.summary).map(([apiName, data]) => (
                  <div key={apiName}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{apiName}</span>
                      <span className={getSuccessRateColor(data.successRate)}>
                        {data.successRate}%
                      </span>
                    </div>
                    <Progress value={parseFloat(data.successRate)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}