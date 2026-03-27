// Market Analytics Types for CurrentDao Energy Trading Platform

// Energy Types
export type EnergyType = 'solar' | 'wind' | 'hydro' | 'nuclear' | 'natural_gas' | 'coal' | 'biomass';

// Time Intervals
export type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' | '1M';

// Market Data Points
export interface MarketDataPoint {
  timestamp: string;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  energyType: EnergyType;
}

// Market Metrics
export interface MarketMetrics {
  totalVolume: number;
  totalValue: number;
  averagePrice: number;
  priceChange: number;
  priceChangePercent: number;
  volatility: number;
  marketCap: number;
  liquidity: number;
  lastUpdated: string;
}

// Trading Volume Analysis
export interface VolumeAnalysis {
  currentVolume: number;
  volumeChange: number;
  volumeChangePercent: number;
  averageVolume: number;
  volumeTrend: 'increasing' | 'decreasing' | 'stable';
  peakVolume: number;
  volumeByEnergyType: Record<EnergyType, number>;
  volumeDistribution: {
    energyType: EnergyType;
    volume: number;
    percentage: number;
  }[];
}

// Price Trend Analysis
export interface PriceTrend {
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  trendDirection: 'bullish' | 'bearish' | 'sideways';
  supportLevels: number[];
  resistanceLevels: number[];
  technicalIndicators: {
    sma: number[];
    ema: number[];
    rsi: number;
    macd: {
      macd: number;
      signal: number;
      histogram: number;
    };
    bollingerBands: {
      upper: number;
      middle: number;
      lower: number;
    };
  };
  pricePredictions: {
    shortTerm: number;
    mediumTerm: number;
    longTerm: number;
    confidence: number;
  };
}

// Market Sentiment
export interface SentimentData {
  overall: number; // -100 to 100
  social: number;
  news: number;
  technical: number;
  fundamental: number;
  timestamp: string;
  sources: {
    name: string;
    sentiment: number;
    weight: number;
    lastUpdated: string;
  }[];
}

// Comparative Analysis
export interface ComparativeAnalysis {
  energyTypePerformance: {
    energyType: EnergyType;
    currentPrice: number;
    priceChange: number;
    priceChangePercent: number;
    volume: number;
    marketShare: number;
    efficiency: number;
  }[];
  correlations: {
    energyType1: EnergyType;
    energyType2: EnergyType;
    correlation: number;
    significance: number;
  }[];
  marketDominance: {
    energyType: EnergyType;
    dominance: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
}

// Predictive Analytics
export interface PredictiveAnalytics {
  priceForecast: {
    timeHorizon: '1h' | '24h' | '7d' | '30d';
    predictedPrice: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    probability: number;
    model: 'arima' | 'lstm' | 'linear_regression' | 'ensemble';
  }[];
  volumeForecast: {
    timeHorizon: '1h' | '24h' | '7d' | '30d';
    predictedVolume: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    probability: number;
  }[];
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    factors: {
      name: string;
      impact: number;
      description: string;
    }[];
    recommendations: string[];
  };
}

// Dashboard Configuration
export interface DashboardConfig {
  id: string;
  name: string;
  layout: DashboardLayout;
  widgets: WidgetConfig[];
  refreshInterval: number; // in seconds
  autoRefresh: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: Record<string, any>;
  visible: boolean;
}

export type WidgetType = 
  | 'market_overview'
  | 'price_chart'
  | 'volume_analysis'
  | 'sentiment_gauge'
  | 'comparative_chart'
  | 'predictive_forecast'
  | 'technical_indicators'
  | 'risk_assessment'
  | 'market_news'
  | 'energy_performance';

// Real-time Data
export interface RealtimeData {
  timestamp: string;
  price: number;
  volume: number;
  trades: number;
  energyType: EnergyType;
  exchange: string;
}

// Market Events
export interface MarketEvent {
  id: string;
  type: 'price_alert' | 'volume_spike' | 'sentiment_shift' | 'market_news' | 'technical_signal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  data: Record<string, any>;
  acknowledged: boolean;
}

// API Response Types
export interface AnalyticsResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  cacheDuration?: number;
}

export interface HistoricalDataRequest {
  energyType?: EnergyType;
  interval: TimeInterval;
  startTime: string;
  endTime: string;
  limit?: number;
}

