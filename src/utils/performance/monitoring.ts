import React from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } from 'web-vitals';

export interface PerformanceMetrics {
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  ttfb: number; // Time to First Byte
  inp: number; // Interaction to Next Paint
  loadTime: number; // Page load time
  domContentLoaded: number; // DOM Content Loaded time
}

export interface PerformanceThresholds {
  cls: { good: number, needsImprovement: number };
  fid: { good: number, needsImprovement: number };
  fcp: { good: number, needsImprovement: number };
  lcp: { good: number, needsImprovement: number };
  ttfb: { good: number, needsImprovement: number };
  inp: { good: number, needsImprovement: number };
}

export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  cls: { good: 0.1, needsImprovement: 0.25 },
  fid: { good: 100, needsImprovement: 300 },
  fcp: { good: 1800, needsImprovement: 3000 },
  lcp: { good: 2500, needsImprovement: 4000 },
  ttfb: { good: 800, needsImprovement: 1800 },
  inp: { good: 200, needsImprovement: 500 },
};

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  private navigationStart: number = 0;

  constructor(onMetricsUpdate?: (metrics: PerformanceMetrics) => void) {
    this.onMetricsUpdate = onMetricsUpdate;
    this.navigationStart = performance.timing?.navigationStart || Date.now();
  }

  // Start monitoring
  start(): void {
    if (typeof window === 'undefined') return;

    // Monitor Web Vitals
    this.monitorWebVitals();
    
    // Monitor resource loading
    this.monitorResources();
    
    // Monitor long tasks
    this.monitorLongTasks();
    
    // Monitor memory usage
    this.monitorMemory();
  }

  // Stop monitoring and cleanup
  stop(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  private monitorWebVitals(): void {
    const handleMetric = (metric: any) => {
      (this.metrics as any)[metric.name.toLowerCase()] = metric.value;
      
      // Add custom metrics
      if (metric.name === 'LCP') {
        this.metrics.loadTime = metric.value;
      }
      
      this.notifyUpdate();
    };

    getCLS(handleMetric);
    getFID(handleMetric);
    getFCP(handleMetric);
    getLCP(handleMetric);
    getTTFB(handleMetric);
    getINP(handleMetric);
  }

  private monitorResources(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          this.metrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
          this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
        }
      });
      this.notifyUpdate();
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.push(observer);
  }

  private monitorLongTasks(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 50) {
          console.warn(`Long task detected: ${entry.duration}ms`, entry);
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
    this.observers.push(observer);
  }

  private monitorMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setInterval(() => {
        const memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        };
        
        // Alert if memory usage is high
        if (memoryUsage.used / memoryUsage.limit > 0.9) {
          console.warn('High memory usage detected:', memoryUsage);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private notifyUpdate(): void {
    if (this.onMetricsUpdate && this.isComplete()) {
      this.onMetricsUpdate(this.metrics as PerformanceMetrics);
    }
  }

  private isComplete(): boolean {
    const requiredMetrics = ['cls', 'fid', 'fcp', 'lcp', 'ttfb'];
    return requiredMetrics.every(metric => this.metrics[metric as keyof PerformanceMetrics] !== undefined);
  }

  // Get current metrics
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  // Calculate performance score
  calculateScore(): number {
    if (!this.isComplete()) return 0;

    const metrics = this.metrics as PerformanceMetrics;
    const thresholds = PERFORMANCE_THRESHOLDS;
    
    let totalScore = 0;
    let metricCount = 0;

    Object.entries(thresholds).forEach(([key, threshold]) => {
      const value = metrics[key as keyof PerformanceMetrics];
      if (value !== undefined) {
        let score = 0;
        if (value <= threshold.good) {
          score = 100;
        } else if (value <= threshold.needsImprovement) {
          score = 50 + 50 * (1 - (value - threshold.good) / (threshold.needsImprovement - threshold.good));
        } else {
          score = Math.max(0, 50 - (value - threshold.needsImprovement) / threshold.needsImprovement * 50);
        }
        totalScore += score;
        metricCount++;
      }
    });

    return metricCount > 0 ? Math.round(totalScore / metricCount) : 0;
  }

  // Get performance grade
  getGrade(): { letter: string; color: string; message: string } {
    const score = this.calculateScore();
    
    if (score >= 95) {
      return { letter: 'A+', color: 'green', message: 'Excellent performance!' };
    } else if (score >= 90) {
      return { letter: 'A', color: 'green', message: 'Great performance!' };
    } else if (score >= 80) {
      return { letter: 'B', color: 'yellow', message: 'Good performance with room for improvement.' };
    } else if (score >= 70) {
      return { letter: 'C', color: 'orange', message: 'Fair performance. Consider optimizations.' };
    } else if (score >= 60) {
      return { letter: 'D', color: 'red', message: 'Poor performance. Optimization needed.' };
    } else {
      return { letter: 'F', color: 'red', message: 'Very poor performance. Immediate optimization required.' };
    }
  }

  // Check if metrics meet requirements
  meetsRequirements(): boolean {
    const metrics = this.metrics as PerformanceMetrics;
    const thresholds = PERFORMANCE_THRESHOLDS;
    
    return Object.entries(thresholds).every(([key, threshold]) => {
      const value = metrics[key as keyof PerformanceMetrics];
      return value !== undefined && value <= threshold.good;
    });
  }

  // Get recommendations based on metrics
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.metrics as PerformanceMetrics;
    const thresholds = PERFORMANCE_THRESHOLDS;

    if (metrics.fcp && metrics.fcp > thresholds.fcp.good) {
      recommendations.push('Optimize server response time and enable compression');
    }

    if (metrics.lcp && metrics.lcp > thresholds.lcp.good) {
      recommendations.push('Optimize images and use modern formats (WebP/AVIF)');
    }

    if (metrics.fid && metrics.fid > thresholds.fid.good) {
      recommendations.push('Reduce JavaScript execution time and break up long tasks');
    }

    if (metrics.cls && metrics.cls > thresholds.cls.good) {
      recommendations.push('Ensure proper image dimensions and avoid dynamic content shifts');
    }

    if (metrics.ttfb && metrics.ttfb > thresholds.ttfb.good) {
      recommendations.push('Use CDN and optimize server response time');
    }

    if (metrics.inp && metrics.inp > thresholds.inp.good) {
      recommendations.push('Optimize interaction handlers and reduce main thread work');
    }

    return recommendations;
  }
}

