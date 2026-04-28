import { GasFeeEstimate, HistoricalFeeData } from '@/types/gas'

export interface StellarFeeStats {
  base_fee: number
  fee_rate: number
  max_fee: number
  last_ledger: number
  last_ledger_time: string
  ledger_capacity_usage: number
  fee_bump_transaction_count: number
  operation_count: number
}

export interface StellarNetworkStats {
  current_ledger: number
  current_ledger_time: string
  fee_charged: number
  max_fee: number
  operation_count: number
  tx_count: number
  tx_set_operation_count: number
  base_fee: number
  base_fee_stroops: number
}

class StellarHorizonService {
  private baseUrl: string
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>
  private readonly CACHE_TTL = 30000 // 30 seconds

  constructor(network: 'mainnet' | 'testnet' = 'mainnet') {
    this.baseUrl = network === 'mainnet' 
      ? 'https://horizon.stellar.org' 
      : 'https://horizon-testnet.stellar.org'
    this.cache = new Map()
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : ''
    return `${endpoint}${paramString}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data as T
  }

  private setCache<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  private async fetchFromHorizon<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params)
    const cached = this.getFromCache<T>(cacheKey)
    
    if (cached) {
      return cached
    }

    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    try {
      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Horizon API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('Failed to fetch from Horizon:', error)
      throw error
    }
  }

  async getCurrentFeeStats(): Promise<StellarFeeStats> {
    try {
      const feeStats = await this.fetchFromHorizon<any>('/fee_stats')
      
      return {
        base_fee: feeStats.base_fee || 100,
        fee_rate: feeStats.fee_rate || 1,
        max_fee: feeStats.max_fee || 1000,
        last_ledger: feeStats.last_ledger || 0,
        last_ledger_time: feeStats.last_ledger_time || new Date().toISOString(),
        ledger_capacity_usage: feeStats.ledger_capacity_usage || 0.5,
        fee_bump_transaction_count: feeStats.fee_bump_transaction_count || 0,
        operation_count: feeStats.operation_count || 0
      }
    } catch (error) {
      console.error('Failed to fetch fee stats:', error)
      // Return fallback values
      return {
        base_fee: 100,
        fee_rate: 1,
        max_fee: 1000,
        last_ledger: 0,
        last_ledger_time: new Date().toISOString(),
        ledger_capacity_usage: 0.5,
        fee_bump_transaction_count: 0,
        operation_count: 0
      }
    }
  }

  async getLatestLedger(): Promise<StellarNetworkStats> {
    try {
      const ledger = await this.fetchFromHorizon<any>('/ledgers', { order: 'desc', limit: 1 })
      
      if (!ledger._embedded || !ledger._embedded.records || ledger._embedded.records.length === 0) {
        throw new Error('No ledger data available')
      }

      const latestLedger = ledger._embedded.records[0]
      
      return {
        current_ledger: latestLedger.sequence || 0,
        current_ledger_time: latestLedger.closed_at || new Date().toISOString(),
        fee_charged: latestLedger.fee_pool || 0,
        max_fee: latestLedger.base_fee || 1000,
        operation_count: latestLedger.operation_count || 0,
        tx_count: latestLedger.transaction_count || 0,
        tx_set_operation_count: latestLedger.tx_set_operation_count || 0,
        base_fee: latestLedger.base_fee || 100,
        base_fee_stroops: latestLedger.base_fee_in_stroops || 100
      }
    } catch (error) {
      console.error('Failed to fetch latest ledger:', error)
      // Return fallback values
      return {
        current_ledger: 0,
        current_ledger_time: new Date().toISOString(),
        fee_charged: 0,
        max_fee: 1000,
        operation_count: 0,
        tx_count: 0,
        tx_set_operation_count: 0,
        base_fee: 100,
        base_fee_stroops: 100
      }
    }
  }

  async getHistoricalFees(hours: number = 24): Promise<HistoricalFeeData[]> {
    const cacheKey = this.getCacheKey('/historical_fees', { hours })
    const cached = this.getFromCache<HistoricalFeeData[]>(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      // For now, we'll simulate historical data since Horizon doesn't provide
      // direct historical fee statistics. In a real implementation, you might
      // use a third-party service or store historical data yourself.
      const historicalData: HistoricalFeeData[] = []
      const now = new Date()
      
      // Generate data points for the specified hours
      const dataPoints = Math.min(hours, 50) // Limit to prevent too many API calls
      
      for (let i = 0; i < dataPoints; i++) {
        const timestamp = new Date(now.getTime() - (i * (hours * 60 * 60 * 1000) / dataPoints))
        
        // Simulate varying fees based on time of day
        const hour = timestamp.getHours()
        const baseMultiplier = (hour >= 9 && hour <= 17) ? 1.5 : 1.0 // Business hours have higher fees
        const randomVariation = 0.8 + Math.random() * 0.4 // 80% to 120% variation
        
        const baseFee = Math.round(100 * baseMultiplier * randomVariation)
        const priorityFee = Math.round(baseFee * 0.1 * randomVariation)
        
        // Determine network congestion based on fee level
        let congestion: 'low' | 'medium' | 'high' = 'low'
        if (baseFee > 150) congestion = 'high'
        else if (baseFee > 120) congestion = 'medium'
        
        historicalData.push({
          timestamp,
          baseFee,
          priorityFee,
          networkCongestion: congestion,
          blockNumber: 1000000 - (i * 7200) // Approximate block numbers
        })
      }
      
      // Sort by timestamp (newest first)
      historicalData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      
      // Cache for 5 minutes
      this.setCache(cacheKey, historicalData, 300000)
      
      return historicalData
    } catch (error) {
      console.error('Failed to fetch historical fees:', error)
      return []
    }
  }

  async getNetworkCongestion(): Promise<'low' | 'medium' | 'high'> {
    try {
      const feeStats = await this.getCurrentFeeStats()
      const ledger = await this.getLatestLedger()
      
      // Analyze multiple factors to determine congestion
      const baseFee = feeStats.base_fee
      const operationCount = ledger.operation_count
      const ledgerCapacity = feeStats.ledger_capacity_usage
      const feeBumpCount = feeStats.fee_bump_transaction_count
      
      // Congestion scoring algorithm
      let congestionScore = 0
      
      // Base fee analysis (0-30 points)
      if (baseFee > 200) congestionScore += 30
      else if (baseFee > 150) congestionScore += 20
      else if (baseFee > 100) congestionScore += 10
      
      // Operation count analysis (0-25 points)
      if (operationCount > 100) congestionScore += 25
      else if (operationCount > 50) congestionScore += 15
      else if (operationCount > 20) congestionScore += 5
      
      // Ledger capacity usage (0-25 points)
      if (ledgerCapacity > 0.8) congestionScore += 25
      else if (ledgerCapacity > 0.6) congestionScore += 15
      else if (ledgerCapacity > 0.4) congestionScore += 5
      
      // Fee bump transactions (0-20 points)
      if (feeBumpCount > 10) congestionScore += 20
      else if (feeBumpCount > 5) congestionScore += 10
      else if (feeBumpCount > 2) congestionScore += 5
      
      // Determine congestion based on score
      if (congestionScore >= 60) return 'high'
      if (congestionScore >= 30) return 'medium'
      return 'low'
    } catch (error) {
      console.error('Failed to determine network congestion:', error)
      return 'medium' // Default to medium on error
    }
  }

  async getFeeEstimate(): Promise<GasFeeEstimate> {
    try {
      const [feeStats, congestion] = await Promise.all([
        this.getCurrentFeeStats(),
        this.getNetworkCongestion()
      ])
      
      const baseFee = feeStats.base_fee
      const priorityFee = Math.round(baseFee * 0.1) // 10% of base fee as priority
      const maxFee = baseFee + priorityFee + 50 // Add buffer
      
      // Estimate confirmation time based on congestion
      let estimatedTime = 60 // Default 1 minute
      let confidence = 80 // Default confidence
      
      switch (congestion) {
        case 'low':
          estimatedTime = 30 // 30 seconds
          confidence = 95
          break
        case 'medium':
          estimatedTime = 60 // 1 minute
          confidence = 80
          break
        case 'high':
          estimatedTime = 120 // 2 minutes
          confidence = 60
          break
      }
      
      return {
        baseFee,
        priorityFee,
        maxFee,
        estimatedTime,
        confidence,
        networkCongestion: congestion,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Failed to get fee estimate:', error)
      // Return fallback estimate
      return {
        baseFee: 100,
        priorityFee: 10,
        maxFee: 200,
        estimatedTime: 60,
        confidence: 70,
        networkCongestion: 'medium',
        timestamp: new Date()
      }
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheSize(): number {
    return this.cache.size
  }
}

// Export singleton instances
export const mainnetHorizonService = new StellarHorizonService('mainnet')
export const testnetHorizonService = new StellarHorizonService('testnet')

// Export default service (mainnet)
export default mainnetHorizonService
