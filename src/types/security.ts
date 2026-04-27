export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical'

export type SecurityEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'biometric_success'
  | 'biometric_failure'
  | 'device_added'
  | 'device_removed'
  | 'session_created'
  | 'session_expired'
  | 'transaction_anomaly'
  | 'ip_change'
  | 'suspicious_activity'
  | 'threat_detected'

export interface SecurityEvent {
  id: string
  type: SecurityEventType
  timestamp: string
  severity: ThreatLevel
  description: string
  ipAddress?: string
  location?: string
  deviceId?: string
  userId: string
  metadata?: Record<string, any>
}

export interface SecurityThreat {
  id: string
  type: string
  level: ThreatLevel
  description: string
  detectedAt: string
  source: string
  confidence: number
  mitigated: boolean
  actions: string[]
}

export interface DeviceInfo {
  id: string
  name: string
  type: string
  platform: string
  trusted: boolean
  lastSeen: string
  ipAddress: string
  location: string
  biometricSupported: boolean
  riskScore: number
}

export interface SecuritySession {
  id: string
  deviceId: string
  startTime: string
  lastActivity: string
  ipAddress: string
  location: string
  active: boolean
  riskLevel: ThreatLevel
}

export interface SecurityMetrics {
  overallScore: number
  threatLevel: ThreatLevel
  activeThreats: number
  activeSessions: number
  trustedDevices: number
  lastScanTime: string
  biometricSuccessRate: number
  transactionAnomalies: number
  ipChanges: number
}

export interface GeolocationData {
  ip: string
  country: string
  city: string
  region: string
  latitude: number
  longitude: number
  accuracy: number
}

export interface TransactionPattern {
  userId: string
  averageAmount: number
  frequency: number
  lastTransaction: string
  anomalyScore: number
  riskFactors: string[]
}

export interface SecurityAlert {
  id: string
  type: SecurityEventType
  message: string
  severity: ThreatLevel
  timestamp: string
  acknowledged: boolean
  actions: Array<{
    label: string
    action: string
  }>
}
