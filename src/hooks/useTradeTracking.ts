import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trade, 
  TradeStatus, 
  TradeStatusUpdate, 
  StatusHistory, 
  StatusAlert, 
  StatusFilter, 
  TrackingState, 
  RealTimeUpdate,
  StatusMetrics 
} from '@/types/tracking';
import { 
  generateMockTrade, 
  getProgressVisualization, 
  calculateStatusMetrics, 
  filterTrades,
  getNextStatus,
  STATUS_CONFIG
} from '@/utils/statusHelpers';

interface UseTradeTrackingOptions {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTime?: boolean;
}

interface UseTradeTrackingReturn extends TrackingState {
  // Data operations
  addTrade: (trade: Trade) => void;
  updateTradeStatus: (tradeId: string, status: TradeStatus, message?: string, details?: Record<string, any>) => void;
  cancelTrade: (tradeId: string, reason?: string) => void;
  
  // Filtering and searching
  updateFilters: (filters: Partial<StatusFilter>) => void;
  clearFilters: () => void;
  getFilteredTrades: () => Trade[];
  
  // Status history
  getStatusHistory: (tradeId: string) => StatusHistory | null;
  getProgressVisualization: (tradeId: string) => ReturnType<typeof getProgressVisualization>;
  
  // Alerts
  markAlertAsRead: (alertId: string) => void;
  clearAlerts: () => void;
  
  // Metrics
  getMetrics: () => StatusMetrics;
  
  // Export
  exportTrades: (format: 'CSV' | 'JSON', includeDetails?: boolean) => string;
  
  // Real-time
  connectRealTime: () => void;
  disconnectRealTime: () => void;
  
  // Utilities
  refreshData: () => void;
  clearError: () => void;
}

const generateMockStatusHistory = (trade: Trade): StatusHistory => {
  const updates: TradeStatusUpdate[] = [
    {
      id: `${trade.id}_initiated`,
      tradeId: trade.id,
      status: 'initiated',
      timestamp: trade.initiatedAt,
      message: 'Trade was initiated',
      userId: trade.userId,
      isAutomated: false,
    },
  ];

  const statusFlow: TradeStatus[] = ['pending_validation', 'validated', 'matched', 'executing', 'executed', 'settling', 'settled', 'completed'];
  const currentStatusIndex = statusFlow.indexOf(trade.status);
  
  if (currentStatusIndex > -1) {
    let currentTimestamp = trade.initiatedAt + 30000; // 30 seconds after initiation
    
    for (let i = 0; i <= currentStatusIndex; i++) {
      const status = statusFlow[i];
      currentTimestamp += Math.random() * 60000 + 15000; // Random 15-75 seconds between statuses
      
      updates.push({
        id: `${trade.id}_${status}`,
        tradeId: trade.id,
        status,
        timestamp: Math.min(currentTimestamp, trade.updatedAt),
        message: `Trade status updated to ${status}`,
        userId: trade.userId,
        isAutomated: i > 0, // First update is manual, rest are automated
        details: status === 'executed' ? { 
          blockchainTxHash: trade.blockchainTxHash,
          gasUsed: trade.gasUsed,
          gasPrice: trade.gasPrice,
        } : undefined,
      });
    }
  }

  if (trade.status === 'failed') {
    updates.push({
      id: `${trade.id}_failed`,
      tradeId: trade.id,
      status: 'failed',
      timestamp: trade.updatedAt,
      message: trade.errorMessage || 'Trade failed',
      userId: trade.userId,
      isAutomated: true,
      details: { error: trade.errorMessage },
    });
  }

  if (trade.status === 'cancelled') {
    updates.push({
      id: `${trade.id}_cancelled`,
      tradeId: trade.id,
      status: 'cancelled',
      timestamp: trade.updatedAt,
      message: 'Trade was cancelled',
      userId: trade.userId,
      isAutomated: false,
    });
  }

  const progress = getNextStatus(trade.status) ? Math.random() * 80 + 20 : 100;
  const estimatedCompletion = getNextStatus(trade.status) 
    ? Date.now() + Math.random() * 300000 + 60000 // 1-6 minutes from now
    : undefined;

  return {
    tradeId: trade.id,
    updates,
    currentStatus: trade.status,
    progress,
    estimatedCompletion,
    nextStatus: getNextStatus(trade.status),
  };
};

