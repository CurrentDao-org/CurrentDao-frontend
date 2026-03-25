import { mobileWalletService } from '@/services/mobile/mobile-wallet-service'

describe('mobileWalletService', () => {
  it('returns a catalog with at least 10 mobile wallets', async () => {
    const wallets = await mobileWalletService.listWallets()

    expect(wallets).toHaveLength(12)
    expect(wallets.every((wallet) => wallet.supportsNativeDeepLink)).toBe(true)
    expect(wallets.every((wallet) => wallet.averageOperationTimeMs < 1000)).toBe(true)
    expect(wallets.filter((wallet) => wallet.supportsBankLinking).length).toBeGreaterThanOrEqual(7)
  })

  it('connects a wallet with sub-second approval timing', async () => {
    const connection = await mobileWalletService.connectWallet('apple-wallet')

    expect(connection.status).toBe('connected')
    expect(connection.walletAddress).toContain('CUR-')
    expect(connection.approvalTimeMs).toBeLessThan(1000)
  })

  it('returns cross-device sync metrics under one second', async () => {
    const sync = await mobileWalletService.getWalletSyncSnapshot()

    expect(sync.crossDeviceContinuity).toBe(true)
    expect(sync.devices.length).toBeGreaterThanOrEqual(3)
    expect(sync.syncTimeMs).toBeLessThan(1000)
    expect(sync.pendingConflicts).toBe(0)
  })

  it('returns analytics for flow reduction and security audit posture', async () => {
    const analytics = await mobileWalletService.getWalletAnalytics()

    expect(analytics.averagePaymentTimeMs).toBeLessThan(5000)
    expect(analytics.paymentFlow.reducedStepsPercent).toBeGreaterThanOrEqual(50)
    expect(analytics.securityAudit.status).toBe('pass')
    expect(analytics.securityAudit.standards).toContain('PCI DSS')
  })
})
