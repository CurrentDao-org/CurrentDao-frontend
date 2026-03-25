'use client'

import { CreditCard, TimerReset, Wallet2, Workflow } from 'lucide-react'
import {
  PaymentExecution,
  PaymentFlowMetrics,
  PaymentRail,
  PaymentSystem,
} from '@/types/mobile-wallet'

interface PaymentSystemsProps {
  systems: PaymentSystem[]
  selectedRail: PaymentRail
  onSelectRail: (rail: PaymentRail) => void
  lastTransaction: PaymentExecution | null
  paymentFlow: PaymentFlowMetrics | null
}

export function PaymentSystems({
  systems,
  selectedRail,
  onSelectRail,
  lastTransaction,
  paymentFlow,
}: PaymentSystemsProps) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Payment Systems
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            Mobile payment rails under 5 seconds
          </h3>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Flow reduction</p>
          <p className="text-2xl font-semibold text-emerald-900">
            {paymentFlow?.reducedStepsPercent ?? 50}%
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {systems.map((system) => {
          const isActive = system.id === selectedRail

          return (
            <button
              key={system.id}
              type="button"
              onClick={() => onSelectRail(system.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                isActive
                  ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Wallet2 className="h-4 w-4 text-emerald-700" />
                    <span className="font-semibold text-slate-900">{system.name}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{system.description}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Avg speed</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {(system.averageProcessingTimeMs / 1000).toFixed(1)}s
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1">
                  <TimerReset className="h-4 w-4 text-emerald-700" />
                  {system.settlementWindow}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1">
                  <CreditCard className="h-4 w-4 text-emerald-700" />
                  {system.feesLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1">
                  <Workflow className="h-4 w-4 text-emerald-700" />
                  {system.stepsRequired} steps
                </span>
                <span className="rounded-full bg-white px-3 py-1">
                  {system.deepLinkReady ? 'Deep-link ready' : 'QR fallback'}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {lastTransaction ? (
        <div className="mt-5 rounded-2xl bg-slate-900 p-4 text-white">
          <p className="text-sm uppercase tracking-[0.18em] text-emerald-200">Last mobile payment</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold">${lastTransaction.quote.total.toFixed(2)}</p>
              <p className="text-sm text-slate-300">
                {lastTransaction.quote.energyAmountKwh} kWh via {lastTransaction.quote.paymentRail}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-300">Completed in</p>
              <p className="text-xl font-semibold">
                {(lastTransaction.processingTimeMs / 1000).toFixed(1)}s
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-emerald-200">
                {lastTransaction.optimizationStepsSaved} steps saved
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
