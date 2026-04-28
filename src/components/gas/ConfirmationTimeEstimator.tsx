'use client'

import React from 'react'
import { SpeedCostOption } from '@/types/gas'
import { formatFee, formatTime } from '@/utils/gasCalculations'
import { Clock, Timer, Zap, Turtle, Rabbit, Cheetah, Rocket, BarChart3 } from 'lucide-react'

interface ConfirmationTimeEstimatorProps {
  options: SpeedCostOption[]
  currentNetworkCongestion: 'low' | 'medium' | 'high'
  loading?: boolean
  className?: string
}

interface TimeEstimate {
  tier: string
  minTime: number
  avgTime: number
  maxTime: number
  confidence: number
  fee: number
  description: string
}

export const ConfirmationTimeEstimator: React.FC<ConfirmationTimeEstimatorProps> = ({ 
  options, 
  currentNetworkCongestion,
  loading = false,
  className = ''
}) => {
  const getTimeEstimates = (options: SpeedCostOption[], congestion: 'low' | 'medium' | 'high'): TimeEstimate[] => {
    const congestionMultiplier = congestion === 'low' ? 0.7 : congestion === 'medium' ? 1 : 1.5
    
    return options.map(option => {
      const baseTime = option.estimatedTime
      const avgTime = Math.round(baseTime * congestionMultiplier)
      const minTime = Math.round(avgTime * 0.7)
      const maxTime = Math.round(avgTime * 1.5)
      
      return {
        tier: option.name,
        minTime,
        avgTime,
        maxTime,
        confidence: option.confidence,
        fee: option.fee,
        description: option.description
      }
    })
  }

  const getIconForTier = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'slow':
        return Turtle
      case 'standard':
        return Rabbit
      case 'fast':
        return Cheetah
      case 'maximum':
        return Rocket
      default:
        return Clock
    }
  }

  const getTimeColor = (time: number, maxTime: number): string => {
    const percentage = (time / maxTime) * 100
    if (percentage <= 25) return 'text-green-600 bg-green-100'
    if (percentage <= 50) return 'text-blue-600 bg-blue-100'
    if (percentage <= 75) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getProgressBarColor = (tier: string): string => {
    switch (tier.toLowerCase()) {
      case 'slow':
        return 'bg-green-500'
      case 'standard':
        return 'bg-blue-500'
      case 'fast':
        return 'bg-purple-500'
      case 'maximum':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!options || options.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Timer className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No time estimates available</p>
        </div>
      </div>
    )
  }

  const timeEstimates = getTimeEstimates(options, currentNetworkCongestion)
  const maxTime = Math.max(...timeEstimates.map(estimate => estimate.maxTime))

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Timer className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold">Confirmation Time Estimates</h3>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          <span>Network: {currentNetworkCongestion}</span>
        </div>
      </div>

      {/* Network Status Banner */}
      <div className={`rounded-lg p-4 mb-6 ${
        currentNetworkCongestion === 'low' ? 'bg-green-50 border border-green-200' :
        currentNetworkCongestion === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${
              currentNetworkCongestion === 'low' ? 'text-green-800' :
              currentNetworkCongestion === 'medium' ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {currentNetworkCongestion === 'low' ? 'Fast Network Conditions' :
               currentNetworkCongestion === 'medium' ? 'Moderate Network Activity' :
               'High Network Congestion'}
            </div>
            <div className={`text-sm mt-1 ${
              currentNetworkCongestion === 'low' ? 'text-green-700' :
              currentNetworkCongestion === 'medium' ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {currentNetworkCongestion === 'low' 
                ? 'Transactions are processing faster than usual'
                : currentNetworkCongestion === 'medium'
                ? 'Normal processing times expected'
                : 'Processing times are longer than usual'
              }
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {currentNetworkCongestion === 'low' ? '~30s' :
               currentNetworkCongestion === 'medium' ? '~60s' : '~120s'}
            </div>
            <div className="text-sm text-gray-500">Average time</div>
          </div>
        </div>
      </div>

      {/* Time Estimate Cards */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Fee Tier Estimates</h4>
        
        {timeEstimates.map((estimate, index) => {
          const Icon = getIconForTier(estimate.tier)
          const timeColor = getTimeColor(estimate.avgTime, maxTime)
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${getProgressBarColor(estimate.tier)} bg-opacity-20`}>
                    <Icon className={`w-5 h-5 ${getProgressBarColor(estimate.tier).replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{estimate.tier}</div>
                    <div className="text-sm text-gray-600">{estimate.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatFee(estimate.fee)}
                  </div>
                  <div className="text-sm text-gray-500">Fee</div>
                </div>
              </div>

              {/* Time Range Visualization */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Confirmation Time</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${timeColor}`}>
                    {formatTime(estimate.avgTime)}
                  </span>
                </div>
                
                {/* Time Range Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="relative h-2 rounded-full">
                      {/* Min time indicator */}
                      <div 
                        className="absolute h-2 bg-green-400 rounded-l-full"
                        style={{ width: `${(estimate.minTime / maxTime) * 100}%` }}
                      />
                      {/* Avg time indicator */}
                      <div 
                        className="absolute h-2 bg-blue-500"
                        style={{ 
                          left: `${(estimate.minTime / maxTime) * 100}%`,
                          width: `${((estimate.avgTime - estimate.minTime) / maxTime) * 100}%`
                        }}
                      />
                      {/* Max time indicator */}
                      <div 
                        className="absolute h-2 bg-yellow-500 rounded-r-full"
                        style={{ 
                          left: `${(estimate.avgTime / maxTime) * 100}%`,
                          width: `${((estimate.maxTime - estimate.avgTime) / maxTime) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Time labels */}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatTime(estimate.minTime)}</span>
                    <span>{formatTime(estimate.avgTime)}</span>
                    <span>{formatTime(estimate.maxTime)}</span>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Min:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {formatTime(estimate.minTime)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Average:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {formatTime(estimate.avgTime)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Max:</span>
                  <span className="ml-2 font-medium text-yellow-600">
                    {formatTime(estimate.maxTime)}
                  </span>
                </div>
              </div>

              {/* Confidence Indicator */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confidence Level</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${estimate.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{estimate.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Time Comparison Chart */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Time vs Cost Analysis</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-2">Fastest Confirmation</div>
              <div className="flex items-center">
                <Rocket className="w-4 h-4 text-red-600 mr-2" />
                <span className="font-medium">{formatTime(Math.min(...timeEstimates.map(e => e.minTime)))}</span>
                <span className="text-gray-500 ml-2">
                  ({formatFee(Math.max(...timeEstimates.map(e => e.fee)))})
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Most Economical</div>
              <div className="flex items-center">
                <Turtle className="w-4 h-4 text-green-600 mr-2" />
                <span className="font-medium">{formatFee(Math.min(...timeEstimates.map(e => e.fee)))}</span>
                <span className="text-gray-500 ml-2">
                  ({formatTime(Math.max(...timeEstimates.map(e => e.maxTime)))})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <Clock className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Time Tip:</strong> 
            {currentNetworkCongestion === 'low' 
              ? ' Network is fast - even standard fees will be processed quickly.'
              : currentNetworkCongestion === 'medium'
              ? ' Consider priority fees for time-sensitive transactions.'
              : ' Expect delays - use higher fees or wait for better conditions.'
            }
          </div>
        </div>
      </div>
    </div>
  )
}
