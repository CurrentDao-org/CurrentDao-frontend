export interface Trade {
  id: string;
  timestamp: Date;
  type: 'buy' | 'sell';
  asset: string;
  amount: number;
  price: number;
  total: number;
  fee: number;
  exchange: string;
  notes?: string;
}

export interface Portfolio {
  totalValue: number;
  totalInvestment: number;
  totalProfit: number;
  totalProfitPercentage: number;
  assets: Asset[];
  lastUpdated: Date;
}

export interface Asset {
  symbol: string;
  name: string;
  amount: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  profit: number;
  profitPercentage: number;
  allocation: number;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  timestamp: Date;
  price: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  annualizedReturn: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
}

export interface ProfitLossData {
  daily: PnLPoint[];
  weekly: PnLPoint[];
  monthly: PnLPoint[];
  yearly: PnLPoint[];
  cumulative: PnLPoint[];
}

export interface PnLPoint {
  timestamp: Date;
  value: number;
  percentage: number;
}

export interface AllocationData {
  current: AssetAllocation[];
  recommended: AssetAllocation[];
  rebalancingActions: RebalancingAction[];
}

export interface AssetAllocation {
  symbol: string;
  name: string;
  currentPercentage: number;
  targetPercentage: number;
  difference: number;
  value: number;
  action: 'buy' | 'sell' | 'hold';
}

export interface RebalancingAction {
  symbol: string;
  action: 'buy' | 'sell';
  amount: number;
  value: number;
  reason: string;
}

export interface TradingStatistics {
  totalVolume: number;
  totalFees: number;
  averageTradeSize: number;
  mostTradedAsset: string;
  tradingFrequency: number;
  averageHoldingPeriod: number;
  taxLiability: number;
  costBasis: number;
  realizedGains: number;
  unrealizedGains: number;
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'json' | 'excel';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeMetrics: string[];
  includeCharts: boolean;
}

export interface PortfolioAnalytics {
  portfolio: Portfolio;
  performance: PerformanceMetrics;
  profitLoss: ProfitLossData;
  allocation: AllocationData;
  statistics: TradingStatistics;
  trades: Trade[];
  lastUpdated: Date;
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  assets?: string[];
  tradeType?: 'buy' | 'sell' | 'all';
  exchange?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

export interface AlertSettings {
  profitThreshold: number;
  lossThreshold: number;
  allocationThreshold: number;
  priceChangeThreshold: number;
  enabled: boolean;
}

export interface PortfolioAlert {
  id: string;
  type: 'profit' | 'loss' | 'allocation' | 'price_change';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
