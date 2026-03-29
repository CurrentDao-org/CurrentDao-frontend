'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket as useWebSocketContext } from '../providers/WebSocketProvider';
import { WebSocketMessage, WebSocketMessageType, TradeUpdate, OrderUpdate, ProposalUpdate, VoteUpdate, Notification, CollaborationEvent } from '../types/websocket';

export interface RealTimeSyncOptions {
  enableTrading?: boolean;
  enableGovernance?: boolean;
  enableNotifications?: boolean;
  enableCollaboration?: boolean;
  filters?: {
    symbols?: string[];
    proposalIds?: string[];
    userId?: string;
  };
}

export interface RealTimeData {
  trades: TradeUpdate[];
  orders: OrderUpdate[];
  proposals: ProposalUpdate[];
  votes: VoteUpdate[];
  notifications: Notification[];
  collaborationEvents: CollaborationEvent[];
  lastUpdated: number;
}

export function useRealTimeSync(options: RealTimeSyncOptions = {}) {
  const {
    enableTrading = true,
    enableGovernance = true,
    enableNotifications = true,
    enableCollaboration = true,
    filters = {}
  } = options;

  const wsContext = useWebSocketContext();
  const [data, setData] = useState<RealTimeData>({
    trades: [],
    orders: [],
    proposals: [],
    votes: [],
    notifications: [],
    collaborationEvents: [],
    lastUpdated: Date.now()
  });

  const subscriptionsRef = useRef<Map<string, string>>(new Map());
  const dataRef = useRef(data);
  dataRef.current = data;

  // Update data helper function
  const updateData = useCallback((type: keyof RealTimeData, newItem: any) => {
    setData((prevData: RealTimeData) => {
      const updatedArray = [...prevData[type]];
      
      // Remove duplicate items based on ID
      const existingIndex = updatedArray.findIndex(item => 
        'tradeId' in item && 'tradeId' in newItem ? item.tradeId === newItem.tradeId :
        'orderId' in item && 'orderId' in newItem ? item.orderId === newItem.orderId :
        'proposalId' in item && 'proposalId' in newItem ? item.proposalId === newItem.proposalId :
        'id' in item && 'id' in newItem ? item.id === newItem.id :
        false
      );

      if (existingIndex >= 0) {
        updatedArray[existingIndex] = newItem;
      } else {
        updatedArray.push(newItem);
        // Keep only last 100 items for performance
        if (updatedArray.length > 100) {
          updatedArray.shift();
        }
      }

      return {
        ...prevData,
        [type]: updatedArray,
        lastUpdated: Date.now()
      };
    });
  }, []);

  // Trading data handler
  const handleTradeUpdate = useCallback((message: WebSocketMessage) => {
    if (!enableTrading) return;
    
    const tradeUpdate = message.payload as TradeUpdate;
    
    // Apply symbol filter if specified
    if (filters.symbols && !filters.symbols.includes(tradeUpdate.symbol)) {
      return;
    }
    
    updateData('trades', tradeUpdate);
  }, [enableTrading, filters.symbols, updateData]);

  // Order data handler
  const handleOrderUpdate = useCallback((message: WebSocketMessage) => {
    if (!enableTrading) return;
    
    const orderUpdate = message.payload as OrderUpdate;
    
    // Apply symbol filter if specified
    if (filters.symbols && !filters.symbols.includes(orderUpdate.symbol)) {
      return;
    }
    
    updateData('orders', orderUpdate);
  }, [enableTrading, filters.symbols, updateData]);

  // Governance data handlers
  const handleProposalUpdate = useCallback((message: WebSocketMessage) => {
    if (!enableGovernance) return;
    
    const proposalUpdate = message.payload as ProposalUpdate;
    
    // Apply proposal filter if specified
    if (filters.proposalIds && !filters.proposalIds.includes(proposalUpdate.proposalId)) {
      return;
    }
    
    updateData('proposals', proposalUpdate);
  }, [enableGovernance, filters.proposalIds, updateData]);

  const handleVoteUpdate = useCallback((message: WebSocketMessage) => {
    if (!enableGovernance) return;
    
    const voteUpdate = message.payload as VoteUpdate;
    
    // Apply proposal filter if specified
    if (filters.proposalIds && !filters.proposalIds.includes(voteUpdate.proposalId)) {
      return;
    }
    
    updateData('votes', voteUpdate);
  }, [enableGovernance, filters.proposalIds, updateData]);

  // Notification handler
  const handleNotification = useCallback((message: WebSocketMessage) => {
    if (!enableNotifications) return;
    
    const notification = message.payload as Notification;
    
    // Apply user filter if specified
    if (filters.userId && notification.id.includes(filters.userId)) {
      updateData('notifications', notification);
    } else if (!filters.userId) {
      updateData('notifications', notification);
    }
  }, [enableNotifications, filters.userId, updateData]);

  // Collaboration handler
  const handleCollaborationEvent = useCallback((message: WebSocketMessage) => {
    if (!enableCollaboration) return;
    
    const collaborationEvent = message.payload as CollaborationEvent;
    
    // Apply user filter if specified
    if (filters.userId && collaborationEvent.userId === filters.userId) {
      updateData('collaborationEvents', collaborationEvent);
    } else if (!filters.userId) {
      updateData('collaborationEvents', collaborationEvent);
    }
  }, [enableCollaboration, filters.userId, updateData]);

  // Setup subscriptions when connected
  useEffect(() => {
    if (!wsContext.isConnected) return;

    const subscriptions: Array<{ type: WebSocketMessageType; handler: (message: WebSocketMessage) => void }> = [];

    if (enableTrading) {
      subscriptions.push(
        { type: WebSocketMessageType.TRADE_UPDATE, handler: handleTradeUpdate },
        { type: WebSocketMessageType.ORDER_UPDATE, handler: handleOrderUpdate },
        { type: WebSocketMessageType.PRICE_UPDATE, handler: handleTradeUpdate },
        { type: WebSocketMessageType.MARKET_DATA, handler: handleTradeUpdate }
      );
    }

    if (enableGovernance) {
      subscriptions.push(
        { type: WebSocketMessageType.PROPOSAL_UPDATE, handler: handleProposalUpdate },
        { type: WebSocketMessageType.VOTE_UPDATE, handler: handleVoteUpdate },
        { type: WebSocketMessageType.GOVERNANCE_EVENT, handler: handleProposalUpdate }
      );
    }

    if (enableNotifications) {
      subscriptions.push(
        { type: WebSocketMessageType.NOTIFICATION, handler: handleNotification },
        { type: WebSocketMessageType.ALERT, handler: handleNotification },
        { type: WebSocketMessageType.SYSTEM_MESSAGE, handler: handleNotification }
      );
    }

    if (enableCollaboration) {
      subscriptions.push(
        { type: WebSocketMessageType.COLLABORATION_EVENT, handler: handleCollaborationEvent },
        { type: WebSocketMessageType.USER_STATUS, handler: handleCollaborationEvent },
        { type: WebSocketMessageType.CHAT_MESSAGE, handler: handleCollaborationEvent }
      );
    }

    // Subscribe to all channels
    subscriptions.forEach(({ type, handler }) => {
      const subscriptionId = wsContext.subscribe(type.toString(), handler);
      subscriptionsRef.current.set(type.toString(), subscriptionId);
    });

    return () => {
      // Cleanup subscriptions
      subscriptionsRef.current.forEach((subscriptionId: string) => {
        wsContext.unsubscribe(subscriptionId);
      });
      subscriptionsRef.current.clear();
    };
  }, [
    wsContext.isConnected,
    wsContext.subscribe,
    wsContext.unsubscribe,
    enableTrading,
    enableGovernance,
    enableNotifications,
    enableCollaboration,
    handleTradeUpdate,
    handleOrderUpdate,
    handleProposalUpdate,
    handleVoteUpdate,
    handleNotification,
    handleCollaborationEvent
  ]);

  // Utility functions
  const clearData = useCallback((type?: keyof RealTimeData) => {
    if (type) {
      setData((prevData: RealTimeData) => ({
        ...prevData,
        [type]: [],
        lastUpdated: Date.now()
      }));
    } else {
      setData({
        trades: [],
        orders: [],
        proposals: [],
        votes: [],
        notifications: [],
        collaborationEvents: [],
        lastUpdated: Date.now()
      });
    }
  }, []);

  const getDataByType = useCallback((type: keyof RealTimeData) => {
    return dataRef.current[type];
  }, []);

  const getLatestBySymbol = useCallback((symbol: string) => {
    return {
      trades: dataRef.current.trades.filter(trade => trade.symbol === symbol),
      orders: dataRef.current.orders.filter(order => order.symbol === symbol)
    };
  }, []);

  const getUnreadNotifications = useCallback(() => {
    return dataRef.current.notifications.filter(notification => !notification.read);
  }, []);

  const getActiveProposals = useCallback(() => {
    return dataRef.current.proposals.filter(proposal => proposal.status === 'active');
  }, []);

  // Performance optimization for mobile
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);

  useEffect(() => {
    const checkBatteryLevel = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setIsLowPowerMode(battery.level < 0.2);
        } catch {
          setIsLowPowerMode(false);
        }
      }
    };

    checkBatteryLevel();
    const interval = setInterval(checkBatteryLevel, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Reduce update frequency in low power mode
  const throttledUpdateData = useCallback((type: keyof RealTimeData, newItem: any) => {
    if (isLowPowerMode) {
      // Throttle updates in low power mode
      setTimeout(() => updateData(type, newItem), 1000);
    } else {
      updateData(type, newItem);
    }
  }, [isLowPowerMode, updateData]);

  return {
    data,
    isConnected: wsContext.isConnected,
    isLowPowerMode,
    clearData,
    getDataByType,
    getLatestBySymbol,
    getUnreadNotifications,
    getActiveProposals,
    updateData: throttledUpdateData
  };
}

