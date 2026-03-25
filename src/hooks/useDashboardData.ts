import { useState, useMemo, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { DashboardData, PortfolioStats, PriceDataPoint, TradingActivity } from '../types/dashboard';

const INITIAL_STATS: PortfolioStats = {
  totalEnergy: 1245.8,
  earnings: 245.50,
  activeTrades: 8,
  totalKwhChange: 12.5,
  earningsChange: 8.2,
  activeTradesChange: -2,
};

const INITIAL_PRICE_HISTORY: PriceDataPoint[] = Array.from({ length: 20 }, (_, i) => ({
  timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
  price: 0.12 + Math.random() * 0.05,
}));

const RECENT_ACTIVITY: TradingActivity[] = [
  { id: '1', type: 'buy', amount: 50, price: 0.14, status: 'completed', timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
  { id: '2', type: 'sell', amount: 120, price: 0.15, status: 'completed', timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: '3', type: 'buy', amount: 30, price: 0.13, status: 'pending', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '4', type: 'sell', amount: 85, price: 0.16, status: 'completed', timestamp: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: '5', type: 'buy', amount: 200, price: 0.12, status: 'cancelled', timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
];

export function useDashboardData() {
  const [stats, setStats] = useState<PortfolioStats>(INITIAL_STATS);
  const [priceHistory, setPriceHistory] = useState<PriceDataPoint[]>(INITIAL_PRICE_HISTORY);
  const [isLoading, setIsLoading] = useState(true);

  // Simulation logic for live price updates
  const mockPriceGenerator = useCallback((): PriceDataPoint => {
    const lastPrice = priceHistory[priceHistory.length - 1].price;
    const change = (Math.random() - 0.5) * 0.01;
    return {
      timestamp: new Date().toISOString(),
      price: Math.max(0.05, lastPrice + change),
    };
  }, [priceHistory]);

  const { isConnected, error } = useWebSocket<PriceDataPoint>({
    mockDataGenerator: mockPriceGenerator,
    mockInterval: 5000,
    onMessage: (newData) => {
      setPriceHistory(prev => {
        const updated = [...prev, newData].slice(-24); // Keep last 24 points
        return updated;
      });
      // Also update some stats randomly to simulate real-time energy production
      setStats(prev => ({
        ...prev,
        totalEnergy: +(prev.totalEnergy + Math.random() * 0.5).toFixed(2),
        earnings: +(prev.earnings + Math.random() * 0.1).toFixed(2),
      }));
      if (isLoading) setIsLoading(false);
    }
  });

  const dashboardData: DashboardData = useMemo(() => ({
    stats,
    priceHistory,
    earningsHistory: [
      { date: 'Jan', amount: 45 },
      { date: 'Feb', amount: 52 },
      { date: 'Mar', amount: 48 },
      { date: 'Apr', amount: 61 },
      { date: 'May', amount: 55 },
      { date: 'Jun', amount: 67 },
    ],
    recentActivity: RECENT_ACTIVITY,
    lastUpdated: new Date().toISOString(),
  }), [stats, priceHistory]);

  return {
    data: dashboardData,
    isLoading,
    isConnected,
    error,
  };
}
