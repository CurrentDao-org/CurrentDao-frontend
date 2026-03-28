'use client'

import { useState, useEffect, useRef, useCallback, ComponentType, RefObject } from 'react'
import { useRouter } from 'next/navigation'

// Network Information API type
type NetworkInformationType = {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  saveData?: boolean
}

// Global observer pool to prevent creating multiple observers
const observerPool = new Map<string, IntersectionObserver>()

function getObserverKey(options: IntersectionObserverInit): string {
  return `${options.rootMargin || '0px'}-${options.threshold || 0}`
}

function getOrCreateObserver(
  options: IntersectionObserverInit,
  callback: (entries: IntersectionObserverEntry[]) => void
): IntersectionObserver {
  const key = getObserverKey(options)
  
  if (!observerPool.has(key)) {
    const observer = new IntersectionObserver(callback, options)
    observerPool.set(key, observer)
  }
  
  return observerPool.get(key)!
}

interface UseIntersectionObserverReturn {
  /** Ref to attach to the target element */
  ref: RefObject<Element>
  /** Whether the element has intersected with the viewport */
  isVisible: boolean
}

/**
 * useIntersectionObserver
 * 
 * Returns a ref and boolean indicating whether the element has intersected.
 * Uses a single shared IntersectionObserver instance per set of options.
 * Disconnects when the component unmounts.
 * Once intersected (isVisible=true), stops observing (fire-once behavior).
 * 
 * @param options - IntersectionObserverInit options
 * @returns Object containing ref and isVisible boolean
 * 
 * @example
 * const { ref, isVisible } = useIntersectionObserver({ rootMargin: '200px' })
 * 
 * return (
 *   <div ref={ref}>
 *     {isVisible ? <HeavyContent /> : <Skeleton />}
 *   </div>
 * )
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): UseIntersectionObserverReturn {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<Element>(null)
  const hasIntersected = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hasIntersected.current) return

    const element = ref.current
    if (!element) return

    const observer = getOrCreateObserver(options, (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasIntersected.current) {
          hasIntersected.current = true
          setIsVisible(true)
          // Stop observing this element
          observer.unobserve(entry.target)
        }
      })
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options])

  return { ref, isVisible }
}

interface UseLazyComponentReturn<T> {
  /** The loaded component (null until loaded) */
  Component: ComponentType<T> | null
  /** Ref to attach to the container element */
  ref: RefObject<Element>
  /** Whether the component has been loaded */
  isLoaded: boolean
}

/**
 * useLazyComponent
 * 
 * Loads a component only when its container enters the viewport.
 * Calls loader() when intersection fires, then renders the component.
 * Returns null Component until loaded.
 * 
 * @param loader - Dynamic import function
 * @param options - Intersection observer options
 * @returns Object containing Component, ref, and isLoaded state
 * 
 * @example
 * const { Component, ref, isLoaded } = useLazyComponent(
 *   () => import('@/components/heavy/Chart'),
 *   { rootMargin: '100px' }
 * )
 * 
 * return (
 *   <div ref={ref}>
 *     {isLoaded && Component ? <Component data={data} /> : <Skeleton />}
 *   </div>
 * )
 */
export function useLazyComponent<T extends Record<string, unknown>>(
  loader: () => Promise<{ default: ComponentType<T> }>,
  options: { rootMargin?: string; threshold?: number } = {}
): UseLazyComponentReturn<T> {
  const [Component, setComponent] = useState<ComponentType<T> | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { ref, isVisible } = useIntersectionObserver({
    rootMargin: options.rootMargin || '200px',
    threshold: options.threshold || 0,
  })

  useEffect(() => {
    if (isVisible && !isLoaded) {
      loader()
        .then((module) => {
          setComponent(() => module.default)
          setIsLoaded(true)
        })
        .catch((error) => {
          console.error('Failed to load lazy component:', error)
        })
    }
  }, [isVisible, isLoaded, loader])

  return { Component, ref, isLoaded }
}

