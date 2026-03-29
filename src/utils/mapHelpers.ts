import { 
  Coordinates, 
  DistanceCalculation, 
  MapBounds, 
  MapViewport,
  EnergyListing,
  LocationFilter,
  RegionalMarketData,
  HeatMapPoint
} from '../types/maps';

// Enhanced distance calculation with performance optimizations
const simpleGetDistance = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (to.latitude - from.latitude) * Math.PI / 180;
  const dLon = (to.longitude - from.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const calculateDistance = (
  from: Coordinates, 
  to: Coordinates, 
  unit: 'km' | 'miles' = 'km'
): number => {
  const distance = simpleGetDistance(
    { latitude: from.lat, longitude: from.lng },
    { latitude: to.lat, longitude: to.lng }
  );
  
  return unit === 'km' ? distance / 1000 : distance / 1609.34;
};

export const calculateDistanceWithDetails = (
  from: Coordinates, 
  to: Coordinates, 
  unit: 'km' | 'miles' = 'km',
  costPerKm: number = 0.15
): DistanceCalculation => {
  const distance = calculateDistance(from, to, unit);
  const estimatedCost = distance * costPerKm;
  const estimatedTime = distance * 2; // Rough estimate: 2 minutes per km
  
  return {
    from,
    to,
    distance,
    unit,
    estimatedCost,
    estimatedTime
  };
};

export const isWithinRadius = (
  point: Coordinates, 
  center: Coordinates, 
  radius: number
): boolean => {
  return calculateDistance(point, center) <= radius;
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

export const isPointInBounds = (point: Coordinates, bounds: MapBounds): boolean => {
  return point.lat <= bounds.north &&
         point.lat >= bounds.south &&
         point.lng <= bounds.east &&
         point.lng >= bounds.west;
};

export const getBoundsCenter = (bounds: MapBounds): Coordinates => {
  return {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2
  };
};

// Enhanced filtering with performance optimizations
export const filterByLocation = (
  listings: EnergyListing[], 
  filter: LocationFilter
): EnergyListing[] => {
  switch (filter.type) {
    case 'radius':
      if (!filter.center || !filter.radius) return listings;
      return listings.filter(listing => 
        isWithinRadius(listing.coordinates, filter.center!, filter.radius!)
      );
    
    case 'region':
      if (!filter.region) return listings;
      return listings.filter(listing => 
        isInRegion(listing.coordinates, filter.region!)
      );
    
    case 'gridZone':
      if (!filter.gridZone) return listings;
      return listings.filter(listing => 
        isInGridZone(listing.coordinates, filter.gridZone!)
      );
    
    default:
      return listings;
  }
};

export const isInRegion = (coordinates: Coordinates, region: string): boolean => {
  const regionBounds: Record<string, MapBounds> = {
    'northeast': { north: 47.5, south: 40.0, east: -66.9, west: -80.5 },
    'southeast': { north: 40.0, south: 24.5, east: -75.4, west: -93.5 },
    'midwest': { north: 49.0, south: 37.0, east: -80.5, west: -104.0 },
    'southwest': { north: 37.0, south: 31.3, east: -103.0, west: -114.0 },
    'west': { north: 49.0, south: 31.3, east: -114.0, west: -125.0 }
  };
  
  const bounds = regionBounds[region.toLowerCase()];
  return bounds ? isPointInBounds(coordinates, bounds) : false;
};

export const isInGridZone = (coordinates: Coordinates, gridZone: string): boolean => {
  const gridZones: Record<string, MapBounds> = {
    'PJM': { north: 42.0, south: 37.5, east: -74.5, west: -80.5 },
    'ERCOT': { north: 36.5, south: 25.8, east: -93.5, west: -106.5 },
    'CAISO': { north: 42.0, south: 32.5, east: -114.0, west: -124.5 },
    'NYISO': { north: 45.0, south: 40.5, east: -73.3, west: -79.8 },
    'ISO-NE': { north: 47.5, south: 41.2, east: -69.8, west: -73.3 }
  };
  
  const bounds = gridZones[gridZone.toUpperCase()];
  return bounds ? isPointInBounds(coordinates, bounds) : false;
};

// Enhanced clustering with performance improvements
export const clusterMarkers = (
  markers: any[], 
  zoom: number, 
  maxDistance: number = 50
): any[] => {
  if (zoom > 10) return markers; // Don't cluster at high zoom levels
  
  const clusters: any[] = [];
  const processed = new Set();
  
  markers.forEach((marker, index) => {
    if (processed.has(index)) return;
    
    const cluster = {
      id: `cluster-${clusters.length}`,
      center: marker.position,
      markers: [marker],
      count: 1,
      bounds: createBounds(marker.position, maxDistance)
    };
    
    // Find nearby markers
    markers.forEach((otherMarker, otherIndex) => {
      if (index === otherIndex || processed.has(otherIndex)) return;
      
      if (isWithinRadius(otherMarker.position, cluster.center, maxDistance)) {
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

// Enhanced heat map generation with caching
const heatMapCache = new Map<string, HeatMapPoint[]>();

export const generateHeatMapData = (
  listings: EnergyListing[], 
  viewport: MapBounds
): HeatMapPoint[] => {
  const cacheKey = `${viewport.north}-${viewport.south}-${viewport.east}-${viewport.west}-${listings.length}`;
  
  if (heatMapCache.has(cacheKey)) {
    return heatMapCache.get(cacheKey)!;
  }
  
  const points: HeatMapPoint[] = [];
  const gridSize = 0.1; // Grid size for heat map
  
  // Create a grid to aggregate data
  const grid: Record<string, number> = {};
  
  listings
    .filter(listing => isPointInBounds(listing.coordinates, viewport))
    .forEach(listing => {
      const lat = Math.floor(listing.coordinates.lat / gridSize) * gridSize;
      const lng = Math.floor(listing.coordinates.lng / gridSize) * gridSize;
      const key = `${lat},${lng}`;
      
      grid[key] = (grid[key] || 0) + (listing.capacity / 1000); // Convert to MW
    });
  
  // Convert grid to heat map points
  Object.entries(grid).forEach(([key, intensity]) => {
    const [lat, lng] = key.split(',').map(Number);
    points.push({
      coordinates: { lat, lng },
      intensity: Math.min(intensity, 100) // Cap intensity at 100
    });
  });
  
  // Cache the result
  heatMapCache.set(cacheKey, points);
  
  // Clear cache if it gets too large
  if (heatMapCache.size > 50) {
    const firstKey = heatMapCache.keys().next().value;
    heatMapCache.delete(firstKey);
  }
  
  return points;
};

export const calculateRegionalMarketData = (
  listings: EnergyListing[], 
  region: string
): RegionalMarketData | null => {
  const regionListings = listings.filter(listing => isInRegion(listing.coordinates, region));
  
  if (regionListings.length === 0) return null;
  
  const averagePrice = regionListings.reduce((sum, listing) => sum + listing.price, 0) / regionListings.length;
  const totalCapacity = regionListings.reduce((sum, listing) => sum + listing.capacity, 0);
  
  // Simple trend calculation (in real app, this would use historical data)
  const priceTrend = averagePrice > 50 ? 'up' : averagePrice < 30 ? 'down' : 'stable';
  
  const regionCenter = getRegionCenter(region);
  
  return {
    region,
    averagePrice,
    priceTrend,
    totalListings: regionListings.length,
    totalCapacity,
    coordinates: regionCenter,
    lastUpdated: new Date().toISOString()
  };
};

export const getRegionCenter = (region: string): Coordinates => {
  const centers: Record<string, Coordinates> = {
    'northeast': { lat: 43.8, lng: -73.7 },
    'southeast': { lat: 32.3, lng: -84.4 },
    'midwest': { lat: 43.0, lng: -92.3 },
    'southwest': { lat: 34.2, lng: -109.8 },
    'west': { lat: 40.2, lng: -119.5 }
  };
  
  return centers[region.toLowerCase()] || { lat: 39.8, lng: -98.6 }; // Default to US center
};

export const formatDistance = (distance: number, unit: 'km' | 'miles'): string => {
  if (distance < 1) {
    return `${Math.round(distance * (unit === 'km' ? 1000 : 5280))} ${unit === 'km' ? 'm' : 'ft'}`;
  }
  return `${distance.toFixed(1)} ${unit}`;
};

// Enhanced performance optimization with virtualization
export const optimizeMapPerformance = (markers: any[], maxMarkers: number = 1000): any[] => {
  if (markers.length <= maxMarkers) return markers;
  
  // Smart sampling based on marker density
  const step = Math.ceil(markers.length / maxMarkers);
  return markers.filter((_, index) => index % step === 0);
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

// New performance monitoring utilities
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
  cache: new Map(),
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

export const calculateDistanceWithDetails = (
  from: Coordinates, 
  to: Coordinates, 
  unit: 'km' | 'miles' = 'km',
  costPerKm: number = 0.15
): DistanceCalculation => {
  const distance = calculateDistance(from, to, unit);
  const estimatedCost = distance * costPerKm;
  const estimatedTime = distance * 2; // Rough estimate: 2 minutes per km
  
  return {
    from,
    to,
    distance,
    unit,
    estimatedCost,
    estimatedTime
  };
};

export const isWithinRadius = (
  point: Coordinates, 
  center: Coordinates, 
  radius: number
): boolean => {
  return calculateDistance(point, center) <= radius;
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

export const isPointInBounds = (point: Coordinates, bounds: MapBounds): boolean => {
  return point.lat <= bounds.north &&
         point.lat >= bounds.south &&
         point.lng <= bounds.east &&
         point.lng >= bounds.west;
};

export const getBoundsCenter = (bounds: MapBounds): Coordinates => {
  return {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2
  };
};

export const filterByLocation = (
  listings: EnergyListing[], 
  filter: LocationFilter
): EnergyListing[] => {
  switch (filter.type) {
    case 'radius':
      if (!filter.center || !filter.radius) return listings;
      return listings.filter(listing => 
        isWithinRadius(listing.coordinates, filter.center!, filter.radius!)
      );
    
    case 'region':
      if (!filter.region) return listings;
      return listings.filter(listing => 
        isInRegion(listing.coordinates, filter.region!)
      );
    
    case 'gridZone':
      if (!filter.gridZone) return listings;
      return listings.filter(listing => 
        isInGridZone(listing.coordinates, filter.gridZone!)
      );
    
    default:
      return listings;
  }
};

export const isInRegion = (coordinates: Coordinates, region: string): boolean => {
  const regionBounds: Record<string, MapBounds> = {
    'northeast': { north: 47.5, south: 40.0, east: -66.9, west: -80.5 },
    'southeast': { north: 40.0, south: 24.5, east: -75.4, west: -93.5 },
    'midwest': { north: 49.0, south: 37.0, east: -80.5, west: -104.0 },
    'southwest': { north: 37.0, south: 31.3, east: -103.0, west: -114.0 },
    'west': { north: 49.0, south: 31.3, east: -114.0, west: -125.0 }
  };
  
  const bounds = regionBounds[region.toLowerCase()];
  return bounds ? isPointInBounds(coordinates, bounds) : false;
};

export const isInGridZone = (coordinates: Coordinates, gridZone: string): boolean => {
  // Simplified grid zone mapping - in real implementation, this would use actual grid zones
  const gridZones: Record<string, MapBounds> = {
    'PJM': { north: 42.0, south: 37.5, east: -74.5, west: -80.5 },
    'ERCOT': { north: 36.5, south: 25.8, east: -93.5, west: -106.5 },
    'CAISO': { north: 42.0, south: 32.5, east: -114.0, west: -124.5 },
    'NYISO': { north: 45.0, south: 40.5, east: -73.3, west: -79.8 },
    'ISO-NE': { north: 47.5, south: 41.2, east: -69.8, west: -73.3 }
  };
  
  const bounds = gridZones[gridZone.toUpperCase()];
  return bounds ? isPointInBounds(coordinates, bounds) : false;
};

export const clusterMarkers = (
  markers: any[], 
  zoom: number, 
  maxDistance: number = 50
): any[] => {
  if (zoom > 10) return markers; // Don't cluster at high zoom levels
  
  const clusters: any[] = [];
  const processed = new Set();
  
  markers.forEach((marker, index) => {
    if (processed.has(index)) return;
    
    const cluster = {
      id: `cluster-${clusters.length}`,
      center: marker.position,
      markers: [marker],
      count: 1,
      bounds: createBounds(marker.position, maxDistance)
    };
    
    // Find nearby markers
    markers.forEach((otherMarker, otherIndex) => {
      if (index === otherIndex || processed.has(otherIndex)) return;
      
      if (isWithinRadius(otherMarker.position, cluster.center, maxDistance)) {
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

export const generateHeatMapData = (
  listings: EnergyListing[], 
  viewport: MapBounds
): HeatMapPoint[] => {
  const points: HeatMapPoint[] = [];
  const gridSize = 0.1; // Grid size for heat map
  
  // Create a grid to aggregate data
  const grid: Record<string, number> = {};
  
  listings
    .filter(listing => isPointInBounds(listing.coordinates, viewport))
    .forEach(listing => {
      const lat = Math.floor(listing.coordinates.lat / gridSize) * gridSize;
      const lng = Math.floor(listing.coordinates.lng / gridSize) * gridSize;
      const key = `${lat},${lng}`;
      
      grid[key] = (grid[key] || 0) + (listing.capacity / 1000); // Convert to MW
    });
  
  // Convert grid to heat map points
  Object.entries(grid).forEach(([key, intensity]) => {
    const [lat, lng] = key.split(',').map(Number);
    points.push({
      coordinates: { lat, lng },
      intensity: Math.min(intensity, 100) // Cap intensity at 100
    });
  });
  
  return points;
};

export const calculateRegionalMarketData = (
  listings: EnergyListing[], 
  region: string
): RegionalMarketData | null => {
  const regionListings = listings.filter(listing => isInRegion(listing.coordinates, region));
  
  if (regionListings.length === 0) return null;
  
  const averagePrice = regionListings.reduce((sum, listing) => sum + listing.price, 0) / regionListings.length;
  const totalCapacity = regionListings.reduce((sum, listing) => sum + listing.capacity, 0);
  
  // Simple trend calculation (in real app, this would use historical data)
  const priceTrend = averagePrice > 50 ? 'up' : averagePrice < 30 ? 'down' : 'stable';
  
  const regionCenter = getRegionCenter(region);
  
  return {
    region,
    averagePrice,
    priceTrend,
    totalListings: regionListings.length,
    totalCapacity,
    coordinates: regionCenter,
    lastUpdated: new Date().toISOString()
  };
};

export const getRegionCenter = (region: string): Coordinates => {
  const centers: Record<string, Coordinates> = {
    'northeast': { lat: 43.8, lng: -73.7 },
    'southeast': { lat: 32.3, lng: -84.4 },
    'midwest': { lat: 43.0, lng: -92.3 },
    'southwest': { lat: 34.2, lng: -109.8 },
    'west': { lat: 40.2, lng: -119.5 }
  };
  
  return centers[region.toLowerCase()] || { lat: 39.8, lng: -98.6 }; // Default to US center
};

export const formatDistance = (distance: number, unit: 'km' | 'miles'): string => {
  if (distance < 1) {
    return `${Math.round(distance * (unit === 'km' ? 1000 : 5280))} ${unit === 'km' ? 'm' : 'ft'}`;
  }
  return `${distance.toFixed(1)} ${unit}`;
};

export const optimizeMapPerformance = (markers: any[], maxMarkers: number = 1000): any[] => {
  if (markers.length <= maxMarkers) return markers;
  
  // Sample markers to maintain performance
  const step = Math.ceil(markers.length / maxMarkers);
  return markers.filter((_, index) => index % step === 0);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
