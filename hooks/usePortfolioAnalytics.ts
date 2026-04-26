import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  PortfolioAnalytics, 
  Trade, 
  ExportOptions, 
  AnalyticsFilter, 
  Portfolio,
  PerformanceMetrics,
  ProfitLossData,
  AllocationData
} from '../types/portfolio';
import { PortfolioCalculator } from '../utils/portfolioCalculations';

interface UsePortfolioAnalyticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimePrices?: boolean;
}

export const usePortfolioAnalytics = (options: UsePortfolioAnalyticsOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTimePrices = true
  } = options;

  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<AnalyticsFilter>({
    dateRange: {
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      end: new Date()
    }
  });

  // Mock data for demonstration - in real app would come from API
  const mockTrades: Trade[] = [
    {
      id: '1',
      timestamp: new Date('2024-01-15'),
      type: 'buy',
      asset: 'BTC',
      amount: 0.5,
      price: 42000,
      total: 21000,
      fee: 21,
      exchange: 'binance',
      notes: 'Initial investment'
    },
    {
      id: '2',
      timestamp: new Date('2024-02-20'),
      type: 'buy',
      asset: 'ETH',
      amount: 10,
      price: 2800,
      total: 28000,
      fee: 28,
      exchange: 'coinbase'
    },
    {
      id: '3',
      timestamp: new Date('2024-03-10'),
      type: 'sell',
      asset: 'BTC',
      amount: 0.2,
      price: 45000,
      total: 9000,
      fee: 9,
      exchange: 'binance',
      notes: 'Partial profit taking'
    },
    {
      id: '4',
      timestamp: new Date('2024-04-05'),
      type: 'buy',
      asset: 'SOL',
      amount: 100,
      price: 120,
      total: 12000,
      fee: 12,
      exchange: 'kraken'
    }
  ];

  const mockPrices: Record<string, number> = {
    'BTC': 47000,
    'ETH': 3200,
    'SOL': 135
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // In real app, would fetch from API
      const loadedTrades = mockTrades;
      const loadedPrices = mockPrices;
      
      setTrades(loadedTrades);
      setCurrentPrices(loadedPrices);
      
      await calculateAnalytics(loadedTrades, loadedPrices);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = useCallback(async (tradesData: Trade[], pricesData: Record<string, number>) => {
    try {
      const filteredTrades = filterTrades(tradesData, filter);
      
      const portfolio = PortfolioCalculator.calculatePortfolio(filteredTrades, pricesData);
      const performance = PortfolioCalculator.calculatePerformanceMetrics(filteredTrades, portfolio);
      const profitLoss = PortfolioCalculator.calculateProfitLoss(filteredTrades);
      
      const targetAllocation = {
        'BTC': 40,
        'ETH': 35,
        'SOL': 25
      };
      
      const allocation = PortfolioCalculator.calculateAllocation(portfolio, targetAllocation);
      const statistics = PortfolioCalculator.calculateTradingStatistics(filteredTrades);

      const analyticsData: PortfolioAnalytics = {
        portfolio,
        performance,
        profitLoss,
        allocation,
        statistics,
        trades: filteredTrades,
        lastUpdated: new Date()
      };

      setAnalytics(analyticsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate analytics');
    }
  }, [filter]);

  const filterTrades = (tradesData: Trade[], filterData: AnalyticsFilter): Trade[] => {
    return tradesData.filter(trade => {
      // Date range filter
      if (trade.timestamp < filterData.dateRange.start || trade.timestamp > filterData.dateRange.end) {
        return false;
      }

      // Asset filter
      if (filterData.assets && filterData.assets.length > 0) {
        if (!filterData.assets.includes(trade.asset)) {
          return false;
        }
      }

      // Trade type filter
      if (filterData.tradeType && filterData.tradeType !== 'all') {
        if (trade.type !== filterData.tradeType) {
          return false;
        }
      }

      // Exchange filter
      if (filterData.exchange && trade.exchange !== filterData.exchange) {
        return false;
      }

      // Amount filters
      if (filterData.minAmount && trade.amount < filterData.minAmount) {
        return false;
      }
      if (filterData.maxAmount && trade.amount > filterData.maxAmount) {
        return false;
      }

      return true;
    });
  };

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      
      // In real app, would fetch fresh data from API
      const freshPrices = mockPrices;
      setCurrentPrices(freshPrices);
      
      if (trades.length > 0) {
        await calculateAnalytics(trades, freshPrices);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [trades, calculateAnalytics]);

  const addTrade = useCallback(async (newTrade: Omit<Trade, 'id'>) => {
    try {
      const trade: Trade = {
        ...newTrade,
        id: Date.now().toString()
      };

      const updatedTrades = [...trades, trade];
      setTrades(updatedTrades);
      
      await calculateAnalytics(updatedTrades, currentPrices);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add trade');
    }
  }, [trades, currentPrices, calculateAnalytics]);

  const updateTrade = useCallback(async (tradeId: string, updates: Partial<Trade>) => {
    try {
      const updatedTrades = trades.map(trade => 
        trade.id === tradeId ? { ...trade, ...updates } : trade
      );
      
      setTrades(updatedTrades);
      await calculateAnalytics(updatedTrades, currentPrices);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trade');
    }
  }, [trades, currentPrices, calculateAnalytics]);

  const deleteTrade = useCallback(async (tradeId: string) => {
    try {
      const updatedTrades = trades.filter(trade => trade.id !== tradeId);
      
      setTrades(updatedTrades);
      await calculateAnalytics(updatedTrades, currentPrices);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trade');
    }
  }, [trades, currentPrices, calculateAnalytics]);

  const exportData = useCallback(async (options: ExportOptions): Promise<string> => {
    if (!analytics) throw new Error('No analytics data available');

    const exportData = {
      portfolio: analytics.portfolio,
      performance: analytics.performance,
      allocation: analytics.allocation,
      statistics: analytics.statistics,
      trades: analytics.trades.filter(trade => 
        trade.timestamp >= options.dateRange.start && 
        trade.timestamp <= options.dateRange.end
      ),
      exportOptions: options,
      exportedAt: new Date()
    };

    switch (options.format) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      
      case 'csv':
        return convertToCSV(exportData.trades);
      
      case 'pdf':
        // Would use a PDF library like jsPDF
        return JSON.stringify(exportData, null, 2);
      
      case 'excel':
        // Would use a library like xlsx
        return JSON.stringify(exportData, null, 2);
      
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }, [analytics]);

  const convertToCSV = (trades: Trade[]): string => {
    const headers = ['Date', 'Type', 'Asset', 'Amount', 'Price', 'Total', 'Fee', 'Exchange', 'Notes'];
    const rows = trades.map(trade => [
      trade.timestamp.toISOString().split('T')[0],
      trade.type,
      trade.asset,
      trade.amount.toString(),
      trade.price.toString(),
      trade.total.toString(),
      trade.fee.toString(),
      trade.exchange,
      trade.notes || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const updateFilter = useCallback((newFilter: Partial<AnalyticsFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    
    if (trades.length > 0) {
      calculateAnalytics(trades, currentPrices);
    }
  }, [filter, trades, currentPrices, calculateAnalytics]);

  // Memoized computed values
  const portfolio = useMemo(() => analytics?.portfolio, [analytics]);
  const performance = useMemo(() => analytics?.performance, [analytics]);
  const profitLoss = useMemo(() => analytics?.profitLoss, [analytics]);
  const allocation = useMemo(() => analytics?.allocation, [analytics]);
  const statistics = useMemo(() => analytics?.statistics, [analytics]);

  return {
    // Data
    analytics,
    portfolio,
    performance,
    profitLoss,
    allocation,
    statistics,
    trades,
    currentPrices,
    filter,
    
    // State
    loading,
    error,
    
    // Actions
    refreshData,
    addTrade,
    updateTrade,
    deleteTrade,
    exportData,
    updateFilter,
    
    // Utilities
    clearError: () => setError(null),
    resetFilter: () => setFilter({
      dateRange: {
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    })
  };
};
