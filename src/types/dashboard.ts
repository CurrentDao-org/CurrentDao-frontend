export interface PortfolioStats {
  totalEnergy: number;
  earnings: number;
  activeTrades: number;
  totalKwhChange: number;
  earningsChange: number;
  activeTradesChange: number;
}

export interface PriceDataPoint {
  timestamp: string;
  price: number;
}

export interface EarningsDataPoint {
  date: string;
  amount: number;
}

export interface TradingActivity {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'completed' | 'pending' | 'cancelled';
  timestamp: string;
}

export interface DashboardData {
  stats: PortfolioStats;
  priceHistory: PriceDataPoint[];
  earningsHistory: EarningsDataPoint[];
  recentActivity: TradingActivity[];
  lastUpdated: string;
}
