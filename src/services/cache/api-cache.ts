import React from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  lastModified?: string;
  tags?: string[];
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enableBackgroundRefresh: boolean;
  enableStaleWhileRevalidate: boolean;
  staleWhileRevalidateTTL: number;
}

interface CacheOptions {
  ttl?: number;
  skipCache?: boolean;
  forceRefresh?: boolean;
  backgroundRefresh?: boolean;
  invalidateOnMutation?: boolean;
  tags?: string[];
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  evictions: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
    evictions: 0,
  };
  private config: CacheConfig;
  private cleanupInterval?: number;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100, // Max 100 entries
      enableBackgroundRefresh: true,
      enableStaleWhileRevalidate: true,
      staleWhileRevalidateTTL: 60 * 1000, // 1 minute
      ...config,
    };

    // Start cleanup interval
    this.startCleanup();
  }

  // Generate cache key from URL and options
  private generateKey(url: string, options: RequestInit = {}): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  // Check if cache entry is valid
  private isValidEntry<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  // Check if entry is stale but can be served (stale-while-revalidate)
  private isStaleButValid<T>(entry: CacheEntry<T>): boolean {
    const age = Date.now() - entry.timestamp;
    return age >= entry.ttl && age < entry.ttl + this.config.staleWhileRevalidateTTL;
  }

  // Evict oldest entries if cache is full
  private evictIfNeeded(): void {
    if (this.cache.size >= this.config.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toEvict = entries.slice(0, Math.ceil(this.config.maxSize * 0.2)); // Evict 20%
      toEvict.forEach(([key]) => {
        this.cache.delete(key);
        this.stats.evictions++;
      });
    }
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl + this.config.staleWhileRevalidateTTL) {
        this.cache.delete(key);
      }
    }
    this.updateStats();
  }

  // Start cleanup interval
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // Cleanup every minute
  }

  // Update cache statistics
  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.stats.hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;
  }

  // Invalidate cache entries by tags
  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if ((entry as any).tags?.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  // Invalidate cache entries by URL pattern
  invalidateByPattern(pattern: RegExp): void {
    for (const [key] of this.cache.entries()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0,
      evictions: 0,
    };
  }

  // Get cache statistics
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  // Main cache method
  async fetch<T>(
    url: string,
    options: RequestInit & CacheOptions = {}
  ): Promise<T> {
    const {
      ttl = this.config.defaultTTL,
      skipCache = false,
      forceRefresh = false,
      backgroundRefresh = this.config.enableBackgroundRefresh,
      invalidateOnMutation = false,
      tags = [],
    } = options;

    const key = this.generateKey(url, options);

    // Skip cache if requested
    if (skipCache) {
      return this.makeRequest<T>(url, options);
    }

    // Force refresh if requested
    if (forceRefresh) {
      this.cache.delete(key);
    }

    const cachedEntry = this.cache.get(key);

    // Return fresh cached data
    if (cachedEntry && this.isValidEntry(cachedEntry)) {
      this.stats.hits++;
      this.updateStats();

      // Background refresh if enabled
      if (backgroundRefresh && this.isStaleButValid(cachedEntry)) {
        this.backgroundRefresh(url, options, ttl, tags);
      }

      return cachedEntry.data;
    }

    // Return stale data while revalidating
    if (cachedEntry && this.isStaleButValid(cachedEntry) && this.config.enableStaleWhileRevalidate) {
      this.stats.hits++;
      this.updateStats();
      
      // Revalidate in background
      this.backgroundRefresh(url, options, ttl, tags);
      
      return cachedEntry.data;
    }

    // Cache miss - make request
    this.stats.misses++;
    this.updateStats();

    // Check if request is already pending
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Make new request
    const requestPromise = this.makeRequest<T>(url, options);
    this.pendingRequests.set(key, requestPromise);

    try {
      const data = await requestPromise;
      
      // Cache the response
      this.evictIfNeeded();
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
        tags,
      });

      return data;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  // Background refresh for stale data
  private async backgroundRefresh<T>(
    url: string,
    options: RequestInit,
    ttl: number,
    tags: string[]
  ): Promise<void> {
    try {
      const data = await this.makeRequest<T>(url, options);
      const key = this.generateKey(url, options);
      
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
        tags,
      });
    } catch (error) {
      console.warn('Background refresh failed:', error);
    }
  }

  // Make actual HTTP request
  private async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Preload data into cache
  async preload<T>(
    url: string,
    options: RequestInit & CacheOptions = {}
  ): Promise<void> {
    try {
      await this.fetch<T>(url, { ...options, backgroundRefresh: false });
    } catch (error) {
      console.warn('Preload failed:', error);
    }
  }

  // Get cached data without making requests
  getCached<T>(url: string, options: RequestInit = {}): T | null {
    const key = this.generateKey(url, options);
    const entry = this.cache.get(key);
    
    if (entry && this.isValidEntry(entry)) {
      return entry.data;
    }
    
    return null;
  }

  // Destroy cache and cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Global cache instance
export const apiCache = new APICache({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  enableBackgroundRefresh: true,
  enableStaleWhileRevalidate: true,
});

// React hook for API caching
export const useAPICache = () => {
  const [stats, setStats] = React.useState<CacheStats>(apiCache.getStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(apiCache.getStats());
    }, 5000); // Update stats every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    fetch: apiCache.fetch.bind(apiCache),
    preload: apiCache.preload.bind(apiCache),
    getCached: apiCache.getCached.bind(apiCache),
    invalidateByTag: apiCache.invalidateByTag.bind(apiCache),
    invalidateByPattern: apiCache.invalidateByPattern.bind(apiCache),
    clear: apiCache.clear.bind(apiCache),
    stats,
  };
};

// Higher-order function for cached API calls
export const withCache = <T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  options: CacheOptions = {}
): T => {
  return (async (...args: Parameters<T>) => {
    const [url, requestInit] = args;
    return apiCache.fetch(url, { ...requestInit, ...options });
  }) as T;
};

// Utility functions for common cache operations
export const cacheUtils = {
  // Invalidate user-specific cache
  invalidateUserCache: (userId: string) => {
    apiCache.invalidateByPattern(new RegExp(`user-${userId}`));
    apiCache.invalidateByTag(`user:${userId}`);
  },

  // Invalidate dashboard cache
  invalidateDashboardCache: () => {
    apiCache.invalidateByTag('dashboard');
    apiCache.invalidateByPattern(/\/api\/dashboard/);
  },

  // Preload critical data
  preloadCriticalData: async () => {
    const criticalEndpoints = [
      '/api/user/profile',
      '/api/dashboard/stats',
      '/api/portfolio/summary',
    ];

    await Promise.all(
      criticalEndpoints.map(endpoint => 
        apiCache.preload(endpoint).catch(error => ({ error }))
      )
    );
  },

  // Warm up cache for offline mode
  warmupCache: async () => {
    const endpoints = [
      '/api/user/profile',
      '/api/dashboard/stats',
      '/api/portfolio/summary',
      '/api/energy/rates',
      '/api/energy/history',
    ];

    await Promise.all(
      endpoints.map(endpoint => 
        apiCache.preload(endpoint, { ttl: 30 * 60 * 1000 }).catch(error => ({ error })) // 30 minutes
      )
    );
  },
};

export default APICache;