/**
 * usePerformanceMark
 * 
 * Marks a component's render time for Performance API.
 * Calls performance.mark(`${name}:start`) on mount.
 * Calls performance.mark(`${name}:end`) when isReady becomes true.
 * 
 * @param name - Unique identifier for the performance mark
 * @param isReady - Optional flag to indicate when the meaningful render is complete
 * 
 * @example
 * function MyComponent({ data }) {
 *   usePerformanceMark('MyComponent', !!data)
 *   
 *   return <div>{data ? <Content /> : <Skeleton />}</div>
 * }
 */
export function usePerformanceMark(name: string, isReady?: boolean): void {
  useEffect(() => {
    if (typeof performance === 'undefined') return
    
    const startMark = `${name}:start`
    const endMark = `${name}:end`
    
    // Clear any existing marks
    performance.clearMarks(startMark)
    performance.clearMarks(endMark)
    
    // Mark start
    performance.mark(startMark)
    
    return () => {
      performance.clearMarks(startMark)
      performance.clearMarks(endMark)
    }
  }, [name])

  useEffect(() => {
    if (typeof performance === 'undefined') return
    if (isReady === undefined) return
    
    const endMark = `${name}:end`
    
    if (isReady) {
      performance.mark(endMark)
      
      // Measure and log
      try {
        performance.measure(`${name}-render`, `${name}:start`, endMark)
        const entries = performance.getEntriesByName(`${name}-render`)
        if (entries.length > 0) {
          console.log(`[Performance] ${name} rendered in ${entries[0].duration.toFixed(2)}ms`)
        }
      } catch (e) {
        // Measurement might fail if marks don't exist
      }
    }
  }, [name, isReady])
}

interface UsePrefetchReturn {
  /** Call on mouse enter to prefetch */
  onMouseEnter: () => void
  /** Call on focus to prefetch */
  onFocus: () => void
}

// Debounce helper
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

// Helper to determine asset type for prefetch
function getAssetType(href: string): string {
  const ext = href.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'js':
      return 'script'
    case 'css':
      return 'style'
    case 'woff':
    case 'woff2':
    case 'ttf':
    case 'otf':
      return 'font'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'avif':
      return 'image'
    default:
      return 'fetch'
  }
}

/**
 * usePrefetch
 * 
 * Prefetches a route or resource on hover/focus.
 * Uses Next.js router.prefetch() for routes.
 * Uses <link rel="prefetch"> injection for static assets.
 * Debounces to avoid prefetching on accidental hover (150ms delay).
 * No-ops on slow connections (navigator.connection.effectiveType === '2g'|'slow-2g').
 * 
 * @param href - Route or URL to prefetch
 * @returns Object with onMouseEnter and onFocus handlers
 * 
 * @example
 * const { onMouseEnter, onFocus } = usePrefetch('/dashboard')
 * 
 * return (
 *   <Link href="/dashboard">
 *     <a onMouseEnter={onMouseEnter} onFocus={onFocus}>Dashboard</a>
 *   </Link>
 * )
 */
export function usePrefetch(href: string): UsePrefetchReturn {
  const router = useRouter()
  const hasPrefetched = useRef(false)

  const prefetch = useCallback(() => {
    // Check for slow connection
    if (typeof navigator !== 'undefined') {
      const connection = (navigator as Navigator & { connection?: NetworkInformationType }).connection
      if (connection) {
        const effectiveType = connection.effectiveType
        if (effectiveType === '2g' || effectiveType === 'slow-2g') {
          return
        }
      }
    }

    if (hasPrefetched.current) return
    hasPrefetched.current = true

    // Determine if this is a route or static asset
    const isStaticAsset = href.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2)$/)
    const isExternal = href.startsWith('http')

    if (isStaticAsset || isExternal) {
      // Prefetch static asset via link tag
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href
      link.as = isStaticAsset ? getAssetType(href) : undefined
      if (isExternal) {
        link.crossOrigin = 'anonymous'
      }
      document.head.appendChild(link)
    } else {
      // Prefetch route via Next.js router
      router.prefetch(href)
    }
  }, [href, router])

  const debouncedPrefetch = useCallback(
    debounce(prefetch, 150),
    [prefetch]
  )

  return {
    onMouseEnter: debouncedPrefetch,
    onFocus: debouncedPrefetch,
  }
}

// Re-export all hooks
export { useIntersectionObserver as default }