export const useTradeTracking = ({
  userId,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  enableRealTime = true,
}: UseTradeTrackingOptions = {}): UseTradeTrackingReturn => {
  const [state, setState] = useState<TrackingState>({
    trades: [],
    statusHistory: {},
    alerts: [],
    filters: {},
    loading: true,
    error: null,
    lastUpdated: Date.now(),
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize mock data
  const initializeMockData = useCallback(() => {
    const mockTrades: Trade[] = [];
    const mockHistory: Record<string, StatusHistory> = {};
    const mockAlerts: StatusAlert[] = [];

    // Generate 20 mock trades
    for (let i = 0; i < 20; i++) {
      const trade = generateMockTrade(`trade_${i + 1}`, userId || 'user_123');
      mockTrades.push(trade);
      mockHistory[trade.id] = generateMockStatusHistory(trade);

      // Generate some alerts for recent trades
      if (Math.random() > 0.7 && trade.initiatedAt > Date.now() - 3600000) { // Last hour
        mockAlerts.push({
          id: `alert_${i + 1}`,
          type: trade.status === 'failed' ? 'error' : 'info',
          title: `Trade ${trade.status === 'failed' ? 'Failed' : 'Updated'}`,
          message: `Trade ${trade.id} ${trade.status === 'failed' ? 'has failed' : `status updated to ${trade.status}`}`,
          tradeId: trade.id,
          timestamp: trade.updatedAt,
          isRead: false,
          actionUrl: `/trades/${trade.id}`,
        });
      }
    }

    setState(prev => ({
      ...prev,
      trades: mockTrades,
      statusHistory: mockHistory,
      alerts: mockAlerts,
      loading: false,
      lastUpdated: Date.now(),
    }));
  }, [userId]);

  // Simulate real-time updates
  const simulateRealTimeUpdate = useCallback(() => {
    if (state.trades.length === 0) return;

    const randomTrade = state.trades[Math.floor(Math.random() * state.trades.length)];
    const nextStatus = getNextStatus(randomTrade.status);

    if (nextStatus && Math.random() > 0.8) { // 20% chance of status update
      updateTradeStatus(randomTrade.id, nextStatus, `Automated status update to ${nextStatus}`);
    }
  }, [state.trades]);

  // WebSocket connection for real-time updates
  const connectRealTime = useCallback(() => {
    if (!enableRealTime) return;

    try {
      // In a real implementation, this would connect to a WebSocket server
      // For now, we'll simulate with intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        simulateRealTimeUpdate();
      }, refreshInterval);

      setState(prev => ({
        ...prev,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect to real-time updates',
      }));
    }
  }, [enableRealTime, refreshInterval, simulateRealTimeUpdate]);

  const disconnectRealTime = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Add new trade
  const addTrade = useCallback((trade: Trade) => {
    setState(prev => {
      const newTrades = [trade, ...prev.trades];
      const newHistory = {
        ...prev.statusHistory,
        [trade.id]: generateMockStatusHistory(trade),
      };

      // Add alert for new trade
      const newAlert: StatusAlert = {
        id: `alert_new_${trade.id}`,
        type: 'info',
        title: 'New Trade Initiated',
        message: `Trade ${trade.id} has been initiated`,
        tradeId: trade.id,
        timestamp: Date.now(),
        isRead: false,
        actionUrl: `/trades/${trade.id}`,
      };

      return {
        ...prev,
        trades: newTrades,
        statusHistory: newHistory,
        alerts: [newAlert, ...prev.alerts],
        lastUpdated: Date.now(),
      };
    });
  }, []);

  // Update trade status
  const updateTradeStatus = useCallback((
    tradeId: string, 
    status: TradeStatus, 
    message?: string, 
    details?: Record<string, any>
  ) => {
    setState(prev => {
      const updatedTrades = prev.trades.map(trade =>
        trade.id === tradeId 
          ? { 
              ...trade, 
              status, 
              updatedAt: Date.now(),
              completedAt: ['completed', 'settled'].includes(status) ? Date.now() : trade.completedAt,
            }
          : trade
      );

      const updatedTrade = updatedTrades.find(t => t.id === tradeId);
      if (!updatedTrade) return prev;

      const statusUpdate: TradeStatusUpdate = {
        id: `${tradeId}_${status}_${Date.now()}`,
        tradeId,
        status,
        timestamp: Date.now(),
        message: message || `Trade status updated to ${status}`,
        userId: updatedTrade.userId,
        isAutomated: true,
        details,
      };

      const updatedHistory = {
        ...prev.statusHistory,
        [tradeId]: {
          ...prev.statusHistory[tradeId],
          updates: [...(prev.statusHistory[tradeId]?.updates || []), statusUpdate],
          currentStatus: status,
          progress: getNextStatus(status) ? Math.random() * 80 + 20 : 100,
          nextStatus: getNextStatus(status),
        },
      };

      // Add alert for status update
      const alertType = status === 'failed' ? 'error' : status === 'completed' ? 'success' : 'info';
      const newAlert: StatusAlert = {
        id: `alert_update_${tradeId}_${Date.now()}`,
        type: alertType,
        title: `Trade ${status === 'failed' ? 'Failed' : status === 'completed' ? 'Completed' : 'Updated'}`,
        message: message || `Trade ${tradeId} status updated to ${status}`,
        tradeId,
        timestamp: Date.now(),
        isRead: false,
        actionUrl: `/trades/${tradeId}`,
      };

      return {
        ...prev,
        trades: updatedTrades,
        statusHistory: updatedHistory,
        alerts: [newAlert, ...prev.alerts],
        lastUpdated: Date.now(),
      };
    });
  }, []);

  // Cancel trade
  const cancelTrade = useCallback((tradeId: string, reason?: string) => {
    updateTradeStatus(tradeId, 'cancelled', reason || 'Trade cancelled by user');
  }, [updateTradeStatus]);

  // Update filters
  const updateFilters = useCallback((filters: Partial<StatusFilter>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
    }));
  }, []);

  // Get filtered trades
  const getFilteredTrades = useCallback(() => {
    return filterTrades(state.trades, state.filters);
  }, [state.trades, state.filters]);

  // Get status history
  const getStatusHistory = useCallback((tradeId: string): StatusHistory | null => {
    return state.statusHistory[tradeId] || null;
  }, [state.statusHistory]);

  // Get progress visualization
  const getProgressVisualization = useCallback((tradeId: string) => {
    const trade = state.trades.find(t => t.id === tradeId);
    const history = state.statusHistory[tradeId];
    
    if (!trade || !history) return null;
    
    return getProgressVisualization(trade, history);
  }, [state.trades, state.statusHistory]);

  // Mark alert as read
  const markAlertAsRead = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ),
    }));
  }, []);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setState(prev => ({
      ...prev,
      alerts: [],
    }));
  }, []);

  // Get metrics
  const getMetrics = useCallback((): StatusMetrics => {
    return calculateStatusMetrics(state.trades);
  }, [state.trades]);

  // Export trades
  const exportTrades = useCallback((format: 'CSV' | 'JSON', includeDetails = true) => {
    const tradesToExport = includeDetails ? getFilteredTrades() : state.trades;
    
    if (format === 'CSV') {
      const { exportToCSV } = require('@/utils/statusHelpers');
      return exportToCSV(tradesToExport);
    } else {
      const { exportToJSON } = require('@/utils/statusHelpers');
      return exportToJSON(tradesToExport);
    }
  }, [state.trades, getFilteredTrades]);

  // Refresh data
  const refreshData = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }));
    initializeMockData();
  }, [initializeMockData]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeMockData();
  }, [initializeMockData]);

  // Set up real-time updates
  useEffect(() => {
    if (autoRefresh && enableRealTime) {
      connectRealTime();
    }

    return () => {
      disconnectRealTime();
    };
  }, [autoRefresh, enableRealTime, connectRealTime, disconnectRealTime]);

  // Auto-refresh with interval
  useEffect(() => {
    if (autoRefresh && !enableRealTime) {
      intervalRef.current = setInterval(() => {
        refreshData();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, enableRealTime, refreshInterval, refreshData]);

  return {
    ...state,
    addTrade,
    updateTradeStatus,
    cancelTrade,
    updateFilters,
    clearFilters,
    getFilteredTrades,
    getStatusHistory,
    getProgressVisualization,
    markAlertAsRead,
    clearAlerts,
    getMetrics,
    exportTrades,
    connectRealTime,
    disconnectRealTime,
    refreshData,
    clearError,
  };
};
