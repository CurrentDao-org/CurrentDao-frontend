'use client'

import React from 'react'
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react'
import { useOfflineMode } from '../hooks/useOfflineMode'
import { motion, AnimatePresence } from 'framer-motion'

export function OfflineIndicator() {
  const { isOnline, pendingCount, failedCount, startSync } = useOfflineMode()

  if (isOnline && pendingCount === 0 && failedCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`flex flex-col gap-2 p-4 rounded-xl shadow-2xl border transition-colors ${
            isOnline ? 'bg-white border-blue-200' : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-blue-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-orange-600" />
            )}
            <span className={`font-semibold ${isOnline ? 'text-blue-900' : 'text-orange-900'}`}>
              {isOnline ? 'Online' : 'Offline Mode Active'}
            </span>
          </div>

          {(pendingCount > 0 || failedCount > 0) && (
            <div className="space-y-2 mt-2">
              {pendingCount > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{pendingCount} pending trades</span>
                  </div>
                  {isOnline && (
                    <button
                      onClick={() => startSync()}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 underline uppercase tracking-tight"
                    >
                      Sync Now
                    </button>
                  )}
                </div>
              )}

              {failedCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{failedCount} trades failed to sync</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
