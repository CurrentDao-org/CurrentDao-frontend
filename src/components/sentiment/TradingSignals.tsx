'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTradingSignals } from '@/hooks/useSentimentData'
import { TradingSignal, SignalType, SignalConfidence } from '@/types/sentiment'
import { Zap, TrendingUp, Target, AlertCircle, CheckCircle } from 'lucide-react'

interface TradingSignalsProps {
  energyTypes?: string[]
  className?: string
  autoRefresh?: boolean
}

const SIGNAL_COLORS: Record<SignalType, { bg: string; text: string; icon: string }> = {
  strong_buy: { bg: 'bg-green-100', text: 'text-green-800', icon: '🚀' },
  buy: { bg: 'bg-lime-100', text: 'text-lime-800', icon: '📈' },
  hold: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏸️' },
  sell: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '📉' },
  strong_sell: { bg: 'bg-red-100', text: 'text-red-800', icon: '⚠️' },
}

const CONFIDENCE_COLORS: Record<SignalConfidence, string> = {
  very_high: 'bg-green-200 text-green-900',
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-orange-100 text-orange-800',
  very_low: 'bg-red-100 text-red-800',
}

const CONFIDENCE_SCORES: Record<SignalConfidence, number> = {
  very_high: 90,
  high: 70,
  medium: 50,
  low: 30,
  very_low: 10,
}

