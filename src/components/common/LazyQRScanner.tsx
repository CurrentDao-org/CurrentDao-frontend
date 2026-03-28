'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

/**
 * Lazy-loaded QRScanner component
 * 
 * WHY LAZY LOADED:
 * - Uses html5-qrcode library (~60KB gzipped)
 * - Only needed when user initiates QR scanning
 * - Heavy camera access and image processing code
 * - Not needed on initial page load
 * 
 * Usage: Only rendered when user clicks "Scan QR" button
 */
export const LazyQRScanner = dynamic(
  () => import('@/components/QRScanner').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading QR scanner...</span>
      </div>
    ),
    ssr: false, // QR scanner requires browser APIs
  }
)

/**
 * Default export for convenient importing
 */
export default LazyQRScanner
