'use client'

import axios, { AxiosInstance } from 'axios'
import {
  SentimentDashboardData,
  SentimentServiceResponse,
  SentimentQueryOptions,
  SentimentAnalysisResult,
  NewsArticle,
  SocialMediaPost,
  TradingSignal,
  SentimentAlert,
  HistoricalSentimentPoint,
  HeatMapCell,
  RegionalSentiment,
  SentimentCorrelation,
} from '@/types/sentiment'
import { EnergyType } from '@/types/analytics'

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

export class SentimentService {
  private client: AxiosInstance
  private cache: Map<string, CacheEntry> = new Map()
  private cacheDefaultTTL = 5 * 60 * 1000 // 5 minutes
  private wsConnections: Map<string, WebSocket> = new Map()

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'https://api.currentdao.io') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0',
      },
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Sentiment API Error:', error)
        throw error
      }
    )
  }

  /**
   * Get comprehensive sentiment dashboard data with real-time updates
   */
  async getDashboardData(options?: SentimentQueryOptions): Promise<SentimentServiceResponse<SentimentDashboardData>> {
    const cacheKey = `dashboard_${JSON.stringify(options || {})}`
    const cached = this.getFromCache(cacheKey)

    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      }
    }

    try {
      const response = await this.client.get<SentimentServiceResponse<SentimentDashboardData>>('/sentiment/dashboard', {
        params: options,
      })

      this.setCache(cacheKey, response.data, 5 * 60 * 1000) // 5 minute cache
      return response.data
    } catch (error) {
      console.error('Failed to fetch sentiment dashboard:', error)
      throw error
    }
  }

  /**
   * Get real-time sentiment updates via WebSocket
   */
  subscribeToSentiment(
    callback: (data: SentimentDashboardData) => void,
    energyTypes?: EnergyType[],
    onError?: (error: Error) => void
  ): () => void {
    const wsURL = (process.env.NEXT_PUBLIC_WS_URL || 'wss://api.currentdao.io') + '/sentiment/stream'
    const subscriptionId = `sentiment_${Date.now()}`

    try {
      const ws = new WebSocket(wsURL)

      ws.onopen = () => {
        const message = {
          type: 'subscribe',
          energyTypes: energyTypes || [],
          subscriptionId,
        }
        ws.send(JSON.stringify(message))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SentimentDashboardData
          callback(data)
        } catch (error) {
          console.error('Failed to parse sentiment message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        if (onError) {
          onError(new Error('WebSocket connection failed'))
        }
      }

      ws.onclose = () => {
        this.wsConnections.delete(subscriptionId)
      }

      this.wsConnections.set(subscriptionId, ws)

      // Return unsubscribe function
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'unsubscribe', subscriptionId }))
        }
        ws.close()
        this.wsConnections.delete(subscriptionId)
      }
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error)
      throw error
    }
  }

  /**
   * Get news articles aggregated from 50+ sources
   */
  async getNewsArticles(
    options: SentimentQueryOptions & { limit?: number; offset?: number }
  ): Promise<SentimentServiceResponse<NewsArticle[]>> {
    const cacheKey = `news_${JSON.stringify(options)}`
    const cached = this.getFromCache(cacheKey)

    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      }
    }

    try {
      const response = await this.client.get<SentimentServiceResponse<NewsArticle[]>>('/sentiment/news', {
        params: options,
      })

      this.setCache(cacheKey, response.data, 3 * 60 * 1000) // 3 minute cache
      return response.data
    } catch (error) {
      console.error('Failed to fetch news articles:', error)
      throw error
    }
  }

  /**
   * Get social media posts from major platforms
   */
  async getSocialMediaPosts(
    options: SentimentQueryOptions & { limit?: number; offset?: number }
  ): Promise<SentimentServiceResponse<SocialMediaPost[]>> {
    const cacheKey = `social_${JSON.stringify(options)}`
    const cached = this.getFromCache(cacheKey)

    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      }
    }

    try {
      const response = await this.client.get<SentimentServiceResponse<SocialMediaPost[]>>('/sentiment/social', {
        params: options,
      })

      this.setCache(cacheKey, response.data, 2 * 60 * 1000) // 2 minute cache
      return response.data
    } catch (error) {
      console.error('Failed to fetch social media posts:', error)
      throw error
    }
  }

  /**
   * Get sentiment-based trading signals
   */
  async getTradingSignals(
    energyTypes?: EnergyType[]
  ): Promise<SentimentServiceResponse<TradingSignal[]>> {
    const cacheKey = `signals_${energyTypes?.join(',') || 'all'}`
    const cached = this.getFromCache(cacheKey)

    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      }
    }

    try {
      const response = await this.client.get<SentimentServiceResponse<TradingSignal[]>>(
        '/sentiment/trading-signals',
        {
          params: { energyTypes },
        }
      )

      this.setCache(cacheKey, response.data, 5 * 60 * 1000) // 5 minute cache
      return response.data
    } catch (error) {
      console.error('Failed to fetch trading signals:', error)
      throw error
    }
  }

  /**
   * Get sentiment-based alerts
   */
  async getAlerts(
    options?: { severity?: string; energyTypes?: EnergyType[] }
  ): Promise<SentimentServiceResponse<SentimentAlert[]>> {
    try {
      const response = await this.client.get<SentimentServiceResponse<SentimentAlert[]>>(
        '/sentiment/alerts',
        { params: options }
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      throw error
    }
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: string): Promise<SentimentServiceResponse<{ success: boolean }>> {
    try {
      const response = await this.client.post<SentimentServiceResponse<{ success: boolean }>>(
        `/sentiment/alerts/${alertId}/dismiss`
      )
      this.clearCache() // Clear cache when alert is dismissed
      return response.data
    } catch (error) {
      console.error('Failed to dismiss alert:', error)
      throw error
    }
  }

  /**
   * Get historical sentiment data for trending analysis
   */
  async getHistoricalSentiment(
    energyType?: EnergyType,
    timeRange: '1h' | '4h' | '1d' | '7d' | '30d' | '1y' = '1y'
  ): Promise<SentimentServiceResponse<HistoricalSentimentPoint[]>> {
    const cacheKey = `historical_${energyType || 'all'}_${timeRange}`
    const cached = this.getFromCache(cacheKey)

    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      }
    }

    try {
      const response = await this.client.get<SentimentServiceResponse<HistoricalSentimentPoint[]>>(
        '/sentiment/historical',
        {
          params: { energyType, timeRange },
        }
      )

      this.setCache(cacheKey, response.data, 30 * 60 * 1000) // 30 minute cache
      return response.data
    } catch (error) {
      console.error('Failed to fetch historical sentiment:', error)
      throw error
    }
  }

  /**
   * Get sentiment heat map data
   */
  async getHeatMapData(
    timeRange: '1h' | '1d' | '7d' | '30d' | '1y' = '7d'
  ): Promise<SentimentServiceResponse<HeatMapCell[]>> {
    const cacheKey = `heatmap_${timeRange}`
    const cached = this.getFromCache(cacheKey)

    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      }
    }

    try {
      const response = await this.client.get<SentimentServiceResponse<HeatMapCell[]>>(
        '/sentiment/heatmap',
        { params: { timeRange } }
      )

      this.setCache(cacheKey, response.data, 10 * 60 * 1000) // 10 minute cache
      return response.data
    } catch (error) {
      console.error('Failed to fetch heat map data:', error)
      throw error
    }
  }

  /**
   * Get regional sentiment data
   */
  async getRegionalSentiment(
    timeRange: '1h' | '1d' | '7d' | '30d' | '1y' = '7d'
  ): Promise<SentimentServiceResponse<RegionalSentiment[]>> {
    const cacheKey = `regional_${timeRange}`
    const cached = this.getFromCache(cacheKey)

    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      }
    }

    try {
      const response = await this.client.get<SentimentServiceResponse<RegionalSentiment[]>>(
        '/sentiment/regional',
        { params: { timeRange } }
      )

      this.setCache(cacheKey, response.data, 15 * 60 * 1000) // 15 minute cache
      return response.data
    } catch (error) {
      console.error('Failed to fetch regional sentiment:', error)
      throw error
    }
  }

  /**
   * Get sentiment correlations between energy types
   */
  async getSentimentCorrelations(
    timeRange: '1h' | '1d' | '7d' | '30d' | '1y' = '30d'
  ): Promise<SentimentServiceResponse<SentimentCorrelation[]>> {
    const cacheKey = `correlations_${timeRange}`
    const cached = this.getFromCache(cacheKey)

    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      }
    }

    try {
      const response = await this.client.get<SentimentServiceResponse<SentimentCorrelation[]>>(
        '/sentiment/correlations',
        { params: { timeRange } }
      )

      this.setCache(cacheKey, response.data, 30 * 60 * 1000) // 30 minute cache
      return response.data
    } catch (error) {
      console.error('Failed to fetch sentiment correlations:', error)
      throw error
    }
  }

  /**
   * Perform comprehensive sentiment analysis
   */
  async analyzeSentiment(options: SentimentQueryOptions): Promise<SentimentAnalysisResult> {
    try {
      const [dashboardData, historicalData] = await Promise.all([
        this.getDashboardData(options),
        this.getHistoricalSentiment(options.energyTypes?.[0], options.timeRange),
      ])

      const allSentiments = historicalData.data.map((h) => h.overall)
      const avgSentiment = allSentiments.reduce((a, b) => a + b, 0) / allSentiments.length
      const stdDev = this.calculateStdDev(allSentiments, avgSentiment)
      const positive = allSentiments.filter((s) => s > 20).length
      const negative = allSentiments.filter((s) => s < -20).length
      const neutral = allSentiments.filter((s) => s >= -20 && s <= 20).length

      return {
        query: options,
        results: dashboardData.data,
        statistics: {
          totalArticles: dashboardData.data.topNewsArticles.length,
          totalPosts: dashboardData.data.topSocialPosts.length,
          averageSentiment: avgSentiment,
          sentimentStdDev: stdDev,
          positivePercentage: (positive / allSentiments.length) * 100,
          negativePercentage: (negative / allSentiments.length) * 100,
          neutralPercentage: (neutral / allSentiments.length) * 100,
        },
        processingTime: 0,
      }
    } catch (error) {
      console.error('Failed to analyze sentiment:', error)
      throw error
    }
  }

  /**
   * Cache management methods
   */
  private getFromCache(key: string): SentimentServiceResponse<any> | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  private setCache(key: string, data: SentimentServiceResponse<any>, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  private clearCache(): void {
    this.cache.clear()
  }

  /**
   * Utility methods
   */
  private calculateStdDev(values: number[], mean: number): number {
    const squareDiffs = values.map((value) => Math.pow(value - mean, 2))
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length
    return Math.sqrt(avgSquareDiff)
  }

  /**
   * Close all WebSocket connections
   */
  disconnect(): void {
    this.wsConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    })
    this.wsConnections.clear()
  }
}

// Singleton instance
export const sentimentService = new SentimentService()
