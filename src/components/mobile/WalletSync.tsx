'use client'

import { Activity, BarChart3, Shield, Smartphone } from 'lucide-react'
import { WalletAnalyticsSnapshot, WalletSyncSnapshot } from '@/types/mobile-wallet'

interface WalletSyncProps {
  syncSnapshot: WalletSyncSnapshot | null
  analytics: WalletAnalyticsSnapshot | null
}

export function WalletSync({ syncSnapshot, analytics }: WalletSyncProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-700">
          Wallet Synchronization
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">
          Cross-device wallet continuity with sub-second sync
        </h3>

        <div className="mt-5 grid gap-3">
          {syncSnapshot?.devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 shadow-sm">
                  <Smartphone className="h-5 w-5 text-violet-700" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{device.deviceName}</p>
                  <p className="text-sm text-slate-600">{device.platform}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{device.syncState}</p>
                <p className="text-xs text-slate-500">
                  {new Date(device.lastSyncedAt).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {syncSnapshot ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-700">Coverage</p>
              <p className="mt-2 text-2xl font-semibold text-violet-950">
                {syncSnapshot.syncCoveragePercent}%
              </p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-700">Sync time</p>
              <p className="mt-2 text-2xl font-semibold text-violet-950">
                {syncSnapshot.syncTimeMs}ms
              </p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-700">Continuity</p>
              <p className="mt-2 text-2xl font-semibold text-violet-950">
                {syncSnapshot.crossDeviceContinuity ? 'On' : 'Off'}
              </p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-4 sm:col-span-3">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-700">
                Conflict resolution
              </p>
              <p className="mt-2 text-lg font-semibold text-violet-950">
                {syncSnapshot.pendingConflicts === 0 ? 'No pending conflicts' : 'Review needed'}
              </p>
              <p className="mt-1 text-sm text-violet-900/80">
                Last resolved{' '}
                {new Date(syncSnapshot.lastConflictResolvedAt).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
          Security + Analytics
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">
          Mobile wallet usage insights
        </h3>

        {analytics ? (
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Average payment time</span>
              </div>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {(analytics.averagePaymentTimeMs / 1000).toFixed(1)}s
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Repeat wallet usage</span>
              </div>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {(analytics.repeatWalletUsageRate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Security audit</span>
              </div>
              <p className="mt-2 text-xl font-semibold capitalize text-slate-900">
                {analytics.securityAudit.status}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {analytics.securityAudit.standards.join(', ')}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Top mobile wallets</span>
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {analytics.topWallets.join(', ')}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Peak usage window: {analytics.peakUsageWindow}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Usage patterns</span>
              </div>
              <div className="mt-3 space-y-2">
                {analytics.usagePatterns.map((pattern) => (
                  <div key={pattern.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{pattern.label}</span>
                    <span className="font-semibold text-slate-900">
                      {(pattern.share * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
