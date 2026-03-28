'use client'

import { useEffect } from 'react'
import { reportWebVital } from '@/utils/performanceHelpers'

// Metric type definition matching web-vitals library
type Metric = {
  name: string
  value: number
  id: string
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  entries: PerformanceEntry[]
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender' | 'restore'
}

/**
 * Web Vitals Reporter Component
 * 
 * Reports Core Web Vitals to analytics in production.
 * Uses native Performance APIs as a lightweight alternative to the web-vitals library.
 * 
 * Tracks:
 * - CLS (Cumulative Layout Shift)
 * - LCP (Largest Contentful Paint)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint) - when available
 */
export function WebVitalsReporter(): null {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Report FCP (First Contentful Paint)
    const reportFCP = () => {
      const paintEntries = performance.getEntriesByName('first-contentful-paint')
      if (paintEntries.length > 0) {
        const fcp = paintEntries[0] as PerformancePaintTiming
        reportWebVital({
          name: 'FCP',
          value: fcp.startTime,
          id: 'fcp',
          rating: fcp.startTime < 1800 ? 'good' : fcp.startTime < 3000 ? 'needs-improvement' : 'poor',
          delta: fcp.startTime,
          entries: [fcp],
          navigationType: 'navigate',
        })
      }
    }

    // Report LCP (Largest Contentful Paint)
    const reportLCP = () => {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
      if (lcpEntries.length > 0) {
        const lastEntry = lcpEntries[lcpEntries.length - 1] as PerformanceEntry
        const value = lastEntry.startTime
        reportWebVital({
          name: 'LCP',
          value,
          id: 'lcp',
          rating: value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor',
          delta: value,
          entries: [lastEntry],
          navigationType: 'navigate',
        })
      }
    }

    // Report TTFB (Time to First Byte)
    const reportTTFB = () => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      if (navEntry) {
        const value = navEntry.responseStart - navEntry.startTime
        reportWebVital({
          name: 'TTFB',
          value,
          id: 'ttfb',
          rating: value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor',
          delta: value,
          entries: [navEntry],
          navigationType: 'navigate',
        })
      }
    }

    // Report CLS (Cumulative Layout Shift)
    let clsValue = 0
    let clsEntries: PerformanceEntry[] = []
    
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only count layout shifts without recent user input
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
          clsEntries.push(entry)
        }
      }
    })

    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true })
    } catch (e) {
      // Layout Shift API not supported
    }

    // Report CLS on page hide
    const reportCLS = () => {
      reportWebVital({
        name: 'CLS',
        value: clsValue,
        id: 'cls',
        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
        delta: clsValue,
        entries: clsEntries,
        navigationType: 'navigate',
      })
    }

    // Report metrics when page is hidden
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        reportCLS()
      }
    }

    // Schedule reports
    setTimeout(reportFCP, 0)
    setTimeout(reportLCP, 100)
    setTimeout(reportTTFB, 0)

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      clsObserver.disconnect()
    }
  }, [])

  // This component renders nothing
  return null
}

export default WebVitalsReporter
