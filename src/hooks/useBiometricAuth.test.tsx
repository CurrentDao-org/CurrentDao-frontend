import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useBiometricAuth } from '@/hooks/useBiometricAuth'
import { biometricService } from '@/services/security/biometric-service'
import {
  BiometricAnalyticsSnapshot,
  BiometricAuthenticationResult,
  BiometricDeviceProfile,
  FallbackVerificationResult,
  TransactionConfirmationResult,
} from '@/types/biometric'

jest.mock('@/services/security/biometric-service', () => ({
  biometricService: {
    listDevices: jest.fn(),
    getAnalytics: jest.fn(),
    authenticate: jest.fn(),
    confirmTransaction: jest.fn(),
    verifyFallback: jest.fn(),
  },
}))

type HookSnapshot = ReturnType<typeof useBiometricAuth>

const mockedBiometricService = biometricService as jest.Mocked<typeof biometricService>

const devicesFixture: BiometricDeviceProfile[] = [
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    platform: 'ios',
    supportedModalities: ['fingerprint', 'face', 'voice'],
    fallbackOptions: ['device-pin', 'passkey'],
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
    id: 'companion-browser',
    name: 'Companion Browser',
    platform: 'cross-platform',
    supportedModalities: ['voice'],
    fallbackOptions: ['passkey', 'recovery-code'],
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

const analyticsFixture: BiometricAnalyticsSnapshot = {
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
    standards: ['FIPS 140-3', 'SOC 2'],
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

const authFixture: BiometricAuthenticationResult = {
  deviceId: 'iphone-15-pro',
  modality: 'fingerprint',
  useCase: 'app-access',
  status: 'verified',
  verifiedAt: '2026-03-24T15:00:00.000Z',
  verificationTimeMs: 420,
  confidenceScore: 0.992,
}

const fallbackFixture: FallbackVerificationResult = {
  deviceId: 'iphone-15-pro',
  option: 'passkey',
  status: 'verified',
  verificationTimeMs: 850,
  verifiedAt: '2026-03-24T15:01:00.000Z',
}

const approvalFixture: TransactionConfirmationResult = {
  id: 'bio_tx_123',
  amountUsd: 1200,
  status: 'approved',
  requiredFactors: 2,
  verifiedFactors: ['fingerprint', 'face'],
  verificationTimeMs: 1340,
  approvedAt: '2026-03-24T15:02:00.000Z',
}

function renderHarness() {
  const container = document.createElement('div')
  const root = createRoot(container)
  let latest: HookSnapshot | null = null

  function Harness() {
    const hook = useBiometricAuth()

    useEffect(() => {
      latest = hook
    })

    return null
  }

  return {
    async mount() {
      await act(async () => {
        root.render(<Harness />)
      })
    },
    latest() {
      return latest
    },
    async flush() {
      await act(async () => {
        await Promise.resolve()
      })
    },
    async unmount() {
      await act(async () => {
        root.unmount()
      })
    },
  }
}

describe('useBiometricAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockedBiometricService.listDevices.mockResolvedValue(devicesFixture)
    mockedBiometricService.getAnalytics.mockResolvedValue(analyticsFixture)
    mockedBiometricService.authenticate.mockResolvedValue(authFixture)
    mockedBiometricService.verifyFallback.mockResolvedValue(fallbackFixture)
    mockedBiometricService.confirmTransaction.mockResolvedValue(approvalFixture)
  })

  it('loads biometric profiles and completes access, fallback, and transaction flows', async () => {
    const harness = renderHarness()
    await harness.mount()
    await harness.flush()

    expect(harness.latest()?.selectedDeviceId).toBe('iphone-15-pro')
    expect(harness.latest()?.selectedModality).toBe('fingerprint')
    expect(harness.latest()?.fallbackCoveragePercent).toBe(100)

    await act(async () => {
      harness.latest()?.toggleFactor('face')
    })

    expect(harness.latest()?.selectedFactors).toEqual(['fingerprint', 'face'])

    await act(async () => {
      await harness.latest()?.authenticateSelected()
    })

    expect(harness.latest()?.lastAccessVerification?.status).toBe('verified')

    await act(async () => {
      await harness.latest()?.verifyFallback('passkey')
    })

    expect(harness.latest()?.lastFallbackVerification?.option).toBe('passkey')

    await act(async () => {
      await harness.latest()?.confirmTransaction(1200)
    })

    expect(harness.latest()?.lastTransactionApproval?.requiredFactors).toBe(2)

    await harness.unmount()
  })

  it('remaps unsupported modalities when switching devices', async () => {
    const harness = renderHarness()
    await harness.mount()
    await harness.flush()

    await act(async () => {
      harness.latest()?.setSelectedModality('face')
      harness.latest()?.setSelectedDeviceId('companion-browser')
    })
    await harness.flush()

    expect(harness.latest()?.selectedModality).toBe('voice')
    expect(harness.latest()?.selectedFactors).toEqual(['voice'])

    await harness.unmount()
  })

  it('surfaces loading and action errors', async () => {
    mockedBiometricService.listDevices.mockRejectedValueOnce(new Error('load failed'))

    const loadHarness = renderHarness()
    await loadHarness.mount()
    await loadHarness.flush()

    expect(loadHarness.latest()?.error).toBe('Unable to load biometric authentication profiles.')
    expect(loadHarness.latest()?.isLoading).toBe(false)
    await loadHarness.unmount()

    mockedBiometricService.authenticate.mockRejectedValueOnce(new Error('auth failed'))
    mockedBiometricService.confirmTransaction.mockRejectedValueOnce(
      new Error('Additional biometric factors are required for this transaction.'),
    )
    mockedBiometricService.verifyFallback.mockRejectedValueOnce(new Error('fallback failed'))

    const harness = renderHarness()
    await harness.mount()
    await harness.flush()

    await act(async () => {
      harness.latest()?.setSelectedDeviceId('iphone-15-pro')
    })
    await harness.flush()

    await act(async () => {
      await harness.latest()?.authenticateSelected()
    })
    expect(harness.latest()?.error).toBe('Biometric app access verification failed.')

    await act(async () => {
      await harness.latest()?.verifyFallback('passkey')
    })
    expect(harness.latest()?.error).toBe('Fallback verification failed.')

    await act(async () => {
      await harness.latest()?.confirmTransaction(1200)
    })
    expect(harness.latest()?.error).toBe(
      'Additional biometric factors are required for this transaction.',
    )

    await harness.unmount()
  })
})
