import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useRef } from 'react';
import { 
  MarketAnalyticsState, 
  MarketAnalyticsActions, 
  MarketAnalyticsContextType,
  DashboardConfig,
  EnergyType,
  TimeInterval,
  HistoricalDataRequest,
  MarketDataPoint,
  RealtimeData,
  MarketEvent,
  AnalyticsResponse
} from '@/types/analytics';
import {
  calculateMarketMetrics,
  calculateVolumeAnalysis,
  calculatePriceTrend,
  calculateSentiment,
  calculateComparativeAnalysis,
  generatePredictiveAnalytics,
  formatNumber
} from '@/utils/analyticsCalculations';

// Initial state
const initialState: MarketAnalyticsState = {
  metrics: null,
  volumeAnalysis: null,
  priceTrends: null,
  sentiment: null,
  comparative: null,
  predictive: null,
  historicalData: [],
  realtimeData: [],
  events: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Action types
type MarketAnalyticsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_METRICS'; payload: MarketAnalyticsState['metrics'] }
  | { type: 'SET_VOLUME_ANALYSIS'; payload: MarketAnalyticsState['volumeAnalysis'] }
  | { type: 'SET_PRICE_TRENDS'; payload: MarketAnalyticsState['priceTrends'] }
  | { type: 'SET_SENTIMENT'; payload: MarketAnalyticsState['sentiment'] }
  | { type: 'SET_COMPARATIVE'; payload: MarketAnalyticsState['comparative'] }
  | { type: 'SET_PREDICTIVE'; payload: MarketAnalyticsState['predictive'] }
  | { type: 'SET_HISTORICAL_DATA'; payload: MarketDataPoint[] }
  | { type: 'SET_REALTIME_DATA'; payload: RealtimeData[] }
  | { type: 'ADD_REALTIME_DATA'; payload: RealtimeData }
  | { type: 'SET_EVENTS'; payload: MarketEvent[] }
  | { type: 'ADD_EVENT'; payload: MarketEvent }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

// Reducer
const marketAnalyticsReducer = (state: MarketAnalyticsState, action: MarketAnalyticsAction): MarketAnalyticsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload, lastUpdated: new Date().toISOString() };
    case 'SET_VOLUME_ANALYSIS':
      return { ...state, volumeAnalysis: action.payload, lastUpdated: new Date().toISOString() };
    case 'SET_PRICE_TRENDS':
      return { ...state, priceTrends: action.payload, lastUpdated: new Date().toISOString() };
    case 'SET_SENTIMENT':
      return { ...state, sentiment: action.payload, lastUpdated: new Date().toISOString() };
    case 'SET_COMPARATIVE':
      return { ...state, comparative: action.payload, lastUpdated: new Date().toISOString() };
    case 'SET_PREDICTIVE':
      return { ...state, predictive: action.payload, lastUpdated: new Date().toISOString() };
    case 'SET_HISTORICAL_DATA':
      return { ...state, historicalData: action.payload, lastUpdated: new Date().toISOString() };
    case 'SET_REALTIME_DATA':
      return { ...state, realtimeData: action.payload };
    case 'ADD_REALTIME_DATA':
      return { 
        ...state, 
        realtimeData: [...state.realtimeData.slice(-99), action.payload], // Keep last 100 points
        lastUpdated: new Date().toISOString() 
      };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events] };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET_STATE':
      return { ...initialState };
    default:
      return state;
  }
};

// Create context
const MarketAnalyticsContext = createContext<MarketAnalyticsContextType | undefined>(undefined);

