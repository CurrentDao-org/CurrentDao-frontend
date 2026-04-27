import { SecurityEvent, SecurityEventType, ThreatLevel } from '@/types/security'
import { BiometricAuthenticationResult, BiometricModality } from '@/types/biometric'

interface BiometricLogEntry {
  id: string
  timestamp: string
  deviceId: string
  modality: BiometricModality
  success: boolean
  verificationTimeMs: number
  confidenceScore: number
  failureReason?: string
  ipAddress: string
  location: string
  userId: string
}

interface BiometricMetrics {
  totalAttempts: number
  successfulAttempts: number
  failedAttempts: number
  averageVerificationTime: number
  averageConfidenceScore: number
  successRate: number
  failureRate: number
  modalityStats: Record<BiometricModality, {
    attempts: number
    successes: number
    failures: number
    avgTime: number
    avgConfidence: number
  }>
}

class BiometricLoggingService {
  private logs: BiometricLogEntry[] = []
  private subscribers: ((event: SecurityEvent) => void)[] = []

  logAuthentication(result: BiometricAuthenticationResult, ipAddress: string, location: string) {
    const logEntry: BiometricLogEntry = {
      id: `bio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: result.verifiedAt,
      deviceId: result.deviceId,
      modality: result.modality,
      success: true,
      verificationTimeMs: result.verificationTimeMs,
      confidenceScore: result.confidenceScore,
      ipAddress,
      location,
      userId: 'current-user' // In real implementation, get from auth context
    }

    this.logs.push(logEntry)
    this.createSecurityEvent(logEntry)
  }

  logFailure(
    deviceId: string,
    modality: BiometricModality,
    failureReason: string,
    ipAddress: string,
    location: string,
    userId: string
  ) {
    const logEntry: BiometricLogEntry = {
      id: `bio-fail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      deviceId,
      modality,
      success: false,
      verificationTimeMs: 0,
      confidenceScore: 0,
      failureReason,
      ipAddress,
      location,
      userId
    }

    this.logs.push(logEntry)
    this.createSecurityEvent(logEntry)
    
    // Trigger immediate alert for multiple failures
    this.checkForSuspiciousActivity(deviceId, userId)
  }

  private createSecurityEvent(logEntry: BiometricLogEntry) {
    const eventType: SecurityEventType = logEntry.success ? 'biometric_success' : 'biometric_failure'
    const severity: ThreatLevel = this.calculateSeverity(logEntry)

    const event: SecurityEvent = {
      id: logEntry.id,
      type: eventType,
      timestamp: logEntry.timestamp,
      severity,
      description: this.createEventDescription(logEntry),
      ipAddress: logEntry.ipAddress,
      location: logEntry.location,
      deviceId: logEntry.deviceId,
      userId: logEntry.userId,
      metadata: {
        modality: logEntry.modality,
        verificationTime: logEntry.verificationTimeMs,
        confidenceScore: logEntry.confidenceScore,
        failureReason: logEntry.failureReason
      }
    }

    this.notifySubscribers(event)
  }

  private calculateSeverity(logEntry: BiometricLogEntry): ThreatLevel {
    if (!logEntry.success) {
      // Check if this is part of a pattern of failures
      const recentFailures = this.logs.filter(log => 
        !log.success &&
        log.deviceId === logEntry.deviceId &&
        new Date(log.timestamp) > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
      )

      if (recentFailures.length >= 5) return 'critical'
      if (recentFailures.length >= 3) return 'high'
      return 'medium'
    }

    // Low confidence scores might indicate issues
    if (logEntry.confidenceScore < 0.7) return 'medium'
    if (logEntry.confidenceScore < 0.5) return 'low'
    
    return 'low'
  }

  private createEventDescription(logEntry: BiometricLogEntry): string {
    if (logEntry.success) {
      return `Biometric authentication successful using ${logEntry.modality} on device ${logEntry.deviceId}`
    } else {
      return `Biometric authentication failed: ${logEntry.failureReason || 'Unknown reason'} using ${logEntry.modality}`
    }
  }

