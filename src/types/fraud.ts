/**
 * Fraud Detection Types
 */

export enum FraudSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum InvestigationStatus {
  PENDING = 'pending',
  UNDER_INVESTIGATION = 'under_investigation',
  RESOLVED_FRAUD = 'resolved_fraud',
  FALSE_POSITIVE = 'false_positive',
  CLOSED = 'closed'
}

export interface FraudAlert {
  id: string;
  timestamp: Date;
  type: string;
  source: string;
  severity: FraudSeverity;
  description: string;
  metadata: Record<string, any>;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface FraudPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  impactScore: number;
  detectedCount: number;
  lastDetected: Date;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface InvestigationCase {
  id: string;
  title: string;
  status: InvestigationStatus;
  severity: FraudSeverity;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  relatedAlerts: string[];
  notes: string[];
  evidenceUrls: string[];
}

export interface PreventionMechanism {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  blockCount: number;
  lastTriggered: Date;
  autoBlockThreshold: number;
}

export interface UserBehavior {
  userId: string;
  username: string;
  riskScore: number;
  lastActivity: Date;
  activityCount: number;
  tags: string[];
  behaviorFlags: string[];
}

export interface FraudHistoricalTrend {
  date: string;
  count: number;
  blockedCount: number;
  typeDistribution: Record<string, number>;
}

export interface FraudSummaryStats {
  totalAlerts24h: number;
  activeInvestigations: number;
  preventionRate: number;
  averageRiskScore: number;
}
