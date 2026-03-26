import React, { useState } from 'react';
import { Trade, StatusHistory } from '@/types/tracking';
import { formatTimestamp, formatDuration, STATUS_CONFIG } from '@/utils/statusHelpers';
import { 
  Copy, 
  ExternalLink, 
  Zap, 
  DollarSign, 
  Clock, 
  User, 
  Hash,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Ban
} from 'lucide-react';

interface StatusDetailsProps {
  trade: Trade;
  statusHistory?: StatusHistory;
  className?: string;
  compact?: boolean;
  showActions?: boolean;
}

const StatusDetails: React.FC<StatusDetailsProps> = ({
  trade,
  statusHistory,
  className = '',
  compact = false,
  showActions = true,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'settled':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <Ban className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const CopyableField: React.FC<{
    label: string;
    value: string;
    field: string;
    truncate?: boolean;
    href?: string;
  }> = ({ label, value, field, truncate = false, href }) => {
    const displayValue = truncate && value.length > 20 
      ? `${value.slice(0, 10)}...${value.slice(-8)}` 
      : value;

    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}:
        </span>
        <div className="flex items-center space-x-2">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span className="font-mono">{displayValue}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
              {displayValue}
            </span>
          )}
          <button
            onClick={() => copyToClipboard(value, field)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-3 h-3" />
          </button>
          {copiedField === field && (
            <span className="text-xs text-green-600 dark:text-green-400">Copied!</span>
          )}
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(trade.status)}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {trade.id}
            </h3>
          </div>
          <span 
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: `${STATUS_CONFIG[trade.status]?.bgColor}20`,
              color: STATUS_CONFIG[trade.status]?.color,
            }}
          >
            {STATUS_CONFIG[trade.status]?.label || trade.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Energy:</span>
            <span className="ml-2 font-medium">{trade.energyType}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
            <span className="ml-2 font-medium">{trade.amount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Price:</span>
            <span className="ml-2 font-medium">${trade.price.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total:</span>
            <span className="ml-2 font-medium">${trade.totalValue.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(trade.status)}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Trade Details
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID: {trade.id}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${STATUS_CONFIG[trade.status]?.bgColor}20`,
                color: STATUS_CONFIG[trade.status]?.color,
              }}
            >
              {getStatusIcon(trade.status)}
              <span className="ml-2">{STATUS_CONFIG[trade.status]?.label || trade.status}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Trade Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            Trade Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <CopyableField 
                label="Trade ID" 
                value={trade.id} 
                field="tradeId" 
              />
              <CopyableField 
                label="User ID" 
                value={trade.userId} 
                field="userId" 
              />
              {trade.counterpartyId && (
                <CopyableField 
                  label="Counterparty ID" 
                  value={trade.counterpartyId} 
                  field="counterpartyId" 
                />
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Energy Type:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {trade.energyType}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {trade.amount.toLocaleString()} units
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  ${trade.price.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Value:
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  ${trade.totalValue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timing Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Timing Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Initiated:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {formatTimestamp(trade.initiatedAt)}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Updated:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {formatTimestamp(trade.updatedAt)}
                </span>
              </div>
              
              {trade.completedAt && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Completed:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {formatTimestamp(trade.completedAt)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duration:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDuration(trade.updatedAt - trade.initiatedAt)}
                </span>
              </div>
              
              {trade.completedAt && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Time:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDuration(trade.completedAt - trade.initiatedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blockchain Information */}
        {(trade.blockchainTxHash || trade.gasUsed || trade.gasPrice) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Hash className="w-5 h-5 mr-2 text-blue-600" />
              Blockchain Information
            </h3>
            
            <div className="space-y-1">
              {trade.blockchainTxHash && (
                <CopyableField 
                  label="Transaction Hash" 
                  value={trade.blockchainTxHash} 
                  field="txHash"
                  truncate
                  href={`https://etherscan.io/tx/${trade.blockchainTxHash}`}
                />
              )}
              
              {trade.gasUsed && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gas Used:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {trade.gasUsed.toLocaleString()}
                  </span>
                </div>
              )}
              
              {trade.gasPrice && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gas Price:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {trade.gasPrice.toFixed(2)} Gwei
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Information */}
        {trade.errorMessage && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              Error Information
            </h3>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                {trade.errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Progress Information */}
        {statusHistory && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Progress Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(statusHistory.progress)}%
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  Progress
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {statusHistory.updates.length}
                </div>
                <div className="text-sm text-green-800 dark:text-green-200">
                  Status Updates
                </div>
              </div>
              
              {statusHistory.estimatedCompletion && (
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatDuration(statusHistory.estimatedCompletion - Date.now())}
                  </div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">
                    Est. Completion
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusDetails;
