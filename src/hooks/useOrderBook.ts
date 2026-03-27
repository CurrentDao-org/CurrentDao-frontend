import { useState, useEffect, useCallback, useRef } from 'react';
import { OrderBook, OrderBookEntry, OrderBookSettings, LiveMatch } from '@/types/orderbook';
import { OrderBookCalculations } from '@/utils/orderBookCalculations';

interface UseOrderBookProps {
  symbol?: string;
  settings?: Partial<OrderBookSettings>;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useOrderBook({
  symbol = 'BTC/USD',
  settings = {},
  autoRefresh = true,
  refreshInterval = 100
}: UseOrderBookProps = {}) {
  const [orderBook, setOrderBook] = useState<OrderBook>({
    bids: [],
    asks: [],
    spread: 0,
    spreadPercentage: 0,
    lastUpdate: Date.now(),
    totalVolume: 0,
    high24h: 0,
    low24h: 0
  });

  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const defaultSettings: OrderBookSettings = {
    maxLevels: 20,
    groupingSize: 0.01,
    autoRefresh: true,
    refreshInterval: 100,
    showOrderFlow: true,
    showDepthChart: true,
    theme: 'dark',
    ...settings
  };

  const generateMockOrderBook = useCallback((): OrderBook => {
    const basePrice = 50000 + Math.random() * 10000;
    const bids = [];
    const asks = [];

    for (let i = 0; i < defaultSettings.maxLevels; i++) {
      const bidPrice = basePrice - (i * defaultSettings.groupingSize);
      const askPrice = basePrice + ((i + 1) * defaultSettings.groupingSize);
      
      bids.push({
        price: bidPrice,
        quantity: Math.random() * 10 + 0.1,
        total: bidPrice * (Math.random() * 10 + 0.1),
        orders: Math.floor(Math.random() * 50) + 1,
        timestamp: Date.now()
      });

      asks.push({
        price: askPrice,
        quantity: Math.random() * 10 + 0.1,
        total: askPrice * (Math.random() * 10 + 0.1),
        orders: Math.floor(Math.random() * 50) + 1,
        timestamp: Date.now()
      });
    }

    const { spread, spreadPercentage } = OrderBookCalculations.calculateSpread(bids, asks);
    const totalVolume = bids.reduce((sum, bid) => sum + bid.quantity, 0) + 
                       asks.reduce((sum, ask) => sum + ask.quantity, 0);

    return {
      bids,
      asks,
      spread,
      spreadPercentage,
      lastUpdate: Date.now(),
      totalVolume,
      high24h: basePrice * 1.02,
      low24h: basePrice * 0.98
    };
  }, [defaultSettings.maxLevels, defaultSettings.groupingSize]);

  const generateMockLiveMatch = useCallback((): LiveMatch => {
    const midPrice = orderBook.bids[0]?.price && orderBook.asks[0]?.price 
      ? (orderBook.bids[0].price + orderBook.asks[0].price) / 2
      : 50000;

    return {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      price: midPrice + (Math.random() - 0.5) * 100,
      quantity: Math.random() * 5 + 0.1,
      buyOrderId: `buy_${Date.now()}`,
      sellOrderId: `sell_${Date.now()}`,
      timestamp: Date.now(),
      aggressor: Math.random() > 0.5 ? 'buy' : 'sell'
    };
  }, [orderBook]);

  const updateOrderBook = useCallback(() => {
    if (!defaultSettings.autoRefresh) return;

    const newOrderBook = generateMockOrderBook();
    setOrderBook(prev => ({
      ...newOrderBook,
      high24h: prev.high24h || newOrderBook.bids[0]?.price || 0,
      low24h: prev.low24h || newOrderBook.asks[0]?.price || 0
    }));

    if (Math.random() > 0.7) {
      const newMatch = generateMockLiveMatch();
      setLiveMatches(prev => [newMatch, ...prev.slice(0, 49)]);
    }
  }, [generateMockOrderBook, generateMockLiveMatch, defaultSettings.autoRefresh]);

  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.example.com/ws';
      wsRef.current = new WebSocket(`${wsUrl}/orderbook?symbol=${symbol}`);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('OrderBook WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'orderbook') {
            setOrderBook(data.payload);
          } else if (data.type === 'match') {
            setLiveMatches(prev => [data.payload, ...prev.slice(0, 49)]);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('OrderBook WebSocket disconnected');
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      wsRef.current.onerror = (error) => {
        setIsConnected(false);
        setError('WebSocket connection error');
        console.error('OrderBook WebSocket error:', error);
      };

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to order book feed');
      setIsConnected(false);
    }
  }, [symbol]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    updateOrderBook();
    setTimeout(() => setIsLoading(false), 100);
  }, [updateOrderBook]);

  const clearLiveMatches = useCallback(() => {
    setLiveMatches([]);
  }, []);

  useEffect(() => {
    if (autoRefresh && defaultSettings.autoRefresh) {
      updateOrderBook();
      intervalRef.current = setInterval(updateOrderBook, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, defaultSettings.autoRefresh, refreshInterval, updateOrderBook]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      disconnect();
    };
  }, [connectWebSocket, disconnect]);

  return {
    orderBook,
    liveMatches,
    isLoading,
    error,
    isConnected,
    settings: defaultSettings,
    refresh,
    disconnect,
    clearLiveMatches,
    updateOrderBook
  };
}
