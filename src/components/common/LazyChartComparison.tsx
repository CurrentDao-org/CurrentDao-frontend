'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

/**
 * Lazy-loaded ChartComparison component
 * 
 * WHY LAZY LOADED:
 * - ~12KB component with complex modal and data visualization
 * - Uses recharts library (heavy charting dependency)
 * - Only shown when user clicks "Add Comparison" button
 * - Not visible above the fold
 * 
 * Usage: Rendered in analytics pages below the fold
 */
export const LazyChartComparison = dynamic(
  () => import('@/components/charts/ChartComparison').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[200px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading chart comparison...</span>
      </div>
    ),
    ssr: false, // Chart components use browser-only APIs
  }
)

/**
 * Default export for convenient importing
 */
export default LazyChartComparison