// Hook for specific trading data
export function useTradingData(symbols?: string[]) {
  const { data, isConnected, getLatestBySymbol } = useRealTimeSync({
    enableTrading: true,
    enableGovernance: false,
    enableNotifications: false,
    enableCollaboration: false,
    filters: { symbols }
  });

  const symbolData = symbols ? 
    symbols.reduce((acc, symbol) => {
      acc[symbol] = getLatestBySymbol(symbol);
      return acc;
    }, {} as Record<string, { trades: TradeUpdate[]; orders: OrderUpdate[] }>) : 
    {};

  return {
    trades: data.trades,
    orders: data.orders,
    symbolData,
    isConnected,
    lastUpdated: data.lastUpdated
  };
}

// Hook for governance data
export function useGovernanceData(proposalIds?: string[]) {
  const { data, isConnected, getActiveProposals } = useRealTimeSync({
    enableTrading: false,
    enableGovernance: true,
    enableNotifications: false,
    enableCollaboration: false,
    filters: { proposalIds }
  });

  return {
    proposals: data.proposals,
    votes: data.votes,
    activeProposals: getActiveProposals(),
    isConnected,
    lastUpdated: data.lastUpdated
  };
}

// Hook for notifications
export function useNotifications(userId?: string) {
  const { data, isConnected, getUnreadNotifications } = useRealTimeSync({
    enableTrading: false,
    enableGovernance: false,
    enableNotifications: true,
    enableCollaboration: false,
    filters: { userId }
  });

  return {
    notifications: data.notifications,
    unreadNotifications: getUnreadNotifications(),
    unreadCount: getUnreadNotifications().length,
    isConnected,
    lastUpdated: data.lastUpdated
  };
}

// Hook for collaboration data
export function useCollaborationData(userId?: string) {
  const { data, isConnected } = useRealTimeSync({
    enableTrading: false,
    enableGovernance: false,
    enableNotifications: false,
    enableCollaboration: true,
    filters: { userId }
  });

  return {
    events: data.collaborationEvents,
    isConnected,
    lastUpdated: data.lastUpdated
  };
}
