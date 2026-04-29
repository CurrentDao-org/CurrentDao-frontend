'use client'

import React, { useState, useEffect } from 'react'
import { GasFeeEstimate, HistoricalFeeData, FeeAlert, SpeedCostOption } from '@/types/gas'
import { getSpeedCostOptions, generateHistoricalData } from '@/utils/gasCalculations'
import mainnetHorizonService from '@/services/stellarHorizon'

// Import all gas components
import { GasEstimator } from './GasEstimator'
import { FeeHistory } from './FeeHistory'
import { FeeAlerts } from './FeeAlerts'
import { OptimalTiming } from './OptimalTiming'
import { NetworkCongestionIndicator } from './NetworkCongestionIndicator'
import { ConfirmationTimeEstimator } from './ConfirmationTimeEstimator'
import { SpeedCostSlider } from './SpeedCostSlider'
import { FeeOptimizer } from './FeeOptimizer'

interface GasFeeTrackerProps {
  network?: 'mainnet' | 'testnet'
  className?: string
}

export const GasFeeTracker: React.FC<GasFeeTrackerProps> = ({ 
  network = 'mainnet',
  className = ''
}) => {
  const [currentEstimate, setCurrentEstimate] = useState<GasFeeEstimate | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalFeeData[]>([])
  const [alerts, setAlerts] = useState<FeeAlert[]>([])
  const [speedOptions, setSpeedOptions] = useState<SpeedCostOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [refreshInterval, setRefreshInterval] = useState<number>(30000) // 30 seconds

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch current fee estimate
        const estimate = await mainnetHorizonService.getFeeEstimate()
        setCurrentEstimate(estimate)

        // Fetch historical data
        const historical = await mainnetHorizonService.getHistoricalFees(24)
        setHistoricalData(historical)

        // Generate speed options based on current network congestion
        const options = getSpeedCostOptions(estimate.networkCongestion)
        setSpeedOptions(options)

        // Generate initial alerts
        generateAlerts(estimate, historical)

      } catch (err) {
        console.error('Failed to fetch gas data:', err)
        setError('Failed to load gas fee data')
        
        // Fallback to generated data
        const fallbackData = generateHistoricalData(1)
        setHistoricalData(fallbackData)
        
        if (fallbackData.length > 0) {
          const latest = fallbackData[0]
          const fallbackEstimate = {
            baseFee: latest.baseFee,
            priorityFee: latest.priorityFee,
            maxFee: latest.baseFee + latest.priorityFee + 100,
            estimatedTime: latest.networkCongestion === 'low' ? 30 : latest.networkCongestion === 'medium' ? 60 : 120,
            confidence: 75,
            networkCongestion: latest.networkCongestion,
            timestamp: new Date()
          }
          setCurrentEstimate(fallbackEstimate)
          setSpeedOptions(getSpeedCostOptions(latest.networkCongestion))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [network])

  // Set up auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return

    const interval = setInterval(async () => {
      try {
        const estimate = await mainnetHorizonService.getFeeEstimate()
        setCurrentEstimate(estimate)
        
        const historical = await mainnetHorizonService.getHistoricalFees(24)
        setHistoricalData(historical)
        
        setSpeedOptions(getSpeedCostOptions(estimate.networkCongestion))
        generateAlerts(estimate, historical)
      } catch (err) {
        console.error('Failed to refresh data:', err)
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, network])

  const generateAlerts = (estimate: GasFeeEstimate, historical: HistoricalFeeData[]) => {
    const newAlerts: FeeAlert[] = []
    const now = new Date()

    // Check for optimal window
    if (estimate.networkCongestion === 'low' && estimate.baseFee < 100) {
      newAlerts.push({
        id: `optimal_${now.getTime()}`,
        type: 'optimal_window',
        message: 'Network conditions are optimal for transactions with low fees',
        timestamp: now,
        acknowledged: false,
        feeData: estimate
      })
    }

    // Check for congestion spike
    if (estimate.networkCongestion === 'high') {
      newAlerts.push({
        id: `congestion_${now.getTime()}`,
        type: 'congestion_spike',
        message: 'Network is experiencing high congestion. Consider waiting or using higher fees.',
        timestamp: now,
        acknowledged: false,
        feeData: estimate
      })
    }

    // Check for fee drop (compare with historical average)
    if (historical.length > 10) {
      const recentAvg = historical.slice(0, 10).reduce((sum, d) => sum + d.baseFee, 0) / 10
      const dropPercentage = ((recentAvg - estimate.baseFee) / recentAvg) * 100
      
      if (dropPercentage > 15) {
        newAlerts.push({
          id: `fee_drop_${now.getTime()}`,
          type: 'fee_drop',
          message: `Fees have dropped by ${dropPercentage.toFixed(1)}% compared to recent average`,
          timestamp: now,
          acknowledged: false,
          feeData: estimate
        })
      }
    }

    setAlerts(prev => [...newAlerts, ...prev.filter(alert => 
      now.getTime() - alert.timestamp.getTime() < 3600000 // Keep alerts for 1 hour
    )].slice(0, 10)) // Keep max 10 alerts
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const [estimate, historical] = await Promise.all([
        mainnetHorizonService.getFeeEstimate(),
        mainnetHorizonService.getHistoricalFees(24)
      ])
      
      setCurrentEstimate(estimate)
      setHistoricalData(historical)
      setSpeedOptions(getSpeedCostOptions(estimate.networkCongestion))
      generateAlerts(estimate, historical)
    } catch (err) {
      console.error('Failed to refresh data:', err)
      setError('Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }

  if (error && !currentEstimate) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-red-600">
          <div className="text-lg font-medium mb-2">Error Loading Gas Fee Tracker</div>
          <div className="text-sm mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gas Fee Tracker</h1>
            <p className="text-gray-600 mt-1">
              Real-time Stellar network fees and optimal transaction timing
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Network</div>
              <div className="font-medium capitalize">{network}</div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Gas Estimate */}
        <GasEstimator 
          estimate={currentEstimate} 
          loading={loading} 
          error={error}
        />

        {/* Network Congestion Indicator */}
        {currentEstimate && (
          <NetworkCongestionIndicator 
            estimate={currentEstimate}
            loading={loading}
            detailed={true}
          />
        )}
      </div>

      {/* Fee History Chart */}
      <FeeHistory 
        data={historicalData}
        loading={loading}
        timeRange={selectedTimeRange}
        onTimeRangeChange={setSelectedTimeRange}
      />

      {/* Optimal Timing and Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OptimalTiming 
          historicalData={historicalData}
          loading={loading}
        />

        <FeeAlerts 
          alerts={alerts}
          currentFee={currentEstimate}
          onAcknowledge={handleAcknowledgeAlert}
          onDismiss={handleDismissAlert}
        />
      </div>

      {/* Speed Cost Options */}
      {speedOptions.length > 0 && currentEstimate && (
        <SpeedCostSlider 
          options={speedOptions}
        />
      )}

      {/* Confirmation Time Estimates */}
      {speedOptions.length > 0 && currentEstimate && (
        <ConfirmationTimeEstimator 
          options={speedOptions}
          currentNetworkCongestion={currentEstimate.networkCongestion}
          loading={loading}
        />
      )}

      {/* Fee Optimizer */}
      <FeeOptimizer 
        loading={loading}
        onOptimize={(currentFee, targetTime) => {
          // Handle fee optimization
          console.log('Optimize fee:', currentFee, targetTime)
        }}
      />

      {/* Footer with Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <div>Last updated: {currentEstimate ? currentEstimate.timestamp.toLocaleTimeString() : 'Never'}</div>
            <div>Auto-refresh: Every {refreshInterval / 1000}s</div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-sm">
              <span className="mr-2">Auto-refresh:</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value="0">Off</option>
                <option value="15000">15s</option>
                <option value="30000">30s</option>
                <option value="60000">1m</option>
                <option value="300000">5m</option>
              </select>
            </label>
            <button
              onClick={() => mainnetHorizonService.clearCache()}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
