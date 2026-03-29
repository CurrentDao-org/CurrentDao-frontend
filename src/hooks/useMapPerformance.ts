import { useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Coordinates, 
  MapBounds, 
  EnergyListing, 
  MapViewport,
  HeatMapPoint
} from '../types/maps';
import { 
  performanceMonitor, 
  memoryManager, 
  debounce, 
  throttle, 
  virtualizeMarkers, 
  smartCluster, 
  generateOptimizedHeatMapData,
  calculateDistanceOptimized,
  batchProcess,
  metricsCollector
} from '../utils/mapPerformance';

interface UseMapPerformanceOptions {
  maxMarkers?: number;
  enableVirtualization?: boolean;
  enableClustering?: boolean;
  enableCaching?: boolean;
  batchSize?: number;
  performanceThreshold?: number; // ms
}

interface PerformanceMetrics {
  renderTime: number;
  markersProcessed: number;
  markersPerSecond: number;
  cacheHitRate: number;
  memoryUsage: number;
}

export const useMapPerformance = (
  listings: EnergyListing[],
  viewport: MapBounds | null,
  options: UseMapPerformanceOptions = {}
) => {
  const {
    maxMarkers = 1000,
    enableVirtualization = true,
    enableClustering = true,
    enableCaching = true,
    batchSize = 100,
    performanceThreshold = 16 // 60fps = 16.67ms per frame
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    markersProcessed: 0,
    markersPerSecond: 0,
    cacheHitRate: 0,
    memoryUsage: 0
  });

  const cacheHitsRef = useRef(0);
  const cacheMissesRef = useRef(0);

  // Optimized viewport change handler with debouncing
  const handleViewportChange = useCallback(
    debounce((newViewport: MapBounds) => {
      const startTime = performance.now();
      
      // Process viewport change
      if (enableVirtualization && newViewport) {
        const visibleListings = virtualizeMarkers(listings, newViewport);
        metricsRef.current.markersProcessed = visibleListings.length;
      }
      
      const endTime = performance.now();
      metricsRef.current.renderTime = endTime - startTime;
      
      // Record metrics
      metricsCollector.recordOperation('viewportChange', endTime - startTime);
    }, 100),
    [listings, enableVirtualization]
  );

  // Optimized marker processing with virtualization
  const processedMarkers = useMemo(() => {
    const startTime = performance.now();
    performanceMonitor.startRender();
    
    let result = listings;
    
    // Apply virtualization if enabled and viewport is available
    if (enableVirtualization && viewport) {
      result = virtualizeMarkers(result, viewport);
      cacheHitsRef.current++;
    }
    
    // Apply clustering if enabled
    if (enableClustering && viewport) {
      const zoom = 10; // Default zoom, should come from actual map zoom
      result = smartCluster(result, zoom);
    }
    
    // Apply performance optimization if too many markers
    if (result.length > maxMarkers) {
      const step = Math.ceil(result.length / maxMarkers);
      result = result.filter((_, index) => index % step === 0);
    }
    
    performanceMonitor.markersProcessed = result.length;
    const renderTime = performanceMonitor.endRender();
    
    metricsRef.current = {
      renderTime,
      markersProcessed: result.length,
      markersPerSecond: result.length / (renderTime / 1000),
      cacheHitRate: cacheHitsRef.current / (cacheHitsRef.current + cacheMissesRef.current),
      memoryUsage: memoryManager.cache.size
    };
    
    metricsCollector.recordOperation('markerProcessing', renderTime);
    
    return result;
  }, [listings, viewport, enableVirtualization, enableClustering, maxMarkers]);

  // Optimized heat map data generation with caching
  const heatMapData = useMemo(() => {
    if (!viewport) return [];
    
    const startTime = performance.now();
    
    let data: HeatMapPoint[];
    
    if (enableCaching) {
      const cacheKey = `heatmap-${viewport.north}-${viewport.south}-${viewport.east}-${viewport.west}`;
      const cached = memoryManager.get(cacheKey);
      
      if (cached) {
        data = cached;
        cacheHitsRef.current++;
      } else {
        data = generateOptimizedHeatMapData(listings, viewport);
        memoryManager.set(cacheKey, data);
        cacheMissesRef.current++;
      }
    } else {
      data = generateOptimizedHeatMapData(listings, viewport);
    }
    
    const endTime = performance.now();
    metricsCollector.recordOperation('heatMapGeneration', endTime - startTime);
    
    return data;
  }, [listings, viewport, enableCaching]);

  // Optimized distance calculations with batching
  const calculateDistances = useCallback((
    from: Coordinates,
    toPoints: Coordinates[],
    unit: 'km' | 'miles' = 'km'
  ) => {
    const startTime = performance.now();
    
    const results = batchProcess(
      toPoints,
      (batch) => batch.map(point => ({
        to: point,
        distance: calculateDistanceOptimized(from, point, unit)
      })),
      batchSize
    );
    
    const endTime = performance.now();
    metricsCollector.recordOperation('distanceCalculation', endTime - startTime);
    
    return results;
  }, [batchSize]);

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    return {
      ...metricsRef.current,
      detailedMetrics: metricsCollector.getReport()
    };
  }, []);

  // Memory cleanup
  const clearCache = useCallback(() => {
    memoryManager.clear();
    cacheHitsRef.current = 0;
    cacheMissesRef.current = 0;
  }, []);

  // Adaptive quality adjustment
  const shouldReduceQuality = useMemo(() => {
    return metricsRef.current.renderTime > performanceThreshold;
  }, [metricsRef.current.renderTime, performanceThreshold]);

  // Throttled performance update
  const updatePerformance = useCallback(
    throttle(() => {
      // Force re-evaluation of performance metrics
      if (shouldReduceQuality) {
        console.warn('Performance threshold exceeded, consider reducing marker count or disabling features');
      }
    }, 1000),
    [shouldReduceQuality]
  );

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      clearCache();
      metricsCollector.reset();
    };
  }, [clearCache]);

  // Update performance metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      updatePerformance();
    }, 5000);

    return () => clearInterval(interval);
  }, [updatePerformance]);

  return {
    processedMarkers,
    heatMapData,
    handleViewportChange,
    calculateDistances,
    getPerformanceMetrics,
    clearCache,
    shouldReduceQuality,
    metrics: metricsRef.current
  };
};
