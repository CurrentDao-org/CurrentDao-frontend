import { DecodedEvent } from './eventDecoder';
import { createEventDecoder } from './eventDecoder';

export interface WebSocketMessage {
  type: 'event' | 'transaction' | 'error' | 'connected' | 'disconnected';
  data?: any;
  error?: string;
}

export interface EventSubscription {
  id: string;
  type: 'account' | 'contract' | 'all';
  address?: string;
  filters?: {
    eventType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
  callback: (event: DecodedEvent) => void;
  onError?: (error: string) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventDecoder = createEventDecoder();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private network: 'mainnet' | 'testnet';

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network;
  }

  /**
   * Connect to WebSocket stream
   */
  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      const wsUrl = this.getWebSocketUrl();
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifySubscriptions('connected');
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.notifySubscriptions('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.notifySubscriptions('error', 'WebSocket connection error');
      };

    } catch (error) {
      this.isConnecting = false;
      throw new Error(`Failed to connect WebSocket: ${error}`);
    }
  }

  /**
   * Disconnect from WebSocket stream
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }

  /**
   * Subscribe to events for an account
   */
  subscribeToAccount(
    accountAddress: string,
    callback: (event: DecodedEvent) => void,
    filters?: EventSubscription['filters'],
    onError?: (error: string) => void
  ): string {
    const subscriptionId = `account_${accountAddress}_${Date.now()}`;
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      type: 'account',
      address: accountAddress,
      filters,
      callback,
      onError
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Send subscription message to server
    this.sendSubscriptionMessage(subscription);

    return subscriptionId;
  }

  /**
   * Subscribe to events for a contract
   */
  subscribeToContract(
    contractAddress: string,
    callback: (event: DecodedEvent) => void,
    filters?: EventSubscription['filters'],
    onError?: (error: string) => void
  ): string {
    const subscriptionId = `contract_${contractAddress}_${Date.now()}`;
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      type: 'contract',
      address: contractAddress,
      filters,
      callback,
      onError
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Send subscription message to server
    this.sendSubscriptionMessage(subscription);

    return subscriptionId;
  }

  /**
   * Subscribe to all events
   */
  subscribeToAll(
    callback: (event: DecodedEvent) => void,
    filters?: EventSubscription['filters'],
    onError?: (error: string) => void
  ): string {
    const subscriptionId = `all_${Date.now()}`;
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      type: 'all',
      filters,
      callback,
      onError
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Send subscription message to server
    this.sendSubscriptionMessage(subscription);

    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);

    // Send unsubscribe message to server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        subscriptionId
      }));
    }
  }

  /**
   * Get WebSocket URL for the network
   */
  private getWebSocketUrl(): string {
    // For Stellar, we would use Horizon's streaming API
    // This is a placeholder implementation
    if (this.network === 'mainnet') {
      return 'wss://horizon.stellar.org/websocket';
    } else {
      return 'wss://horizon-testnet.stellar.org/websocket';
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private async handleMessage(data: string): Promise<void> {
    try {
      const message: WebSocketMessage = JSON.parse(data);

      switch (message.type) {
        case 'event':
          if (message.data) {
            await this.handleEventMessage(message.data);
          }
          break;
        
        case 'transaction':
          if (message.data) {
            await this.handleTransactionMessage(message.data);
          }
          break;
        
        case 'error':
          console.error('WebSocket error message:', message.error);
          this.notifySubscriptions('error', message.error);
          break;
        
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to handle WebSocket message:', error);
    }
  }

  /**
   * Handle event message
   */
  private async handleEventMessage(eventData: any): Promise<void> {
    try {
      // Decode the event
      const decodedEvents = await this.eventDecoder.decodeTransactionEvents(eventData.transaction_hash);
      
      for (const event of decodedEvents) {
        this.notifySubscriptionsOfEvent(event);
      }
    } catch (error) {
      console.error('Failed to handle event message:', error);
    }
  }

  /**
   * Handle transaction message
   */
  private async handleTransactionMessage(transactionData: any): Promise<void> {
    try {
      // Decode events from the transaction
      const decodedEvents = await this.eventDecoder.decodeTransactionEvents(transactionData.hash);
      
      for (const event of decodedEvents) {
        this.notifySubscriptionsOfEvent(event);
      }
    } catch (error) {
      console.error('Failed to handle transaction message:', error);
    }
  }

  /**
   * Notify subscriptions of an event
   */
  private notifySubscriptionsOfEvent(event: DecodedEvent): void {
    const subscriptions = Array.from(this.subscriptions.values());
    for (const subscription of subscriptions) {
      if (this.eventMatchesSubscription(event, subscription)) {
        try {
          subscription.callback(event);
        } catch (error) {
          console.error('Error in subscription callback:', error);
          if (subscription.onError) {
            subscription.onError('Callback error: ' + error);
          }
        }
      }
    }
  }

  /**
   * Notify subscriptions of connection status
   */
  private notifySubscriptions(type: WebSocketMessage['type'], error?: string): void {
    const subscriptions = Array.from(this.subscriptions.values());
    for (const subscription of subscriptions) {
      if (subscription.onError && type === 'error') {
        subscription.onError(error || 'Unknown error');
      }
    }
  }

  /**
   * Check if event matches subscription criteria
   */
  private eventMatchesSubscription(event: DecodedEvent, subscription: EventSubscription): boolean {
    // Check subscription type
    if (subscription.type === 'account' && subscription.address) {
      if (event.sourceAccount !== subscription.address) {
        return false;
      }
    }
    
    if (subscription.type === 'contract' && subscription.address) {
      if (event.contractAddress !== subscription.address) {
        return false;
      }
    }

    // Check filters
    if (subscription.filters) {
      if (subscription.filters.eventType && event.type !== subscription.filters.eventType) {
        return false;
      }
      
      if (subscription.filters.dateFrom && new Date(event.timestamp) < subscription.filters.dateFrom) {
        return false;
      }
      
      if (subscription.filters.dateTo && new Date(event.timestamp) > subscription.filters.dateTo) {
        return false;
      }
    }

    return true;
  }

  /**
   * Send subscription message to server
   */
  private sendSubscriptionMessage(subscription: EventSubscription): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      type: 'subscribe',
      subscription: {
        id: subscription.id,
        type: subscription.type,
        address: subscription.address,
        filters: subscription.filters
      }
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnect failed:', error);
      });
    }, delay);
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values());
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

// Hook for React components
export const useWebSocketService = () => {
  return webSocketService;
};