// Default dashboard configuration
const defaultConfig: DashboardConfig = {
  id: 'default',
  name: 'Market Analytics Dashboard',
  layout: {
    columns: 4,
    rows: 3,
    gap: 16,
  },
  widgets: [
    {
      id: 'market-overview',
      type: 'market_overview',
      title: 'Market Overview',
      position: { x: 0, y: 0, width: 2, height: 1 },
      config: { refreshInterval: 5 },
      visible: true,
    },
    {
      id: 'price-trends',
      type: 'price_chart',
      title: 'Price Trends',
      position: { x: 2, y: 0, width: 2, height: 1 },
      config: { showTechnicalIndicators: true },
      visible: true,
    },
    {
      id: 'volume-analysis',
      type: 'volume_analysis',
      title: 'Volume Analysis',
      position: { x: 0, y: 1, width: 2, height: 1 },
      config: { timeRange: '1h' },
      visible: true,
    },
    {
      id: 'sentiment-indicators',
      type: 'sentiment_gauge',
      title: 'Market Sentiment',
      position: { x: 2, y: 1, width: 2, height: 1 },
      config: { showBreakdown: true },
      visible: true,
    },
    {
      id: 'comparative-analysis',
      type: 'comparative_chart',
      title: 'Energy Type Comparison',
      position: { x: 0, y: 2, width: 2, height: 1 },
      config: { selectedEnergyTypes: ['solar', 'wind', 'hydro'] },
      visible: true,
    },
    {
      id: 'predictive-analytics',
      type: 'predictive_forecast',
      title: 'Predictive Analytics',
      position: { x: 2, y: 2, width: 2, height: 1 },
      config: { showConfidence: true, timeHorizon: '24h' },
      visible: true,
    },
  ],
  refreshInterval: 5,
  autoRefresh: true,
  theme: 'light',
};

