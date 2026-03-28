'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

/**
 * Lazy-loaded DrawingTools component
 * 
 * WHY LAZY LOADED:
 * - ~11KB interactive SVG component with mouse event handlers
 * - Complex drawing and interaction logic
 * - Only used in advanced chart analysis mode
 * - Not needed for basic chart viewing
 * 
 * Usage: Only rendered when user enables drawing mode in charts
 */
export const LazyDrawingTools = dynamic(
  () => import('@/components/charts/DrawingTools').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading drawing tools...</span>
      </div>
    ),
    ssr: false, // Drawing tools require DOM manipulation
  }
)

/**
 * Default export for convenient importing
 */
export default LazyDrawingTools
