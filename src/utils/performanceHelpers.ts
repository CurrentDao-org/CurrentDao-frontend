// Type definitions for Web Vitals
type MetricRating = 'good' | 'needs-improvement' | 'poor'

interface Metric {
  name: string
  value: number
  id: string
  rating: MetricRating
  delta: number
  entries: PerformanceEntry[]
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender' | 'restore'
}

// Network Information API type
type NetworkInformationType = {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  saveData?: boolean
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'
}

/**
 * Report a Core Web Vital to analytics
 * 
 * @param metric - Web Vitals metric object from web-vitals library
 * 
 * @example
 * import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
 * 
 * getCLS(reportWebVital)
 * getFID(reportWebVital)
 * getFCP(reportWebVital)
 * getLCP(reportWebVital)
 * getTTFB(reportWebVital)
 */
export function reportWebVital(metric: Metric): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${metric.name}:`, metric)
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Check if gtag is available (Google Analytics)
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag
    if (typeof gtag === 'function') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value),
        non_interaction: true,
      })
    }

    // Alternative: Send to custom analytics endpoint
    // Uncomment and modify as needed for your analytics provider
    /*
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        rating: metric.rating,
        navigationType: metric.navigationType,
      }),
    }).catch(console.error)
    */
  }
}

/**
 * Detect if the user is on a slow connection
 * 
 * Uses navigator.connection.effectiveType and saveData flag.
 * Returns true if the connection is considered slow (2g, slow-2g) or if saveData is enabled.
 * 
 * @returns boolean indicating if the connection is slow
 * 
 * @example
 * if (isSlowConnection()) {
 *   // Load low-resolution images or skip non-critical features
 * }
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false

  const connection = (navigator as Navigator & { connection?: NetworkInformationType }).connection

  if (!connection) return false

  // Check effective connection type
  const slowTypes = ['2g', 'slow-2g']
  if (connection.effectiveType && slowTypes.includes(connection.effectiveType)) {
    return true
  }

  // Check save data preference
  if (connection.saveData) {
    return true
  }

  return false
}

/**
 * Generate a base64 blur placeholder
 * 
 * Returns a tiny blurred SVG as a data URL for use in next/image blurDataURL.
 * Useful for creating low-quality image placeholders (LQIP).
 * 
 * @param width - Width of the placeholder
 * @param height - Height of the placeholder
 * @param color - Base color for the blur (default: '#e5e7eb')
 * @returns Base64 encoded SVG data URL
 * 
 * @example
 * const blurDataURL = generateBlurDataURL(800, 600, '#3b82f6')
 * <Image src="/photo.jpg" blurDataURL={blurDataURL} placeholder="blur" />
 */
export function generateBlurDataURL(
  width: number = 100,
  height: number = 100,
  color: string = '#e5e7eb'
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}" filter="url(#blur)"/>
      <defs>
        <filter id="blur">
          <feGaussianBlur stdDeviation="20"/>
        </filter>
      </defs>
    </svg>
  `
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

// Track preconnected origins to avoid duplicates
const preconnectedOrigins = new Set<string>()

/**
 * Preconnect to a domain by injecting a <link rel="preconnect"> tag
 * 
 * Guards against duplicates - only injects once per origin.
 * Helps establish early connections to required origins.
 * 
 * @param origin - The origin URL to preconnect to (e.g., 'https://fonts.googleapis.com')
 * 
 * @example
 * preconnect('https://fonts.googleapis.com')
 * preconnect('https://fonts.gstatic.com')
 * preconnect('https://api.example.com')
 */
export function preconnect(origin: string): void {
  if (typeof document === 'undefined') return
  if (preconnectedOrigins.has(origin)) return

  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = origin
  link.crossOrigin = 'anonymous'
  
  document.head.appendChild(link)
  preconnectedOrigins.add(origin)

  // Also add dns-prefetch as fallback
  const dnsLink = document.createElement('link')
  dnsLink.rel = 'dns-prefetch'
  dnsLink.href = origin
  document.head.appendChild(dnsLink)
}

