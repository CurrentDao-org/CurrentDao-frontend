'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Globe2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { GlobalAnalyticsData, Translations, RiskLevel } from '@/types/cross-border'

interface GlobalAnalyticsProps {
  analytics: GlobalAnalyticsData | null
  t: Translations
  isLoading: boolean
}

const riskBadge: Record<RiskLevel, { bg: string; text: string }> = {
  low: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700' },
  high: { bg: 'bg-red-100', text: 'text-red-700' },
}

export function GlobalAnalytics({ analytics, t, isLoading }: GlobalAnalyticsProps) {
  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const { summary, trends, regionalBreakdown, marketComparisons, arbitrageOpportunities } = analytics

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t['analytics.totalVolume'], value: `${(summary.totalVolume / 1000000).toFixed(2)}M kWh`, icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', accent: 'from-yellow-500 to-amber-500' },
          { label: t['analytics.activeMarkets'], value: summary.activeMarkets.toString(), icon: Globe2, color: 'text-blue-600', bg: 'bg-blue-50', accent: 'from-blue-500 to-indigo-500' },
          { label: t['analytics.avgPrice'], value: `$${summary.avgPrice.toFixed(3)}/kWh`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'from-emerald-500 to-teal-500' },
          { label: t['analytics.topSpread'], value: `${summary.topArbitrageSpread.toFixed(1)}%`, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50', accent: 'from-purple-500 to-pink-500' },
        ].map((metric, i) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.accent}`} />
              <div className="flex items-center gap-2 mb-2 mt-1">
                <div className={`w-8 h-8 ${metric.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <span className="text-xs text-gray-500 font-medium">{metric.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            {t['analytics.trends']}
          </h4>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                formatter={(value: number) => [`${value.toLocaleString()} kWh`, 'Volume']}
              />
              <Line type="monotone" dataKey="totalVolume" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Regional Breakdown Pie */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-emerald-600" />
            Regional Breakdown
          </h4>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={230}>
              <PieChart>
                <Pie
                  data={regionalBreakdown}
                  dataKey="percentage"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {regionalBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  formatter={(value: number) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {regionalBreakdown.map(entry => (
                <div key={entry.region} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                  <span className="text-gray-600 flex-1">{entry.region}</span>
                  <span className="font-medium text-gray-900">{entry.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Comparisons Bar Chart */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          Market Price Comparison ($/kWh)
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={marketComparisons} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9CA3AF" tickFormatter={v => `$${v}`} />
            <YAxis
              type="category"
              dataKey="country"
              tick={{ fontSize: 11 }}
              stroke="#9CA3AF"
              width={80}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              formatter={(value: number) => [`$${value.toFixed(3)}`, 'Price/kWh']}
            />
            <Bar dataKey="price" radius={[0, 4, 4, 0]}>
              {marketComparisons.map((entry, i) => (
                <Cell key={i} fill={entry.price > 0.10 ? '#EF4444' : entry.price > 0.06 ? '#F59E0B' : '#10B981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Arbitrage Opportunities */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            {t['analytics.arbitrage']}
          </h4>
          <span className="text-xs text-gray-400">{arbitrageOpportunities.length} active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-600">Buy Market</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Sell Market</th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">Buy Price</th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">Sell Price</th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">Spread</th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">Volume</th>
                <th className="text-center px-6 py-3 font-medium text-gray-600">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {arbitrageOpportunities.map(arb => {
                const rb = riskBadge[arb.risk]
                return (
                  <tr key={arb.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
                        {arb.buyMarket}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
                        {arb.sellMarket}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right text-emerald-600 font-medium">${arb.buyPrice.toFixed(3)}</td>
                    <td className="px-6 py-3 text-right text-blue-600 font-medium">${arb.sellPrice.toFixed(3)}</td>
                    <td className="px-6 py-3 text-right">
                      <span className="font-semibold text-emerald-600">+{arb.spreadPercent.toFixed(1)}%</span>
                      <span className="block text-xs text-gray-400">${arb.spread.toFixed(3)}</span>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-700">{arb.volume.toLocaleString()} kWh</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${rb.bg} ${rb.text}`}>
                        {arb.risk}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
