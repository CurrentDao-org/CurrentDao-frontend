export interface WebSocketMessage {
  id: string;
  type: WebSocketMessageType;
  payload: any;
  timestamp: number;
  channel?: string;
}

export enum WebSocketMessageType {
  // Trading messages
  TRADE_UPDATE = 'trade_update',
  ORDER_UPDATE = 'order_update',
  PRICE_UPDATE = 'price_update',
  MARKET_DATA = 'market_data',
  
  // Governance messages
  PROPOSAL_UPDATE = 'proposal_update',
  VOTE_UPDATE = 'vote_update',
  GOVERNANCE_EVENT = 'governance_event',
  
  // Notification messages
  NOTIFICATION = 'notification',
  ALERT = 'alert',
  SYSTEM_MESSAGE = 'system_message',
  
  // Collaboration messages
  COLLABORATION_EVENT = 'collaboration_event',
  USER_STATUS = 'user_status',
  CHAT_MESSAGE = 'chat_message',
  
  // System messages
  CONNECTION_STATUS = 'connection_status',
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe'
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  messageQueueSize?: number;
  enableCompression?: boolean;
  timeout?: number;
}

export interface ConnectionState {
  status: WebSocketConnectionStatus;
  lastConnected?: number;
  lastDisconnected?: number;
  reconnectAttempts: number;
  error?: string;
}

export enum WebSocketConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export interface Subscription {
  id: string;
  channel: string;
  filters?: Record<string, any>;
  callback: (message: WebSocketMessage) => void;
  active: boolean;
  createdAt: number;
}

export interface QueuedMessage {
  message: WebSocketMessage;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export interface WebSocketStats {
  messagesReceived: number;
  messagesSent: number;
  connectionUptime: number;
  averageLatency: number;
  lastPingTime?: number;
  lastPongTime?: number;
}

export interface WebSocketContext {
  connection: ConnectionState;
  stats: WebSocketStats;
  subscribe: (channel: string, callback: (message: WebSocketMessage) => void, filters?: Record<string, any>) => string;
  unsubscribe: (subscriptionId: string) => void;
  sendMessage: (type: WebSocketMessageType, payload: any, channel?: string) => void;
  reconnect: () => void;
  disconnect: () => void;
  isConnected: boolean;
  isReconnecting: boolean;
}

// Trading specific types
export interface TradeUpdate {
  tradeId: string;
  symbol: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface OrderUpdate {
  orderId: string;
  symbol: string;
  type: 'limit' | 'market' | 'stop';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  filledQuantity: number;
  status: 'open' | 'filled' | 'cancelled' | 'rejected';
  timestamp: number;
}

// Governance specific types
export interface ProposalUpdate {
  proposalId: string;
  title: string;
  description: string;
  status: 'active' | 'executed' | 'rejected' | 'expired';
  votesFor: number;
  votesAgainst: number;
  deadline: number;
  timestamp: number;
}

export interface VoteUpdate {
  proposalId: string;
  voter: string;
  vote: 'for' | 'against' | 'abstain';
  weight: number;
  timestamp: number;
}

// Notification specific types
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  actionUrl?: string;
  actionText?: string;
}

// Collaboration specific types
export interface CollaborationEvent {
  eventId: string;
  type: 'document_edit' | 'comment' | 'mention' | 'share';
  userId: string;
  userName: string;
  documentId?: string;
  content: string;
  timestamp: number;
}
