'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { WebSocketManager } from '../lib/websocket';
import { WebSocketContext, WebSocketConfig, ConnectionState, WebSocketStats } from '../types/websocket';

const WebSocketContextValue = createContext<WebSocketContext | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  config: WebSocketConfig;
  autoConnect?: boolean;
}

export function WebSocketProvider({ children, config, autoConnect = true }: WebSocketProviderProps) {
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected' as any,
    reconnectAttempts: 0
  });
  const [stats, setStats] = useState<WebSocketStats>({
    messagesReceived: 0,
    messagesSent: 0,
    connectionUptime: 0,
    averageLatency: 0
  });

  useEffect(() => {
    if (!wsManagerRef.current) {
      wsManagerRef.current = new WebSocketManager(config);
      
      // Add connection state listener
      wsManagerRef.current.addConnectionStateListener((state) => {
        setConnectionState(state);
      });

      // Auto-connect if enabled
      if (autoConnect) {
        wsManagerRef.current.connect().catch(console.error);
      }
    }

    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
        wsManagerRef.current = null;
      }
    };
  }, [config, autoConnect]);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsManagerRef.current) {
        setStats(wsManagerRef.current.getStats());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const subscribe = (channel: string, callback: (message: any) => void, filters?: Record<string, any>) => {
    if (!wsManagerRef.current) {
      console.warn('WebSocket manager not initialized');
      return '';
    }
    return wsManagerRef.current.subscribe(channel, callback, filters);
  };

  const unsubscribe = (subscriptionId: string) => {
    if (wsManagerRef.current) {
      wsManagerRef.current.unsubscribe(subscriptionId);
    }
  };

  const sendMessage = (type: any, payload: any, channel?: string) => {
    if (wsManagerRef.current) {
      wsManagerRef.current.sendMessage(type, payload, channel);
    }
  };

  const reconnect = () => {
    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect();
      wsManagerRef.current.connect().catch(console.error);
    }
  };

  const disconnect = () => {
    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect();
    }
  };

  const contextValue: WebSocketContext = {
    connection: connectionState,
    stats,
    subscribe,
    unsubscribe,
    sendMessage,
    reconnect,
    disconnect,
    isConnected: connectionState.status === 'connected',
    isReconnecting: connectionState.status === 'reconnecting'
  };

  return (
    <WebSocketContextValue.Provider value={contextValue}>
      {children}
    </WebSocketContextValue.Provider>
  );
}

export function useWebSocket(): WebSocketContext {
  const context = useContext(WebSocketContextValue);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

// Hook for specific channel subscriptions
export function useWebSocketSubscription(
  channel: string,
  callback: (message: any) => void,
  filters?: Record<string, any>,
  deps: React.DependencyList = []
) {
  const { subscribe, unsubscribe, isConnected } = useWebSocket();
  const subscriptionIdRef = useRef<string>('');

  useEffect(() => {
    if (isConnected) {
      subscriptionIdRef.current = subscribe(channel, callback, filters);
    }

    return () => {
      if (subscriptionIdRef.current) {
        unsubscribe(subscriptionIdRef.current);
      }
    };
  }, [channel, isConnected, subscribe, unsubscribe, ...deps]);

  return subscriptionIdRef.current;
}
