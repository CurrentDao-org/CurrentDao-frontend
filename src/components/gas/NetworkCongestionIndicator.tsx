'use client'

import React from 'react'
import { GasFeeEstimate } from '@/types/gas'
import { getNetworkCongestionColor } from '@/utils/gasCalculations'
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, Users, Cpu } from 'lucide-react'

interface NetworkCongestionIndicatorProps {
  estimate: GasFeeEstimate | null
  loading?: boolean
  detailed?: boolean
  className?: string
}

interface CongestionMetrics {
  level: 'low' | 'medium' | 'high'
  score: number
  operationsPerSecond: number
  ledgerUtilization: number
  averageConfirmationTime: number
  trend: 'improving' | 'stable' | 'worsening'
}

export const NetworkCongestionIndicator: React.FC<NetworkCongestionIndicatorProps> = ({ 
  estimate, 
  loading = false,
  detailed = false,
  className = ''
}) => {
  const getCongestionMetrics = (estimate: GasFeeEstimate): CongestionMetrics => {
    const baseScore = estimate.networkCongestion === 'low' ? 20 : 
                     estimate.networkCongestion === 'medium' ? 50 : 80
    
    // Simulate additional metrics based on fee estimate
    const operationsPerSecond = estimate.networkCongestion === 'low' ? 15 :
                               estimate.networkCongestion === 'medium' ? 45 : 85
    
    const ledgerUtilization = estimate.networkCongestion === 'low' ? 0.3 :
                             estimate.networkCongestion === 'medium' ? 0.6 : 0.9
    
    const trend = estimate.confidence > 80 ? 'improving' : 
                 estimate.confidence > 60 ? 'stable' : 'worsening'

    return {
      level: estimate.networkCongestion,
      score: baseScore,
      operationsPerSecond,
      ledgerUtilization,
      averageConfirmationTime: estimate.estimatedTime,
      trend
    }
  }

  const getTrendIcon = (trend: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'stable':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'worsening':
        return <TrendingUp className="w-4 h-4 text-red-600" />
    }
  }

  const getTrendColor = (trend: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return 'text-green-600'
      case 'stable':
        return 'text-blue-600'
      case 'worsening':
        return 'text-red-600'
    }
  }

  const getProgressBarColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'bg-green-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'high':
        return 'bg-red-500'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No congestion data available</p>
        </div>
      </div>
    )
  }

  const metrics = getCongestionMetrics(estimate)

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Activity className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold">Network Congestion</h3>
        </div>
        <div className="flex items-center space-x-2">
          {getTrendIcon(metrics.trend)}
          <span className={`text-sm font-medium ${getTrendColor(metrics.trend)}`}>
            {metrics.trend.charAt(0).toUpperCase() + metrics.trend.slice(1)}
          </span>
        </div>
      </div>

      {/* Main Congestion Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${
              metrics.level === 'low' ? 'bg-green-500' :
              metrics.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-xl font-bold capitalize">
              {metrics.level} Congestion
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {metrics.score}%
            </div>
            <div className="text-sm text-gray-500">Congestion Score</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(metrics.level)}`}
            style={{ width: `${metrics.score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Optimal</span>
          <span>Moderate</span>
          <span>Congested</span>
        </div>
      </div>

      {/* Detailed Metrics */}
      {detailed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Users className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium">Operations/sec</span>
            </div>
            <div className="text-xl font-semibold">
              {metrics.operationsPerSecond}
            </div>
            <div className="text-xs text-gray-500">
              {metrics.operationsPerSecond < 20 ? 'Light load' :
               metrics.operationsPerSecond < 60 ? 'Moderate load' : 'Heavy load'}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Cpu className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium">Ledger Usage</span>
            </div>
            <div className="text-xl font-semibold">
              {Math.round(metrics.ledgerUtilization * 100)}%
            </div>
            <div className="text-xs text-gray-500">
              {metrics.ledgerUtilization < 0.5 ? 'Available capacity' :
               metrics.ledgerUtilization < 0.8 ? 'Moderate usage' : 'Near capacity'}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium">Avg. Confirm Time</span>
            </div>
            <div className="text-xl font-semibold">
              {metrics.averageConfirmationTime}s
            </div>
            <div className="text-xs text-gray-500">
              {metrics.averageConfirmationTime < 30 ? 'Fast' :
               metrics.averageConfirmationTime < 90 ? 'Normal' : 'Slow'}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium">Confidence</span>
            </div>
            <div className="text-xl font-semibold">
              {estimate.confidence}%
            </div>
            <div className="text-xs text-gray-500">
              {estimate.confidence > 80 ? 'High confidence' :
               estimate.confidence > 60 ? 'Moderate confidence' : 'Low confidence'}
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      <div className={`rounded-lg p-4 mb-6 ${
        metrics.level === 'low' ? 'bg-green-50 border border-green-200' :
        metrics.level === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-start">
          <AlertTriangle className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
            metrics.level === 'low' ? 'text-green-600' :
            metrics.level === 'medium' ? 'text-yellow-600' : 'text-red-600'
          }`} />
          <div>
            <h4 className={`font-medium mb-1 ${
              metrics.level === 'low' ? 'text-green-800' :
              metrics.level === 'medium' ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {metrics.level === 'low' ? 'Network is Running Smoothly' :
               metrics.level === 'medium' ? 'Network is Moderately Busy' :
               'Network is Heavily Congested'}
            </h4>
            <p className={`text-sm ${
              metrics.level === 'low' ? 'text-green-700' :
              metrics.level === 'medium' ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {metrics.level === 'low' 
                ? 'Low fees and fast confirmation times. Excellent time for transactions.'
                : metrics.level === 'medium'
                ? 'Moderate fees and reasonable confirmation times. Normal network activity.'
                : 'High fees and slower confirmation times. Consider waiting or using higher fees.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {metrics.level === 'low' && (
            <>
              <div>• Standard fees will be processed quickly</div>
              <div>• Good time for batch transactions</div>
              <div>• No need for priority fees unless urgent</div>
            </>
          )}
          {metrics.level === 'medium' && (
            <>
              <div>• Consider using priority fees for faster processing</div>
              <div>• Monitor network before large transactions</div>
              <div>• Standard fees acceptable for non-urgent transfers</div>
            </>
          )}
          {metrics.level === 'high' && (
            <>
              <div>• Use higher priority fees for urgent transactions</div>
              <div>• Consider waiting for better network conditions</div>
              <div>• Batch transactions to reduce overall costs</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
