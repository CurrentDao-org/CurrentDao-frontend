'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  SecurityThreat, 
  SecurityEvent, 
  SecurityMetrics, 
  DeviceInfo, 
  SecuritySession,
  TransactionPattern,
  SecurityAlert,
  ThreatLevel 
} from '@/types/security'
import { threatDetectionService } from '@/services/security/threat-detection'
import { biometricLoggingService } from '@/services/security/biometric-logging'
import { calculateSecurityScore, calculateThreatLevel } from '@/utils/security/calculations'

interface SecurityMonitoringState {
  threats: SecurityThreat[]
  events: SecurityEvent[]
  metrics: SecurityMetrics
  devices: DeviceInfo[]
  sessions: SecuritySession[]
  alerts: SecurityAlert[]
  isLoading: boolean
  lastUpdate: string
}

export function useSecurityMonitoring(userId: string = 'current-user') {
  const [state, setState] = useState<SecurityMonitoringState>({
    threats: [],
    events: [],
    metrics: {
      overallScore: 0,
      threatLevel: 'low',
      activeThreats: 0,
      activeSessions: 0,
      trustedDevices: 0,
      lastScanTime: new Date().toISOString(),
      biometricSuccessRate: 0,
      transactionAnomalies: 0,
      ipChanges: 0
    },
    devices: [],
    sessions: [],
    alerts: [],
    isLoading: true,
    lastUpdate: new Date().toISOString()
  })

  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)

  // Initialize mock data
  const initializeData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // Initialize mock devices
      const mockDevices: DeviceInfo[] = [
        {
          id: 'device-1',
          name: 'iPhone 15 Pro',
          type: 'mobile',
          platform: 'iOS',
          trusted: true,
          lastSeen: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          location: 'New York, USA',
          biometricSupported: true,
          riskScore: 15
        },
        {
          id: 'device-2',
          name: 'MacBook Pro',
          type: 'desktop',
          platform: 'macOS',
          trusted: true,
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          ipAddress: '192.168.1.101',
          location: 'New York, USA',
          biometricSupported: true,
          riskScore: 10
        },
        {
          id: 'device-3',
          name: 'Windows PC',
          type: 'desktop',
          platform: 'Windows',
          trusted: false,
          lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          ipAddress: '192.168.1.102',
          location: 'Unknown',
          biometricSupported: false,
          riskScore: 45
        }
      ]

      // Initialize mock sessions
      const mockSessions: SecuritySession[] = [
        {
          id: 'session-1',
          deviceId: 'device-1',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          location: 'New York, USA',
          active: true,
          riskLevel: 'low'
        },
        {
          id: 'session-2',
          deviceId: 'device-2',
          startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          ipAddress: '192.168.1.101',
          location: 'New York, USA',
          active: true,
          riskLevel: 'low'
        }
      ]

      // Initialize mock transaction patterns
      const mockTransactionPatterns: TransactionPattern[] = [
        {
          userId,
          averageAmount: 1250,
          frequency: 3.5,
          lastTransaction: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          anomalyScore: 0.15,
          riskFactors: []
        }
      ]

      // Get initial threats and events from services
      const threats = threatDetectionService.getActiveThreats()
      const events = threatDetectionService.getRecentEvents(100)
      
      // Calculate security metrics
      const overallScore = calculateSecurityScore(events, mockDevices, mockSessions, mockTransactionPatterns)
      const threatLevel = calculateThreatLevel(events)
      
      const biometricMetrics = biometricLoggingService.getMetrics('day')

      const metrics: SecurityMetrics = {
        overallScore,
        threatLevel,
        activeThreats: threats.length,
        activeSessions: mockSessions.filter(s => s.active).length,
        trustedDevices: mockDevices.filter(d => d.trusted).length,
        lastScanTime: new Date().toISOString(),
        biometricSuccessRate: biometricMetrics.successRate,
        transactionAnomalies: mockTransactionPatterns.filter(p => p.anomalyScore > 0.7).length,
        ipChanges: events.filter(e => e.type === 'ip_change').length
      }

      // Initialize alerts
      const alerts: SecurityAlert[] = threats.slice(0, 5).map(threat => ({
        id: `alert-${threat.id}`,
        type: 'threat_detected' as SecurityEventType,
        message: threat.description,
        severity: threat.level,
        timestamp: threat.detectedAt,
        acknowledged: false,
        actions: threat.actions.map(action => ({
          label: action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          action
        }))
      }))

      setState(prev => ({
        ...prev,
        threats,
        events,
        metrics,
        devices: mockDevices,
        sessions: mockSessions,
        alerts,
        isLoading: false,
        lastUpdate: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error initializing security monitoring:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [userId])

  // Subscribe to threat detection updates
  useEffect(() => {
    const unsubscribeThreats = threatDetectionService.subscribe((threats) => {
      setState(prev => {
        const newAlerts: SecurityAlert[] = threats
          .filter(threat => !prev.threats.some(t => t.id === threat.id))
          .slice(0, 3)
          .map(threat => ({
            id: `alert-${threat.id}`,
            type: 'threat_detected' as SecurityEventType,
            message: threat.description,
            severity: threat.level,
            timestamp: threat.detectedAt,
            acknowledged: false,
            actions: threat.actions.map(action => ({
              label: action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
              action
            }))
          }))

        return {
          ...prev,
          threats,
          alerts: [...newAlerts, ...prev.alerts].slice(0, 20)
        }
      })
    })

    const unsubscribeBiometric = biometricLoggingService.subscribe((event) => {
      setState(prev => ({
        ...prev,
        events: [event, ...prev.events].slice(0, 200),
        lastUpdate: new Date().toISOString()
      }))
    })

    return () => {
      unsubscribeThreats()
      unsubscribeBiometric()
    }
  }, [])

  // Real-time updates
  useEffect(() => {
    if (!isRealTimeEnabled) return

    const interval = setInterval(() => {
      updateMetrics()
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [isRealTimeEnabled])

  const updateMetrics = useCallback(() => {
    setState(prev => {
      const threats = threatDetectionService.getActiveThreats()
      const events = threatDetectionService.getRecentEvents(100)
      const biometricMetrics = biometricLoggingService.getMetrics('day')
      
      const overallScore = calculateSecurityScore(events, prev.devices, prev.sessions, [{
        userId,
        averageAmount: 1250,
        frequency: 3.5,
        lastTransaction: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        anomalyScore: 0.15,
        riskFactors: []
      }])
      
      const threatLevel = calculateThreatLevel(events)

      return {
        ...prev,
        metrics: {
          ...prev.metrics,
          overallScore,
          threatLevel,
          activeThreats: threats.length,
          biometricSuccessRate: biometricMetrics.successRate,
          lastScanTime: new Date().toISOString()
        },
        threats,
        events,
        lastUpdate: new Date().toISOString()
      }
    })
  }, [userId])

  // Actions
  const mitigateThreat = useCallback((threatId: string) => {
    threatDetectionService.mitigateThreat(threatId)
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert => 
        alert.id === `alert-${threatId}` 
          ? { ...alert, acknowledged: true }
          : alert
      )
    }))
  }, [])

  const revokeSession = useCallback((sessionId: string) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(session => 
        session.id === sessionId 
          ? { ...session, active: false }
          : session
      )
    }))
  }, [])

  const trustDevice = useCallback((deviceId: string) => {
    setState(prev => ({
      ...prev,
      devices: prev.devices.map(device => 
        device.id === deviceId 
          ? { ...device, trusted: true, riskScore: Math.max(0, device.riskScore - 20) }
          : device
      )
    }))
  }, [])

  const removeDevice = useCallback((deviceId: string) => {
    setState(prev => ({
      ...prev,
      devices: prev.devices.filter(device => device.id !== deviceId),
      sessions: prev.sessions.filter(session => session.deviceId !== deviceId)
    }))
  }, [])

  const acknowledgeAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    }))
  }, [])

  const refreshData = useCallback(async () => {
    await initializeData()
  }, [initializeData])

  // Initialize on mount
  useEffect(() => {
    initializeData()
  }, [initializeData])

  return {
    ...state,
    isRealTimeEnabled,
    setIsRealTimeEnabled,
    mitigateThreat,
    revokeSession,
    trustDevice,
    removeDevice,
    acknowledgeAlert,
    refreshData,
    updateMetrics
  }
}