// Hook for React components
export const usePerformanceMonitor = (onMetricsUpdate?: (metrics: PerformanceMetrics) => void) => {
  const [metrics, setMetrics] = React.useState<Partial<PerformanceMetrics>>({});
  const [score, setScore] = React.useState<number>(0);
  const [grade, setGrade] = React.useState<{ letter: string; color: string; message: string }>({ letter: 'N/A', color: 'gray', message: 'Loading...' });

  React.useEffect(() => {
    const monitor = new PerformanceMonitor((updatedMetrics) => {
      setMetrics(updatedMetrics);
      
      const monitorInstance = new PerformanceMonitor();
      (monitorInstance as any).metrics = { ...updatedMetrics };
      setScore(monitorInstance.calculateScore());
      setGrade(monitorInstance.getGrade());
    });

    monitor.start();

    return () => monitor.stop();
  }, [onMetricsUpdate]);

  return { metrics, score, grade };
};

// Utility function to measure component render time
export const measureRenderTime = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (end - start > 16) { // More than one frame
      console.warn(`Slow render detected for ${name}: ${end - start}ms`);
    }
    
    return result;
  }) as T;
};

// Utility to measure API response time
export const measureApiCall = async <T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await apiCall();
    const end = performance.now();
    
    if (end - start > 1000) {
      console.warn(`Slow API call to ${endpoint}: ${end - start}ms`);
    }
    
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`API call to ${endpoint} failed after ${end - start}ms:`, error);
    throw error;
  }
};

export default PerformanceMonitor;
