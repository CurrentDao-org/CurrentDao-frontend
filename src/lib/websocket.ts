import { 
  WebSocketMessage, 
  WebSocketMessageType, 
  WebSocketConfig, 
  ConnectionState, 
  WebSocketConnectionStatus, 
  Subscription, 
  QueuedMessage, 
  WebSocketStats 
} from '../types/websocket';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private connectionState: ConnectionState;
  private subscriptions: Map<string, Subscription> = new Map();
  private messageQueue: QueuedMessage[] = [];
  private stats: WebSocketStats;
  private heartbeatTimer?: number;
  private reconnectTimer?: number;
  private messageHandlers: Map<WebSocketMessageType, Set<(message: WebSocketMessage) => void>> = new Map();
  private connectionStateListeners: Set<(state: ConnectionState) => void> = new Set();

  constructor(config: WebSocketConfig) {
    this.config = {
      protocols: [],
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      messageQueueSize: 1000,
      enableCompression: true,
      timeout: 10000,
      ...config
    };

    this.connectionState = {
      status: WebSocketConnectionStatus.DISCONNECTED,
      reconnectAttempts: 0
    };

    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      connectionUptime: 0,
      averageLatency: 0
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.updateConnectionState(WebSocketConnectionStatus.CONNECTING);

      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);
        
        this.ws.onopen = () => {
          this.handleOpen();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          this.handleClose(event);
        };

        this.ws.onerror = (error) => {
          this.handleError(error);
          reject(error);
        };

      } catch (error) {
        this.handleError(error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.clearTimers();
    
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Client disconnect');
      }
      
      this.ws = null;
    }

    this.updateConnectionState(WebSocketConnectionStatus.DISCONNECTED);
  }

  sendMessage(type: WebSocketMessageType, payload: any, channel?: string): void {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type,
      payload,
      timestamp: Date.now(),
      channel
    };

    if (this.isConnected()) {
      this.sendWebSocketMessage(message);
    } else {
      this.queueMessage(message);
    }
  }

  subscribe(channel: string, callback: (message: WebSocketMessage) => void, filters?: Record<string, any>): string {
    const subscription: Subscription = {
      id: this.generateSubscriptionId(),
      channel,
      filters,
      callback,
      active: true,
      createdAt: Date.now()
    };

    this.subscriptions.set(subscription.id, subscription);

    if (this.isConnected()) {
      this.sendMessage(WebSocketMessageType.SUBSCRIBE, { channel, filters }, channel);
    }

    return subscription.id;
  }

  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = false;
      this.subscriptions.delete(subscriptionId);

      if (this.isConnected()) {
        this.sendMessage(WebSocketMessageType.UNSUBSCRIBE, { channel: subscription.channel }, subscription.channel);
      }
    }
  }

  addMessageHandler(type: WebSocketMessageType, handler: (message: WebSocketMessage) => void): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);
  }

  removeMessageHandler(type: WebSocketMessageType, handler: (message: WebSocketMessage) => void): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(type);
      }
    }
  }

  addConnectionStateListener(listener: (state: ConnectionState) => void): void {
    this.connectionStateListeners.add(listener);
  }

  removeConnectionStateListener(listener: (state: ConnectionState) => void): void {
    this.connectionStateListeners.delete(listener);
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  getStats(): WebSocketStats {
    return { ...this.stats };
  }

  isConnected(): boolean {
    return this.connectionState.status === WebSocketConnectionStatus.CONNECTED;
  }

  isReconnecting(): boolean {
    return this.connectionState.status === WebSocketConnectionStatus.RECONNECTING;
  }

  private handleOpen(): void {
    this.connectionState.lastConnected = Date.now();
    this.connectionState.reconnectAttempts = 0;
    this.updateConnectionState(WebSocketConnectionStatus.CONNECTED);
    
    this.startHeartbeat();
    this.processMessageQueue();
    
    // Resubscribe to all active subscriptions
    this.subscriptions.forEach(subscription => {
      if (subscription.active) {
        this.sendMessage(WebSocketMessageType.SUBSCRIBE, { 
          channel: subscription.channel, 
          filters: subscription.filters 
        }, subscription.channel);
      }
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.stats.messagesReceived++;

      // Handle ping/pong for connection health
      if (message.type === WebSocketMessageType.PING) {
        this.sendMessage(WebSocketMessageType.PONG, { timestamp: Date.now() });
        this.stats.lastPingTime = Date.now();
        return;
      }

      if (message.type === WebSocketMessageType.PONG) {
        this.stats.lastPongTime = Date.now();
        this.updateLatency();
        return;
      }

      // Route message to subscribers
      this.subscriptions.forEach(subscription => {
        if (subscription.active && this.shouldDeliverMessage(message, subscription)) {
          subscription.callback(message);
        }
      });

      // Route to global handlers
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => handler(message));
      }

    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    this.clearTimers();
    this.updateConnectionState(WebSocketConnectionStatus.DISCONNECTED);
    this.connectionState.lastDisconnected = Date.now();

    if (event.code !== 1000 && this.connectionState.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: any): void {
    this.connectionState.error = error.message || 'Unknown WebSocket error';
    this.updateConnectionState(WebSocketConnectionStatus.ERROR);
  }

  private sendWebSocketMessage(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      this.stats.messagesSent++;
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    if (this.messageQueue.length >= this.config.messageQueueSize) {
      this.messageQueue.shift(); // Remove oldest message
    }

    this.messageQueue.push({
      message,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3
    });
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const queuedMessage = this.messageQueue.shift()!;
      this.sendWebSocketMessage(queuedMessage.message);
    }
  }

  private scheduleReconnect(): void {
    this.updateConnectionState(WebSocketConnectionStatus.RECONNECTING);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.connectionState.reconnectAttempts++;
      this.connect().catch(() => {
        // Connection failed, will try again
      });
    }, this.config.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage(WebSocketMessageType.PING, { timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  private clearTimers(): void {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private updateConnectionState(status: WebSocketConnectionStatus): void {
    this.connectionState.status = status;
    this.notifyConnectionStateListeners();
  }

  private notifyConnectionStateListeners(): void {
    this.connectionStateListeners.forEach(listener => {
      listener({ ...this.connectionState });
    });
  }

  private shouldDeliverMessage(message: WebSocketMessage, subscription: Subscription): boolean {
    if (message.channel !== subscription.channel) {
      return false;
    }

    if (subscription.filters) {
      return this.matchesFilters(message.payload, subscription.filters);
    }

    return true;
  }

  private matchesFilters(payload: any, filters: Record<string, any>): boolean {
    return Object.entries(filters).every(([key, value]) => {
      return payload[key] === value;
    });
  }

  private updateLatency(): void {
    if (this.stats.lastPingTime && this.stats.lastPongTime) {
      const latency = this.stats.lastPongTime - this.stats.lastPingTime;
      this.stats.averageLatency = (this.stats.averageLatency + latency) / 2;
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