/**
 * Measure and log a code block's execution time (dev only)
 * 
 * Uses performance.now() for high-precision timing.
 * Logs only if process.env.NODE_ENV === 'development'.
 * 
 * @param label - Label for the measurement
 * @param fn - Function to measure
 * @returns The result of the function
 * 
 * @example
 * const result = measureTime('heavyCalculation', () => {
 *   return calculateLargeDataset()
 * })
 */
export function measureTime<T>(label: string, fn: () => T): T {
  if (typeof performance === 'undefined' || process.env.NODE_ENV !== 'development') {
    return fn()
  }

  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`)
  
  return result
}

/**
 * Chunk an array for deferred rendering
 * 
 * Splits an array into smaller chunks for rendering in batches.
 * Useful for avoiding blocking the main thread when rendering large lists.
 * 
 * @param array - Array to chunk
 * @param size - Size of each chunk (default: 10)
 * @returns Array of chunks
 * 
 * @example
 * const items = Array.from({ length: 1000 }, (_, i) => i)
 * const chunks = chunkArray(items, 50)
 * 
 * // Render in batches using requestIdleCallback or setTimeout
 * chunks.forEach((chunk, index) => {
 *   setTimeout(() => {
 *     chunk.forEach(item => renderItem(item))
 *   }, index * 16) // ~1 frame delay between batches
 * })
 */
export function chunkArray<T>(array: T[], size: number = 10): T[][] {
  if (size <= 0) throw new Error('Chunk size must be greater than 0')
  
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  
  return chunks
}

/**
 * Schedule work during idle time
 * 
 * Uses requestIdleCallback when available, falls back to setTimeout.
 * Useful for non-critical work that can be deferred.
 * 
 * @param callback - Function to call when browser is idle
 * @param timeout - Maximum time to wait (default: 2000ms)
 * 
 * @example
 * scheduleIdleWork(() => {
 *   analytics.track('page_view', { path: window.location.pathname })
 * })
 */
export function scheduleIdleWork(callback: () => void, timeout: number = 2000): void {
  if (typeof window === 'undefined') {
    callback()
    return
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout })
  } else {
    setTimeout(callback, 1)
  }
}

/**
 * Debounce a function
 * 
 * Delays execution until after wait milliseconds have elapsed since the last call.
 * 
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait (default: 300)
 * @returns Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query) => {
 *   fetchSearchResults(query)
 * }, 500)
 * 
 * // Only executes 500ms after last call
 * debouncedSearch('a')
 * debouncedSearch('ab')
 * debouncedSearch('abc')
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }
}

/**
 * Throttle a function
 * 
 * Ensures the function is called at most once per wait period.
 * 
 * @param func - Function to throttle
 * @param limit - Milliseconds between calls (default: 100)
 * @returns Throttled function
 * 
 * @example
 * const throttledScroll = throttle(() => {
 *   updateScrollPosition()
 * }, 16) // ~60fps
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number = 100
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Get device memory tier
 * 
 * Returns 'low', 'medium', or 'high' based on device memory.
 * Useful for adapting feature set to device capabilities.
 * 
 * @returns Memory tier string
 * 
 * @example
 * const tier = getMemoryTier()
 * if (tier === 'low') {
 *   disableHeavyAnimations()
 * }
 */
export function getMemoryTier(): 'low' | 'medium' | 'high' {
  if (typeof navigator === 'undefined') return 'medium'

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory

  if (!memory) return 'medium'

  if (memory <= 2) return 'low'
  if (memory <= 4) return 'medium'
  return 'high'
}

/**
 * Check if the browser supports a given feature
 * 
 * @param feature - Feature to check
 * @returns boolean indicating support
 * 
 * @example
 * if (supports('IntersectionObserver')) {
 *   // Use native IntersectionObserver
 * }
 */
export function supports(feature: string): boolean {
  if (typeof window === 'undefined') return false

  switch (feature) {
    case 'IntersectionObserver':
      return 'IntersectionObserver' in window
    case 'ResizeObserver':
      return 'ResizeObserver' in window
    case 'MutationObserver':
      return 'MutationObserver' in window
    case 'requestIdleCallback':
      return 'requestIdleCallback' in window
    case 'matchMedia':
      return 'matchMedia' in window
    case 'WebSocket':
      return 'WebSocket' in window
    default:
      return false
  }
}
