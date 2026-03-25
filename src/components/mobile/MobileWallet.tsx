'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  CreditCard,
  Cpu,
  ShieldCheck,
  Smartphone,
  Wallet2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useMobileWallet } from '@/hooks/useMobileWallet'
import { BankingIntegration } from '@/components/mobile/BankingIntegration'
import { PaymentSystems } from '@/components/mobile/PaymentSystems'
import { WalletSync } from '@/components/mobile/WalletSync'

function formatPercent(value: number) {
  return `${(value * 100).toFixed(0)}%`
}

export function MobileWallet() {
  const [energyAmountKwh, setEnergyAmountKwh] = useState('120')
  const [unitPrice, setUnitPrice] = useState('0.09')
  const {
    wallets,
    compatiblePaymentSystems,
    bankAccounts,
    syncSnapshot,
    analytics,
    paymentFlowMetrics,
    securityAudit,
    selectedWallet,
    selectedWalletId,
    selectedPaymentRail,
    connection,
    lastTransaction,
    error,
    isLoading,
    isProcessingPayment,
    setSelectedWalletId,
    setSelectedPaymentRail,
    connectSelectedWallet,
    refreshSync,
    runPayment,
    supportedWalletCount,
    nativeWalletCount,
    bankLinkedWalletCount,
    energyOptimizedWalletCount,
    averageWalletOperationTimeMs,
    walletPerformanceWithinTarget,
  } = useMobileWallet()

  async function handleConnect() {
    const result = await connectSelectedWallet()

    if (result) {
      toast.success(`${selectedWallet?.name ?? 'Wallet'} connected`)
    }
  }

  async function handlePayment() {
    const energyAmount = Number(energyAmountKwh)
    const price = Number(unitPrice)

    if (!energyAmount || !price) {
      toast.error('Enter an energy amount and price.')
      return
    }

    const result = await runPayment({
      energyAmountKwh: energyAmount,
      unitPrice: price,
    })

    if (result) {
      toast.success(`Payment completed in ${(result.processingTimeMs / 1000).toFixed(1)}s`)
    }
  }

  return (
    <section
      id="mobile-wallets"
      className="space-y-6 rounded-[2rem] bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 p-6 text-white shadow-2xl md:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-200">
            Mobile Wallet Integration
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            Native wallet, banking, and mobile payment flows for energy trading.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-slate-200">
            This mobile layer connects native wallets, open banking rails, and
            energy-specific settlement flows with under-1-second wallet operations and
            payment completion targets below 5 seconds.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
                Wallet coverage
              </p>
              <p className="mt-2 text-3xl font-semibold">{supportedWalletCount} wallets</p>
              <p className="mt-1 text-sm text-emerald-100/80">{nativeWalletCount} native</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
                Wallet operation speed
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {(averageWalletOperationTimeMs / 1000).toFixed(2)}s
              </p>
              <p className="mt-1 text-sm text-emerald-100/80">
                {walletPerformanceWithinTarget ? 'Under target' : 'Needs tuning'}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
                Payment completion
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {analytics ? (analytics.averagePaymentTimeMs / 1000).toFixed(1) : '2.8'}s
              </p>
              <p className="mt-1 text-sm text-emerald-100/80">
                {bankLinkedWalletCount} bank-linked wallets
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
                Energy wallets
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {energyOptimizedWalletCount}
              </p>
              <p className="mt-1 text-sm text-emerald-100/80">
                {analytics ? formatPercent(analytics.mobileConversionRate) : '78%'} conversion
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">
                Optimized payment flow
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {paymentFlowMetrics?.optimizedStepCount ?? 3} taps to buy energy
              </h3>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <CreditCard className="h-6 w-6 text-emerald-100" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-100">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Select mobile wallet
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Approve with biometrics
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Balance sync and instant settlement
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Reduce checkout from {paymentFlowMetrics?.previousStepCount ?? 6} to{' '}
              {paymentFlowMetrics?.optimizedStepCount ?? 3} steps
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Native Wallets
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                Connect a wallet optimized for mobile energy payments
              </h3>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3">
              <Wallet2 className="h-6 w-6 text-emerald-700" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {wallets.map((wallet) => {
              const isSelected = wallet.id === selectedWalletId

              return (
                <button
                  key={wallet.id}
                  type="button"
                  onClick={() => setSelectedWalletId(wallet.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div
                        className={`inline-flex rounded-2xl bg-gradient-to-r ${wallet.logoAccent} px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white`}
                      >
                        {wallet.platform}
                      </div>
                      <p className="mt-3 text-lg font-semibold text-slate-900">{wallet.name}</p>
                      <p className="mt-2 text-sm text-slate-600">{wallet.description}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                        Energy features
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {wallet.energyTradingFeatures.slice(0, 2).join(' | ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Readiness
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {wallet.mobileReadinessScore}
                      </p>
                      <p className="text-xs text-slate-500">{wallet.averageOperationTimeMs}ms op time</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                    {wallet.security.complianceBadges.slice(0, 2).map((badge) => (
                      <span key={badge} className="rounded-full bg-white px-3 py-1">
                        {badge}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Mobile Checkout
              </p>
              <h3 className="mt-2 text-2xl font-semibold">Run a wallet-backed energy payment</h3>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3">
              <Smartphone className="h-6 w-6 text-emerald-700" />
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Selected wallet</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {selectedWallet?.name ?? 'Loading wallet catalog...'}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Security tier: {selectedWallet?.security.securityTier ?? 'enhanced'}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Bank app links: {selectedWallet?.bankingAppIds.length ?? 0}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Energy amount (kWh)</span>
                <input
                  type="number"
                  min="1"
                  value={energyAmountKwh}
                  onChange={(event) => setEnergyAmountKwh(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Unit price (USD)</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Cpu className="h-4 w-4 text-emerald-700" />
                Security integration
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                {(securityAudit?.standards ?? selectedWallet?.security.standards ?? []).map(
                  (standard) => (
                    <span key={standard} className="rounded-full bg-white px-3 py-1">
                      {standard}
                    </span>
                  ),
                )}
              </div>
              <p className="text-sm text-slate-600">
                Audit status: {securityAudit?.status ?? 'pass'} | Fraud detection latency:{' '}
                {securityAudit?.fraudDetectionLatencyMs ?? 310}ms
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleConnect()}
                disabled={!selectedWallet || isLoading}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <ShieldCheck className="h-4 w-4" />
                {connection?.walletId === selectedWalletId ? 'Wallet Connected' : 'Connect Wallet'}
              </button>
              <button
                type="button"
                onClick={() => void handlePayment()}
                disabled={!selectedWallet || isProcessingPayment}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 font-medium text-slate-900 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {isProcessingPayment ? 'Processing...' : 'Pay for Energy'}
              </button>
            </div>

            {connection ? (
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-950">
                Connected address: <span className="font-semibold">{connection.walletAddress}</span>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
            ) : null}
          </div>
        </div>
      </div>

      <PaymentSystems
        systems={compatiblePaymentSystems}
        selectedRail={selectedPaymentRail}
        onSelectRail={setSelectedPaymentRail}
        lastTransaction={lastTransaction}
        paymentFlow={paymentFlowMetrics}
      />

      <BankingIntegration accounts={bankAccounts} onRefresh={refreshSync} />
      <WalletSync syncSnapshot={syncSnapshot} analytics={analytics} />
    </section>
  )
}
