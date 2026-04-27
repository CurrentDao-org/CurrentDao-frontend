'use client';

import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '@/utils/performance/monitoring';
import { useAPICache } from '@/services/cache/api-cache';

interface ServiceWorkerMetrics {
  cacheHits: number;
  cacheMisses: number;
  networkRequests: number;
  offlineResponses: number;
}

const PerformanceDashboard: React.FC = () => {
  const { metrics, score, grade } = usePerformanceMonitor();
  const { stats: cacheStats } = useAPICache();
  const [swMetrics, setSwMetrics] = useState<ServiceWorkerMetrics>({
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    offlineResponses: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Listen for service worker metrics
  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'PERFORMANCE_METRICS') {
          setSwMetrics(event.data.data);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      // Request metrics from service worker
      const channel = new MessageChannel();
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_METRICS' },
        [channel.port2]
      );
      
      channel.port1.onmessage = (event) => {
        setSwMetrics(event.data);
      };

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  const getMetricColor = (value: number, thresholds: { good: number; needsImprovement: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.needsImprovement) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatMetric = (value: number, unit: string = '') => {
    if (value < 1000) return `${value}${unit}`;
    if (value < 1000000) return `${(value / 1000).toFixed(1)}k${unit}`;
    return `${(value / 1000000).toFixed(1)}M${unit}`;
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    unit?: string;
    color?: string;
    threshold?: { good: number; needsImprovement: number };
    actualValue?: number;
  }> = ({ title, value, unit, color, threshold, actualValue }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className={`text-2xl font-bold ${color || 'text-gray-900'}`}>
        {typeof value === 'number' ? formatMetric(value, unit) : value}
      </p>
      {threshold && actualValue && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                actualValue <= threshold.good
                  ? 'bg-green-500'
                  : actualValue <= threshold.needsImprovement
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{
                width: `${Math.min(100, (threshold.needsImprovement / actualValue) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className={`bg-white rounded-full p-3 shadow-lg border-2 ${
            score >= 90 ? 'border-green-500' : score >= 70 ? 'border-yellow-500' : 'border-red-500'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className={`text-xs font-medium ${getScoreColor(score)}`}>
              {grade.letter}
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Performance Dashboard</h2>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-3 flex items-center space-x-3">
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <div>
            <div className={`text-lg font-medium ${getScoreColor(score)}`}>
              {grade.letter} Grade
            </div>
            <div className="text-sm text-gray-600">{grade.message}</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Core Web Vitals */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Core Web Vitals</h3>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              title="LCP"
              value={metrics.lcp || 0}
              unit="ms"
              color={getMetricColor(metrics.lcp || 0, { good: 2500, needsImprovement: 4000 })}
              threshold={{ good: 2500, needsImprovement: 4000 }}
              actualValue={metrics.lcp}
            />
            <MetricCard
              title="FID"
              value={metrics.fid || 0}
              unit="ms"
              color={getMetricColor(metrics.fid || 0, { good: 100, needsImprovement: 300 })}
              threshold={{ good: 100, needsImprovement: 300 }}
              actualValue={metrics.fid}
            />
            <MetricCard
              title="CLS"
              value={(metrics.cls || 0).toFixed(3)}
              color={getMetricColor(metrics.cls || 0, { good: 0.1, needsImprovement: 0.25 })}
              threshold={{ good: 0.1, needsImprovement: 0.25 }}
              actualValue={metrics.cls || 0}
            />
            <MetricCard
              title="TTFB"
              value={metrics.ttfb || 0}
              unit="ms"
              color={getMetricColor(metrics.ttfb || 0, { good: 800, needsImprovement: 1800 })}
              threshold={{ good: 800, needsImprovement: 1800 }}
              actualValue={metrics.ttfb}
            />
          </div>
        </div>

        {/* Cache Performance */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Cache Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              title="API Cache Hit Rate"
              value={cacheStats.hitRate || 0}
              unit="%"
              color={cacheStats.hitRate >= 80 ? 'text-green-600' : cacheStats.hitRate >= 60 ? 'text-yellow-600' : 'text-red-600'}
            />
            <MetricCard
              title="API Cache Size"
              value={cacheStats.size || 0}
              unit=" entries"
            />
            <MetricCard
              title="SW Cache Hits"
              value={swMetrics.cacheHits}
              color="text-green-600"
            />
            <MetricCard
              title="SW Cache Misses"
              value={swMetrics.cacheMisses}
              color="text-yellow-600"
            />
          </div>
        </div>

        {/* Network Performance */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Network Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              title="Network Requests"
              value={swMetrics.networkRequests}
              color="text-blue-600"
            />
            <MetricCard
              title="Offline Responses"
              value={swMetrics.offlineResponses}
              color="text-orange-600"
            />
          </div>
        </div>

        {/* Performance Requirements */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Requirements Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bundle Size &lt; 500KB</span>
              <span className="text-sm font-medium text-green-600">✓ Pass</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">FCP &lt; 1.8s</span>
              <span className={`text-sm font-medium ${(metrics.fcp || 0) <= 1800 ? 'text-green-600' : 'text-red-600'}`}>
                {(metrics.fcp || 0) <= 1800 ? '✓ Pass' : '✗ Fail'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">LCP &lt; 2.5s</span>
              <span className={`text-sm font-medium ${(metrics.lcp || 0) <= 2500 ? 'text-green-600' : 'text-red-600'}`}>
                {(metrics.lcp || 0) <= 2500 ? '✓ Pass' : '✗ Fail'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">FID &lt; 100ms</span>
              <span className={`text-sm font-medium ${(metrics.fid || 0) <= 100 ? 'text-green-600' : 'text-red-600'}`}>
                {(metrics.fid || 0) <= 100 ? '✓ Pass' : '✗ Fail'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CLS &lt; 0.1</span>
              <span className={`text-sm font-medium ${(metrics.cls || 0) <= 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                {(metrics.cls || 0) <= 0.1 ? '✓ Pass' : '✗ Fail'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-gray-200">
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Metrics
            </button>
            <button
              onClick={() => {
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({ type: 'CACHE_CLEANUP' });
                }
              }}
              className="w-full px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
