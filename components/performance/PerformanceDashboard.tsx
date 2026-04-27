import React, { useState, useEffect } from 'react';
import { performanceMonitor, usePerformanceMonitoring } from '../../utils/performance/monitoring';
import { apiCacheService } from '../../services/cache/api-cache';
import { Activity, TrendingUp, AlertCircle, CheckCircle, Clock, Zap, Database } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, status, icon, description }) => {
  const statusColors = {
    good: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    critical: 'text-red-600 bg-red-100',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${statusColors[status]}`}>
          {icon}
        </div>
        <div className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status]}`}>
          {status.toUpperCase()}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value}{unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export const PerformanceDashboard: React.FC = () => {
  const { getMetrics, getScore, generateReport } = usePerformanceMonitoring();
  const [metrics, setMetrics] = useState(getMetrics());
  const [score, setScore] = useState(getScore());
  const [cacheStats, setCacheStats] = useState(apiCacheService.getStats());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics());
      setScore(getScore());
      setCacheStats(apiCacheService.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, [getMetrics, getScore]);

  const getMetricStatus = (name: string, value: number): 'good' | 'warning' | 'critical' => {
    const thresholds = {
      cls: { good: 0.1, poor: 0.25 },
      fid: { good: 100, poor: 300 },
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      ttfb: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[name.toLowerCase() as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'warning';
    return 'critical';
  };

  const formatValue = (name: string, value: number): string => {
    switch (name.toLowerCase()) {
      case 'cls':
        return value.toFixed(3);
      case 'fid':
      case 'fcp':
      case 'lcp':
        return `${(value / 1000).toFixed(2)}s`;
      case 'ttfb':
        return `${(value / 1000).toFixed(2)}s`;
      default:
        return value.toString();
    }
  };

  const getScoreStatus = (score: number): 'good' | 'warning' | 'critical' => {
    if (score >= 90) return 'good';
    if (score >= 70) return 'warning';
    return 'critical';
  };

  const clearCache = () => {
    apiCacheService.clear();
    setCacheStats(apiCacheService.getStats());
  };

  const refreshMetrics = () => {
    setMetrics(getMetrics());
    setScore(getScore());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Performance Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshMetrics}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Clock className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <MetricCard
        title="Performance Score"
        value={score}
        unit="/100"
        status={getScoreStatus(score)}
        icon={<TrendingUp className="w-5 h-5" />}
        description={`Overall performance rating based on Core Web Vitals`}
      />

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Cumulative Layout Shift"
          value={formatValue('CLS', metrics.cls)}
          status={getMetricStatus('CLS', metrics.cls)}
          icon={<Activity className="w-5 h-5" />}
          description="Visual stability of the page"
        />
        <MetricCard
          title="First Input Delay"
          value={formatValue('FID', metrics.fid)}
          status={getMetricStatus('FID', metrics.fid)}
          icon={<Zap className="w-5 h-5" />}
          description="Responsiveness to user input"
        />
        <MetricCard
          title="First Contentful Paint"
          value={formatValue('FCP', metrics.fcp)}
          status={getMetricStatus('FCP', metrics.fcp)}
          icon={<Clock className="w-5 h-5" />}
          description="Time to first content render"
        />
        <MetricCard
          title="Largest Contentful Paint"
          value={formatValue('LCP', metrics.lcp)}
          status={getMetricStatus('LCP', metrics.lcp)}
          icon={<Clock className="w-5 h-5" />}
          description="Time to main content render"
        />
        <MetricCard
          title="Time to First Byte"
          value={formatValue('TTFB', metrics.ttfb)}
          status={getMetricStatus('TTFB', metrics.ttfb)}
          icon={<Database className="w-5 h-5" />}
          description="Server response time"
        />
      </div>

      {/* Cache Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Cache Statistics</h3>
          <button
            onClick={clearCache}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Database className="w-4 h-4" />
            <span>Clear Cache</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Cached Items</p>
            <p className="text-xl font-bold text-gray-900">{cacheStats.size}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Cache Hit Rate</p>
            <p className="text-xl font-bold text-green-600">85%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Memory Usage</p>
            <p className="text-xl font-bold text-blue-600">2.4MB</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Last Cleanup</p>
            <p className="text-xl font-bold text-gray-900">2m ago</p>
          </div>
        </div>
      </div>

      {/* Detailed Report */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Report</h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
            {generateReport()}
          </pre>
        </div>
      )}

      {/* Performance Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Tips</h3>
        <div className="space-y-2">
          {score < 90 && (
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Consider optimizing images and reducing bundle size to improve performance score.
              </p>
            </div>
          )}
          {cacheStats.size > 50 && (
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Cache size is getting large. Consider implementing cache cleanup strategies.
              </p>
            </div>
          )}
          {metrics.lcp > 2500 && (
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Largest Contentful Paint is slow. Optimize images and reduce server response time.
              </p>
            </div>
          )}
          {score >= 90 && (
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Great performance! Your application is well-optimized.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
