'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { sentimentService } from '@/services/sentiment/sentiment-service'
import {
  SentimentDashboardData,
  SentimentQueryOptions,
  SentimentAlert,
  TradingSignal,
  NewsArticle,
  SocialMediaPost,
} from '@/types/sentiment'
import { EnergyType } from '@/types/analytics'

interface UseSentimentDataReturn {
  dashboardData: SentimentDashboardData | null
  newsArticles: NewsArticle[]
  socialPosts: SocialMediaPost[]
  tradingSignals: TradingSignal[]
  alerts: SentimentAlert[]
  isLoading: boolean
  error: Error | null
  isRealTime: boolean
  refetch: () => Promise<void>
  dismissAlert: (alertId: string) => Promise<void>
  subscribe: (callback?: (data: SentimentDashboardData) => void) => () => void
}

export function useSentimentData(
  options: SentimentQueryOptions = { timeRange: '7d' },
  autoRefresh = true,
  refreshInterval = 60000 // 1 minute
): UseSentimentDataReturn {
  const [dashboardData, setDashboardData] = useState<SentimentDashboardData | null>(null)
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [socialPosts, setSocialPosts] = useState<SocialMediaPost[]>([])
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([])
  const [alerts, setAlerts] = useState<SentimentAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRealTime, setIsRealTime] = useState(false)

  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  const wsUnsubscribeRef = useRef<(() => void) | null>(null)

  /**
   * Fetch sentiment data from the service
   */
  const fetchSentimentData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [dashboard, news, social, signals, alertsData] = await Promise.all([
        sentimentService.getDashboardData(options),
        sentimentService.getNewsArticles(options),
        sentimentService.getSocialMediaPosts(options),
        sentimentService.getTradingSignals(options.energyTypes),
        sentimentService.getAlerts({ energyTypes: options.energyTypes }),
      ])

      setDashboardData(dashboard.data)
      setNewsArticles(news.data)
      setSocialPosts(social.data)
      setTradingSignals(signals.data)
      setAlerts(alertsData.data.filter((alert) => !alert.dismissed))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch sentiment data')
      setError(error)
      console.error('Sentiment data fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [options])

  /**
   * Subscribe to real-time sentiment updates
   */
  const subscribeToRealTime = useCallback(
    (callback?: (data: SentimentDashboardData) => void) => {
      try {
        const unsubscribe = sentimentService.subscribeToSentiment(
          (data) => {
            setDashboardData(data)
            setIsRealTime(true)
            if (callback) {
              callback(data)
            }
          },
          options.energyTypes,
          (err) => {
            setError(err)
            setIsRealTime(false)
          }
        )

        wsUnsubscribeRef.current = unsubscribe
        return unsubscribe
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to subscribe to real-time updates')
        setError(error)
        return () => {} // Return no-op unsubscribe
      }
    },
    [options.energyTypes]
  )

  /**
   * Dismiss an alert
   */
  const handleDismissAlert = useCallback(async (alertId: string) => {
    try {
      await sentimentService.dismissAlert(alertId)
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to dismiss alert')
      setError(error)
      console.error('Alert dismissal error:', error)
    }
  }, [])

  /**
   * Initial data fetch and setup
   */
  useEffect(() => {
    // Fetch initial data
    fetchSentimentData()

    // Subscribe to real-time updates if enabled
    if (autoRefresh && options.timeRange !== '1y' && options.timeRange !== '30d') {
      subscribeToRealTime()
    }

    // Set up periodic refresh for non-real-time data
    if (autoRefresh && refreshInterval > 0) {
      refreshTimeoutRef.current = setInterval(() => {
        fetchSentimentData()
      }, refreshInterval)
    }

    // Cleanup
    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current)
      }
      if (wsUnsubscribeRef.current) {
        wsUnsubscribeRef.current()
      }
    }
  }, [options, autoRefresh, refreshInterval, fetchSentimentData, subscribeToRealTime])

  return {
    dashboardData,
    newsArticles,
    socialPosts,
    tradingSignals,
    alerts,
    isLoading,
    error,
    isRealTime,
    refetch: fetchSentimentData,
    dismissAlert: handleDismissAlert,
    subscribe: subscribeToRealTime,
  }
}

/**
 * Hook for sentiment trend analysis
 */
export function useSentimentTrends(
  energyType?: EnergyType | null,
  timeRange: '1h' | '4h' | '1d' | '7d' | '30d' | '1y' = '30d'
) {
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setIsLoading(true)
        const response = await sentimentService.getHistoricalSentiment(energyType ?? undefined, timeRange)
        setHistoricalData(response.data)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch trends')
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrends()
  }, [energyType, timeRange])

  return { historicalData, isLoading, error }
}

/**
 * Hook for sentiment heatmap data
 */
export function useSentimentHeatMap(timeRange: '1h' | '1d' | '7d' | '30d' | '1y' = '7d') {
  const [heatMapData, setHeatMapData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchHeatMap = async () => {
      try {
        setIsLoading(true)
        const response = await sentimentService.getHeatMapData(timeRange)
        setHeatMapData(response.data)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch heat map')
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeatMap()
  }, [timeRange])

  return { heatMapData, isLoading, error }
}

/**
 * Hook for trading signals
 */
export function useTradingSignals(energyTypes?: EnergyType[], autoRefresh = true, refreshInterval = 300000) {
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        setIsLoading(true)
        const response = await sentimentService.getTradingSignals(energyTypes)
        setSignals(response.data)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch trading signals')
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignals()

    if (autoRefresh) {
      const interval = setInterval(fetchSignals, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [energyTypes, autoRefresh, refreshInterval])

  return { signals, isLoading, error }
}
