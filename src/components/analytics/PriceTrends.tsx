import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { PriceTrendsProps, TimeInterval, MarketDataPoint } from '@/types/analytics';
import { formatNumber, formatPercentage } from '@/utils/analyticsCalculations';
import { Button } from '@/components/ui/Button';

const timeRanges: { value: TimeInterval; label: string }[] = [
  { value: '1m', label: '1 Min' },
  { value: '5m', label: '5 Mins' },
  { value: '15m', label: '15 Mins' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' },
  { value: '1M', label: '1 Month' },
];

export const PriceTrends: React.FC<PriceTrendsProps> = ({
  data,
  historicalData,
  isLoading = false,
  error = null,
  className = '',
  timeRange = '1h',
  onTimeRangeChange,
  showTechnicalIndicators = true,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [showPredictions, setShowPredictions] = useState(false);

  const getTrendIcon = (trend: 'bullish' | 'bearish' | 'sideways') => {
    switch (trend) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'sideways':
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'bullish' | 'bearish' | 'sideways') => {
    switch (trend) {
      case 'bullish':
        return 'text-green-600';
      case 'bearish':
        return 'text-red-600';
      case 'sideways':
        return 'text-gray-600';
    }
  };

  const getTrendBg = (trend: 'bullish' | 'bearish' | 'sideways') => {
    switch (trend) {
      case 'bullish':
        return 'bg-green-50';
      case 'bearish':
        return 'bg-red-50';
      case 'sideways':
        return 'bg-gray-50';
    }
  };

  // Prepare chart data
  const chartData = historicalData.map((point, index) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      ...(timeRange === '1d' || timeRange === '1w' || timeRange === '1M' ? { day: 'numeric', month: 'short' } : {})
    }),
    price: point.price,
    high: point.high,
    low: point.low,
    volume: point.volume,
    sma20: data.technicalIndicators.sma[0] || point.price,
    sma50: data.technicalIndicators.sma[1] || point.price,
    ema12: data.technicalIndicators.ema[0] || point.price,
    ema26: data.technicalIndicators.ema[1] || point.price,
    bollingerUpper: data.technicalIndicators.bollingerBands.upper || point.price,
    bollingerLower: data.technicalIndicators.bollingerBands.lower || point.price,
  }));

  // Add prediction data if enabled
  if (showPredictions && data.pricePredictions) {
    const lastPoint = chartData[chartData.length - 1];
    const predictionPoints = [
      {
        time: 'Short-term',
        price: data.pricePredictions.shortTerm,
        isPrediction: true,
        confidence: data.pricePredictions.confidence,
      },
      {
        time: 'Medium-term',
        price: data.pricePredictions.mediumTerm,
        isPrediction: true,
        confidence: data.pricePredictions.confidence * 0.8,
      },
      {
        time: 'Long-term',
        price: data.pricePredictions.longTerm,
        isPrediction: true,
        confidence: data.pricePredictions.confidence * 0.6,
      },
    ];
    
    chartData.push(...predictionPoints);
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${formatNumber(entry.value)}
            </p>
          ))}
          {data.volume && (
            <p className="text-sm text-gray-600">
              Volume: {formatNumber(data.volume)}
            </p>
          )}
          {data.isPrediction && (
            <p className="text-xs text-blue-600 mt-1">
              Prediction (Confidence: {formatPercentage(data.confidence * 100)})
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Error Loading Price Data</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading price trends...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-gray-500">
          <Info className="w-5 h-5" />
          <p>No price data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Price Trends</h2>
            <p className="text-sm text-gray-500">Price movements and technical indicators</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={chartType === 'area' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('area')}
              className="px-3 py-1 text-xs"
            >
              Area
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('line')}
              className="px-3 py-1 text-xs"
            >
              Line
            </Button>
          </div>
          
          {/* Time Range Selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange?.(e.target.value as TimeInterval)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Price Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Current Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Current Price</span>
              {getTrendIcon(data.trendDirection)}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                ${formatNumber(data.currentPrice)}
              </p>
              <p className={`text-xs font-medium ${getTrendColor(data.trendDirection)}`}>
                {formatPercentage(data.priceChangePercent)}
              </p>
            </div>
          </motion.div>

          {/* Price Change */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${getTrendBg(data.trendDirection)} rounded-lg p-4 border`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">24h Change</span>
              {getTrendIcon(data.trendDirection)}
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${getTrendColor(data.trendDirection)}`}>
                {data.priceChange > 0 ? '+' : ''}{formatNumber(data.priceChange)}
              </p>
              <p className="text-xs text-gray-500">
                USD change
              </p>
            </div>
          </motion.div>

          {/* Trend Direction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Trend</span>
              {getTrendIcon(data.trendDirection)}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {data.trendDirection}
              </p>
              <p className="text-xs text-gray-500">
                Market direction
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
              <span className="text-sm font-medium text-gray-600">RSI</span>
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.technicalIndicators.rsi)}
              </p>
              <p className="text-xs text-gray-500">
                {data.technicalIndicators.rsi > 70 ? 'Overbought' : 
                 data.technicalIndicators.rsi < 30 ? 'Oversold' : 'Neutral'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Price Chart */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Price Chart</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPredictions(!showPredictions)}
                className="p-2"
              >
                {showPredictions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              {showTechnicalIndicators && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="p-2"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `$${formatNumber(value)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  {/* Main price line */}
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Price"
                  />
                  
                  {/* Technical indicators */}
                  {showTechnicalIndicators && (
                    <>
                      <ReferenceLine
                        y={data.technicalIndicators.sma[0]}
                        stroke="#3b82f6"
                        strokeDasharray="5 5"
                        label="SMA 20"
                      />
                      <ReferenceLine
                        y={data.technicalIndicators.sma[1]}
                        stroke="#8b5cf6"
                        strokeDasharray="5 5"
                        label="SMA 50"
                      />
                    </>
                  )}
                </AreaChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `$${formatNumber(value)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  {/* Main price line */}
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name="Price"
                  />
                  
                  {/* Technical indicators */}
                  {showTechnicalIndicators && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="sma20"
                        stroke="#3b82f6"
                        strokeWidth={1}
                        dot={false}
                        strokeDasharray="5 5"
                        name="SMA 20"
                      />
                      <Line
                        type="monotone"
                        dataKey="sma50"
                        stroke="#8b5cf6"
                        strokeWidth={1}
                        dot={false}
                        strokeDasharray="5 5"
                        name="SMA 50"
                      />
                    </>
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technical Indicators */}
        <AnimatePresence>
          {showTechnicalDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 pt-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Indicators</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* RSI */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">RSI (14)</h4>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatNumber(data.technicalIndicators.rsi)}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    {data.technicalIndicators.rsi > 70 ? 'Overbought' : 
                     data.technicalIndicators.rsi < 30 ? 'Oversold' : 'Neutral'}
                  </p>
                </div>

                {/* MACD */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">MACD</h4>
                  <p className="text-lg font-bold text-blue-900">
                    {formatNumber(data.technicalIndicators.macd.macd)}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Signal: {formatNumber(data.technicalIndicators.macd.signal)}
                  </p>
                </div>

                {/* Bollinger Bands */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Bollinger Bands</h4>
                  <p className="text-sm font-bold text-green-900">
                    Upper: ${formatNumber(data.technicalIndicators.bollingerBands.upper)}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Lower: ${formatNumber(data.technicalIndicators.bollingerBands.lower)}
                  </p>
                </div>

                {/* EMAs */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h4 className="text-sm font-medium text-orange-900 mb-2">EMAs</h4>
                  <p className="text-sm font-bold text-orange-900">
                    EMA 12: ${formatNumber(data.technicalIndicators.ema[0])}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    EMA 26: ${formatNumber(data.technicalIndicators.ema[1])}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Support & Resistance Levels */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Support & Resistance Levels</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Support Levels */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="text-sm font-medium text-green-900 mb-3">Support Levels</h4>
              <div className="space-y-2">
                {data.supportLevels.length > 0 ? (
                  data.supportLevels.map((level, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-green-800">Level {index + 1}</span>
                      <span className="text-sm font-bold text-green-900">
                        ${formatNumber(level)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-green-700">No support levels identified</p>
                )}
              </div>
            </div>

            {/* Resistance Levels */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="text-sm font-medium text-red-900 mb-3">Resistance Levels</h4>
              <div className="space-y-2">
                {data.resistanceLevels.length > 0 ? (
                  data.resistanceLevels.map((level, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-red-800">Level {index + 1}</span>
                      <span className="text-sm font-bold text-red-900">
                        ${formatNumber(level)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-red-700">No resistance levels identified</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTrends;
