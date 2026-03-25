import {
  BiometricAnalyticsSnapshot,
  BiometricAuthenticationRequest,
  BiometricAuthenticationResult,
  BiometricCapability,
  BiometricDeviceProfile,
  BiometricFallbackOption,
  FallbackVerificationResult,
  TransactionConfirmationRequest,
  TransactionConfirmationResult,
} from '@/types/biometric'

const deviceProfiles: BiometricDeviceProfile[] = [
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    platform: 'ios',
    supportedModalities: ['fingerprint', 'face', 'voice'],
    fallbackOptions: ['device-pin', 'passkey', 'recovery-code'],
    multiFactorLimit: 2,
    secureStorage: {
      storageProvider: 'Secure Enclave',
      hardwareBacked: true,
      templateIsolation: true,
      encryption: 'secure-enclave',
      fipsStandard: 'FIPS 140-3 Level 3',
    },
    capabilities: [
      {
        modality: 'fingerprint',
        averageVerificationMs: 420,
        accuracyRate: 0.992,
        livenessDetection: true,
        retryWindowSeconds: 30,
      },
      {
        modality: 'face',
        averageVerificationMs: 760,
        accuracyRate: 0.987,
        livenessDetection: true,
        retryWindowSeconds: 30,
      },
      {
        modality: 'voice',
        averageVerificationMs: 1800,
        accuracyRate: 0.981,
        livenessDetection: true,
        retryWindowSeconds: 45,
      },
    ],
  },
  {
    id: 'pixel-9-pro',
    name: 'Pixel 9 Pro',
    platform: 'android',
    supportedModalities: ['fingerprint', 'face', 'voice'],
    fallbackOptions: ['device-pin', 'passkey', 'hardware-key'],
    multiFactorLimit: 2,
    secureStorage: {
      storageProvider: 'Titan M2',
      hardwareBacked: true,
      templateIsolation: true,
      encryption: 'trustzone-backed',
      fipsStandard: 'FIPS 140-3 Level 3',
    },
    capabilities: [
      {
        modality: 'fingerprint',
        averageVerificationMs: 390,
        accuracyRate: 0.991,
        livenessDetection: true,
        retryWindowSeconds: 30,
      },
      {
        modality: 'face',
        averageVerificationMs: 810,
        accuracyRate: 0.984,
        livenessDetection: true,
        retryWindowSeconds: 30,
      },
      {
        modality: 'voice',
        averageVerificationMs: 1850,
        accuracyRate: 0.979,
        livenessDetection: true,
        retryWindowSeconds: 45,
      },
    ],
  },
  {
    id: 'galaxy-s25-ultra',
    name: 'Galaxy S25 Ultra',
    platform: 'android',
    supportedModalities: ['fingerprint', 'face'],
    fallbackOptions: ['device-pin', 'passkey', 'hardware-key'],
    multiFactorLimit: 2,
    secureStorage: {
      storageProvider: 'Samsung Knox Vault',
      hardwareBacked: true,
      templateIsolation: true,
      encryption: 'trustzone-backed',
      fipsStandard: 'FIPS 140-3 Level 3',
    },
    capabilities: [
      {
        modality: 'fingerprint',
        averageVerificationMs: 440,
        accuracyRate: 0.989,
        livenessDetection: true,
        retryWindowSeconds: 30,
      },
      {
        modality: 'face',
        averageVerificationMs: 890,
        accuracyRate: 0.983,
        livenessDetection: true,
        retryWindowSeconds: 30,
      },
    ],
  },
  {
    id: 'companion-browser',
    name: 'Companion Browser',
    platform: 'cross-platform',
    supportedModalities: ['voice'],
    fallbackOptions: ['passkey', 'hardware-key', 'recovery-code'],
    multiFactorLimit: 1,
    secureStorage: {
      storageProvider: 'WebAuthn Hardware Token',
      hardwareBacked: true,
      templateIsolation: true,
      encryption: 'AES-256',
      fipsStandard: 'FIPS 140-3 Level 2',
    },
    capabilities: [
      {
        modality: 'voice',
        averageVerificationMs: 1900,
        accuracyRate: 0.982,
        livenessDetection: true,
        retryWindowSeconds: 45,
      },
    ],
  },
]