export const TradingSignals: React.FC<TradingSignalsProps> = ({
  energyTypes,
  className = '',
  autoRefresh = true,
}) => {
  const { signals, isLoading, error } = useTradingSignals(energyTypes as any, autoRefresh, 300000)

  // Sort signals by confidence and type
  const sortedSignals = useMemo(() => {
    return signals
      .sort((a, b) => {
        const confA = CONFIDENCE_SCORES[a.confidence]
        const confB = CONFIDENCE_SCORES[b.confidence]
        if (confA !== confB) return confB - confA

        // Strong buy/sell first
        const signalOrder = { strong_buy: 0, buy: 1, hold: 2, sell: 3, strong_sell: 4 }
        return (signalOrder[a.signal] || 5) - (signalOrder[b.signal] || 5)
      })
      .slice(0, 20)
  }, [signals])

  const stats = useMemo(() => {
    return {
      totalSignals: signals.length,
      strongBuy: signals.filter((s) => s.signal === 'strong_buy').length,
      buy: signals.filter((s) => s.signal === 'buy').length,
      hold: signals.filter((s) => s.signal === 'hold').length,
      sell: signals.filter((s) => s.signal === 'sell').length,
      strongSell: signals.filter((s) => s.signal === 'strong_sell').length,
      avgConfidence: signals.length > 0
        ? signals.reduce((sum, s) => sum + CONFIDENCE_SCORES[s.confidence], 0) / signals.length
        : 0,
    }
  }, [signals])

  if (error) {
    return (
      <div className={`rounded-lg bg-red-50 p-4 border border-red-200 ${className}`}>
        <p className="text-red-700">Failed to load trading signals</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap className="w-6 h-6 text-yellow-600" />
        <h2 className="text-xl font-bold text-gray-900">Sentiment-Based Trading Signals</h2>
        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
          {sortedSignals.length}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
          <p className="text-2xl font-bold text-green-700">🚀</p>
          <p className="text-xs text-green-600 font-medium mt-1">Strong Buy</p>
          <p className="text-lg font-bold text-green-900">{stats.strongBuy}</p>
        </div>

        <div className="bg-lime-50 rounded-lg p-3 border border-lime-200 text-center">
          <p className="text-2xl font-bold text-lime-700">📈</p>
          <p className="text-xs text-lime-600 font-medium mt-1">Buy</p>
          <p className="text-lg font-bold text-lime-900">{stats.buy}</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-center">
          <p className="text-2xl font-bold text-yellow-700">⏸️</p>
          <p className="text-xs text-yellow-600 font-medium mt-1">Hold</p>
          <p className="text-lg font-bold text-yellow-900">{stats.hold}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 text-center">
          <p className="text-2xl font-bold text-orange-700">📉</p>
          <p className="text-xs text-orange-600 font-medium mt-1">Sell</p>
          <p className="text-lg font-bold text-orange-900">{stats.sell}</p>
        </div>

        <div className="bg-red-50 rounded-lg p-3 border border-red-200 text-center">
          <p className="text-2xl font-bold text-red-700">⚠️</p>
          <p className="text-xs text-red-600 font-medium mt-1">Strong Sell</p>
          <p className="text-lg font-bold text-red-900">{stats.strongSell}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
          <p className="text-2xl font-bold text-blue-700">📊</p>
          <p className="text-xs text-blue-600 font-medium mt-1">Avg Confidence</p>
          <p className="text-lg font-bold text-blue-900">{stats.avgConfidence.toFixed(0)}%</p>
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {isLoading && sortedSignals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-8"
            >
              <div className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin" />
            </motion.div>
          ) : sortedSignals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 bg-gray-50 rounded-lg"
            >
              <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No trading signals available</p>
            </motion.div>
          ) : (
            sortedSignals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-lg border-l-4 p-4 ${SIGNAL_COLORS[signal.signal].bg} border-l-yellow-600 hover:shadow-lg transition-shadow`}
              >
                {/* Signal Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {/* Energy Type */}
                      <span className="text-sm font-bold px-3 py-1 bg-white rounded text-gray-900">
                        {signal.energyType.toUpperCase()}
                      </span>

                      {/* Signal Type */}
                      <span
                        className={`px-3 py-1 rounded text-sm font-bold ${SIGNAL_COLORS[signal.signal].text} ${SIGNAL_COLORS[signal.signal].bg}`}
                      >
                        {SIGNAL_COLORS[signal.signal].icon} {signal.signal.replace('_', ' ').toUpperCase()}
                      </span>

                      {/* Confidence Badge */}
                      <span
                        className={`px-3 py-1 rounded text-xs font-bold ${CONFIDENCE_COLORS[signal.confidence]}`}
                      >
                        {CONFIDENCE_SCORES[signal.confidence]}% Confidence
                      </span>
                    </div>

                    {/* Reasoning */}
                    <p className="text-sm text-gray-700 mt-2">{signal.reasoning}</p>
                  </div>

                  {/* Sentiment Score Badge */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-3xl font-bold text-gray-900">{signal.sentimentScore > 0 ? '+' : ''}{signal.sentimentScore}</div>
                    <p className="text-xs text-gray-600 mt-1">Sentiment</p>
                  </div>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-white bg-opacity-50 rounded">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Sentiment</p>
                    <p className="text-sm font-bold text-gray-900">{signal.sentimentScore}%</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-600">Technical</p>
                    <p className="text-sm font-bold text-gray-900">{signal.technicalScore}%</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-600">Fundamental</p>
                    <p className="text-sm font-bold text-gray-900">{signal.fundamentalScore}%</p>
                  </div>
                </div>

                {/* Price Targets */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {signal.targetPrice && (
                    <div className="flex items-center gap-2 p-2 bg-green-100 bg-opacity-50 rounded">
                      <Target className="w-4 h-4 text-green-700" />
                      <div>
                        <p className="text-xs text-green-600">Target</p>
                        <p className="font-semibold text-green-900">${signal.targetPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {signal.takeProfit && (
                    <div className="flex items-center gap-2 p-2 bg-blue-100 bg-opacity-50 rounded">
                      <CheckCircle className="w-4 h-4 text-blue-700" />
                      <div>
                        <p className="text-xs text-blue-600">Take Profit</p>
                        <p className="font-semibold text-blue-900">${signal.takeProfit.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {signal.stopLoss && (
                    <div className="flex items-center gap-2 p-2 bg-red-100 bg-opacity-50 rounded">
                      <AlertCircle className="w-4 h-4 text-red-700" />
                      <div>
                        <p className="text-xs text-red-600">Stop Loss</p>
                        <p className="font-semibold text-red-900">${signal.stopLoss.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Validity */}
                <div className="mt-3 pt-3 border-t border-gray-300 border-opacity-30">
                  <p className="text-xs text-gray-600">
                    Valid until: {new Date(signal.validUntil).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-3">Signal Guide</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
          <div>
            <p className="font-medium text-gray-900 mb-1">🚀 Strong Buy / 🔴 Strong Sell</p>
            <p>High conviction signals with strong sentiment and technical confirmation</p>
          </div>

          <div>
            <p className="font-medium text-gray-900 mb-1">📈 Buy / 📉 Sell</p>
            <p>Moderate conviction signals with positive or negative sentiment trend</p>
          </div>

          <div>
            <p className="font-medium text-gray-900 mb-1">⏸️ Hold</p>
            <p>Mixed signals or neutral sentiment - wait for clearer direction</p>
          </div>
        </div>
      </div>
    </div>
  )
}
