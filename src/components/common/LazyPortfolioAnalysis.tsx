'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

/**
 * Lazy-loaded PortfolioAnalysis component
 * 
 * WHY LAZY LOADED:
 * - Uses recharts library for multiple complex charts
 * - Heavy data processing and visualization code (~15KB)
 * - Only shown on risk management page
 * - Not visible above the fold - appears in tabs
 * 
 * Usage: Rendered in risk dashboard below the fold
 */
export const LazyPortfolioAnalysis = dynamic(
  () => import('@/components/risk/PortfolioAnalysis').then(mod => ({ default: mod.PortfolioAnalysis })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading portfolio analysis...</span>
      </div>
    ),
    ssr: false, // Charts require browser environment
  }
)

/**
 * Default export for convenient importing
 */
export default LazyPortfolioAnalysis
