import { 
  Coordinates, 
  DistanceCalculation, 
  MapBounds, 
  EnergyListing,
  HeatMapPoint
} from '../types/maps';

// Performance monitoring utilities
export const performanceMonitor = {
  markersProcessed: 0,
  renderTime: 0,
  
  startRender() {
    this.renderTime = performance.now();
  },
  
  endRender() {
    this.renderTime = performance.now() - this.renderTime;
    return this.renderTime;
  },
  
  getMetrics() {
    return {
      markersProcessed: this.markersProcessed,
      renderTime: this.renderTime,
      markersPerSecond: this.markersProcessed / (this.renderTime / 1000)
    };
  },
  
  reset() {
    this.markersProcessed = 0;
    this.renderTime = 0;
  }
};

// Memory management for large datasets
export const memoryManager = {
  cache: new Map<string, any>(),
  maxCacheSize: 100,
  
  get(key: string) {
    return this.cache.get(key);
  },
  
  set(key: string, value: any) {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  },
  
  clear() {
    this.cache.clear();
  }
};

// Enhanced debouncing with leading edge
export const debounce = <T extends (...args: any[]) => any>(
  func: T, 
  wait: number,
  leading: boolean = false
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  let lastCallTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (leading && now - lastCallTime >= wait) {
      lastCallTime = now;
      func(...args);
      return;
    }
    
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      lastCallTime = Date.now();
      func(...args);
    }, wait);
  };
};

// Enhanced throttling with trailing edge
export const throttle = <T extends (...args: any[]) => any>(
  func: T, 
  limit: number,
  trailing: boolean = true
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  let lastArgs: Parameters<T> | null = null;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (trailing && lastArgs) {
          func(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else if (trailing) {
      lastArgs = args;
    }
  };
};

// Virtualization for large datasets
export const virtualizeMarkers = (
  markers: any[], 
  viewport: MapBounds,
  bufferSize: number = 0.1
): any[] => {
  // Expand viewport by buffer size
  const bufferedBounds = {
    north: viewport.north + bufferSize,
    south: viewport.south - bufferSize,
    east: viewport.east + bufferSize,
    west: viewport.west - bufferSize
  };
  
  return markers.filter(marker => {
    const pos = marker.position || marker.coordinates;
    return pos && 
           pos.lat <= bufferedBounds.north &&
           pos.lat >= bufferedBounds.south &&
           pos.lng <= bufferedBounds.east &&
           pos.lng >= bufferedBounds.west;
  });
};

// Smart clustering algorithm
export const smartCluster = (
  markers: any[], 
  zoom: number, 
  maxClusters: number = 100
): any[] => {
  if (zoom > 12 || markers.length <= maxClusters) return markers;
  
  const clusters: any[] = [];
  const processed = new Set<number>();
  
  // Calculate optimal cluster distance based on zoom
  const clusterDistance = Math.max(0.5, 5 / Math.pow(2, zoom - 5));
  
  markers.forEach((marker, index) => {
    if (processed.has(index)) return;
    
    const cluster = {
      id: `cluster-${clusters.length}`,
      center: marker.position || marker.coordinates,
      markers: [marker],
      count: 1,
      bounds: createBounds(marker.position || marker.coordinates, clusterDistance)
    };
    
    // Find nearby markers
    markers.forEach((otherMarker, otherIndex) => {
      if (index === otherIndex || processed.has(otherIndex)) return;
      
      const otherPos = otherMarker.position || otherMarker.coordinates;
      if (isWithinRadius(otherPos, cluster.center, clusterDistance)) {
        cluster.markers.push(otherMarker);
        cluster.count++;
        processed.add(otherIndex);
      }
    });
    
    processed.add(index);
    clusters.push(cluster);
  });
  
  return clusters;
};

// Enhanced heat map generation with performance optimizations
const heatMapCache = new Map<string, HeatMapPoint[]>();

export const generateOptimizedHeatMapData = (
  listings: EnergyListing[], 
  viewport: MapBounds
): HeatMapPoint[] => {
  const cacheKey = `${viewport.north.toFixed(3)}-${viewport.south.toFixed(3)}-${viewport.east.toFixed(3)}-${viewport.west.toFixed(3)}-${listings.length}`;
  
  // Check cache first
  if (heatMapCache.has(cacheKey)) {
    return heatMapCache.get(cacheKey)!;
  }
  
  const points: HeatMapPoint[] = [];
  const gridSize = Math.max(0.05, 0.5 / Math.pow(2, 10)); // Dynamic grid size
  
  // Use spatial indexing for better performance
  const grid: Record<string, { count: number; totalIntensity: number }> = {};
  
  listings
    .filter(listing => isInBounds(listing.coordinates, viewport))
    .forEach(listing => {
      const lat = Math.floor(listing.coordinates.lat / gridSize) * gridSize;
      const lng = Math.floor(listing.coordinates.lng / gridSize) * gridSize;
      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
      
      if (!grid[key]) {
        grid[key] = { count: 0, totalIntensity: 0 };
      }
      
      grid[key].count++;
      grid[key].totalIntensity += (listing.capacity / 1000); // Convert to MW
    });
  
  // Convert grid to heat map points with intensity averaging
  Object.entries(grid).forEach(([key, data]) => {
    const [lat, lng] = key.split(',').map(Number);
    const avgIntensity = data.totalIntensity / data.count;
    
    points.push({
      coordinates: { lat, lng },
      intensity: Math.min(avgIntensity * 10, 100) // Scale and cap intensity
    });
  });
  
  // Cache the result
  heatMapCache.set(cacheKey, points);
  
  // Clear cache if it gets too large
  if (heatMapCache.size > 50) {
    const firstKey = heatMapCache.keys().next().value;
    if (firstKey) heatMapCache.delete(firstKey);
  }
  
  return points;
};

// Performance-optimized distance calculation with memoization
const distanceCache = new Map<string, number>();

export const calculateDistanceOptimized = (
  from: Coordinates, 
  to: Coordinates, 
  unit: 'km' | 'miles' = 'km'
): number => {
  const cacheKey = `${from.lat.toFixed(4)},${from.lng.toFixed(4)}-${to.lat.toFixed(4)},${to.lng.toFixed(4)}`;
  
  if (distanceCache.has(cacheKey)) {
    return distanceCache.get(cacheKey)!;
  }
  
  // Haversine formula
  const R = unit === 'km' ? 6371 : 3959; // Earth radius in km or miles
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLon = (to.lng - from.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Cache the result
  distanceCache.set(cacheKey, distance);
  
  // Clear cache if it gets too large
  if (distanceCache.size > 1000) {
    const firstKey = distanceCache.keys().next().value;
    if (firstKey) distanceCache.delete(firstKey);
  }
  
  return distance;
};

// Batch processing for large datasets
export const batchProcess = <T, R>(
  items: T[],
  processor: (batch: T[]) => R[],
  batchSize: number = 100
): R[] => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    results.push(...processor(batch));
  }
  
  return results;
};

