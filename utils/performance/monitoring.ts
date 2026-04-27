import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface PerformanceMetrics {
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  ttfb: number; // Time to First Byte
}

interface PerformanceEntry {
  name: string;
  value: number;
  timestamp: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface PerformanceThresholds {
  cls: { good: number; poor: number };
  fid: { good: number; poor: number };
  fcp: { good: number; poor: number };
  lcp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

const thresholds: PerformanceThresholds = {
  cls: { good: 0.1, poor: 0.25 },
  fid: { good: 100, poor: 300 },
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  ttfb: { good: 800, poor: 1800 },
};

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    cls: 0,
    fid: 0,
    fcp: 0,
    lcp: 0,
    ttfb: 0,
  };

  private entries: PerformanceEntry[] = [];
  private observers: PerformanceObserver[] = [];
  private onMetricCallback?: (entry: PerformanceEntry) => void;

  constructor() {
    this.initWebVitals();
    this.initCustomMetrics();
  }

  private initWebVitals(): void {
    // Core Web Vitals
    getCLS((metric) => this.handleMetric('CLS', metric));
    getFID((metric) => this.handleMetric('FID', metric));
    getFCP((metric) => this.handleMetric('FCP', metric));
    getLCP((metric) => this.handleMetric('LCP', metric));
    getTTFB((metric) => this.handleMetric('TTFB', metric));
  }

  private initCustomMetrics(): void {
    // Navigation timing
    if ('navigation' in performance) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.recordCustomMetric('domInteractive', navEntry.domInteractive - navEntry.fetchStart);
      this.recordCustomMetric('domComplete', navEntry.domComplete - navEntry.fetchStart);
      this.recordCustomMetric('loadComplete', navEntry.loadEventEnd - navEntry.fetchStart);
    }

    // Resource timing
    this.observeResourceTiming();
    
    // Long tasks
    this.observeLongTasks();
  }

  private observeResourceTiming(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            this.recordCustomMetric(`resource-${resource.name}`, resource.duration);
          }
        });
      });
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Resource timing not supported:', error);
    }
  }

  private observeLongTasks(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            this.recordCustomMetric('longTask', entry.duration);
          }
        });
      });
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Long tasks not supported:', error);
    }
  }

  private handleMetric(name: string, metric: any): void {
    const value = metric.value;
    const timestamp = Date.now();
    
    // Update internal metrics
    const key = name.toLowerCase() as keyof PerformanceMetrics;
    if (key in this.metrics) {
      this.metrics[key] = value;
    }

    // Determine rating
    const rating = this.getRating(name, value);
    
    const entry: PerformanceEntry = {
      name,
      value,
      timestamp,
      rating,
    };

    this.entries.push(entry);
    
    // Call callback if provided
    if (this.onMetricCallback) {
      this.onMetricCallback(entry);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value} (${rating})`);
    }
  }

  private recordCustomMetric(name: string, value: number): void {
    const entry: PerformanceEntry = {
      name,
      value,
      timestamp: Date.now(),
      rating: 'good', // Custom metrics don't have standard ratings
    };

    this.entries.push(entry);
    
    if (this.onMetricCallback) {
      this.onMetricCallback(entry);
    }
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const key = name.toLowerCase() as keyof PerformanceThresholds;
    if (!(key in thresholds)) return 'good';

    const threshold = thresholds[key];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // Public API
  onMetric(callback: (entry: PerformanceEntry) => void): void {
    this.onMetricCallback = callback;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  getCoreWebVitals(): PerformanceEntry[] {
    return this.entries.filter(entry => 
      ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'].includes(entry.name)
    );
  }

  getPerformanceScore(): number {
    const coreVitals = this.getCoreWebVitals();
    if (coreVitals.length === 0) return 0;

    const goodCount = coreVitals.filter(entry => entry.rating === 'good').length;
    return Math.round((goodCount / coreVitals.length) * 100);
  }

  generateReport(): string {
    const coreVitals = this.getCoreWebVitals();
    const score = this.getPerformanceScore();
    
    let report = `Performance Report (Score: ${score})\n`;
    report += '='.repeat(40) + '\n\n';
    
    coreVitals.forEach(entry => {
      const status = entry.rating === 'good' ? '✅' : 
                    entry.rating === 'needs-improvement' ? '⚠️' : '❌';
      report += `${status} ${entry.name}: ${entry.value.toFixed(2)} (${entry.rating})\n`;
    });

    return report;
  }

  // Send metrics to analytics service
  sendToAnalytics(endpoint?: string): void {
    const data = {
      metrics: this.getMetrics(),
      entries: this.getEntries(),
      score: this.getPerformanceScore(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };

    // Send to specified endpoint or default
    const url = endpoint || '/api/analytics/performance';
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, JSON.stringify(data));
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {
        // Silent fail for analytics
      });
    }
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.onMetricCallback = undefined;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const measureRenderTime = (componentName: string): void => {
  const startTime = performance.now();
  
  requestAnimationFrame(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    performanceMonitor['recordCustomMetric'](`render-${componentName}`, renderTime);
  });
};

export const measureFunction = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    performanceMonitor['recordCustomMetric'](`function-${name}`, end - start);
    return result;
  }) as T;
};

export const startMeasurement = (name: string): () => void => {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    performanceMonitor['recordCustomMetric'](name, end - start);
  };
};

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  React.useEffect(() => {
    // Set up automatic reporting
    const handleMetric = (entry: PerformanceEntry) => {
      // Send critical metrics to analytics
      if (['CLS', 'LCP', 'FID'].includes(entry.name) && entry.rating !== 'good') {
        performanceMonitor.sendToAnalytics();
      }
    };

    performanceMonitor.onMetric(handleMetric);

    // Send report on page unload
    const handleUnload = () => {
      performanceMonitor.sendToAnalytics();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      performanceMonitor.destroy();
    };
  }, []);

  return {
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getScore: performanceMonitor.getPerformanceScore.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
  };
};
