import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  BarChart3, 
  Zap,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';
import { MarketOverviewProps } from '@/types/analytics';
import { formatNumber, formatPercentage } from '@/utils/analyticsCalculations';
import { Button } from '@/components/ui/Button';

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  metrics,
  isLoading = false,
  error = null,
  className = '',
  refreshInterval = 5,
  onRefresh,
}) => {
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVolatilityLevel = (volatility: number) => {
    if (volatility < 0.1) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50' };
    if (volatility < 0.2) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (volatility < 0.3) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'Extreme', color: 'text-red-600', bg: 'bg-red-50' };
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Error Loading Market Data</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !metrics) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading market overview...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-gray-500">
          <Info className="w-5 h-5" />
          <p>No market data available</p>
        </div>
      </div>
    );
  }

  const volatilityLevel = getVolatilityLevel(metrics.volatility);

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Market Overview</h2>
            <p className="text-sm text-gray-500">
              Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Auto-refresh: {refreshInterval}s
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Volume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total Volume</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.totalVolume)}
              </p>
              <p className="text-xs text-gray-500">
                WATT tokens traded
              </p>
            </div>
          </motion.div>

          {/* Average Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Average Price</span>
              </div>
              {getTrendIcon(metrics.priceChange)}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                ${formatNumber(metrics.averagePrice)}
              </p>
              <p className={`text-xs font-medium ${getTrendColor(metrics.priceChange)}`}>
                {formatPercentage(metrics.priceChange)}
              </p>
            </div>
          </motion.div>

          {/* Market Cap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Market Cap</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                ${formatNumber(metrics.marketCap)}
              </p>
              <p className="text-xs text-gray-500">
                Total market value
              </p>
            </div>
          </motion.div>

          {/* Volatility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Volatility</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(metrics.volatility * 100)}
              </p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${volatilityLevel.bg} ${volatilityLevel.color}`}>
                {volatilityLevel.level}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Additional Metrics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Value */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">Total Trading Value</h3>
                <p className="text-3xl font-bold text-blue-900">
                  ${formatNumber(metrics.totalValue)}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  24h trading volume
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          {/* Liquidity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-900 mb-1">Liquidity Score</h3>
                <p className="text-3xl font-bold text-green-900">
                  {formatNumber(metrics.liquidity, 1)}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Market liquidity index
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Market Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                metrics.priceChange > 0 ? 'bg-green-500' : 
                metrics.priceChange < 0 ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                Market Status: {metrics.priceChange > 0 ? 'Bullish' : metrics.priceChange < 0 ? 'Bearish' : 'Neutral'}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Volatility: {volatilityLevel.level}</span>
              <span>•</span>
              <span>Liquidity: {metrics.liquidity > 1 ? 'High' : metrics.liquidity > 0.5 ? 'Medium' : 'Low'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MarketOverview;
