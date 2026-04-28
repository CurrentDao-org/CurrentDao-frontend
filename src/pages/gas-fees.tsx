'use client'

import React from 'react'
import { GasFeeTracker } from '@/components/gas/GasFeeTracker'

export default function GasFeesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <GasFeeTracker network="mainnet" />
      </div>
    </div>
  )
}
