import { paymentService } from '@/services/mobile/payment-service'

describe('paymentService', () => {
  it('lists mobile payment systems and banking accounts', async () => {
    const [systems, accounts] = await Promise.all([
      paymentService.listPaymentSystems(),
      paymentService.listBankAccounts(),
    ])

    expect(systems.length).toBeGreaterThanOrEqual(6)
    expect(systems.every((system) => system.mobileOptimized)).toBe(true)
    expect(systems.every((system) => system.stepsRequired <= 3)).toBe(true)
    expect(accounts.length).toBe(3)
    expect(accounts.some((account) => account.supportsInstantPayments)).toBe(true)
  })

  it('creates a payment quote with deterministic fees', async () => {
    const quote = await paymentService.createPaymentQuote({
      walletId: 'apple-wallet',
      paymentRail: 'instant-bank',
      energyAmountKwh: 120,
      unitPrice: 0.09,
      currency: 'USD',
    })

    expect(quote.subtotal).toBe(10.8)
    expect(quote.fee).toBe(0.04)
    expect(quote.total).toBe(10.84)
    expect(quote.estimatedCompletionMs).toBeLessThan(5000)
  })

  it('applies tokenized card pricing for native wallet rails', async () => {
    const quote = await paymentService.createPaymentQuote({
      walletId: 'apple-wallet',
      paymentRail: 'apple-pay',
      energyAmountKwh: 120,
      unitPrice: 0.09,
      currency: 'USD',
    })

    expect(quote.subtotal).toBe(10.8)
    expect(quote.fee).toBe(0.09)
    expect(quote.total).toBe(10.89)
    expect(quote.estimatedCompletionMs).toBeLessThan(5000)
  })

  it('processes mobile payments within five seconds', async () => {
    const quote = await paymentService.createPaymentQuote({
      walletId: 'paypal',
      paymentRail: 'wallet-balance',
      energyAmountKwh: 100,
      unitPrice: 0.08,
      currency: 'USD',
    })
    const execution = await paymentService.processPayment(quote)

    expect(execution.status).toBe('completed')
    expect(execution.processingTimeMs).toBeLessThan(5000)
    expect(execution.optimizationStepsSaved).toBeGreaterThanOrEqual(3)
  })

  it('syncs banking balances with updated timestamps', async () => {
    const syncedAccounts = await paymentService.syncBankAccounts()

    expect(syncedAccounts.every((account) => account.syncStatus === 'synced')).toBe(true)
    expect(
      syncedAccounts.every((account) => Date.parse(account.lastSyncedAt) > 0),
    ).toBe(true)
    expect(syncedAccounts[0]?.provider).toBe('Direct API')
    expect(syncedAccounts[1]?.supportsInstantPayments).toBe(true)
  })
})
