'use client'

import React, { useState, useEffect } from 'react'
import { HistoricalFeeData } from '@/types/gas'
import { formatFee, formatTime, calculateOptimalFeeWindow } from '@/utils/gasCalculations'
import { Clock, TrendingDown, Calendar, AlertCircle, ChevronRight, Activity } from 'lucide-react'

interface OptimalTimingProps {
  historicalData: HistoricalFeeData[]
  loading?: boolean
}

interface TimeWindow {
  start: Date
  end: Date
  avgFee: number
  savings: number
  recommendation: string
}

export const OptimalTiming: React.FC<OptimalTimingProps> = ({ 
  historicalData, 
  loading = false 
}) => {
  const [optimalWindows, setOptimalWindows] = useState<TimeWindow[]>([])
  const [currentFee, setCurrentFee] = useState<number>(0)
  const [bestSavings, setBestSavings] = useState<number>(0)

  useEffect(() => {
    if (historicalData && historicalData.length > 0) {
      const windows = calculateOptimalFeeWindow(historicalData)
      const latestFee = historicalData[0]?.baseFee + historicalData[0]?.priorityFee || 0
      
      const enrichedWindows = windows.map(window => ({
        ...window,
        savings: latestFee - window.avgFee,
        recommendation: getRecommendation(window.avgFee, latestFee)
      }))

      setOptimalWindows(enrichedWindows)
      setCurrentFee(latestFee)
      setBestSavings(Math.max(0, enrichedWindows[0]?.savings || 0))
    }
  }, [historicalData])

  const getRecommendation = (optimalFee: number, currentFee: number): string => {
    const savingsPercentage = ((currentFee - optimalFee) / currentFee) * 100
    
    if (savingsPercentage > 30) {
      return 'Excellent timing - significant savings available'
    } else if (savingsPercentage > 15) {
      return 'Good timing - moderate savings available'
    } else if (savingsPercentage > 5) {
      return 'Fair timing - some savings available'
    } else {
      return 'Current timing is optimal'
    }
  }

  const getTimeWindowIcon = (savings: number) => {
    if (savings > 50) return TrendingDown
    if (savings > 20) return Clock
    return Calendar
  }

  const getSavingsColor = (savings: number): string => {
    if (savings > 50) return 'text-green-600 bg-green-100 border-green-200'
    if (savings > 20) return 'text-blue-600 bg-blue-100 border-blue-200'
    if (savings > 0) return 'text-yellow-600 bg-yellow-100 border-yellow-200'
    return 'text-gray-600 bg-gray-100 border-gray-200'
  }

  const formatTimeWindow = (start: Date, end: Date): string => {
    const startHour = start.getHours()
    const endHour = end.getHours()
    
    if (startHour === 0 && endHour === 23) {
      return 'All day'
    }
    
    const formatHour = (hour: number) => {
      const period = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${displayHour}${period}`
    }
    
    return `${formatHour(startHour)} - ${formatHour(endHour)}`
  }

  const getNextOptimalWindow = (): TimeWindow | null => {
    if (optimalWindows.length === 0) return null
    
    const now = new Date()
    const currentHour = now.getHours()
    
    // Find the next optimal window from current time
    for (const window of optimalWindows) {
      const windowHour = window.start.getHours()
      
      if (windowHour > currentHour || 
          (windowHour <= currentHour && window.savings > 0)) {
        return window
      }
    }
    
    return optimalWindows[0] // Return the best option if none found
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No timing data available</p>
        </div>
      </div>
    )
  }

  const nextWindow = getNextOptimalWindow()

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold">Optimal Transaction Timing</h3>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Activity className="w-4 h-4 mr-1" />
          <span>Based on {historicalData.length} data points</span>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Current Fee</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatFee(currentFee)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Potential Savings</div>
            <div className={`text-2xl font-bold ${bestSavings > 0 ? 'text-green-600' : 'text-gray-600'}`}>
              {bestSavings > 0 ? `-${formatFee(bestSavings)}` : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Next Optimal Window */}
      {nextWindow && nextWindow.savings > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800 mb-1">
                Next Best Time: {formatTimeWindow(nextWindow.start, nextWindow.end)}
              </h4>
              <p className="text-sm text-green-700 mb-2">
                {nextWindow.recommendation}
              </p>
              <div className="flex items-center text-sm text-green-600">
                <span>Save {formatFee(nextWindow.savings)} ({((nextWindow.savings / currentFee) * 100).toFixed(1)}%)</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimal Time Windows */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Best Time Windows (24h)</h4>
        
        {optimalWindows.map((window, index) => {
          const Icon = getTimeWindowIcon(window.savings)
          const colorClass = getSavingsColor(window.savings)
          const isBest = index === 0 && window.savings > 0
          
          return (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                isBest ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="font-medium">
                        {formatTimeWindow(window.start, window.end)}
                      </span>
                      {isBest && (
                        <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                          Best
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg fee: {formatFee(window.avgFee)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {window.savings > 0 ? (
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        -{formatFee(window.savings)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((window.savings / currentFee) * 100).toFixed(1)}% saved
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No savings
                    </div>
                  )}
                </div>
              </div>
              
              {window.savings > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {window.recommendation}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Timing Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Timing Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></div>
            <div>
              <div className="font-medium text-gray-700">Peak Hours</div>
              <div className="text-gray-600">9 AM - 5 PM typically show higher fees</div>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5"></div>
            <div>
              <div className="font-medium text-gray-700">Off-Peak Hours</div>
              <div className="text-gray-600">Late night and early morning offer best rates</div>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 mt-1.5"></div>
            <div>
              <div className="font-medium text-gray-700">Weekend Pattern</div>
              <div className="text-gray-600">Saturday-Sunday usually have lower activity</div>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 mt-1.5"></div>
            <div>
              <div className="font-medium text-gray-700">Network Events</div>
              <div className="text-gray-600">Major announcements can cause temporary spikes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Pro Tip:</strong> Schedule non-urgent transactions during optimal windows 
            to maximize savings. Set up alerts to notify you when fees drop below your threshold.
          </div>
        </div>
      </div>
    </div>
  )
}