const biometricAnalytics: BiometricAnalyticsSnapshot = {
  fingerprintVerificationMs: 420,
  faceRecognitionAccuracy: 0.986,
  voiceVerificationMs: 1800,
  fallbackCoveragePercent: 100,
  transactionApprovalRate: 0.972,
  activeBiometricUsers: 2841,
  modalityAnalytics: [
    {
      modality: 'fingerprint',
      adoptionRate: 0.46,
      successRate: 0.991,
      averageVerificationMs: 420,
    },
    {
      modality: 'face',
      adoptionRate: 0.37,
      successRate: 0.986,
      averageVerificationMs: 790,
    },
    {
      modality: 'voice',
      adoptionRate: 0.17,
      successRate: 0.979,
      averageVerificationMs: 1800,
    },
  ],
  compliance: {
    auditStatus: 'pass',
    standards: ['FIPS 140-3', 'SOC 2', 'Biometric MFA', 'On-device Template Storage'],
    fallbackCoveragePercent: 100,
    multiFactorCoveragePercent: 100,
    onDeviceTemplateRetention: true,
    secureStorage: {
      storageProvider: 'Hardware-backed keystore',
      hardwareBacked: true,
      templateIsolation: true,
      encryption: 'AES-256',
      fipsStandard: 'FIPS 140-3 Level 3',
    },
  },
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getDevice(deviceId: string) {
  const device = deviceProfiles.find((entry) => entry.id === deviceId)

  if (!device) {
    throw new Error('Unknown biometric device.')
  }

  return device
}

function getCapability(device: BiometricDeviceProfile, modality: BiometricCapability['modality']) {
  const capability = device.capabilities.find((entry) => entry.modality === modality)

  if (!capability) {
    throw new Error('Requested biometric modality is not supported on this device.')
  }

  return capability
}

function uniqueFactors(factors: TransactionConfirmationRequest['factors']) {
  return Array.from(new Set(factors))
}

export const biometricService = {
  async listDevices(): Promise<BiometricDeviceProfile[]> {
    await delay(120)
    return deviceProfiles
  },

  async getAnalytics(): Promise<BiometricAnalyticsSnapshot> {
    await delay(90)
    return biometricAnalytics
  },

  async authenticate(
    request: BiometricAuthenticationRequest,
  ): Promise<BiometricAuthenticationResult> {
    const device = getDevice(request.deviceId)
    const capability = getCapability(device, request.modality)

    await delay(capability.averageVerificationMs)

    return {
      deviceId: request.deviceId,
      modality: request.modality,
      useCase: request.useCase,
      status: 'verified',
      verifiedAt: new Date().toISOString(),
      verificationTimeMs: capability.averageVerificationMs,
      confidenceScore: capability.accuracyRate,
    }
  },

  async confirmTransaction(
    request: TransactionConfirmationRequest,
  ): Promise<TransactionConfirmationResult> {
    const device = getDevice(request.deviceId)
    const factors = uniqueFactors(request.factors)
    const requiredFactors = request.amountUsd >= 500 ? Math.min(2, device.multiFactorLimit) : 1

    if (factors.length < requiredFactors) {
      throw new Error('Additional biometric factors are required for this transaction.')
    }

    const supportedFactors = factors.slice(0, requiredFactors)
    const totalVerificationMs = supportedFactors.reduce((total, modality) => {
      return total + getCapability(device, modality).averageVerificationMs
    }, 160)

    await delay(totalVerificationMs)

    return {
      id: `bio_tx_${Date.now()}`,
      amountUsd: request.amountUsd,
      status: 'approved',
      requiredFactors,
      verifiedFactors: supportedFactors,
      verificationTimeMs: totalVerificationMs,
      approvedAt: new Date().toISOString(),
    }
  },

  async verifyFallback(
    deviceId: string,
    option: BiometricFallbackOption,
  ): Promise<FallbackVerificationResult> {
    const device = getDevice(deviceId)

    if (!device.fallbackOptions.includes(option)) {
      throw new Error('Fallback option is not supported on this device.')
    }

    await delay(850)

    return {
      deviceId,
      option,
      status: 'verified',
      verificationTimeMs: 850,
      verifiedAt: new Date().toISOString(),
    }
  },
}
