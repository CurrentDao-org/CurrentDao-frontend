'use client';

import React from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { WebSocketConnectionStatus } from '../../types/websocket';

interface ConnectionStatusProps {
  showDetails?: boolean;
  showReconnectButton?: boolean;
  compact?: boolean;
  className?: string;
}

export function ConnectionStatus({
  showDetails = false,
  showReconnectButton = true,
  compact = false,
  className = ''
}: ConnectionStatusProps) {
  const { connection, stats, reconnect, isConnected, isReconnecting } = useWebSocket();

  const getStatusIcon = () => {
    switch (connection.status) {
      case WebSocketConnectionStatus.CONNECTED:
        return '🟢';
      case WebSocketConnectionStatus.CONNECTING:
      case WebSocketConnectionStatus.RECONNECTING:
        return '🔄';
      case WebSocketConnectionStatus.DISCONNECTED:
        return '🔴';
      case WebSocketConnectionStatus.ERROR:
        return '❌';
      default:
        return '🔴';
    }
  };

  const getStatusText = () => {
    switch (connection.status) {
      case WebSocketConnectionStatus.CONNECTED:
        return 'Connected';
      case WebSocketConnectionStatus.CONNECTING:
        return 'Connecting...';
      case WebSocketConnectionStatus.RECONNECTING:
        return `Reconnecting... (${connection.reconnectAttempts})`;
      case WebSocketConnectionStatus.DISCONNECTED:
        return 'Disconnected';
      case WebSocketConnectionStatus.ERROR:
        return connection.error || 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span>{getStatusIcon()}</span>
        <span className="text-xs font-medium">
          {getStatusText()}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <h3 className="font-semibold">{getStatusText()}</h3>
            {showDetails && (
              <div className="text-sm text-gray-600 mt-1 space-y-1">
                <div>Messages Sent: {stats.messagesSent}</div>
                <div>Messages Received: {stats.messagesReceived}</div>
                {connection.lastConnected && (
                  <div>Uptime: {formatUptime(Date.now() - connection.lastConnected)}</div>
                )}
                {stats.averageLatency > 0 && (
                  <div>Avg Latency: {Math.round(stats.averageLatency)}ms</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {showReconnectButton && !isConnected && (
          <button
            onClick={reconnect}
            disabled={isReconnecting}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
          </button>
        )}
      </div>

      {connection.status === WebSocketConnectionStatus.ERROR && connection.error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
          Error: {connection.error}
        </div>
      )}
    </div>
  );
}

// Mini connection indicator for headers/footers
export function ConnectionIndicator() {
  const { isConnected, isReconnecting } = useWebSocket();

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : isReconnecting ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
        }`}
      />
      <span className="text-xs text-gray-600">
        {isConnected ? 'Live' : isReconnecting ? 'Reconnecting...' : 'Offline'}
      </span>
    </div>
  );
}

// Connection status badge
export function ConnectionBadge() {
  const { connection } = useWebSocket();

  const getBadgeColor = () => {
    switch (connection.status) {
      case WebSocketConnectionStatus.CONNECTED:
        return 'bg-green-100 text-green-800';
      case WebSocketConnectionStatus.CONNECTING:
      case WebSocketConnectionStatus.RECONNECTING:
        return 'bg-yellow-100 text-yellow-800';
      case WebSocketConnectionStatus.DISCONNECTED:
        return 'bg-gray-100 text-gray-800';
      case WebSocketConnectionStatus.ERROR:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor()}`}>
      {connection.status === WebSocketConnectionStatus.CONNECTED && (
        <>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
          Connected
        </>
      )}
      {connection.status === WebSocketConnectionStatus.CONNECTING && 'Connecting...'}
      {connection.status === WebSocketConnectionStatus.RECONNECTING && 'Reconnecting...'}
      {connection.status === WebSocketConnectionStatus.DISCONNECTED && 'Disconnected'}
      {connection.status === WebSocketConnectionStatus.ERROR && 'Error'}
    </span>
  );
}
