import { SecurityThreat, SecurityEvent, ThreatLevel, GeolocationData } from '@/types/security'

class ThreatDetectionService {
  private threats: SecurityThreat[] = []
  private eventHistory: SecurityEvent[] = []
  private subscribers: ((threats: SecurityThreat[]) => void)[] = []

  constructor() {
    this.startRealTimeMonitoring()
  }

  subscribe(callback: (threats: SecurityThreat[]) => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.threats))
  }

  addEvent(event: SecurityEvent) {
    this.eventHistory.push(event)
    this.analyzeEvent(event)
  }

  private analyzeEvent(event: SecurityEvent) {
    const threats = this.detectThreats(event)
    threats.forEach(threat => {
      this.addThreat(threat)
    })
  }

  private detectThreats(event: SecurityEvent): SecurityThreat[] {
    const threats: SecurityThreat[] = []

    // Detect multiple failed login attempts
    if (event.type === 'login_failure') {
      const recentFailures = this.eventHistory.filter(e => 
        e.type === 'login_failure' && 
        e.userId === event.userId &&
        new Date(e.timestamp) > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
      )

      if (recentFailures.length >= 5) {
        threats.push({
          id: `brute-force-${Date.now()}`,
          type: 'brute_force_attack',
          level: 'high',
          description: `Multiple failed login attempts detected for user ${event.userId}`,
          detectedAt: new Date().toISOString(),
          source: event.ipAddress || 'unknown',
          confidence: 0.85,
          mitigated: false,
          actions: ['lock_account', 'notify_user', 'require_2fa']
        })
      }
    }

    // Detect suspicious IP changes
    if (event.type === 'ip_change') {
      const previousIps = this.eventHistory
        .filter(e => e.userId === event.userId && e.ipAddress)
        .map(e => e.ipAddress!)

      if (this.isSuspiciousLocation(event.ipAddress!, previousIps)) {
        threats.push({
          id: `suspicious-ip-${Date.now()}`,
          type: 'suspicious_location',
          level: 'medium',
          description: `Login from unusual location: ${event.location}`,
          detectedAt: new Date().toISOString(),
          source: event.ipAddress!,
          confidence: 0.7,
          mitigated: false,
          actions: ['verify_identity', 'notify_user']
        })
      }
    }

    // Detect biometric failures
    if (event.type === 'biometric_failure') {
      const recentBiometricFailures = this.eventHistory.filter(e => 
        e.type === 'biometric_failure' &&
        e.deviceId === event.deviceId &&
        new Date(e.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      )

      if (recentBiometricFailures.length >= 3) {
        threats.push({
          id: `biometric-attack-${Date.now()}`,
          type: 'biometric_attack',
          level: 'high',
          description: `Multiple biometric authentication failures on device ${event.deviceId}`,
          detectedAt: new Date().toISOString(),
          source: event.deviceId!,
          confidence: 0.8,
          mitigated: false,
          actions: ['lock_device', 'require_alternate_auth', 'notify_user']
        })
      }
    }

    // Detect transaction anomalies
    if (event.type === 'transaction_anomaly') {
      threats.push({
        id: `transaction-anomaly-${Date.now()}`,
        type: 'transaction_anomaly',
        level: 'medium',
        description: 'Unusual transaction pattern detected',
        detectedAt: new Date().toISOString(),
        source: event.userId,
        confidence: event.metadata?.anomalyScore || 0.5,
        mitigated: false,
        actions: ['review_transaction', 'require_verification', 'notify_user']
      })
    }

    return threats
  }

  private isSuspiciousLocation(currentIp: string, previousIps: string[]): boolean {
    // Simple heuristic - in real implementation, use geolocation API
    const ipRanges = {
      '192.168.': 'local',
      '10.': 'local',
      '172.16.': 'local'
    }

    const isLocal = (ip: string) => 
      Object.keys(ipRanges).some(range => ip.startsWith(range))

    const currentIsLocal = isLocal(currentIp)
    const hasPreviousLocal = previousIps.some(ip => isLocal(ip))

    // If current is remote but previous were local, it's suspicious
    return !currentIsLocal && hasPreviousLocal && previousIps.length > 0
  }

  private addThreat(threat: SecurityThreat) {
    this.threats.push(threat)
    this.notifySubscribers()
    
    // Auto-mitigate low-level threats after 1 minute
    if (threat.level === 'low') {
      setTimeout(() => {
        this.mitigateThreat(threat.id)
      }, 60000)
    }
  }

  mitigateThreat(threatId: string) {
    const threat = this.threats.find(t => t.id === threatId)
    if (threat) {
      threat.mitigated = true
      this.notifySubscribers()
    }
  }

  getActiveThreats(): SecurityThreat[] {
    return this.threats.filter(threat => !threat.mitigated)
  }

  getThreatsByLevel(level: ThreatLevel): SecurityThreat[] {
    return this.threats.filter(threat => threat.level === level)
  }

  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.eventHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  private startRealTimeMonitoring() {
    // Simulate real-time threat detection
    setInterval(() => {
      this.simulateRandomThreat()
    }, 30000) // Every 30 seconds
  }

  private simulateRandomThreat() {
    const threatTypes = [
      { type: 'port_scan', level: 'medium' as ThreatLevel, description: 'Port scan detected' },
      { type: 'ddos_attempt', level: 'high' as ThreatLevel, description: 'DDoS attempt detected' },
      { type: 'malware_detected', level: 'critical' as ThreatLevel, description: 'Malware signature detected' },
      { type: 'unusual_access_pattern', level: 'low' as ThreatLevel, description: 'Unusual access pattern detected' }
    ]

    const randomThreat = threatTypes[Math.floor(Math.random() * threatTypes.length)]
    
    const threat: SecurityThreat = {
      id: `simulated-${Date.now()}`,
      type: randomThreat.type,
      level: randomThreat.level,
      description: randomThreat.description,
      detectedAt: new Date().toISOString(),
      source: 'system_monitor',
      confidence: 0.6 + Math.random() * 0.4,
      mitigated: false,
      actions: ['monitor', 'log', 'alert']
    }

    this.addThreat(threat)
  }

  async analyzeStellarNetworkAlerts(): Promise<SecurityThreat[]> {
    // Simulate Stellar network security alerts
    const stellarThreats: SecurityThreat[] = [
      {
        id: `stellar-${Date.now()}`,
        type: 'stellar_anomaly',
        level: 'medium',
        description: 'Unusual transaction pattern detected on Stellar network',
        detectedAt: new Date().toISOString(),
        source: 'stellar_network',
        confidence: 0.75,
        mitigated: false,
        actions: ['freeze_transaction', 'investigate', 'notify_user']
      }
    ]

    stellarThreats.forEach(threat => this.addThreat(threat))
    return stellarThreats
  }

  getThreatStatistics() {
    const activeThreats = this.getActiveThreats()
    const threatsByLevel = {
      low: activeThreats.filter(t => t.level === 'low').length,
      medium: activeThreats.filter(t => t.level === 'medium').length,
      high: activeThreats.filter(t => t.level === 'high').length,
      critical: activeThreats.filter(t => t.level === 'critical').length
    }

    return {
      totalActive: activeThreats.length,
      byLevel: threatsByLevel,
      mitigated: this.threats.filter(t => t.mitigated).length,
      totalDetected: this.threats.length
    }
  }
}

export const threatDetectionService = new ThreatDetectionService()
