import { 
  FraudAlert, 
  FraudSeverity, 
  FraudPattern, 
  InvestigationCase, 
  InvestigationStatus, 
  PreventionMechanism, 
  UserBehavior,
  FraudHistoricalTrend,
  FraudSummaryStats
} from '@/types/fraud';
import { subDays, format, subMonths, startOfMonth } from 'date-fns';

class FraudService {
  private static instance: FraudService;
  private alerts: FraudAlert[] = [];
  private cases: InvestigationCase[] = [];
  private mechanisms: PreventionMechanism[] = [];
  private patterns: FraudPattern[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): FraudService {
    if (!FraudService.instance) {
      FraudService.instance = new FraudService();
    }
    return FraudService.instance;
  }

  private initializeMockData() {
    // Initialize 50+ fraud patterns as per requirements
    const fraudTypes = [
      'Sybil Attack', 'Wash Trading', 'Double Spending', 'Phishing Attempt', 
      'Anomalous Transaction Volume', 'Account Takeover', 'Market Manipulation',
      'Resource Exhaustion', 'Oracle Manipulation', 'Smart Contract Vulnerability Exploit',
      'Identity Theft', 'Bot Activity', 'IP Spoofing', 'Rapid Withdrawal',
      'Credential Stuffing', 'Social Engineering', 'Whale Manipulation',
      'Liquidity Siphoning', 'Flash Loan Attack', 'Front-running',
      'Transaction Pinning', 'Sandwich Attack', 'Block Withholding',
      'Selfish Mining', 'Eclipse Attack', 'Routing Attack',
      'Governance Attack', 'Rug Pull Attempt', 'Token Minting Anomaly',
      'Dusting Attack', 'Man-in-the-Middle', 'DDoS Attack',
      'Malware Distribution', 'Ransomware Payment', 'Sanctioned Address Interaction',
      'Mixer Usage', 'Unusual Cross-chain Activity', 'High Velocity Transfers',
      'Layering', 'Structuring', 'Integration (AML)', 'Placement (AML)',
      'Sim Swap', 'Replay Attack', 'Time-jacking', 'Majority Hash Rate Attack',
      'Short-range Attack', 'Long-range Attack', 'Pre-computation Attack',
      'Balance Distortion'
    ];

    this.patterns = fraudTypes.map((name, index) => ({
      id: `pattern-${index}`,
      name,
      description: `Detected patterns of ${name.toLowerCase()} within the network.`,
      frequency: Math.floor(Math.random() * 100),
      impactScore: Math.floor(Math.random() * 100),
      detectedCount: Math.floor(Math.random() * 1000),
      lastDetected: new Date(),
      trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
    }));

    // Initialize mechanisms
    this.mechanisms = [
      { id: 'm-1', name: 'Sybil Defense', description: 'Blocks multiple accounts from same IP/fingerprint', enabled: true, blockCount: 1240, lastTriggered: new Date(), autoBlockThreshold: 0.85 },
      { id: 'm-2', name: 'Wash Trade Filter', description: 'Prevents circular trading patterns', enabled: true, blockCount: 543, lastTriggered: subDays(new Date(), 1), autoBlockThreshold: 0.9 },
      { id: 'm-3', name: 'Velocity Limiter', description: 'Limits transaction frequency per account', enabled: false, blockCount: 89, lastTriggered: subDays(new Date(), 5), autoBlockThreshold: 0.7 },
      { id: 'm-4', name: 'Oracle Guard', description: 'Detects and prevents price manipulation', enabled: true, blockCount: 12, lastTriggered: subDays(new Date(), 10), autoBlockThreshold: 0.95 }
    ];

    // Initialize historical trends (2 years)
    // We'll generate this on demand in getHistoricalTrends
  }

  public async getSummaryStats(): Promise<FraudSummaryStats> {
    return {
      totalAlerts24h: 124,
      activeInvestigations: 42,
      preventionRate: 98.4,
      averageRiskScore: 12.5
    };
  }

  public async getRecentAlerts(): Promise<FraudAlert[]> {
    return [
      {
        id: 'alt-1',
        timestamp: new Date(),
        type: 'Wash Trading',
        source: 'Market Monitor',
        severity: FraudSeverity.HIGH,
        description: 'Circular trading detected between 0x123... and 0x456...',
        metadata: { volume: '15,000 XLM', confidence: 0.92 },
        status: 'active'
      },
      {
        id: 'alt-2',
        timestamp: subDays(new Date(), 0.1),
        type: 'Sybil Attack',
        source: 'Identity Service',
        severity: FraudSeverity.CRITICAL,
        description: '15 accounts registered from identical IP in 2 minutes',
        metadata: { ip: '192.168.1.1', matchRate: 0.98 },
        status: 'active'
      }
    ];
  }

  public async getPatterns(): Promise<FraudPattern[]> {
    return this.patterns;
  }

  public async getCases(): Promise<InvestigationCase[]> {
    return [
      {
        id: 'case-101',
        title: 'Suspected Wash Trading - Pool #45',
        status: InvestigationStatus.UNDER_INVESTIGATION,
        severity: FraudSeverity.HIGH,
        assignedTo: 'Agent Smith',
        createdAt: subDays(new Date(), 2),
        updatedAt: new Date(),
        relatedAlerts: ['alt-1', 'alt-45'],
        notes: ['Patterns confirm circular flow', 'Waiting for user response'],
        evidenceUrls: []
      },
      {
        id: 'case-102',
        title: 'Sybil Cluster - Registration Alpha',
        status: InvestigationStatus.PENDING,
        severity: FraudSeverity.CRITICAL,
        createdAt: subDays(new Date(), 1),
        updatedAt: subDays(new Date(), 1),
        relatedAlerts: ['alt-2'],
        notes: ['Automation flagged this group'],
        evidenceUrls: []
      }
    ];
  }

  public async getPreventionMechanisms(): Promise<PreventionMechanism[]> {
    return this.mechanisms;
  }

  public async getHistoricalTrends(): Promise<FraudHistoricalTrend[]> {
    const trends: FraudHistoricalTrend[] = [];
    const now = new Date();
    
    // Generate 24 months of data
    for (let i = 23; i >= 0; i--) {
      const date = startOfMonth(subMonths(now, i));
      trends.push({
        date: format(date, 'MMM yyyy'),
        count: 500 + Math.floor(Math.random() * 1000),
        blockedCount: 480 + Math.floor(Math.random() * 950),
        typeDistribution: {
          'Sybil': 30 + Math.random() * 20,
          'Wash Trading': 25 + Math.random() * 15,
          'Phishing': 20 + Math.random() * 10,
          'Other': 15 + Math.random() * 10
        }
      });
    }
    return trends;
  }

  public async getUserBehavior(userId: string): Promise<UserBehavior> {
    return {
      userId,
      username: 'User_' + userId.slice(0, 4),
      riskScore: Math.random() * 100,
      lastActivity: new Date(),
      activityCount: Math.floor(Math.random() * 1000),
      tags: ['Frequent Trader', 'Lp Provider'],
      behaviorFlags: ['Night Owl', 'High Volume']
    };
  }

  public async updateMechanismStatus(id: string, enabled: boolean): Promise<void> {
    const mechanism = this.mechanisms.find(m => m.id === id);
    if (mechanism) {
      mechanism.enabled = enabled;
    }
  }
}

export const fraudService = FraudService.getInstance();
