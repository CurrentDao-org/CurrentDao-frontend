export type MobilePlatform = 'ios' | 'android' | 'cross-platform'

export type WalletCategory =
  | 'native'
  | 'banking'
  | 'exchange'
  | 'energy'
  | 'super-app'
  | 'defi'

export type SecurityTier = 'standard' | 'enhanced' | 'institutional'

export type SecurityStandard =
  | 'PCI DSS'
  | 'PSD2'
  | 'SOC 2'
  | 'Tokenized Payments'
  | 'Biometric MFA'
  | 'Device Integrity'

export type ConnectionHealth = 'healthy' | 'monitoring' | 'degraded'

export type PaymentRail =
  | 'apple-pay'
  | 'google-pay'
  | 'wallet-balance'
  | 'instant-bank'
  | 'open-banking'
  | 'qr-pay'

export interface WalletSecurityProfile {
  biometricAuth: boolean
  deviceBinding: boolean
  fraudMonitoring: boolean
  encryption: 'AES-256' | 'hardware-backed' | 'secure-enclave'
  securityTier: SecurityTier
  complianceBadges: string[]
  standards: SecurityStandard[]
}

export interface MobileWalletProvider {
  id: string
  name: string
  platform: MobilePlatform
  categories: WalletCategory[]
  logoAccent: string
  description: string
  supportedCountries: number
  averageOperationTimeMs: number
  supportsEnergyTrading: boolean
  supportsBankLinking: boolean
  supportsNativeDeepLink: boolean
  mobileReadinessScore: number
  riskScore: number
  energyTradingFeatures: string[]
  bankingAppIds: string[]
  security: WalletSecurityProfile
}

export interface WalletConnection {
  walletId: string
  status: 'connected'
  connectedAt: string
  walletAddress: string
  approvalTimeMs: number
}

export interface PaymentSystem {
  id: PaymentRail
  name: string
  settlementWindow: string
  averageProcessingTimeMs: number
  feesLabel: string
  stepsRequired: number
  deepLinkReady: boolean
  mobileOptimized: boolean
  supportedWalletIds: string[]
  description: string
}

export interface BankAccountConnection {
  id: string
  bankName: string
  mobileApp: string
  provider: 'Plaid' | 'TrueLayer' | 'Direct API'
  accountLabel: string
  accountType: 'checking' | 'savings' | 'treasury'
  currency: 'USD' | 'EUR' | 'GBP'
  availableBalance: number
  supportsInstantPayments: boolean
  connectionHealth: ConnectionHealth
  syncStatus: 'synced' | 'syncing'
  lastSyncedAt: string
}

export interface PaymentRequest {
  walletId: string
  paymentRail: PaymentRail
  energyAmountKwh: number
  unitPrice: number
  currency: 'USD'
}

export interface PaymentQuote extends PaymentRequest {
  subtotal: number
  fee: number
  total: number
  estimatedCompletionMs: number
}

export interface PaymentExecution {
  id: string
  quote: PaymentQuote
  status: 'completed'
  processedAt: string
  processingTimeMs: number
  optimizationStepsSaved: number
}

export interface DeviceSyncStatus {
  id: string
  deviceName: string
  platform: MobilePlatform
  lastSyncedAt: string
  syncState: 'healthy' | 'refreshing'
}

export interface WalletSyncSnapshot {
  devices: DeviceSyncStatus[]
  syncCoveragePercent: number
  syncTimeMs: number
  crossDeviceContinuity: boolean
  pendingConflicts: number
  lastConflictResolvedAt: string
}

export interface WalletUsagePattern {
  label: string
  share: number
}

export interface SecurityAuditReport {
  status: 'pass'
  standards: SecurityStandard[]
  biometricCoveragePercent: number
  fraudDetectionLatencyMs: number
  lastAuditAt: string
}

export interface PaymentFlowMetrics {
  previousStepCount: number
  optimizedStepCount: number
  reducedStepsPercent: number
  medianCompletionMs: number
  walletOperationBudgetMs: number
}

export interface WalletAnalyticsSnapshot {
  activeMobileWallets: number
  mobileConversionRate: number
  repeatWalletUsageRate: number
  averagePaymentTimeMs: number
  preferredPaymentRail: PaymentRail
  peakUsageWindow: string
  topWallets: string[]
  usagePatterns: WalletUsagePattern[]
  paymentFlow: PaymentFlowMetrics
  securityAudit: SecurityAuditReport
}
