'use client'

import { Building2, RefreshCw, ShieldCheck, Smartphone, Zap } from 'lucide-react'
import { BankAccountConnection } from '@/types/mobile-wallet'

interface BankingIntegrationProps {
  accounts: BankAccountConnection[]
  onRefresh: () => Promise<void>
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function BankingIntegration({ accounts, onRefresh }: BankingIntegrationProps) {
  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Banking Connections
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            Synced balances for instant funding decisions
          </h3>
        </div>
        <button
          type="button"
          onClick={() => void onRefresh()}
          className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 transition hover:bg-sky-100"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-sky-700" />
                  <p className="font-semibold text-slate-900">{account.bankName}</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {account.accountLabel} | {account.accountType}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Available</p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatMoney(account.availableBalance, account.currency)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1">
                <ShieldCheck className="h-4 w-4 text-sky-700" />
                {account.syncStatus === 'synced' ? 'Balance synced' : 'Syncing'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1">
                <Smartphone className="h-4 w-4 text-sky-700" />
                {account.mobileApp}
              </span>
              <span className="rounded-full bg-white px-3 py-1">{account.provider}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1">
                <Zap className="h-4 w-4 text-sky-700" />
                {account.supportsInstantPayments ? 'Instant pay enabled' : 'ACH fallback'}
              </span>
              <span className="rounded-full bg-white px-3 py-1 capitalize">
                Health: {account.connectionHealth}
              </span>
              <span className="rounded-full bg-white px-3 py-1">
                Updated{' '}
                {new Date(account.lastSyncedAt).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