// Provider component
export const MarketAnalyticsProvider: React.FC<{ 
  children: ReactNode; 
  config?: Partial<DashboardConfig>;
}> = ({ children, config: userConfig = {} }) => {
  const [state, dispatch] = useReducer(marketAnalyticsReducer, initialState);
  const [config, setConfigState] = useState<DashboardConfig>({ ...defaultConfig, ...userConfig });
  
  const websocketRef = useRef<WebSocket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // API service functions
  const apiService = {
    // Mock API calls - replace with actual API endpoints
    async fetchMarketData(request: HistoricalDataRequest): Promise<MarketDataPoint[]> {
      // Generate mock data for demonstration
      const data: MarketDataPoint[] = [];
      const startTime = new Date(request.startTime).getTime();
      const endTime = new Date(request.endTime).getTime();
      const interval = (endTime - startTime) / (request.limit || 100);
      
      for (let i = 0; i < (request.limit || 100); i++) {
        const timestamp = new Date(startTime + (i * interval)).toISOString();
        const basePrice = 50 + Math.random() * 100;
        const volume = 1000 + Math.random() * 9000;
        
        data.push({
          timestamp,
          price: basePrice + (Math.random() - 0.5) * 10,
          volume,
          high: basePrice + Math.random() * 5,
          low: basePrice - Math.random() * 5,
          open: basePrice,
          close: basePrice + (Math.random() - 0.5) * 10,
          energyType: request.energyType || 'solar',
        });
      }
      
      return data;
    },

    async fetchSocialSentiment(): Promise<number[]> {
      // Mock social sentiment data
      return Array.from({ length: 10 }, () => Math.random() * 200 - 100);
    },

    async fetchNewsSentiment(): Promise<number[]> {
      // Mock news sentiment data
      return Array.from({ length: 10 }, () => Math.random() * 200 - 100);
    },

    async fetchTechnicalSentiment(): Promise<number[]> {
      // Mock technical sentiment data
      return Array.from({ length: 10 }, () => Math.random() * 200 - 100);
    },

    async fetchRealtimeUpdates(): Promise<RealtimeData[]> {
      // Mock realtime data
      return Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        price: 50 + Math.random() * 100,
        volume: 1000 + Math.random() * 9000,
        trades: Math.floor(Math.random() * 100),
        energyType: ['solar', 'wind', 'hydro'][Math.floor(Math.random() * 3)] as EnergyType,
        exchange: 'CurrentDao',
      }));
    },

    async fetchMarketEvents(): Promise<MarketEvent[]> {
      // Mock market events
      return [
        {
          id: '1',
          type: 'price_alert',
          severity: 'medium',
          title: 'Price Spike Detected',
          description: 'Solar energy price increased by 15% in the last hour',
          timestamp: new Date().toISOString(),
          data: { energyType: 'solar', changePercent: 15 },
          acknowledged: false,
        },
        {
          id: '2',
          type: 'volume_spike',
          severity: 'high',
          title: 'Unusual Volume Activity',
          description: 'Wind energy trading volume 3x higher than average',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          data: { energyType: 'wind', volumeMultiplier: 3 },
          acknowledged: false,
        },
      ];
    },
  };

  // Actions
  const actions: MarketAnalyticsActions = {
    fetchMetrics: useCallback(async (energyTypes?: EnergyType[]) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        const request: HistoricalDataRequest = {
          energyType: energyTypes?.[0],
          interval: '1h',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          limit: 100,
        };

        const data = await apiService.fetchMarketData(request);
        const metrics = calculateMarketMetrics(data);
        
        dispatch({ type: 'SET_METRICS', payload: metrics });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch metrics' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [apiService]),

    fetchVolumeAnalysis: useCallback(async (energyType?: EnergyType) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        const request: HistoricalDataRequest = {
          energyType,
          interval: '1h',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          limit: 100,
        };

        const data = await apiService.fetchMarketData(request);
        const volumeAnalysis = calculateVolumeAnalysis(data);
        
        dispatch({ type: 'SET_VOLUME_ANALYSIS', payload: volumeAnalysis });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch volume analysis' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [apiService]),

    fetchPriceTrends: useCallback(async (energyType: EnergyType, interval: TimeInterval) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        const request: HistoricalDataRequest = {
          energyType,
          interval,
          startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          limit: 200,
        };

        const data = await apiService.fetchMarketData(request);
        const priceTrends = calculatePriceTrend(data);
        
        dispatch({ type: 'SET_PRICE_TRENDS', payload: priceTrends });
        dispatch({ type: 'SET_HISTORICAL_DATA', payload: data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch price trends' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [apiService]),

    fetchSentiment: useCallback(async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        const [socialData, newsData, technicalData] = await Promise.all([
          apiService.fetchSocialSentiment(),
          apiService.fetchNewsSentiment(),
          apiService.fetchTechnicalSentiment(),
        ]);

        const sentiment = calculateSentiment(socialData, newsData, technicalData);
        
        dispatch({ type: 'SET_SENTIMENT', payload: sentiment });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch sentiment data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [apiService]),

    fetchComparative: useCallback(async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        const request: HistoricalDataRequest = {
          interval: '1h',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          limit: 500,
        };

        const data = await apiService.fetchMarketData(request);
        const comparative = calculateComparativeAnalysis(data);
        
        dispatch({ type: 'SET_COMPARATIVE', payload: comparative });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch comparative analysis' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [apiService]),

    fetchPredictive: useCallback(async (energyType: EnergyType) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        const request: HistoricalDataRequest = {
          energyType,
          interval: '1h',
          startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          limit: 500,
        };

        const data = await apiService.fetchMarketData(request);
        const predictive = generatePredictiveAnalytics(data);
        
        dispatch({ type: 'SET_PREDICTIVE', payload: predictive });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch predictive analytics' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [apiService]),

    fetchHistoricalData: useCallback(async (request: HistoricalDataRequest) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        const data = await apiService.fetchMarketData(request);
        
        dispatch({ type: 'SET_HISTORICAL_DATA', payload: data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch historical data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [apiService]),

    subscribeRealtime: useCallback((energyTypes: EnergyType[]) => {
      // Mock WebSocket subscription
      const connectWebSocket = () => {
        try {
          // In a real implementation, this would connect to a WebSocket server
          websocketRef.current = new WebSocket('wss://api.currentdao.com/realtime');
          
          websocketRef.current.onopen = () => {
            console.log('Connected to real-time data stream');
            // Subscribe to specific energy types
            websocketRef.current?.send(JSON.stringify({
              action: 'subscribe',
              energyTypes,
            }));
          };
          
          websocketRef.current.onmessage = (event) => {
            try {
              const data: RealtimeData = JSON.parse(event.data);
              dispatch({ type: 'ADD_REALTIME_DATA', payload: data });
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };
          
          websocketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
          };
          
          websocketRef.current.onclose = () => {
            console.log('WebSocket connection closed');
            // Attempt to reconnect after 5 seconds
            setTimeout(connectWebSocket, 5000);
          };
        } catch (error) {
          console.error('Failed to connect to WebSocket:', error);
          // Fallback to polling
          startRealtimePolling();
        }
      };

      const startRealtimePolling = async () => {
        const data = await apiService.fetchRealtimeUpdates();
        dispatch({ type: 'SET_REALTIME_DATA', payload: data });
        
        // Set up polling interval
        const pollInterval = setInterval(async () => {
          try {
            const newData = await apiService.fetchRealtimeUpdates();
            newData.forEach(point => {
              dispatch({ type: 'ADD_REALTIME_DATA', payload: point });
            });
          } catch (error) {
            console.error('Error polling real-time data:', error);
          }
        }, 5000); // Poll every 5 seconds
        
        return () => clearInterval(pollInterval);
      };

      connectWebSocket();

      return () => {
        if (websocketRef.current) {
          websocketRef.current.close();
          websocketRef.current = null;
        }
      };
    }, [apiService]),

    refreshData: useCallback(async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        // Refresh all data
        await Promise.all([
          actions.fetchMetrics(),
          actions.fetchVolumeAnalysis(),
          actions.fetchPriceTrends('solar', '1h'),
          actions.fetchSentiment(),
          actions.fetchComparative(),
          actions.fetchPredictive('solar'),
        ]);

        // Fetch events
        const events = await apiService.fetchMarketEvents();
        dispatch({ type: 'SET_EVENTS', payload: events });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [actions, apiService]),

    clearError: useCallback(() => {
      dispatch({ type: 'CLEAR_ERROR' });
    }, []),
  };

  // Initialize data on mount
  useEffect(() => {
    actions.refreshData();
    
    // Set up auto-refresh if enabled
    if (config.autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        actions.refreshData();
      }, config.refreshInterval * 1000);
    }

    // Subscribe to real-time data
    const unsubscribe = actions.subscribeRealtime(['solar', 'wind', 'hydro']);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      unsubscribe();
    };
  }, [config.autoRefresh, config.refreshInterval, actions]);

  // Update config
  const updateConfig = useCallback((newConfig: Partial<DashboardConfig>) => {
    setConfigState(prev => ({ ...prev, ...newConfig }));
  }, []);

  const contextValue: MarketAnalyticsContextType = {
    state,
    actions,
    config,
    updateConfig,
  };

  return (
    <MarketAnalyticsContext.Provider value={contextValue}>
      {children}
    </MarketAnalyticsContext.Provider>
  );
};

// Hook to use market analytics context
export const useMarketAnalytics = (): MarketAnalyticsContextType => {
  const context = useContext(MarketAnalyticsContext);
  if (context === undefined) {
    throw new Error('useMarketAnalytics must be used within a MarketAnalyticsProvider');
  }
  return context;
};

// Additional hooks for specific data
export const useMarketMetrics = () => {
  const { state, actions } = useMarketAnalytics();
  return {
    metrics: state.metrics,
    isLoading: state.isLoading,
    error: state.error,
    refresh: actions.fetchMetrics,
  };
};

export const useVolumeAnalysis = () => {
  const { state, actions } = useMarketAnalytics();
  return {
    volumeAnalysis: state.volumeAnalysis,
    isLoading: state.isLoading,
    error: state.error,
    refresh: actions.fetchVolumeAnalysis,
  };
};

export const usePriceTrends = () => {
  const { state, actions } = useMarketAnalytics();
  return {
    priceTrends: state.priceTrends,
    historicalData: state.historicalData,
    isLoading: state.isLoading,
    error: state.error,
    refresh: actions.fetchPriceTrends,
  };
};

export const useSentiment = () => {
  const { state, actions } = useMarketAnalytics();
  return {
    sentiment: state.sentiment,
    isLoading: state.isLoading,
    error: state.error,
    refresh: actions.fetchSentiment,
  };
};

export const useComparativeAnalysis = () => {
  const { state, actions } = useMarketAnalytics();
  return {
    comparative: state.comparative,
    isLoading: state.isLoading,
    error: state.error,
    refresh: actions.fetchComparative,
  };
};

export const usePredictiveAnalytics = () => {
  const { state, actions } = useMarketAnalytics();
  return {
    predictive: state.predictive,
    isLoading: state.isLoading,
    error: state.error,
    refresh: actions.fetchPredictive,
  };
};

export const useRealtimeData = () => {
  const { state } = useMarketAnalytics();
  return {
    realtimeData: state.realtimeData,
    lastUpdated: state.lastUpdated,
  };
};

export const useMarketEvents = () => {
  const { state } = useMarketAnalytics();
  return {
    events: state.events,
    hasUnacknowledgedEvents: state.events.some(event => !event.acknowledged),
  };
};

export const useDashboardConfig = () => {
  const { config, updateConfig } = useMarketAnalytics();
  return {
    config,
    updateConfig,
  };
};
