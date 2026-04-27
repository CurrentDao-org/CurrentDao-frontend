// Cache utilities for performance optimization

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      key,
    };
    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Cache instances for different data types
export const apiCache = new MemoryCache(10 * 60 * 1000); // 10 minutes for API responses
export const imageCache = new MemoryCache(60 * 60 * 1000); // 1 hour for images
export const staticCache = new MemoryCache(24 * 60 * 60 * 1000); // 24 hours for static data

// Cache utilities
export const cacheUtils = {
  // Generate cache key from URL and parameters
  generateKey: (url: string, params?: Record<string, any>): string => {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}:${paramString}`;
  },

  // Cache wrapper for async functions
  withCache: async <T>(
    key: string,
    fn: () => Promise<T>,
    cache: MemoryCache<T> = apiCache,
    ttl?: number
  ): Promise<T> => {
    // Check cache first
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fn();
      cache.set(key, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  },

  // Invalidate cache by pattern
  invalidatePattern: (pattern: string, cache: MemoryCache = apiCache): void => {
    const keys = cache.keys();
    const regex = new RegExp(pattern);
    keys.forEach(key => {
      if (regex.test(key)) {
        cache.delete(key);
      }
    });
  },

  // Get cache statistics
  getStats: (cache: MemoryCache = apiCache) => ({
    size: cache.size(),
    keys: cache.keys(),
  }),
};

// LocalStorage cache with fallback to memory
export class PersistentCache<T = any> {
  private memoryCache = new MemoryCache<T>();
  private prefix: string;

  constructor(prefix: string = 'app_cache_') {
    this.prefix = prefix;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item) as CacheEntry<T>;
            if (!this.isExpired(parsed)) {
              const cacheKey = key.replace(this.prefix, '');
              this.memoryCache.set(cacheKey, parsed.data, parsed.ttl);
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
  }

  set(key: string, data: T, ttl?: number): void {
    this.memoryCache.set(key, data, ttl);
    
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.memoryCache['defaultTTL'],
        key,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  get(key: string): T | null {
    return this.memoryCache.get(key);
  }

  delete(key: string): boolean {
    localStorage.removeItem(this.prefix + key);
    return this.memoryCache.delete(key);
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
    this.memoryCache.clear();
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
}

// Export singleton instances
export const persistentCache = new PersistentCache();
