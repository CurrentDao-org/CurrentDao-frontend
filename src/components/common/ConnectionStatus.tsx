import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw, Activity } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useWebSocket';
import { getConnectionStatusText, getConnectionStatusColor } from '@/utils/websocketHelpers';

/**
 * Props for the ConnectionStatus component.
 */
interface ConnectionStatusProps {
  showDetails?: boolean;
  showLatency?: boolean;
  showStats?: boolean;
  compact?: boolean;
  className?: string;
  onReconnect?: () => void;
}

/**
 * Component to display the current WebSocket connection status,
 * including latency and connection quality metrics.
 */
export function ConnectionStatus({
  showDetails = false,
  showLatency = false,
  showStats = false,
  compact = false,
  className = '',
  onReconnect
}: ConnectionStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { connectionState, stats, isHealthy, connectionQuality, reconnect } = useConnectionStatus();

  const statusColor = getConnectionStatusColor(connectionState.status);
  const statusText = getConnectionStatusText(connectionState.status);
  
  const handleReconnect = () => {
    if (onReconnect) {
      onReconnect();
    } else {
      reconnect();
    }
  };

  /**
   * Formats latency in milliseconds or seconds based on the value.
   */
  const formatLatency = (latency?: number) => {
    if (!latency) return '--';
    return latency < 1000 ? `${latency}ms` : `${(latency / 1000).toFixed(1)}s`;
  };

  const formatUptime = (uptime: number) => {
    if (uptime === 0) return '--';
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusIcon = () => {
    switch (connectionState.status) {
      case 'connected':
        return <Wifi className="w-4 h-4" />;
      case 'connecting':
      case 'reconnecting':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          className="flex items-center gap-1"
          style={{ color: statusColor }}
        >
          {getStatusIcon()}
          <span className="text-xs font-medium">{statusText}</span>
        </div>
        {showLatency && connectionState.latency && (
          <span className="text-xs text-gray-500">
            {formatLatency(connectionState.latency)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Main status bar */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-2"
            style={{ color: statusColor }}
          >
            {getStatusIcon()}
            <span className="font-medium">{statusText}</span>
          </div>
          
          {showLatency && connectionState.latency && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Activity className="w-3 h-3" />
              <span>{formatLatency(connectionState.latency)}</span>
            </div>
          )}
          
          <div className={`px-2 py-1 text-xs rounded-full ${
            isHealthy 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {connectionQuality}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connectionState.status === 'error' && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleReconnect();
              }}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              title="Reconnect"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          
          <div className="text-gray-400">
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3 space-y-3">
          {/* Connection details */}
          {showDetails && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Connection Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 font-medium">{statusText}</span>
                </div>
                <div>
                  <span className="text-gray-500">Quality:</span>
                  <span className="ml-2 font-medium">{connectionQuality}</span>
                </div>
                {connectionState.lastConnected && (
                  <div>
                    <span className="text-gray-500">Last Connected:</span>
                    <span className="ml-2">
                      {new Date(connectionState.lastConnected).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {connectionState.lastDisconnected && (
                  <div>
                    <span className="text-gray-500">Last Disconnected:</span>
                    <span className="ml-2">
                      {new Date(connectionState.lastDisconnected).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {connectionState.reconnectAttempts > 0 && (
                  <div>
                    <span className="text-gray-500">Retry Attempts:</span>
                    <span className="ml-2 font-medium">{connectionState.reconnectAttempts}</span>
                  </div>
                )}
                {connectionState.error && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Error:</span>
                    <span className="ml-2 text-red-600 text-xs">{connectionState.error}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          {showStats && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Statistics</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Messages Sent:</span>
                  <span className="ml-2 font-medium">{stats.messagesSent}</span>
                </div>
                <div>
                  <span className="text-gray-500">Messages Received:</span>
                  <span className="ml-2 font-medium">{stats.messagesReceived}</span>
                </div>
                <div>
                  <span className="text-gray-500">Reconnections:</span>
                  <span className="ml-2 font-medium">{stats.reconnections}</span>
                </div>
                <div>
                  <span className="text-gray-500">Uptime:</span>
                  <span className="ml-2 font-medium">{formatUptime(stats.uptime)}</span>
                </div>
                {stats.averageLatency > 0 && (
                  <div>
                    <span className="text-gray-500">Avg Latency:</span>
                    <span className="ml-2 font-medium">{formatLatency(stats.averageLatency)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {connectionState.status === 'disconnected' && (
              <button
                onClick={handleReconnect}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Reconnect
              </button>
            )}
            
            {connectionState.status === 'connected' && (
              <button
                onClick={() => reconnect()}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal connection indicator for navigation bars
export function ConnectionIndicator({
  showLatency = false,
  className = ''
}: {
  showLatency?: boolean;
  className?: string;
}) {
  const { connectionState, isHealthy } = useConnectionStatus();
  const statusColor = getConnectionStatusColor(connectionState.status);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`w-2 h-2 rounded-full ${
          isHealthy ? 'bg-green-500' : 'bg-yellow-500'
        }`}
        style={{ backgroundColor: statusColor }}
      />
      {showLatency && connectionState.latency && (
        <span className="text-xs text-gray-500">
          {connectionState.latency < 1000 
            ? `${connectionState.latency}ms` 
            : `${(connectionState.latency / 1000).toFixed(1)}s`
          }
        </span>
      )}
    </div>
  );
}

// Connection status badge for cards and lists
export function ConnectionBadge({
  status,
  className = ''
}: {
  status: ConnectionState['status'];
  className?: string;
}) {
  const statusColor = getConnectionStatusColor(status);
  const statusText = getConnectionStatusText(status);

  return (
    <div 
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${className}`}
      style={{ 
        backgroundColor: `${statusColor}20`, 
        color: statusColor 
      }}
    >
      <div 
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: statusColor }}
      />
      {statusText}
    </div>
  );
}

// Network quality indicator
export function NetworkQuality({
  latency,
  className = ''
}: {
  latency?: number;
  className?: string;
}) {
  if (!latency) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        <span className="text-xs text-gray-500">Unknown</span>
      </div>
    );
  }

  const getQuality = (lat: number) => {
    if (lat < 50) return { text: 'Excellent', color: 'bg-green-500' };
    if (lat < 100) return { text: 'Good', color: 'bg-blue-500' };
    if (lat < 200) return { text: 'Fair', color: 'bg-yellow-500' };
    if (lat < 500) return { text: 'Poor', color: 'bg-orange-500' };
    return { text: 'Very Poor', color: 'bg-red-500' };
  };

  const quality = getQuality(latency);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${quality.color}`} />
      <span className="text-xs text-gray-600">{quality.text}</span>
      <span className="text-xs text-gray-500">({latency}ms)</span>
    </div>
  );
}
