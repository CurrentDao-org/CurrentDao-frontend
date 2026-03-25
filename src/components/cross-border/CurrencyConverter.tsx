'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRightLeft, Star, TrendingUp, RefreshCw } from 'lucide-react'
import type { Currency, Translations, CurrencyConversion, CurrencyPair } from '@/types/cross-border'
import { convertCurrency } from '@/services/cross-border/cross-border-service'
import { FAVORITE_PAIRS } from '@/services/cross-border/cross-border-service'

interface CurrencyConverterProps {
  currencies: Currency[]
  t: Translations
}

export function CurrencyConverter({ currencies, t }: CurrencyConverterProps) {
  const [fromCode, setFromCode] = useState('USD')
  const [toCode, setToCode] = useState('EUR')
  const [amount, setAmount] = useState('1000')
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [rateHistory] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      label: `${i + 1}h`,
      rate: 0.92 + Math.random() * 0.04,
    }))
  )

  useEffect(() => {
    handleConvert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCode, toCode])

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    setIsConverting(true)
    try {
      const result = await convertCurrency(fromCode, toCode, parseFloat(amount))
      setConversion(result)
    } finally {
      setIsConverting(false)
    }
  }

  const handleSwap = () => {
    setFromCode(toCode)
    setToCode(fromCode)
  }

  const handlePairClick = (pair: CurrencyPair) => {
    setFromCode(pair.from)
    setToCode(pair.to)
  }

  const fromCurrency = currencies.find(c => c.code === fromCode)
  const toCurrency = currencies.find(c => c.code === toCode)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Converter Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{t['currency.title']}</h3>
              <p className="text-sm text-blue-100">Real-time exchange rates for 22+ currencies</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* From / To currencies */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            {/* From */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t['currency.from']}</label>
              <select
                value={fromCode}
                onChange={e => setFromCode(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                min="0"
                step="0.01"
              />
              {fromCurrency && (
                <p className="text-xs text-gray-500">
                  {fromCurrency.flag} {fromCurrency.symbol}{parseFloat(amount || '0').toLocaleString()}
                </p>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center pb-6">
              <button
                onClick={handleSwap}
                className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all hover:rotate-180 duration-300"
              >
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              </button>
            </div>

            {/* To */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t['currency.to']}</label>
              <select
                value={toCode}
                onChange={e => setToCode(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-lg font-semibold text-gray-900 min-h-[46px] flex items-center">
                <AnimatePresence mode="wait">
                  {isConverting ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-gray-400"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Converting...</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key={conversion?.convertedAmount}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {conversion ? conversion.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '—'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {toCurrency && conversion && (
                <p className="text-xs text-gray-500">
                  {toCurrency.flag} {toCurrency.symbol}{conversion.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>

          {/* Exchange Rate Display */}
          {conversion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">{t['currency.rate']}:</span>
                <span className="font-semibold text-gray-900">
                  1 {fromCode} = {conversion.rate.toFixed(6)} {toCode}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                Updated: {new Date(conversion.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          )}

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
          >
            {isConverting ? t['trade.processing'] : t['currency.convert']}
          </button>
        </div>
      </div>

      {/* Quick Pairs & Rate History side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorite Pairs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-500" />
            <h4 className="font-semibold text-gray-900">{t['currency.favorites']}</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FAVORITE_PAIRS.map(pair => (
              <button
                key={pair.label}
                onClick={() => handlePairClick(pair)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  fromCode === pair.from && toCode === pair.to
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {pair.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mini Rate History */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900 mb-4">
            {fromCode}/{toCode} — 12h Trend
          </h4>
          <div className="flex items-end gap-1 h-20">
            {rateHistory.map((point, i) => {
              const max = Math.max(...rateHistory.map(p => p.rate))
              const min = Math.min(...rateHistory.map(p => p.rate))
              const range = max - min || 1
              const height = ((point.rate - min) / range) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 8)}%` }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    className={`w-full rounded-t ${
                      i === rateHistory.length - 1 ? 'bg-blue-600' : 'bg-blue-200'
                    }`}
                  />
                  <span className="text-[9px] text-gray-400">{point.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
