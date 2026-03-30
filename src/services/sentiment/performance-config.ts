// Performance optimization utilities for Sentiment Dashboard

/**
 * Configuration for sentiment service performance
 */
export const SENTIMENT_CONFIG = {
  // Cache TTLs (in milliseconds)
  cache: {
    dashboard: 5 * 60 * 1000, // 5 minutes
    news: 3 * 60 * 1000, // 3 minutes
    social: 2 * 60 * 1000, // 2 minutes
    signals: 5 * 60 * 1000, // 5 minutes
    historical: 30 * 60 * 1000, // 30 minutes
    heatmap: 10 * 60 * 1000, // 10 minutes
    regional: 15 * 60 * 1000, // 15 minutes
    correlations: 30 * 60 * 1000, // 30 minutes
  },

  // Update intervals (in milliseconds)
  updates: {
    realTime: 1000, // 1 second for WebSocket updates
    autoRefresh: 60000, // 1 minute for polling
    socialFeed: 30000, // 30 seconds for social media
    newsFeed: 60000, // 1 minute for news
    signals: 300000, // 5 minutes for trading signals
  },

  // Pagination and limits
  pagination: {
    newsArticles: 50, // Display 50 articles by default
    socialPosts: 100, // Display up to 100 social posts
    tradingSignals: 20, // Show top 20 signals
    alerts: 10, // Display 10 recent alerts
    historicalPoints: 365, // 1 year of history
  },

  // API request configuration
  api: {
    timeout: 10000, // 10 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
    batchSize: 50, // Batch API requests in groups of 50
  },

  // Performance thresholds
  performance: {
    maxLoadTime: 3000, // Dashboard must load under 3 seconds
    maxRenderTime: 500, // Component must render under 500ms
    maxUpdateTime: 1000, // Real-time updates under 1 second
  },

  // Data aggregation settings
  aggregation: {
    minNewsCredibility: 50, // Minimum credibility score for news sources
    minInfluenceScore: 0, // Minimum social media influence score
    sentimentThreshold: 0.5, // Sentiment sensitivity
  },

  // Feature flags
  features: {
    enableRealTime: true,
    enableWebSocket: true,
    enableCache: true,
    enableCompression: true,
    enableOptimisticUpdates: true,
  },
}

/**
 * Memory management utilities
 */
export const MemoryManager = {
  /**
   * Estimate memory usage of objects
   */
  estimateSize: (obj: any): number => {
    const objectList = []
    const stack = [obj]
    let bytes = 0

    while (stack.length) {
      const value = stack.pop()

      if (typeof value === 'boolean') {
        bytes += 4
      } else if (typeof value === 'string') {
        bytes += value.length * 2
      } else if (typeof value === 'number') {
        bytes += 8
      } else if (typeof value === 'object' && value !== null) {
        if (objectList.indexOf(value) === -1) {
          objectList.push(value)

          for (const prop in value) {
            if (value.hasOwnProperty(prop)) {
              stack.push(value[prop])
            }
          }
        }
      }
    }

    return bytes
  },

  /**
   * Clear old cache entries
   */
  clearOldCache: (cache: Map<string, any>, maxAge: number): void => {
    const now = Date.now()
    for (const [key, entry] of cache.entries()) {
      if (entry.timestamp && now - entry.timestamp > maxAge) {
        cache.delete(key)
      }
    }
  },
}

/**
 * Data compression utilities
 */
export const CompressionUtils = {
  /**
   * Compress sentiment data for transmission
   */
  compressSentimentData: (data: any): string => {
    // Reduce decimal places
    const compressed = JSON.stringify(data, (key, value) => {
      if (typeof value === 'number') {
        return Math.round(value * 100) / 100
      }
      return value
    })
    return compressed
  },

  /**
   * Decompress sentiment data
   */
  decompressSentimentData: (compressed: string): any => {
    return JSON.parse(compressed)
  },
}

/**
 * Query optimization utilities
 */
