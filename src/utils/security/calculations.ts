import { ThreatLevel, SecurityEvent, DeviceInfo, SecuritySession, TransactionPattern } from '@/types/security'

export function calculateSecurityScore(
  events: SecurityEvent[],
  devices: DeviceInfo[],
  sessions: SecuritySession[],
  transactionPatterns: TransactionPattern[]
): number {
  let score = 100
  
  // Deduct points for security events
  const recentEvents = events.filter(event => 
    new Date(event.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  )
  
  recentEvents.forEach(event => {
    switch (event.severity) {
      case 'critical':
        score -= 25
        break
      case 'high':
        score -= 15
        break
      case 'medium':
        score -= 8
        break
      case 'low':
        score -= 3
        break
    }
  })
  
  // Deduct points for untrusted devices
  const untrustedDevices = devices.filter(device => !device.trusted)
  score -= untrustedDevices.length * 10
  
  // Deduct points for high-risk sessions
  const highRiskSessions = sessions.filter(session => session.riskLevel === 'high' || session.riskLevel === 'critical')
  score -= highRiskSessions.length * 15
  
  // Deduct points for transaction anomalies
  const anomalousTransactions = transactionPatterns.filter(pattern => pattern.anomalyScore > 0.7)
  score -= anomalousTransactions.length * 20
  
  // Bonus points for trusted devices
  const trustedDevices = devices.filter(device => device.trusted)
  score += trustedDevices.length * 2
  
  // Ensure score stays within bounds
  return Math.max(0, Math.min(100, score))
}

export function calculateThreatLevel(events: SecurityEvent[]): ThreatLevel {
  const recentEvents = events.filter(event => 
    new Date(event.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
  )
  
  const criticalCount = recentEvents.filter(e => e.severity === 'critical').length
  const highCount = recentEvents.filter(e => e.severity === 'high').length
  const mediumCount = recentEvents.filter(e => e.severity === 'medium').length
  
  if (criticalCount > 0 || highCount >= 3) return 'critical'
  if (highCount > 0 || mediumCount >= 5) return 'high'
  if (mediumCount > 0) return 'medium'
  return 'low'
}

export function calculateDeviceRiskScore(device: DeviceInfo, events: SecurityEvent[]): number {
  let riskScore = 0
  
  // Base risk from device properties
  if (!device.trusted) riskScore += 30
  if (!device.biometricSupported) riskScore += 15
  
  // Risk from recent events on this device
  const deviceEvents = events.filter(event => 
    event.deviceId === device.id && 
    new Date(event.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  )
  
  deviceEvents.forEach(event => {
    switch (event.severity) {
      case 'critical':
        riskScore += 25
        break
      case 'high':
        riskScore += 15
        break
      case 'medium':
        riskScore += 8
        break
      case 'low':
        riskScore += 3
        break
    }
  })
  
  // Risk from time since last seen
  const hoursSinceLastSeen = (Date.now() - new Date(device.lastSeen).getTime()) / (1000 * 60 * 60)
  if (hoursSinceLastSeen > 168) { // More than 1 week
    riskScore += 10
  }
  
  return Math.min(100, riskScore)
}

export function detectTransactionAnomaly(
  currentAmount: number,
  patterns: TransactionPattern[]
): { anomaly: boolean; score: number; riskFactors: string[] } {
  const userPattern = patterns[0] // Assuming patterns are for the current user
  if (!userPattern) {
    return { anomaly: false, score: 0, riskFactors: [] }
  }
  
  const riskFactors: string[] = []
  let anomalyScore = 0
  
  // Amount anomaly detection
  const amountRatio = currentAmount / userPattern.averageAmount
  if (amountRatio > 5) {
    anomalyScore += 40
    riskFactors.push('Unusually high transaction amount')
  } else if (amountRatio > 2) {
    anomalyScore += 20
    riskFactors.push('Elevated transaction amount')
  }
  
  // Frequency anomaly detection
  const timeSinceLastTransaction = Date.now() - new Date(userPattern.lastTransaction).getTime()
  const expectedInterval = 24 * 60 * 60 * 1000 / userPattern.frequency // Daily frequency
  
  if (timeSinceLastTransaction < expectedInterval * 0.1) {
    anomalyScore += 30
    riskFactors.push('Unusual transaction frequency')
  }
  
  return {
    anomaly: anomalyScore > 50,
    score: anomalyScore,
    riskFactors
  }
}

export function calculateGeolocationAccuracy(
  currentLocation: { latitude: number; longitude: number },
  previousLocation: { latitude: number; longitude: number }
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (currentLocation.latitude - previousLocation.latitude) * Math.PI / 180
  const dLon = (currentLocation.longitude - previousLocation.longitude) * Math.PI / 180
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(previousLocation.latitude * Math.PI / 180) * Math.cos(currentLocation.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in kilometers
}

export function formatSecurityScore(score: number): { level: ThreatLevel; color: string; label: string } {
  if (score >= 80) return { level: 'low', color: 'text-green-600', label: 'Excellent' }
  if (score >= 60) return { level: 'low', color: 'text-blue-600', label: 'Good' }
  if (score >= 40) return { level: 'medium', color: 'text-yellow-600', label: 'Fair' }
  if (score >= 20) return { level: 'high', color: 'text-orange-600', label: 'Poor' }
  return { level: 'critical', color: 'text-red-600', label: 'Critical' }
}

export function getThreatColor(level: ThreatLevel): string {
  switch (level) {
    case 'low': return 'bg-green-500'
    case 'medium': return 'bg-yellow-500'
    case 'high': return 'bg-orange-500'
    case 'critical': return 'bg-red-500'
  }
}

export function getThreatTextColor(level: ThreatLevel): string {
  switch (level) {
    case 'low': return 'text-green-600'
    case 'medium': return 'text-yellow-600'
    case 'high': return 'text-orange-600'
    case 'critical': return 'text-red-600'
  }
}