export interface AnalyticsRequest {
  metrics: string[];
  energyTypes?: EnergyType[];
  interval: TimeInterval;
  startTime: string;
  endTime: string;
  includePredictions?: boolean;
  includeSentiment?: boolean;
}

// Component Props Types
export interface MarketOverviewProps {
  metrics: MarketMetrics;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  refreshInterval?: number;
  onRefresh?: () => void;
}

export interface VolumeAnalysisProps {
  data: VolumeAnalysis;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  timeRange?: TimeInterval;
  onTimeRangeChange?: (range: TimeInterval) => void;
}

export interface PriceTrendsProps {
  data: PriceTrend;
  historicalData: MarketDataPoint[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  timeRange?: TimeInterval;
  onTimeRangeChange?: (range: TimeInterval) => void;
  showTechnicalIndicators?: boolean;
}

export interface SentimentIndicatorsProps {
  data: SentimentData;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  showBreakdown?: boolean;
  historicalSentiment?: SentimentData[];
}

export interface PredictiveAnalyticsProps {
  data: PredictiveAnalytics;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  showConfidence?: boolean;
  timeHorizon?: '1h' | '24h' | '7d' | '30d';
}

export interface ComparativeAnalysisProps {
  data: ComparativeAnalysis;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  selectedEnergyTypes?: EnergyType[];
  onSelectionChange?: (types: EnergyType[]) => void;
}

// Hook Types
export interface MarketAnalyticsState {
  metrics: MarketMetrics | null;
  volumeAnalysis: VolumeAnalysis | null;
  priceTrends: PriceTrend | null;
  sentiment: SentimentData | null;
  comparative: ComparativeAnalysis | null;
  predictive: PredictiveAnalytics | null;
  historicalData: MarketDataPoint[];
  realtimeData: RealtimeData[];
  events: MarketEvent[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface MarketAnalyticsActions {
  fetchMetrics: (energyTypes?: EnergyType[]) => Promise<void>;
  fetchVolumeAnalysis: (energyType?: EnergyType) => Promise<void>;
  fetchPriceTrends: (energyType: EnergyType, interval: TimeInterval) => Promise<void>;
  fetchSentiment: () => Promise<void>;
  fetchComparative: () => Promise<void>;
  fetchPredictive: (energyType: EnergyType) => Promise<void>;
  fetchHistoricalData: (request: HistoricalDataRequest) => Promise<void>;
  subscribeRealtime: (energyTypes: EnergyType[]) => () => void;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export interface MarketAnalyticsContextType {
  state: MarketAnalyticsState;
  actions: MarketAnalyticsActions;
  config: DashboardConfig;
  updateConfig: (config: Partial<DashboardConfig>) => void;
}

// Utility Types
export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'hold';
  strength: number; // 0-100
}

export interface MarketAlert {
  id: string;
  type: 'price' | 'volume' | 'sentiment' | 'technical';
  condition: string;
  threshold: number;
  currentValue: number;
  triggered: boolean;
  createdAt: string;
}

export interface EnergyMarketStats {
  energyType: EnergyType;
  totalSupply: number;
  totalDemand: number;
  averagePrice: number;
  priceVolatility: number;
  tradingVolume: number;
  marketShare: number;
  efficiency: number;
  carbonIntensity: number;
}

// Chart Data Types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area' | 'scatter';
}

// Export all types for easy importing
export type {
  // Core types
  EnergyType,
  TimeInterval,
  MarketDataPoint,
  MarketMetrics,
  VolumeAnalysis,
  PriceTrend,
  SentimentData,
  ComparativeAnalysis,
  PredictiveAnalytics,
  
  // Dashboard types
  DashboardConfig,
  DashboardLayout,
  WidgetConfig,
  WidgetType,
  
  // Real-time types
  RealtimeData,
  MarketEvent,
  
  // API types
  AnalyticsResponse,
  HistoricalDataRequest,
  AnalyticsRequest,
  
  // Component props
  MarketOverviewProps,
  VolumeAnalysisProps,
  PriceTrendsProps,
  SentimentIndicatorsProps,
  PredictiveAnalyticsProps,
  ComparativeAnalysisProps,
  
  // Hook types
  MarketAnalyticsState,
  MarketAnalyticsActions,
  MarketAnalyticsContextType,
  
  // Utility types
  TechnicalIndicator,
  MarketAlert,
  EnergyMarketStats,
  ChartDataPoint,
  ChartSeries,
};