export const QueryOptimizer = {
  /**
   * Build optimized query parameters
   */
  optimizeQuery: (options: any): any => {
    const optimized = { ...options }

    // Remove undefined/null values
    Object.keys(optimized).forEach((key) => {
      if (optimized[key] === undefined || optimized[key] === null) {
        delete optimized[key]
      }
    })

    return optimized
  },

  /**
   * Batch multiple queries
   */
  batchQueries: (queries: any[], batchSize: number = 50): any[][] => {
    const batches = []
    for (let i = 0; i < queries.length; i += batchSize) {
      batches.push(queries.slice(i, i + batchSize))
    }
    return batches
  },
}

/**
 * Rendering optimization utilities
 */
export const RenderOptimizer = {
  /**
   * Debounce function for frequent updates
   */
  debounce: (func: Function, delay: number): Function => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  },

  /**
   * Throttle function for regular updates
   */
  throttle: (func: Function, limit: number): Function => {
    let inThrottle: boolean
    return (...args: any[]) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  /**
   * Virtual scrolling for large lists
   */
  createVirtualizer: (items: any[], itemHeight: number, containerHeight: number) => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    return {
      items,
      itemHeight,
      containerHeight,
      visibleCount,
      getVisibleItems: (scrollTop: number) => {
        const startIndex = Math.floor(scrollTop / itemHeight)
        const endIndex = Math.min(startIndex + visibleCount, items.length)
        return items.slice(startIndex, endIndex)
      },
    }
  },
}

/**
 * Network optimization utilities
 */
export const NetworkOptimizer = {
  /**
   * Request deduplication
   */
  deduplicateRequests: (requests: any[]): any[] => {
    const seen = new Set()
    return requests.filter((req) => {
      const key = JSON.stringify(req)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  },

  /**
   * Prioritize requests by importance
   */
  prioritizeRequests: (requests: any[]): any[] => {
    const priority = { critical: 0, high: 1, normal: 2, low: 3 }
    return requests.sort((a, b) => {
      const priorityA = priority[a.priority as keyof typeof priority] ?? 2
      const priorityB = priority[b.priority as keyof typeof priority] ?? 2
      return priorityA - priorityB
    })
  },
}

/**
 * Monitoring and metrics utilities
 */
export const PerformanceMonitor = {
  metrics: {
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    wsUpdates: 0,
    renderTime: [] as number[],
    loadTime: [] as number[],
  },

  /**
   * Record API call
   */
  recordApiCall: (): void => {
    PerformanceMonitor.metrics.apiCalls++
  },

  /**
   * Record cache hit
   */
  recordCacheHit: (): void => {
    PerformanceMonitor.metrics.cacheHits++
  },

  /**
   * Record cache miss
   */
  recordCacheMiss: (): void => {
    PerformanceMonitor.metrics.cacheMisses++
  },

  /**
   * Record WebSocket update
   */
  recordWsUpdate: (): void => {
    PerformanceMonitor.metrics.wsUpdates++
  },

  /**
   * Record render time
   */
  recordRenderTime: (time: number): void => {
    PerformanceMonitor.metrics.renderTime.push(time)
  },

  /**
   * Get metrics summary
   */
  getMetricsSummary: () => {
    const metrics = PerformanceMonitor.metrics
    const avgRenderTime = metrics.renderTime.length > 0
      ? metrics.renderTime.reduce((a, b) => a + b) / metrics.renderTime.length
      : 0
    const avgLoadTime = metrics.loadTime.length > 0
      ? metrics.loadTime.reduce((a, b) => a + b) / metrics.loadTime.length
      : 0
    const cacheHitRate = metrics.cacheHits + metrics.cacheMisses > 0
      ? (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100
      : 0

    return {
      totalApiCalls: metrics.apiCalls,
      cacheHitRate: cacheHitRate.toFixed(2) + '%',
      avgRenderTime: avgRenderTime.toFixed(2) + 'ms',
      avgLoadTime: avgLoadTime.toFixed(2) + 'ms',
      wsUpdates: metrics.wsUpdates,
    }
  },

  /**
   * Reset metrics
   */
  reset: (): void => {
    PerformanceMonitor.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      wsUpdates: 0,
      renderTime: [],
      loadTime: [],
    }
  },
}
