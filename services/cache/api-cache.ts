import { cacheUtils, apiCache } from '../../utils/performance/cache';

interface CacheOptions {
  ttl?: number;
  key?: string;
  bypass?: boolean;
  revalidate?: boolean;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  timestamp: number;
}

class ApiCacheService {
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private pendingRequests = new Map<string, Promise<any>>();

  // Main cache wrapper for API calls
  async request<T = any>(
    url: string,
    options: RequestInit = {},
    cacheOptions: CacheOptions = {}
  ): Promise<T> {
    const {
      ttl = this.defaultTTL,
      key,
      bypass = false,
      revalidate = false
    } = cacheOptions;

    const cacheKey = key || cacheUtils.generateKey(url, options);

    // If bypassing cache, make direct request
    if (bypass) {
      return this.makeRequest<T>(url, options);
    }

    // Check cache first (unless revalidating)
    if (!revalidate) {
      const cached = apiCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Make request and cache result
    const requestPromise = this.makeRequest<T>(url, options)
      .then(data => {
        apiCache.set(cacheKey, data, ttl);
        this.pendingRequests.delete(cacheKey);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  private async makeRequest<T = any>(url: string, options: RequestInit = {}): Promise<T> {
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

  // GET request with caching
  async get<T = any>(url: string, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>(url, { method: 'GET' }, cacheOptions);
  }

  // POST request (usually not cached)
  async post<T = any>(url: string, data?: any, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, { ...cacheOptions, ttl: 0 }); // Don't cache POST requests by default
  }

  // PUT request
  async put<T = any>(url: string, data?: any, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, { ...cacheOptions, ttl: 0 });
  }

  // DELETE request
  async delete<T = any>(url: string, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' }, { ...cacheOptions, ttl: 0 });
  }

  // Batch requests
  async batch<T = any>(requests: Array<{
    url: string;
    options?: RequestInit;
    cacheOptions?: CacheOptions;
  }>): Promise<T[]> {
    const promises = requests.map(req => 
      this.request<T>(req.url, req.options, req.cacheOptions)
    );
    return Promise.all(promises);
  }

  // Revalidate cached data
  async revalidate<T = any>(url: string, options: RequestInit = {}, cacheKey?: string): Promise<T> {
    return this.request<T>(url, options, {
      key: cacheKey,
      revalidate: true,
    });
  }

  // Prefetch data for better performance
  async prefetch(url: string, options: RequestInit = {}, cacheOptions?: CacheOptions): Promise<void> {
    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.request(url, options, cacheOptions).catch(() => {
          // Silent fail for prefetch
        });
      });
    } else {
      setTimeout(() => {
        this.request(url, options, cacheOptions).catch(() => {
          // Silent fail for prefetch
        });
      }, 0);
    }
  }

  // Invalidate cache by URL pattern
  invalidatePattern(pattern: string): void {
    cacheUtils.invalidatePattern(pattern, apiCache);
  }

  // Invalidate specific cache key
  invalidate(key: string): void {
    apiCache.delete(key);
  }

  // Clear all cache
  clear(): void {
    apiCache.clear();
  }

  // Get cache statistics
  getStats() {
    return cacheUtils.getStats(apiCache);
  }

  // Intelligent cache invalidation based on HTTP methods
  smartInvalidate(url: string, method: string = 'GET'): void {
    const baseUrl = url.split('?')[0]; // Remove query parameters
    
    switch (method.toUpperCase()) {
      case 'POST':
      case 'PUT':
      case 'DELETE':
        // Invalidate related GET requests when data changes
        this.invalidatePattern(`^${baseUrl}.*`);
        break;
      default:
        break;
    }
  }
}

// Specialized cache services for different data types
export class PortfolioApiCache extends ApiCacheService {
  // Cache portfolio data for longer periods
  async getPortfolioData(userId: string): Promise<any> {
    return this.get(`/api/portfolio/${userId}`, {
      ttl: 10 * 60 * 1000, // 10 minutes
    });
  }

  // Cache trading history with shorter TTL
  async getTradingHistory(userId: string, filters?: any): Promise<any> {
    return this.get(`/api/portfolio/${userId}/history`, {
      ttl: 2 * 60 * 1000, // 2 minutes
      key: cacheUtils.generateKey(`/api/portfolio/${userId}/history`, filters),
    });
  }

  // Cache performance metrics
  async getPerformanceMetrics(userId: string, period?: string): Promise<any> {
    return this.get(`/api/portfolio/${userId}/metrics`, {
      ttl: 5 * 60 * 1000, // 5 minutes
      key: cacheUtils.generateKey(`/api/portfolio/${userId}/metrics`, { period }),
    });
  }

  // Invalidate portfolio-related cache when trades are updated
  async updateTrade(userId: string, tradeId: string, data: any): Promise<any> {
    const result = await this.put(`/api/portfolio/${userId}/trades/${tradeId}`, data);
    this.smartInvalidate(`/api/portfolio/${userId}`);
    return result;
  }

  // Invalidate cache when new trades are added
  async addTrade(userId: string, data: any): Promise<any> {
    const result = await this.post(`/api/portfolio/${userId}/trades`, data);
    this.smartInvalidate(`/api/portfolio/${userId}`);
    return result;
  }

  // Invalidate cache when trades are deleted
  async deleteTrade(userId: string, tradeId: string): Promise<any> {
    const result = await this.delete(`/api/portfolio/${userId}/trades/${tradeId}`);
    this.smartInvalidate(`/api/portfolio/${userId}`);
    return result;
  }

  // Prefetch common data
  prefetchPortfolioData(userId: string): void {
    this.prefetch(`/api/portfolio/${userId}`);
    this.prefetch(`/api/portfolio/${userId}/metrics`);
    this.prefetch(`/api/portfolio/${userId}/history`);
  }
}

// Export singleton instances
export const apiCacheService = new ApiCacheService();
export const portfolioApiCache = new PortfolioApiCache();

// React hook for API caching
export const useApiCache = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const request = React.useCallback(async <T = any>(
    url: string,
    options: RequestInit = {},
    cacheOptions: CacheOptions = {}
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCacheService.request<T>(url, options, cacheOptions);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    request,
    get: React.useCallback((url: string, cacheOptions?: CacheOptions) => 
      apiCacheService.get(url, cacheOptions), []),
    post: React.useCallback((url: string, data?: any, cacheOptions?: CacheOptions) => 
      apiCacheService.post(url, data, cacheOptions), []),
    put: React.useCallback((url: string, data?: any, cacheOptions?: CacheOptions) => 
      apiCacheService.put(url, data, cacheOptions), []),
    delete: React.useCallback((url: string, cacheOptions?: CacheOptions) => 
      apiCacheService.delete(url, cacheOptions), []),
    isLoading,
    error,
    invalidate: React.useCallback((key: string) => apiCacheService.invalidate(key), []),
    clear: React.useCallback(() => apiCacheService.clear(), []),
  };
};
