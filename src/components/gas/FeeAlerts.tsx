'use client'

import React, { useState, useEffect } from 'react'
import { FeeAlert, GasFeeEstimate } from '@/types/gas'
import { formatTime, formatFee } from '@/utils/gasCalculations'
import { Bell, BellOff, TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, Settings, X } from 'lucide-react'

interface FeeAlertThreshold {
  id: string
  type: 'fee_drop' | 'congestion_spike' | 'optimal_window'
  enabled: boolean
  threshold?: number
  name: string
  description: string
}

interface FeeAlertsProps {
  alerts: FeeAlert[]
  currentFee?: GasFeeEstimate | null
  onAcknowledge?: (alertId: string) => void
  onDismiss?: (alertId: string) => void
  onThresholdUpdate?: (thresholds: FeeAlertThreshold[]) => void
  className?: string
}

export const FeeAlerts: React.FC<FeeAlertsProps> = ({ 
  alerts, 
  currentFee,
  onAcknowledge,
  onDismiss,
  onThresholdUpdate,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false)
  const [thresholds, setThresholds] = useState<FeeAlertThreshold[]>([
    {
      id: 'fee_drop_10',
      type: 'fee_drop',
      enabled: true,
      threshold: 10,
      name: 'Fee Drop > 10%',
      description: 'Notify when fees drop by more than 10%'
    },
    {
      id: 'optimal_window',
      type: 'optimal_window',
      enabled: true,
      name: 'Optimal Fee Window',
      description: 'Notify about optimal transaction timing'
    },
    {
      id: 'congestion_spike',
      type: 'congestion_spike',
      enabled: true,
      name: 'Network Congestion',
      description: 'Notify when network becomes highly congested'
    }
  ])

  useEffect(() => {
    if (onThresholdUpdate) {
      onThresholdUpdate(thresholds)
    }
  }, [thresholds, onThresholdUpdate])

  const toggleThreshold = (id: string) => {
    setThresholds(prev => prev.map(threshold => 
      threshold.id === id ? { ...threshold, enabled: !threshold.enabled } : threshold
    ))
  }

  const updateThreshold = (id: string, threshold: number) => {
    setThresholds(prev => prev.map(threshold => 
      threshold.id === id ? { ...threshold, threshold } : threshold
    ))
  }
  const getAlertIcon = (type: FeeAlert['type']) => {
    switch (type) {
      case 'optimal_window':
        return TrendingDown
      case 'congestion_spike':
        return TrendingUp
      case 'fee_drop':
        return Clock
      default:
        return Bell
    }
  }

  const getAlertColor = (type: FeeAlert['type']) => {
    switch (type) {
      case 'optimal_window':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'congestion_spike':
        return 'text-red-600 bg-red-100 border-red-200'
      case 'fee_drop':
        return 'text-blue-600 bg-blue-100 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getAlertTitle = (type: FeeAlert['type']) => {
    switch (type) {
      case 'optimal_window':
        return 'Optimal Transaction Window'
      case 'congestion_spike':
        return 'Network Congestion Spike'
      case 'fee_drop':
        return 'Fee Drop Detected'
      default:
        return 'Fee Alert'
    }
  }

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged)
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged)

  if (alerts.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <BellOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No fee alerts at this time</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bell className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold">Fee Alerts</h3>
          {unacknowledgedAlerts.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {unacknowledgedAlerts.length} new
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => alerts.forEach(alert => onAcknowledge?.(alert.id))}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Unacknowledged Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium text-gray-700">New Alerts</h4>
          {unacknowledgedAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.type)
            const colorClass = getAlertColor(alert.type)
            
            return (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${colorClass}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <Icon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h5 className="font-medium">{getAlertTitle(alert.type)}</h5>
                        <span className="ml-2 text-xs opacity-75">
                          {formatTime(Date.now() - alert.timestamp.getTime())} ago
                        </span>
                      </div>
                      <p className="text-sm opacity-90">{alert.message}</p>
                      
                      {alert.feeData && (
                        <div className="mt-2 text-xs opacity-75">
                          Current fee: {alert.feeData.baseFee} stroops
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onAcknowledge?.(alert.id)}
                      className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                      title="Acknowledge"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    {onDismiss && (
                      <button
                        onClick={() => onDismiss(alert.id)}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                        title="Dismiss"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Previous Alerts</h4>
          <div className="space-y-2">
            {acknowledgedAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.type)
              
              return (
                <div
                  key={alert.id}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2 text-gray-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          {getAlertTitle(alert.type)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(Date.now() - alert.timestamp.getTime())} ago
                        </div>
                      </div>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Alert Settings */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Alert Preferences</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Optimal fee windows</span>
            <div className="w-10 h-6 bg-blue-600 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Network congestion spikes</span>
            <div className="w-10 h-6 bg-blue-600 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Fee drops > 10%</span>
            <div className="w-10 h-6 bg-gray-300 rounded-full relative">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Pro Tip:</strong> Enable alerts to get notified about optimal fee windows 
            and network congestion changes. This can help you save significantly on transaction costs.
          </div>
        </div>
      </div>
    </div>
  )
}
