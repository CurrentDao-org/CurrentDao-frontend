import { biometricService } from '@/services/security/biometric-service'

describe('biometricService', () => {
  it('loads device profiles with fallback coverage and FIPS-grade storage', async () => {
    const devices = await biometricService.listDevices()

    expect(devices.length).toBeGreaterThanOrEqual(4)
    expect(devices.every((device) => device.fallbackOptions.length >= 1)).toBe(true)
    expect(devices.every((device) => device.secureStorage.fipsStandard.startsWith('FIPS'))).toBe(
      true,
    )
  })

  it('verifies fingerprint access in under one second', async () => {
    const result = await biometricService.authenticate({
      deviceId: 'iphone-15-pro',
      modality: 'fingerprint',
      useCase: 'app-access',
    })

    expect(result.status).toBe('verified')
    expect(result.verificationTimeMs).toBeLessThan(1000)
  })

  it('reports face recognition accuracy above 98 percent and voice verification within two seconds', async () => {
    const analytics = await biometricService.getAnalytics()

    expect(analytics.faceRecognitionAccuracy).toBeGreaterThan(0.98)
    expect(analytics.voiceVerificationMs).toBeLessThanOrEqual(2000)
    expect(analytics.fallbackCoveragePercent).toBe(100)
  })

  it('requires multi-factor biometrics for higher-value transactions', async () => {
    await expect(
      biometricService.confirmTransaction({
        deviceId: 'iphone-15-pro',
        amountUsd: 1200,
        factors: ['fingerprint'],
      }),
    ).rejects.toThrow('Additional biometric factors are required')

    const approval = await biometricService.confirmTransaction({
      deviceId: 'iphone-15-pro',
      amountUsd: 1200,
      factors: ['fingerprint', 'face'],
    })

    expect(approval.requiredFactors).toBe(2)
    expect(approval.verifiedFactors).toEqual(['fingerprint', 'face'])
  })
})
