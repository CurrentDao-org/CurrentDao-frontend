export interface PriceLevel {
  price: number;
  quantity: number;
  total: number;
  orders: number;
  timestamp: number;
}

export interface OrderBookEntry {
  id: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
  userId?: string;
  type: 'limit' | 'market';
  status: 'active' | 'filled' | 'cancelled' | 'partial';
}

export interface OrderBook {
  bids: PriceLevel[];
  asks: PriceLevel[];
  spread: number;
  spreadPercentage: number;
  lastUpdate: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
}

export interface MarketDepthData {
  price: number;
  buyDepth: number;
  sellDepth: number;
  cumulativeBuyVolume: number;
  cumulativeSellVolume: number;
}

export interface LiveMatch {
  id: string;
  price: number;
  quantity: number;
  buyOrderId: string;
  sellOrderId: string;
  timestamp: number;
  aggressor: 'buy' | 'sell';
}

export interface PriceLevelAnalysis {
  price: number;
  support: number;
  resistance: number;
  strength: number;
  volume: number;
  orders: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export interface OrderFlowIndicator {
  timestamp: number;
  buyPressure: number;
  sellPressure: number;
  netFlow: number;
  volume: number;
  trades: number;
}

export interface HistoricalOrderBookData {
  timestamp: number;
  price: number;
  volume: number;
  bidVolume: number;
  askVolume: number;
  spread: number;
}

export interface OrderBookSettings {
  maxLevels: number;
  groupingSize: number;
  autoRefresh: boolean;
  refreshInterval: number;
  showOrderFlow: boolean;
  showDepthChart: boolean;
  theme: 'light' | 'dark';
}

export interface OrderBookFilters {
  priceRange: {
    min: number;
    max: number;
  };
  quantityRange: {
    min: number;
    max: number;
  };
  orderTypes: ('limit' | 'market')[];
  status: ('active' | 'filled' | 'cancelled' | 'partial')[];
}