// Helper functions
export const isWithinRadius = (
  point: Coordinates, 
  center: Coordinates, 
  radius: number
): boolean => {
  return calculateDistanceOptimized(point, center) <= radius;
};

export const createBounds = (center: Coordinates, radius: number): MapBounds => {
  const latOffset = radius / 111; // Approximate km per degree latitude
  const lngOffset = radius / (111 * Math.cos(center.lat * Math.PI / 180));
  
  return {
    north: center.lat + latOffset,
    south: center.lat - latOffset,
    east: center.lng + lngOffset,
    west: center.lng - lngOffset
  };
};

export const isInBounds = (point: Coordinates, bounds: MapBounds): boolean => {
  return point.lat <= bounds.north &&
         point.lat >= bounds.south &&
         point.lng <= bounds.east &&
         point.lng >= bounds.west;
};

// Performance metrics collector
export const metricsCollector = {
  operations: new Map<string, number>(),
  timings: new Map<string, number[]>(),
  
  recordOperation(name: string, duration: number) {
    const count = this.operations.get(name) || 0;
    this.operations.set(name, count + 1);
    
    const timings = this.timings.get(name) || [];
    timings.push(duration);
    this.timings.set(name, timings);
    
    // Keep only last 100 timings per operation
    if (timings.length > 100) {
      timings.shift();
    }
  },
  
  getAverageTime(name: string): number {
    const timings = this.timings.get(name) || [];
    return timings.length > 0 ? timings.reduce((a, b) => a + b, 0) / timings.length : 0;
  },
  
  getReport() {
    const report: Record<string, any> = {};
    
    for (const [name, count] of this.operations) {
      report[name] = {
        count,
        averageTime: this.getAverageTime(name),
        totalTime: (this.timings.get(name) || []).reduce((a, b) => a + b, 0)
      };
    }
    
    return report;
  },
  
  reset() {
    this.operations.clear();
    this.timings.clear();
  }
};
