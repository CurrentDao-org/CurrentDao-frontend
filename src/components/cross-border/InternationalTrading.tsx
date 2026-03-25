'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  ArrowRightLeft,
  Shield,
  Package,
  BarChart3,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Languages,
  Zap,
  Clock,
  TrendingUp,
  ChevronRight,
  CheckCircle,
} from 'lucide-react'
import { useCrossBorderTrading } from '@/hooks/useCrossBorderTrading'
import { CurrencyConverter } from './CurrencyConverter'
import { RegulatoryCompliance } from './RegulatoryCompliance'
import { CustomsIntegration } from './CustomsIntegration'
import { GlobalAnalytics } from './GlobalAnalytics'
import type { CrossBorderTab, EnergyMarket } from '@/types/cross-border'

const TAB_ICONS: Record<CrossBorderTab, typeof Globe> = {
  markets: Globe,
  currency: ArrowRightLeft,
  compliance: Shield,
  customs: Package,
  analytics: BarChart3,
}

export function InternationalTrading() {
  const {
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    t,
    languages,
    markets,
    currencies,
    regulations,
    customsRegions,
    analytics,
    isLoadingMarkets,
    isLoadingCurrencies,
    isLoadingRegulations,
    isLoadingCustoms,
    isLoadingAnalytics,
    recentTrades,
    executeTrade,
    isExecutingTrade,
  } = useCrossBorderTrading()

  const [marketSearch, setMarketSearch] = useState('')
  const [tradeModal, setTradeModal] = useState<EnergyMarket | null>(null)
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [tradeSuccess, setTradeSuccess] = useState(false)

  const tabs: CrossBorderTab[] = ['markets', 'currency', 'compliance', 'customs', 'analytics']

  const filteredMarkets = markets.filter(
    m =>
      m.country.name.toLowerCase().includes(marketSearch.toLowerCase()) ||
      m.country.code.toLowerCase().includes(marketSearch.toLowerCase()) ||
      m.country.region.toLowerCase().includes(marketSearch.toLowerCase())
  )

  const handleExecuteTrade = () => {
    if (!tradeModal || !tradeAmount) return
    setTradeSuccess(false)
    executeTrade(
      {
        sourceCountry: 'US',
        destCountry: tradeModal.country.code,
        type: tradeType,
        amountKwh: parseFloat(tradeAmount),
        currency: tradeModal.currency,
      },
      {
        onSuccess: () => {
          setTradeSuccess(true)
          setTimeout(() => {
            setTradeModal(null)
            setTradeAmount('')
            setTradeSuccess(false)
          }, 2000)
        },
      }
    )
  }

  const statusColors: Record<string, string> = {
    open: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-gray-100 text-gray-600',
    restricted: 'bg-red-100 text-red-700',
    'pre-market': 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Globe className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{t['header.title']}</h1>
                <p className="text-blue-200 text-sm mt-1">{t['header.subtitle']}</p>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
              <Languages className="w-4 h-4 text-blue-300" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as typeof language)}
                className="bg-transparent text-white text-sm border-none outline-none cursor-pointer"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code} className="text-gray-900">
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/5 rounded-lg px-4 py-3 backdrop-blur-sm">
              <p className="text-xs text-blue-300">Markets</p>
              <p className="text-xl font-bold">{markets.length}</p>
            </div>
            <div className="bg-white/5 rounded-lg px-4 py-3 backdrop-blur-sm">
              <p className="text-xs text-blue-300">Currencies</p>
              <p className="text-xl font-bold">{currencies.length}</p>
            </div>
            <div className="bg-white/5 rounded-lg px-4 py-3 backdrop-blur-sm">
              <p className="text-xs text-blue-300">Regions</p>
              <p className="text-xl font-bold">{customsRegions.length}</p>
            </div>
            <div className="bg-white/5 rounded-lg px-4 py-3 backdrop-blur-sm">
              <p className="text-xs text-blue-300">Languages</p>
              <p className="text-xl font-bold">{languages.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = TAB_ICONS[tab]
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t[`nav.${tab}` as keyof typeof t]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'markets' && (
          <motion.div
            key="markets"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Search + Filter */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={marketSearch}
                  onChange={e => setMarketSearch(e.target.value)}
                  placeholder={t['markets.searchPlaceholder']}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Markets Table */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              {isLoadingMarkets ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-6 py-3 font-medium text-gray-600">{t['markets.country']}</th>
                        <th className="text-right px-6 py-3 font-medium text-gray-600">{t['markets.price']}</th>
                        <th className="text-right px-6 py-3 font-medium text-gray-600">{t['markets.volume']}</th>
                        <th className="text-right px-6 py-3 font-medium text-gray-600">{t['markets.change']}</th>
                        <th className="text-center px-6 py-3 font-medium text-gray-600">Renewable</th>
                        <th className="text-center px-6 py-3 font-medium text-gray-600">{t['markets.status']}</th>
                        <th className="text-center px-6 py-3 font-medium text-gray-600">{t['markets.trade']}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredMarkets.map((market, i) => (
                        <motion.tr
                          key={market.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{market.country.flag}</span>
                              <div>
                                <p className="font-medium text-gray-900">{market.country.name}</p>
                                <p className="text-xs text-gray-500">{market.country.region} · {market.country.regulatoryBody}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            ${market.pricePerKwh.toFixed(4)}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-700">
                            {market.volume24h.toLocaleString()} kWh
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`flex items-center justify-end gap-1 font-medium ${market.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {market.change24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {Math.abs(market.change24h).toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-emerald-500 h-1.5 rounded-full"
                                  style={{ width: `${market.renewablePercentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{market.renewablePercentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[market.status]}`}>
                              {market.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => { setTradeModal(market); setTradeSuccess(false) }}
                              disabled={market.status === 'closed'}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {t['markets.trade']}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent trades */}
            {recentTrades.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Recent Trades
                </h4>
                <div className="space-y-3">
                  {recentTrades.map(trade => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${trade.type === 'buy' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                          {trade.type === 'buy' ? (
                            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {trade.type === 'buy' ? t['trade.buy'] : t['trade.sell']} {trade.amountKwh.toLocaleString()} kWh
                          </p>
                          <p className="text-xs text-gray-500">
                            {trade.sourceCountry} → {trade.destCountry} · {trade.id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">${trade.totalValue.toLocaleString()}</p>
                        <p className="text-xs text-emerald-600">Completed</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'currency' && (
          <motion.div
            key="currency"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CurrencyConverter currencies={currencies} t={t} />
          </motion.div>
        )}

        {activeTab === 'compliance' && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <RegulatoryCompliance regulations={regulations} t={t} isLoading={isLoadingRegulations} />
          </motion.div>
        )}

        {activeTab === 'customs' && (
          <motion.div
            key="customs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CustomsIntegration regions={customsRegions} t={t} isLoading={isLoadingCustoms} />
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlobalAnalytics analytics={analytics} t={t} isLoading={isLoadingAnalytics} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade Modal */}
      <AnimatePresence>
        {tradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => { if (!isExecutingTrade) setTradeModal(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{tradeModal.country.flag}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{tradeModal.country.name}</h3>
                    <p className="text-sm text-blue-100">${tradeModal.pricePerKwh.toFixed(4)}/kWh · {tradeModal.currency}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {tradeSuccess ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center gap-3 py-6"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{t['trade.success']}</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Trade Type Toggle */}
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setTradeType('buy')}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                          tradeType === 'buy' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {t['trade.buy']}
                      </button>
                      <button
                        onClick={() => setTradeType('sell')}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                          tradeType === 'sell' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {t['trade.sell']}
                      </button>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t['trade.amount']}</label>
                      <input
                        type="number"
                        value={tradeAmount}
                        onChange={e => setTradeAmount(e.target.value)}
                        placeholder="e.g. 10000"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        min="0"
                      />
                    </div>

                    {/* Total Value */}
                    {tradeAmount && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">{t['trade.totalValue']}</span>
                          <span className="text-xl font-bold text-gray-900">
                            ${(parseFloat(tradeAmount) * tradeModal.pricePerKwh).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <TrendingUp className="w-3 h-3" />
                          <span>Rate: ${tradeModal.pricePerKwh.toFixed(4)}/kWh · {tradeModal.currency}</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Execute */}
                    <button
                      onClick={handleExecuteTrade}
                      disabled={isExecutingTrade || !tradeAmount}
                      className={`w-full py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                        tradeType === 'buy'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isExecutingTrade ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t['trade.processing']}
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          {t['trade.execute']}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
