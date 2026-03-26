import { useState, useEffect, useRef } from 'react';
import { MobileOptimizer } from '../mobile-optimizer';

interface PerformanceMetrics {
  batteryLevel: number;
  memoryUsage: number;
  networkRequests: number;
  appLaunchTime: number;
  frameRate: number;
  timestamp: number;
}

export const useMobilePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const optimizerRef = useRef<MobileOptimizer | null>(null);

  useEffect(() => {
    const initializeOptimizer = async () => {
      if (!optimizerRef.current) {
        optimizerRef.current = new MobileOptimizer();
        await optimizerRef.current.initialize();
        await optimizerRef.current.optimize();
        setIsMonitoring(true);
      }
    };

    initializeOptimizer();

    return () => {
      if (optimizerRef.current) {
        optimizerRef.current.cleanup();
      }
    };
  }, []);

  useEffect(() => {
    if (!isMonitoring || !optimizerRef.current) return;

    const updateMetrics = () => {
      const currentMetrics = optimizerRef.current?.getMetrics();
      if (currentMetrics && currentMetrics.length > 0) {
        setMetrics(currentMetrics[currentMetrics.length - 1]);
      }
    };

    const interval = setInterval(updateMetrics, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const startMonitoring = async () => {
    if (optimizerRef.current) {
      await optimizerRef.current.optimize();
      setIsMonitoring(true);
    }
  };

  const stopMonitoring = async () => {
    if (optimizerRef.current) {
      await optimizerRef.current.cleanup();
      setIsMonitoring(false);
    }
  };

  const getAllMetrics = () => {
    return optimizerRef.current?.getMetrics() || [];
  };

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getAllMetrics,
  };
};