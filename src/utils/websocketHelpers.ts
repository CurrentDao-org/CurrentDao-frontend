import { WebSocketMessage, WebSocketMessageType, WebSocketConfig, TradeUpdate, OrderUpdate, ProposalUpdate, VoteUpdate, Notification, CollaborationEvent } from '../types/websocket';

// WebSocket URL configuration
export const getWebSocketUrl = (protocol: 'ws' | 'wss' = 'wss', host: string = 'localhost', port: number = 8080, path: string = '/ws'): string => {
  return `${protocol}://${host}:${port}${path}`;
};

// Default WebSocket configuration
export const getDefaultWebSocketConfig = (url?: string): WebSocketConfig => ({
  url: url || getWebSocketUrl(),
  protocols: [],
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  messageQueueSize: 1000,
  enableCompression: true,
  timeout: 10000
});

// Message validation helpers
export const validateWebSocketMessage = (message: any): message is WebSocketMessage => {
  return (
    message &&
    typeof message === 'object' &&
    typeof message.id === 'string' &&
    Object.values(WebSocketMessageType).includes(message.type as WebSocketMessageType) &&
    typeof message.timestamp === 'number' &&
    message.payload !== undefined
  );
};

export const validateTradeUpdate = (payload: any): payload is TradeUpdate => {
  return (
    payload &&
    typeof payload === 'object' &&
    typeof payload.tradeId === 'string' &&
    typeof payload.symbol === 'string' &&
    typeof payload.price === 'number' &&
    typeof payload.quantity === 'number' &&
    ['buy', 'sell'].includes(payload.side) &&
    typeof payload.timestamp === 'number' &&
    ['pending', 'completed', 'failed'].includes(payload.status)
  );
};

export const validateOrderUpdate = (payload: any): payload is OrderUpdate => {
  return (
    payload &&
    typeof payload === 'object' &&
    typeof payload.orderId === 'string' &&
    typeof payload.symbol === 'string' &&
    ['limit', 'market', 'stop'].includes(payload.type) &&
    ['buy', 'sell'].includes(payload.side) &&
    typeof payload.quantity === 'number' &&
    (payload.price === undefined || typeof payload.price === 'number') &&
    typeof payload.filledQuantity === 'number' &&
    ['open', 'filled', 'cancelled', 'rejected'].includes(payload.status) &&
    typeof payload.timestamp === 'number'
  );
};

export const validateProposalUpdate = (payload: any): payload is ProposalUpdate => {
  return (
    payload &&
    typeof payload === 'object' &&
    typeof payload.proposalId === 'string' &&
    typeof payload.title === 'string' &&
    typeof payload.description === 'string' &&
    ['active', 'executed', 'rejected', 'expired'].includes(payload.status) &&
    typeof payload.votesFor === 'number' &&
    typeof payload.votesAgainst === 'number' &&
    typeof payload.deadline === 'number' &&
    typeof payload.timestamp === 'number'
  );
};

export const validateVoteUpdate = (payload: any): payload is VoteUpdate => {
  return (
    payload &&
    typeof payload === 'object' &&
    typeof payload.proposalId === 'string' &&
    typeof payload.voter === 'string' &&
    ['for', 'against', 'abstain'].includes(payload.vote) &&
    typeof payload.weight === 'number' &&
    typeof payload.timestamp === 'number'
  );
};

export const validateNotification = (payload: any): payload is Notification => {
  return (
    payload &&
    typeof payload === 'object' &&
    typeof payload.id === 'string' &&
    ['info', 'warning', 'error', 'success'].includes(payload.type) &&
    typeof payload.title === 'string' &&
    typeof payload.message === 'string' &&
    typeof payload.read === 'boolean' &&
    typeof payload.timestamp === 'number' &&
    (payload.actionUrl === undefined || typeof payload.actionUrl === 'string') &&
    (payload.actionText === undefined || typeof payload.actionText === 'string')
  );
};

export const validateCollaborationEvent = (payload: any): payload is CollaborationEvent => {
  return (
    payload &&
    typeof payload === 'object' &&
    typeof payload.eventId === 'string' &&
    ['document_edit', 'comment', 'mention', 'share'].includes(payload.type) &&
    typeof payload.userId === 'string' &&
    typeof payload.userName === 'string' &&
    typeof payload.content === 'string' &&
    typeof payload.timestamp === 'number' &&
    (payload.documentId === undefined || typeof payload.documentId === 'string')
  );
};

// Message creation helpers
export const createWebSocketMessage = (
  type: WebSocketMessageType,
  payload: any,
  channel?: string
): WebSocketMessage => ({
  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  payload,
  timestamp: Date.now(),
  channel
});

export const createTradeUpdateMessage = (tradeUpdate: TradeUpdate): WebSocketMessage => 
  createWebSocketMessage(WebSocketMessageType.TRADE_UPDATE, tradeUpdate, 'trading');

export const createOrderUpdateMessage = (orderUpdate: OrderUpdate): WebSocketMessage => 
  createWebSocketMessage(WebSocketMessageType.ORDER_UPDATE, orderUpdate, 'trading');

export const createProposalUpdateMessage = (proposalUpdate: ProposalUpdate): WebSocketMessage => 
  createWebSocketMessage(WebSocketMessageType.PROPOSAL_UPDATE, proposalUpdate, 'governance');

export const createVoteUpdateMessage = (voteUpdate: VoteUpdate): WebSocketMessage => 
  createWebSocketMessage(WebSocketMessageType.VOTE_UPDATE, voteUpdate, 'governance');

export const createNotificationMessage = (notification: Notification): WebSocketMessage => 
  createWebSocketMessage(WebSocketMessageType.NOTIFICATION, notification, 'notifications');

