export type BiometricModality = 'fingerprint' | 'face' | 'voice'

export type BiometricFallbackOption =
  | 'device-pin'
  | 'passkey'
  | 'hardware-key'
  | 'recovery-code'

export type BiometricPlatform = 'ios' | 'android' | 'cross-platform'

export type BiometricUseCase = 'app-access' | 'transaction-confirmation'

export interface SecureBiometricStorage {
  storageProvider: string
  hardwareBacked: boolean
  templateIsolation: boolean
  encryption: 'AES-256' | 'secure-enclave' | 'trustzone-backed'
  fipsStandard: 'FIPS 140-3 Level 2' | 'FIPS 140-3 Level 3'
}

export interface BiometricCapability {
  modality: BiometricModality
  averageVerificationMs: number
  accuracyRate: number
  livenessDetection: boolean
  retryWindowSeconds: number
}

export interface BiometricDeviceProfile {
  id: string
  name: string
  platform: BiometricPlatform
  supportedModalities: BiometricModality[]
  fallbackOptions: BiometricFallbackOption[]
  multiFactorLimit: number
  secureStorage: SecureBiometricStorage
  capabilities: BiometricCapability[]
}

export interface BiometricAuthenticationRequest {
  deviceId: string
  modality: BiometricModality
  useCase: BiometricUseCase
}

export interface BiometricAuthenticationResult {
  deviceId: string
  modality: BiometricModality
  useCase: BiometricUseCase
  status: 'verified'
  verifiedAt: string
  verificationTimeMs: number
  confidenceScore: number
}

export interface TransactionConfirmationRequest {
  deviceId: string
  amountUsd: number
  factors: BiometricModality[]
}

export interface TransactionConfirmationResult {
  id: string
  amountUsd: number
  status: 'approved'
  requiredFactors: number
  verifiedFactors: BiometricModality[]
  verificationTimeMs: number
  approvedAt: string
}

export interface FallbackVerificationResult {
  deviceId: string
  option: BiometricFallbackOption
  status: 'verified'
  verificationTimeMs: number
  verifiedAt: string
}

export interface BiometricModalityAnalytics {
  modality: BiometricModality
  adoptionRate: number
  successRate: number
  averageVerificationMs: number
}

export interface BiometricComplianceSnapshot {
  auditStatus: 'pass'
  standards: string[]
  fallbackCoveragePercent: number
  multiFactorCoveragePercent: number
  onDeviceTemplateRetention: boolean
  secureStorage: SecureBiometricStorage
}

export interface BiometricAnalyticsSnapshot {
  fingerprintVerificationMs: number
  faceRecognitionAccuracy: number
  voiceVerificationMs: number
  fallbackCoveragePercent: number
  transactionApprovalRate: number
  activeBiometricUsers: number
  modalityAnalytics: BiometricModalityAnalytics[]
  compliance: BiometricComplianceSnapshot
}
