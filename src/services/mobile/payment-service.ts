import {
  BankAccountConnection,
  PaymentExecution,
  PaymentQuote,
  PaymentRequest,
  PaymentSystem,
} from '@/types/mobile-wallet'

const paymentSystems: PaymentSystem[] = [
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    settlementWindow: 'Instant',
    averageProcessingTimeMs: 1800,
    feesLabel: '0.8% + tokenized card fees',
    stepsRequired: 3,
    deepLinkReady: true,
    mobileOptimized: true,
    supportedWalletIds: ['apple-wallet', 'paypal', 'revolut', 'monzo'],
    description: 'One-tap iOS checkout using Face ID and secure element tokenization.',
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    settlementWindow: 'Instant',
    averageProcessingTimeMs: 1900,
    feesLabel: '0.8% + network fees',
    stepsRequired: 3,
    deepLinkReady: true,
    mobileOptimized: true,
    supportedWalletIds: ['google-wallet', 'samsung-wallet', 'paypal', 'cash-app'],
    description: 'Android-native payment flow with deep-link approval.',
  },
  {
    id: 'wallet-balance',
    name: 'Wallet Balance',
    settlementWindow: 'Under 2 seconds',
    averageProcessingTimeMs: 950,
    feesLabel: '0.25% platform fee',
    stepsRequired: 2,
    deepLinkReady: true,
    mobileOptimized: true,
    supportedWalletIds: ['paypal', 'cash-app', 'venmo', 'coinbase-wallet', 'phantom'],
    description: 'Uses stored balance for the fastest repeat energy purchases.',
  },
  {
    id: 'instant-bank',
    name: 'Instant Bank',
    settlementWindow: '2 to 4 seconds',
    averageProcessingTimeMs: 2800,
    feesLabel: '0.4% open banking fee',
    stepsRequired: 3,
    deepLinkReady: true,
    mobileOptimized: true,
    supportedWalletIds: ['apple-wallet', 'google-wallet', 'revolut', 'monzo', 'mpesa'],
    description: 'Push payments with account balance verification before settlement.',
  },
  {
    id: 'open-banking',
    name: 'Open Banking',
    settlementWindow: '3 to 5 seconds',
    averageProcessingTimeMs: 3200,
    feesLabel: '0.35% regulated API fee',
    stepsRequired: 3,
    deepLinkReady: true,
    mobileOptimized: true,
    supportedWalletIds: ['revolut', 'monzo', 'paypal', 'apple-wallet', 'google-wallet'],
    description: 'Bank app redirect with immediate balance sync and consented payment initiation.',
  },
  {
    id: 'qr-pay',
    name: 'QR Utility Pay',
    settlementWindow: '2 to 4 seconds',
    averageProcessingTimeMs: 2400,
    feesLabel: '0.3% merchant-present fee',
    stepsRequired: 3,
    deepLinkReady: false,
    mobileOptimized: true,
    supportedWalletIds: ['mpesa', 'paypal', 'cash-app', 'venmo', 'phantom'],
    description: 'Scan-to-settle flows for field energy settlement and local transfers.',
  },
]

const bankAccounts: BankAccountConnection[] = [
  {
    id: 'bank-1',
    bankName: 'Monzo',
    mobileApp: 'Monzo US',
    provider: 'Direct API',
    accountLabel: 'Operating Balance',
    accountType: 'checking',
    currency: 'USD',
    availableBalance: 18240.33,
    supportsInstantPayments: true,
    connectionHealth: 'healthy',
    syncStatus: 'synced',
    lastSyncedAt: '2026-03-24T09:33:00.000Z',
  },
  {
    id: 'bank-2',
    bankName: 'Revolut Business',
    mobileApp: 'Revolut Business',
    provider: 'TrueLayer',
    accountLabel: 'Trading Float',
    accountType: 'treasury',
    currency: 'USD',
    availableBalance: 42890.1,
    supportsInstantPayments: true,
    connectionHealth: 'healthy',
    syncStatus: 'synced',
    lastSyncedAt: '2026-03-24T09:32:40.000Z',
  },
  {
    id: 'bank-3',
    bankName: 'Community Solar CU',
    mobileApp: 'Community Solar CU',
    provider: 'Plaid',
    accountLabel: 'Reserve Savings',
    accountType: 'savings',
    currency: 'USD',
    availableBalance: 9760.55,
    supportsInstantPayments: false,
    connectionHealth: 'monitoring',
    syncStatus: 'synced',
    lastSyncedAt: '2026-03-24T09:31:20.000Z',
  },
]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clampToCents(value: number) {
  return Math.round(value * 100) / 100
}

function feeRateForRail(rail: PaymentSystem['id']) {
  switch (rail) {
    case 'wallet-balance':
      return 0.0025
    case 'instant-bank':
    case 'open-banking':
      return 0.004
    case 'qr-pay':
      return 0.003
    default:
      return 0.008
  }
}

export const paymentService = {
  async listPaymentSystems(): Promise<PaymentSystem[]> {
    await delay(120)
    return paymentSystems
  },

  async listBankAccounts(): Promise<BankAccountConnection[]> {
    await delay(150)
    return bankAccounts
  },

  async syncBankAccounts(): Promise<BankAccountConnection[]> {
    await delay(360)
    return bankAccounts.map((account, index) => ({
      ...account,
      availableBalance: clampToCents(account.availableBalance + (index + 1) * 14.12),
      syncStatus: 'synced' as const,
      lastSyncedAt: new Date().toISOString(),
    }))
  },

  async createPaymentQuote(request: PaymentRequest): Promise<PaymentQuote> {
    await delay(140)
    const subtotal = clampToCents(request.energyAmountKwh * request.unitPrice)
    const fee = clampToCents(subtotal * feeRateForRail(request.paymentRail))
    return {
      ...request,
      subtotal,
      fee,
      total: clampToCents(subtotal + fee),
      estimatedCompletionMs:
        paymentSystems.find((system) => system.id === request.paymentRail)
          ?.averageProcessingTimeMs ?? 3000,
    }
  },

  async processPayment(quote: PaymentQuote): Promise<PaymentExecution> {
    await delay(quote.estimatedCompletionMs)
    return {
      id: `pay_${quote.walletId}_${Date.now()}`,
      quote,
      status: 'completed',
      processedAt: new Date().toISOString(),
      processingTimeMs: quote.estimatedCompletionMs,
      optimizationStepsSaved: 3,
    }
  },
}
