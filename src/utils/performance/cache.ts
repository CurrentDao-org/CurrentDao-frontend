// Performance cache utilities for optimizing data storage and retrieval

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item is expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();

    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if item is expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  size(): number {
    return this.cache.size;
  }

  // Get cache statistics
  getStats(): {
    size: number;
    hitRate: number;
    mostAccessed: Array<{ key: string; count: number }>;
  } {
    const items = Array.from(this.cache.entries());
    const totalAccess = items.reduce((sum, [, item]) => sum + item.accessCount, 0);
    
    const mostAccessed = items
      .map(([key, item]) => ({ key, count: item.accessCount }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? (items.reduce((sum, [, item]) => sum + item.accessCount, 0) / totalAccess) * 100 : 0,
      mostAccessed,
    };
  }

  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  // Clean up expired items
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Memory-efficient storage for large datasets
class MemoryStore {
  private store = new Map<string, any>();
  private compressionEnabled: boolean;

  constructor(compressionEnabled = false) {
    this.compressionEnabled = compressionEnabled;
  }

  async set(key: string, data: any): Promise<void> {
    if (this.compressionEnabled && typeof data === 'object') {
      // Simple compression simulation - in real app, use proper compression
      data = JSON.stringify(data);
    }

    this.store.set(key, data);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = this.store.get(key);
    
    if (!data) return null;

    if (this.compressionEnabled && typeof data === 'string') {
      try {
        return JSON.parse(data) as T;
      } catch {
        return data as T;
      }
    }

    return data as T;
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  // Estimate memory usage (rough approximation)
  getMemoryUsage(): number {
    let totalSize = 0;
    for (const [, value] of this.store.entries()) {
      totalSize += JSON.stringify(value).length * 2; // Rough byte estimation
    }
    return totalSize;
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization utility
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Batch processing utility
export class BatchProcessor<T> {
  private queue: T[] = [];
  private batchSize: number;
  private processFn: (items: T[]) => Promise<void>;
  private timeout: NodeJS.Timeout | null = null;
  private delay: number;

  constructor(
    batchSize: number,
    processFn: (items: T[]) => Promise<void>,
    delay = 100
  ) {
    this.batchSize = batchSize;
    this.processFn = processFn;
    this.delay = delay;
  }

  add(item: T): void {
    this.queue.push(item);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), this.delay);
    }
  }

  async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    await this.processFn(batch);
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

// Resource pooling for expensive objects
export class ResourcePool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private resetFn?: (item: T) => void;
  private maxSize: number;

  constructor(
    factory: () => T,
    resetFn?: (item: T) => void,
    maxSize = 10
  ) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  release(item: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(item);
      }
      this.pool.push(item);
    }
  }

  size(): number {
    return this.pool.length;
  }

  clear(): void {
    this.pool = [];
  }
}

// Global cache instances
export const performanceCache = new PerformanceCache();
export const memoryStore = new MemoryStore();

export default PerformanceCache;