export const createCollaborationEventMessage = (event: CollaborationEvent): WebSocketMessage => 
  createWebSocketMessage(WebSocketMessageType.COLLABORATION_EVENT, event, 'collaboration');

// Performance monitoring helpers
export const measureMessageLatency = (message: WebSocketMessage): number => {
  return Date.now() - message.timestamp;
};

export const calculateAverageLatency = (latencies: number[]): number => {
  if (latencies.length === 0) return 0;
  const sum = latencies.reduce((acc, latency) => acc + latency, 0);
  return sum / latencies.length;
};

export const calculateThroughput = (messageCount: number, timeWindowMs: number): number => {
  return (messageCount / timeWindowMs) * 1000; // messages per second
};

// Connection health helpers
export const isConnectionHealthy = (lastPingTime: number, lastPongTime: number, threshold: number = 30000): boolean => {
  const now = Date.now();
  const timeSinceLastPong = now - lastPongTime;
  return timeSinceLastPong < threshold;
};

export const shouldReconnect = (connectionState: any): boolean => {
  return (
    connectionState.status !== 'connected' &&
    connectionState.reconnectAttempts < 10
  );
};

// Message filtering helpers
export const filterMessagesByType = <T>(messages: WebSocketMessage[], type: WebSocketMessageType): (WebSocketMessage & { payload: T })[] => {
  return messages
    .filter(message => message.type === type)
    .map(message => message as WebSocketMessage & { payload: T });
};

export const filterMessagesByTimeRange = (messages: WebSocketMessage[], startTime: number, endTime: number): WebSocketMessage[] => {
  return messages.filter(message => 
    message.timestamp >= startTime && message.timestamp <= endTime
  );
};

export const filterMessagesByChannel = (messages: WebSocketMessage[], channel: string): WebSocketMessage[] => {
  return messages.filter(message => message.channel === channel);
};

// Message aggregation helpers
export const aggregateTradesBySymbol = (trades: TradeUpdate[]): Record<string, TradeUpdate[]> => {
  return trades.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = [];
    }
    acc[trade.symbol].push(trade);
    return acc;
  }, {} as Record<string, TradeUpdate[]>);
};

export const aggregateOrdersByStatus = (orders: OrderUpdate[]): Record<string, OrderUpdate[]> => {
  return orders.reduce((acc, order) => {
    if (!acc[order.status]) {
      acc[order.status] = [];
    }
    acc[order.status].push(order);
    return acc;
  }, {} as Record<string, OrderUpdate[]>);
};

export const aggregateVotesByProposal = (votes: VoteUpdate[]): Record<string, VoteUpdate[]> => {
  return votes.reduce((acc, vote) => {
    if (!acc[vote.proposalId]) {
      acc[vote.proposalId] = [];
    }
    acc[vote.proposalId].push(vote);
    return acc;
  }, {} as Record<string, VoteUpdate[]>);
};

// Mobile optimization helpers
export const isMobileDevice = (): boolean => {
  return typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isLowPowerMode = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && 'getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return battery.level < 0.2;
    } catch {
      return false;
    }
  }
  return false;
};

export const getOptimalHeartbeatInterval = async (): Promise<number> => {
  const isMobile = isMobileDevice();
  const lowPower = await isLowPowerMode();
  
  if (lowPower) {
    return 60000; // 1 minute
  } else if (isMobile) {
    return 45000; // 45 seconds
  } else {
    return 30000; // 30 seconds
  }
};

// Storage helpers for offline support
export const saveMessageToStorage = (message: WebSocketMessage): void => {
  try {
    const storedMessages = getMessagesFromStorage();
    storedMessages.push(message);
    
    // Keep only last 100 messages
    if (storedMessages.length > 100) {
      storedMessages.splice(0, storedMessages.length - 100);
    }
    
    localStorage.setItem('websocket_messages', JSON.stringify(storedMessages));
  } catch (error) {
    console.warn('Failed to save message to storage:', error);
  }
};

export const getMessagesFromStorage = (): WebSocketMessage[] => {
  try {
    const stored = localStorage.getItem('websocket_messages');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const clearMessagesFromStorage = (): void => {
  try {
    localStorage.removeItem('websocket_messages');
  } catch (error) {
    console.warn('Failed to clear messages from storage:', error);
  }
};

// Debug helpers
export const createDebugLogger = (enabled: boolean = false) => ({
  log: (...args: any[]) => {
    if (enabled) {
      console.log('[WebSocket Debug]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (enabled) {
      console.error('[WebSocket Error]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (enabled) {
      console.warn('[WebSocket Warning]', ...args);
    }
  }
});

export const debugWebSocketMessage = (message: WebSocketMessage, logger: ReturnType<typeof createDebugLogger>): void => {
  logger.log('Message received:', {
    id: message.id,
    type: message.type,
    channel: message.channel,
    timestamp: message.timestamp,
    payloadSize: JSON.stringify(message.payload).length
  });
};

// Security helpers
export const sanitizeMessage = (message: WebSocketMessage): WebSocketMessage => {
  // Remove potentially sensitive data from payload
  const sanitizedPayload = { ...message.payload };
  
  // Remove common sensitive fields
  delete sanitizedPayload.password;
  delete sanitizedPayload.token;
  delete sanitizedPayload.secret;
  delete sanitizedPayload.privateKey;
  
  return {
    ...message,
    payload: sanitizedPayload
  };
};

export const validateMessageOrigin = (message: WebSocketMessage, allowedOrigins: string[]): boolean => {
  // This would typically be handled by the WebSocket server
  // Client-side validation for additional security
  return message.id && message.timestamp > 0;
};
