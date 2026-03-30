'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Filter,
  Download,
  Zap,
  Globe,
  Newspaper,
  MessageSquare,
} from 'lucide-react'
import { useSentimentData, useSentimentTrends } from '@/hooks/useSentimentData'
import { SentimentQueryOptions } from '@/types/sentiment'
import { EnergyType } from '@/types/analytics'

interface SentimentDashboardProps {
  title?: string
  showRealTime?: boolean
  showAlerts?: boolean
  showNews?: boolean
  showSocial?: boolean
  showSignals?: boolean
  energyTypes?: EnergyType[]
  className?: string
}

const SENTIMENT_COLORS = {
  very_positive: '#10b981',
  positive: '#6ee7b7',
  neutral: '#9ca3af',
  negative: '#fca5a5',
  very_negative: '#ef4444',
}

const ENERGY_TYPE_COLORS: Record<EnergyType, string> = {
  solar: '#fbbf24',
  wind: '#3b82f6',
  hydro: '#06b6d4',
  nuclear: '#8b5cf6',
  natural_gas: '#ec4899',
  coal: '#6b7280',
  biomass: '#65a30d',
}

export const SentimentDashboard: React.FC<SentimentDashboardProps> = ({
  title = 'Market Sentiment Dashboard',
  showRealTime = true,
  showAlerts = true,
  showNews = true,
  showSocial = true,
  showSignals = true,
  energyTypes,
  className = '',
}) => {
  const [timeRange, setTimeRange] = useState<'1h' | '4h' | '1d' | '7d' | '30d' | '1y'>('7d')
  const [selectedEnergyType, setSelectedEnergyType] = useState<EnergyType | null>(null)

  const queryOptions: SentimentQueryOptions = {
    timeRange,
    energyTypes: selectedEnergyType ? [selectedEnergyType] : energyTypes,
  }

  const {
    dashboardData,
    newsArticles,
    socialPosts,
    tradingSignals,
    alerts,
    isLoading,
    error,
    isRealTime,
    refetch,
  } = useSentimentData(queryOptions, showRealTime)

  const { historicalData } = useSentimentTrends(selectedEnergyType || undefined, timeRange)

  // Memoize processed data for performance
  const processedData = useMemo(() => {
    if (!dashboardData) return null

    return {
      overallScore: dashboardData.overall,
      bySource: dashboardData.bySource || [],
      byEnergyType: dashboardData.byEnergyType || [],
      sentiment_trend: historicalData,
      critical_alerts: alerts.filter((a) => a.severity === 'critical'),
      recent_alerts: alerts.slice(0, 5),
    }
  }, [dashboardData, historicalData, alerts])

  if (error) {
    return (
      <div className={`rounded-lg bg-red-50 p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Dashboard</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {isRealTime && (
            <motion.div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
              <motion.div
                className="w-2 h-2 bg-green-600 rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-medium text-green-700">Real-time</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="1d">1 Day</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="1y">1 Year</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">Energy Type:</label>
          <select
            value={selectedEnergyType || ''}
            onChange={(e) => setSelectedEnergyType((e.target.value || null) as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="solar">Solar</option>
            <option value="wind">Wind</option>
            <option value="hydro">Hydro</option>
            <option value="nuclear">Nuclear</option>
            <option value="natural_gas">Natural Gas</option>
            <option value="coal">Coal</option>
            <option value="biomass">Biomass</option>
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading && !dashboardData ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-12"
          >
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </motion.div>
        ) : processedData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Overall Sentiment Score */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Sentiment</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {processedData.overallScore.toFixed(1)}
                    </span>
                    <span className="text-lg text-gray-600">/100</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {processedData.overallScore > 20
                      ? '🟢 Positive'
                      : processedData.overallScore < -20
                        ? '🔴 Negative'
                        : '🟡 Neutral'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>

              {/* Sentiment Gauge */}
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(processedData.overallScore + 100) / 2}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                />
              </div>
            </div>

            {/* Sentiment by Source */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment by Source</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData.bySource}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis domain={[-100, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="sentiment" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sentiment Trend */}
            {processedData.sentiment_trend && processedData.sentiment_trend.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={processedData.sentiment_trend}>
                    <defs>
                      <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[-100, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Area type="monotone" dataKey="overall" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSentiment)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Sentiment by Energy Type */}
            {processedData.byEnergyType && processedData.byEnergyType.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment by Energy Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedData.byEnergyType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="energyType" />
                    <YAxis domain={[-100, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="sentiment" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Critical Alerts */}
            {showAlerts && processedData.critical_alerts.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-600 rounded-r-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h2 className="text-lg font-semibold text-red-900">Critical Alerts ({processedData.critical_alerts.length})</h2>
                </div>
                <div className="space-y-2">
                  {processedData.critical_alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="bg-white rounded p-3 border border-red-200">
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">News Articles</p>
                    <p className="text-2xl font-bold text-gray-900">{newsArticles.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Social Posts</p>
                    <p className="text-2xl font-bold text-gray-900">{socialPosts.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">Trading Signals</p>
                    <p className="text-2xl font-bold text-gray-900">{tradingSignals.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
