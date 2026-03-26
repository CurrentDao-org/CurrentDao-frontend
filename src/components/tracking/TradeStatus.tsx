import React, { useState, useEffect } from 'react';
import { Trade, StatusAlert } from '@/types/tracking';
import { useTradeTracking } from '@/hooks/useTradeTracking';
import { formatTimestamp, getRelativeTime, STATUS_CONFIG } from '@/utils/statusHelpers';
import StatusFilter from './StatusFilter';
import ProgressVisualization from './ProgressVisualization';
import StatusTimeline from './StatusTimeline';
import StatusDetails from './StatusDetails';
import { 
  Bell, 
  Download, 
  RefreshCw, 
  Search, 
  Eye, 
  AlertTriangle,
  CheckCircle2,
  X,
  Activity,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';

interface TradeStatusProps {
  userId?: string;
  className?: string;
  showMetrics?: boolean;
  showAlerts?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const TradeStatusComponent: React.FC<TradeStatusProps> = ({
  userId,
  className = '',
  showMetrics = true,
  showAlerts = true,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    trades,
    statusHistory,
    alerts,
    filters,
    loading,
    error,
    lastUpdated,
    addTrade,
    updateTradeStatus,
    cancelTrade,
    updateFilters,
    clearFilters,
    getFilteredTrades,
    getStatusHistory,
    getProgressVisualization,
    markAlertAsRead,
    clearAlerts,
    getMetrics,
    exportTrades,
    refreshData,
    clearError,
  } = useTradeTracking({
    userId,
    autoRefresh,
    refreshInterval,
    enableRealTime: true,
  });

  const filteredTrades = getFilteredTrades();
  const metrics = getMetrics();
  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshData]);

  const handleExport = (format: 'CSV' | 'PDF' | 'JSON') => {
    try {
      const data = exportTrades(format === 'CSV' ? 'CSV' : 'JSON', true);
      const blob = new Blob([data], { 
        type: format === 'CSV' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trade-status-${Date.now()}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleAlertClick = (alert: StatusAlert) => {
    markAlertAsRead(alert.id);
    if (alert.actionUrl) {
      // In a real app, this would navigate to the trade details
      const trade = trades.find(t => t.id === alert.tradeId);
      if (trade) {
        setSelectedTrade(trade);
      }
    }
  };

  const TradeCard: React.FC<{ trade: Trade }> = ({ trade }) => {
    const history = getStatusHistory(trade.id);
    const progress = getProgressVisualization(trade.id);
    const statusConfig = STATUS_CONFIG[trade.status];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {trade.id}
              </h3>
              <span 
                className="px-2 py-1 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: `${statusConfig?.bgColor}20`,
                  color: statusConfig?.color,
                }}
              >
                {statusConfig?.label || trade.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {trade.energyType} • {trade.amount.toLocaleString()} units @ ${trade.price.toFixed(2)}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ${trade.totalValue.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {getRelativeTime(trade.initiatedAt)}
            </div>
          </div>
        </div>

        {progress && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {Math.round((progress.currentStage / progress.totalStages) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.currentStage / progress.totalStages) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Initiated: {formatTimestamp(trade.initiatedAt)}</span>
            {trade.completedAt && (
              <span>Completed: {formatTimestamp(trade.completedAt)}</span>
            )}
          </div>
          
          <button
            onClick={() => setSelectedTrade(trade)}
            className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            <Eye className="w-4 h-4" />
            <span>Details</span>
          </button>
        </div>
      </div>
    );
  };

  if (loading && trades.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading trade status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Trade Status Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time monitoring of energy trade status
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
              showFilter 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Filter</span>
          </button>
          
          <div className="relative">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleExport('CSV')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              title="Export as CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={refreshData}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Metrics Dashboard */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.totalTrades}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {metrics.successRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {metrics.pendingTrades}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${metrics.totalVolume.toFixed(0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilter && (
        <StatusFilter
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          compact={false}
        />
      )}

      {/* Alerts Panel */}
      {showAlerts && unreadAlerts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Recent Alerts ({unreadAlerts.length})
              </h3>
              <button
                onClick={clearAlerts}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {unreadAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    alert.type === 'error' ? 'bg-red-100 dark:bg-red-900' :
                    alert.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    alert.type === 'success' ? 'bg-green-100 dark:bg-green-900' :
                    'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    {alert.type === 'error' ? <X className="w-4 h-4 text-red-600 dark:text-red-400" /> :
                     alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /> :
                     alert.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                     <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {alert.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getRelativeTime(alert.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trades List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Trades ({filteredTrades.length})
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 text-sm rounded-md ${
                view === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1 text-sm rounded-md ${
                view === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        {filteredTrades.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No trades found matching your filters
            </p>
          </div>
        ) : (
          <div className={
            view === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-4'
          }>
            {filteredTrades.map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Last updated: {formatTimestamp(lastUpdated)}
      </div>

      {/* Trade Details Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Trade Details
                </h2>
                <button
                  onClick={() => setSelectedTrade(null)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <StatusDetails 
                trade={selectedTrade} 
                statusHistory={getStatusHistory(selectedTrade.id)}
              />
              
              {getStatusHistory(selectedTrade.id) && (
                <ProgressVisualization 
                  progress={getProgressVisualization(selectedTrade.id)!}
                />
              )}
              
              {getStatusHistory(selectedTrade.id) && (
                <StatusTimeline 
                  statusHistory={getStatusHistory(selectedTrade.id)!}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeStatusComponent;