  private checkForSuspiciousActivity(deviceId: string, userId: string) {
    const recentFailures = this.logs.filter(log => 
      !log.success &&
      log.deviceId === deviceId &&
      log.userId === userId &&
      new Date(log.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    )

    if (recentFailures.length >= 3) {
      // Create high-priority security event
      const alertEvent: SecurityEvent = {
        id: `bio-alert-${Date.now()}`,
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        severity: 'high',
        description: `Multiple biometric authentication failures detected on device ${deviceId}`,
        deviceId,
        userId,
        metadata: {
          failureCount: recentFailures.length,
          timeWindow: '5 minutes',
          modalities: [...new Set(recentFailures.map(f => f.modality))]
        }
      }

      this.notifySubscribers(alertEvent)
    }
  }

  subscribe(callback: (event: SecurityEvent) => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  private notifySubscribers(event: SecurityEvent) {
    this.subscribers.forEach(callback => callback(event))
  }

  getMetrics(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): BiometricMetrics {
    const now = new Date()
    const timeframes = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    }

    const cutoffTime = new Date(now.getTime() - timeframes[timeframe])
    const relevantLogs = this.logs.filter(log => new Date(log.timestamp) > cutoffTime)

    const totalAttempts = relevantLogs.length
    const successfulAttempts = relevantLogs.filter(log => log.success).length
    const failedAttempts = totalAttempts - successfulAttempts

    const successfulLogs = relevantLogs.filter(log => log.success)
    const averageVerificationTime = successfulLogs.length > 0 
      ? successfulLogs.reduce((sum, log) => sum + log.verificationTimeMs, 0) / successfulLogs.length
      : 0

    const averageConfidenceScore = successfulLogs.length > 0
      ? successfulLogs.reduce((sum, log) => sum + log.confidenceScore, 0) / successfulLogs.length
      : 0

    const modalityStats: Record<BiometricModality, any> = {
      fingerprint: { attempts: 0, successes: 0, failures: 0, avgTime: 0, avgConfidence: 0 },
      face: { attempts: 0, successes: 0, failures: 0, avgTime: 0, avgConfidence: 0 },
      voice: { attempts: 0, successes: 0, failures: 0, avgTime: 0, avgConfidence: 0 }
    }

    // Calculate modality-specific stats
    Object.keys(modalityStats).forEach(modality => {
      const modalityLogs = relevantLogs.filter(log => log.modality === modality as BiometricModality)
      const successfulModalityLogs = modalityLogs.filter(log => log.success)

      modalityStats[modality as BiometricModality] = {
        attempts: modalityLogs.length,
        successes: successfulModalityLogs.length,
        failures: modalityLogs.length - successfulModalityLogs.length,
        avgTime: successfulModalityLogs.length > 0 
          ? successfulModalityLogs.reduce((sum, log) => sum + log.verificationTimeMs, 0) / successfulModalityLogs.length
          : 0,
        avgConfidence: successfulModalityLogs.length > 0
          ? successfulModalityLogs.reduce((sum, log) => sum + log.confidenceScore, 0) / successfulModalityLogs.length
          : 0
      }
    })

    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      averageVerificationTime,
      averageConfidenceScore,
      successRate: totalAttempts > 0 ? successfulAttempts / totalAttempts : 0,
      failureRate: totalAttempts > 0 ? failedAttempts / totalAttempts : 0,
      modalityStats
    }
  }

  getRecentLogs(limit: number = 50): BiometricLogEntry[] {
    return this.logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  getFailedLogs(limit: number = 20): BiometricLogEntry[] {
    return this.logs
      .filter(log => !log.success)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  getDeviceMetrics(deviceId: string): BiometricMetrics {
    const deviceLogs = this.logs.filter(log => log.deviceId === deviceId)
    
    const totalAttempts = deviceLogs.length
    const successfulAttempts = deviceLogs.filter(log => log.success).length
    const failedAttempts = totalAttempts - successfulAttempts

    const successfulLogs = deviceLogs.filter(log => log.success)
    const averageVerificationTime = successfulLogs.length > 0 
      ? successfulLogs.reduce((sum, log) => sum + log.verificationTimeMs, 0) / successfulLogs.length
      : 0

    const averageConfidenceScore = successfulLogs.length > 0
      ? successfulLogs.reduce((sum, log) => sum + log.confidenceScore, 0) / successfulLogs.length
      : 0

    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      averageVerificationTime,
      averageConfidenceScore,
      successRate: totalAttempts > 0 ? successfulAttempts / totalAttempts : 0,
      failureRate: totalAttempts > 0 ? failedAttempts / totalAttempts : 0,
      modalityStats: {} as any // Simplified for device metrics
    }
  }

  clearOldLogs(olderThanDays: number = 30) {
    const cutoffTime = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
    this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoffTime)
  }
}

export const biometricLoggingService = new BiometricLoggingService()
