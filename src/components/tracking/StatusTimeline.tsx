import React, { useState } from 'react';
import { StatusHistory, TradeStatusUpdate } from '@/types/tracking';
import { formatTimestamp, getRelativeTime, STATUS_CONFIG } from '@/utils/statusHelpers';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  User, 
  Bot,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink
} from 'lucide-react';

interface StatusTimelineProps {
  statusHistory: StatusHistory;
  className?: string;
  compact?: boolean;
  showDetails?: boolean;
  maxItems?: number;
}

const StatusTimeline: React.FC<StatusTimelineProps> = ({
  statusHistory,
  className = '',
  compact = false,
  showDetails = true,
  maxItems,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const updates = maxItems && !showAll 
    ? statusHistory.updates.slice(0, maxItems)
    : statusHistory.updates;

  const toggleExpanded = (updateId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(updateId)) {
        newSet.delete(updateId);
      } else {
        newSet.add(updateId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string, isAutomated: boolean) => {
    const iconClass = "w-4 h-4";
    
    if (status === 'failed') {
      return <XCircle className={`${iconClass} text-red-500`} />;
    } else if (status === 'completed' || status === 'settled') {
      return <CheckCircle2 className={`${iconClass} text-green-500`} />;
    } else if (status === 'cancelled') {
      return <AlertCircle className={`${iconClass} text-gray-500`} />;
    } else {
      return <Clock className={`${iconClass} text-blue-500`} />;
    }
  };

  const getStatusColor = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    return config?.color || '#6B7280';
  };

  const getTimelineLineColor = (index: number, total: number) => {
    if (index === total - 1) return 'border-gray-200 dark:border-gray-700';
    
    const update = updates[index];
    const nextUpdate = updates[index + 1];
    
    if (update.status === 'failed' || nextUpdate?.status === 'failed') {
      return 'border-red-200 dark:border-red-800';
    } else if (update.status === 'completed' || update.status === 'settled') {
      return 'border-green-200 dark:border-green-800';
    } else {
      return 'border-blue-200 dark:border-blue-800';
    }
  };

  const formatDetails = (details?: Record<string, any>) => {
    if (!details) return null;

    return (
      <div className="mt-3 space-y-2">
        {Object.entries(details).map(([key, value]) => (
          <div key={key} className="flex items-start space-x-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-0 flex-shrink-0">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
            </span>
            <span className="text-xs text-gray-700 dark:text-gray-300 break-all">
              {typeof value === 'string' && value.startsWith('0x') ? (
                <a 
                  href={`https://etherscan.io/tx/${value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                >
                  <span className="font-mono">{value.slice(0, 10)}...{value.slice(-8)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                String(value)
              )}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {updates.slice(-3).map((update, index) => (
          <div key={update.id} className="flex items-center space-x-3 text-sm">
            {getStatusIcon(update.status, update.isAutomated)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {STATUS_CONFIG[update.status]?.label || update.status}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getRelativeTime(update.timestamp)}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {update.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Status History
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {statusHistory.updates.length} updates
          </span>
          {maxItems && statusHistory.updates.length > maxItems && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm flex items-center space-x-1"
            >
              <span>{showAll ? 'Show Less' : 'Show All'}</span>
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Timeline Items */}
        <div className="space-y-4">
          {updates.map((update, index) => (
            <div key={update.id} className="relative flex items-start space-x-4">
              {/* Timeline Dot */}
              <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white dark:bg-gray-800"
                style={{ 
                  borderColor: getStatusColor(update.status),
                  backgroundColor: update.status === 'failed' ? '#FEE2E2' : 
                                update.status === 'completed' || update.status === 'settled' ? '#D1FAE5' : 
                                '#DBEAFE'
                }}
              >
                {getStatusIcon(update.status, update.isAutomated)}
              </div>

              {/* Content */}
              <div className={`flex-1 min-w-0 pb-4 border-l-2 ${getTimelineLineColor(index, updates.length)}`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 
                        className="font-medium"
                        style={{ color: getStatusColor(update.status) }}
                      >
                        {STATUS_CONFIG[update.status]?.label || update.status}
                      </h4>
                      {update.isAutomated ? (
                        <Bot className="w-4 h-4 text-gray-400" title="Automated update" />
                      ) : (
                        <User className="w-4 h-4 text-blue-500" title="Manual update" />
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getRelativeTime(update.timestamp)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(update.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {update.message}
                  </p>

                  {/* Expandable Details */}
                  {showDetails && (update.details || update.isAutomated) && (
                    <div className="mt-3">
                      <button
                        onClick={() => toggleExpanded(update.id)}
                        className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{expandedItems.has(update.id) ? 'Hide Details' : 'Show Details'}</span>
                        {expandedItems.has(update.id) ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </button>

                      {expandedItems.has(update.id) && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                          {/* Update Metadata */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Update ID:
                              </span>
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                                {update.id}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                User ID:
                              </span>
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                                {update.userId}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Type:
                              </span>
                              <span className="text-xs text-gray-700 dark:text-gray-300">
                                {update.isAutomated ? 'Automated' : 'Manual'}
                              </span>
                            </div>
                          </div>

                          {/* Custom Details */}
                          {formatDetails(update.details)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Status Indicator */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600">
            <Clock className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Current Status
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {STATUS_CONFIG[statusHistory.currentStatus]?.description || statusHistory.currentStatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusTimeline;
