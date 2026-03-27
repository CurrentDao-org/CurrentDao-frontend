import React, { useState, useMemo } from 'react';
import { useMarketDepth } from '@/hooks/useMarketDepth';
import { useOrderBook } from '@/hooks/useOrderBook';
import { OrderFlowIndicator } from '@/types/orderbook';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUpIcon, TrendingDownIcon, ActivityIcon, ZapIcon, AlertTriangleIcon } from 'lucide-react';

interface OrderFlowProps {
  symbol?: string;
  timeWindow?: number;
  showChart?: boolean;
  showIndicators?: boolean;
  className?: string;
}

export function OrderFlow({ 
  symbol = 'BTC/USD',
  timeWindow = 300000, // 5 minutes
  showChart = true,
  showIndicators = true,
  className = ''
}: OrderFlowProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '5m' | '15m' | '1h'>('5m');
  const [flowType, setFlowType] = useState<'pressure' | 'volume' | 'intensity'>('pressure');

  const { orderBook } = useOrderBook({ symbol });
  
  const {
    orderFlow,
    orderFlowMetrics,
    isLoading
  } = useMarketDepth({
    orderBook,
    maxPricePoints: 100
  });

  const timeWindowMap = {
    '1m': 60000,
    '5m': 300000,
    '15m': 900000,
    '1h': 3600000
  };

  const currentWindow = timeWindowMap[selectedTimeframe];

  const recentFlow = useMemo(() => {
    const now = Date.now();
    return orderFlow.filter(flow => now - flow.timestamp <= currentWindow);
  }, [orderFlow, currentWindow]);

  const flowAnalysis = useMemo(() => {
    if (!recentFlow.length) return null;

    const totalBuyPressure = recentFlow.reduce((sum, flow) => sum + flow.buyPressure, 0);
    const totalSellPressure = recentFlow.reduce((sum, flow) => sum + flow.sellPressure, 0);
    const totalNetFlow = recentFlow.reduce((sum, flow) => sum + flow.netFlow, 0);
    const totalVolume = recentFlow.reduce((sum, flow) => sum + flow.volume, 0);
    const totalTrades = recentFlow.reduce((sum, flow) => sum + flow.trades, 0);

    const avgBuyPressure = totalBuyPressure / recentFlow.length;
    const avgSellPressure = totalSellPressure / recentFlow.length;
    const avgNetFlow = totalNetFlow / recentFlow.length;
    const avgVolume = totalVolume / recentFlow.length;
    const avgTrades = totalTrades / recentFlow.length;

    const pressureRatio = avgBuyPressure / (avgSellPressure || 1);
    const flowIntensity = Math.abs(avgNetFlow) / avgVolume * 100;
    const tradeFrequency = totalTrades / (recentFlow.length || 1);

    let trend: 'bullish' | 'bearish' | 'neutral';
    let strength: 'weak' | 'moderate' | 'strong';

    if (avgNetFlow > 1000) {
      trend = 'bullish';
    } else if (avgNetFlow < -1000) {
      trend = 'bearish';
    } else {
      trend = 'neutral';
    }

    if (flowIntensity > 20) {
      strength = 'strong';
    } else if (flowIntensity > 10) {
      strength = 'moderate';
    } else {
      strength = 'weak';
    }

    return {
      trend,
      strength,
      totalBuyPressure,
      totalSellPressure,
      totalNetFlow,
      totalVolume,
      totalTrades,
      avgBuyPressure,
      avgSellPressure,
      avgNetFlow,
      avgVolume,
      avgTrades,
      pressureRatio,
      flowIntensity,
      tradeFrequency
    };
  }, [recentFlow]);

  const chartData = useMemo(() => {
    return recentFlow.map(flow => ({
      timestamp: flow.timestamp,
      time: new Date(flow.timestamp).toLocaleTimeString(),
      buyPressure: flow.buyPressure,
      sellPressure: flow.sellPressure,
      netFlow: flow.netFlow,
      volume: flow.volume,
      trades: flow.trades,
      intensity: Math.abs(flow.netFlow) / flow.volume * 100
    }));
  }, [recentFlow]);

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(2);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-red-400';
      case 'moderate': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return TrendingUpIcon;
      case 'bearish': return TrendingDownIcon;
      default: return ActivityIcon;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
          <p className="text-white font-medium">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatPrice(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderPressureChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          tickFormatter={formatPrice}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="buyPressure" 
          stackId="1"
          stroke="#10B981" 
          fill="#10B981" 
          fillOpacity={0.6}
          name="Buy Pressure"
        />
        <Area 
          type="monotone" 
          dataKey="sellPressure" 
          stackId="2"
          stroke="#EF4444" 
          fill="#EF4444" 
          fillOpacity={0.6}
          name="Sell Pressure"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderVolumeChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          tickFormatter={formatPrice}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="volume" fill="#3B82F6" name="Volume" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderIntensityChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          tickFormatter={(value) => `${value.toFixed(1)}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="intensity" 
          stroke="#F59E0B" 
          strokeWidth={2}
          dot={{ fill: '#F59E0B', r: 4 }}
          name="Flow Intensity"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">Order Flow Analysis</h2>
            <span className="text-gray-400">{symbol}</span>
          </div>
          
          {flowAnalysis && (
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${getTrendColor(flowAnalysis.trend)}`}>
                {React.createElement(getTrendIcon(flowAnalysis.trend), { className: "w-4 h-4" })}
                <span className="text-sm capitalize">{flowAnalysis.trend}</span>
              </div>
              <div className={`flex items-center space-x-2 ${getStrengthColor(flowAnalysis.strength)}`}>
                <ZapIcon className="w-4 h-4" />
                <span className="text-sm capitalize">{flowAnalysis.strength}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 mt-3">
          <div className="flex space-x-2">
            {(['1m', '5m', '15m', '1h'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedTimeframe === timeframe 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFlowType('pressure')}
              className={`px-3 py-1 rounded text-sm ${
                flowType === 'pressure' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Pressure
            </button>
            <button
              onClick={() => setFlowType('volume')}
              className={`px-3 py-1 rounded text-sm ${
                flowType === 'volume' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setFlowType('intensity')}
              className={`px-3 py-1 rounded text-sm ${
                flowType === 'intensity' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Intensity
            </button>
          </div>
        </div>
      </div>

      {showIndicators && flowAnalysis && (
        <div className="p-4 border-b border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-750 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUpIcon className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-400">Buy Pressure</span>
              </div>
              <p className="text-green-400 font-medium">{formatPrice(flowAnalysis.avgBuyPressure)}</p>
            </div>
            <div className="bg-gray-750 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingDownIcon className="w-3 h-3 text-red-400" />
                <span className="text-xs text-gray-400">Sell Pressure</span>
              </div>
              <p className="text-red-400 font-medium">{formatPrice(flowAnalysis.avgSellPressure)}</p>
            </div>
            <div className="bg-gray-750 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <ActivityIcon className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-gray-400">Net Flow</span>
              </div>
              <p className={`font-medium ${flowAnalysis.avgNetFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPrice(flowAnalysis.avgNetFlow)}
              </p>
            </div>
            <div className="bg-gray-750 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <ZapIcon className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-gray-400">Intensity</span>
              </div>
              <p className="text-yellow-400 font-medium">{flowAnalysis.flowIntensity.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-400">Pressure Ratio</p>
              <p className="text-white font-medium">{flowAnalysis.pressureRatio.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Volume</p>
              <p className="text-white font-medium">{formatPrice(flowAnalysis.totalVolume)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Trade Frequency</p>
              <p className="text-white font-medium">{flowAnalysis.tradeFrequency.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {showChart && (
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3 capitalize">
            {flowType} Chart ({selectedTimeframe})
          </h3>
          {flowType === 'pressure' && renderPressureChart()}
          {flowType === 'volume' && renderVolumeChart()}
          {flowType === 'intensity' && renderIntensityChart()}
        </div>
      )}

      <div className="bg-gray-900 p-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>
            Data Points: {recentFlow.length}
          </div>
          <div>
            Time Window: {selectedTimeframe}
          </div>
          <div>
            {flowAnalysis && (
              <>
                Flow: <span className={getTrendColor(flowAnalysis.trend)}>{flowAnalysis.trend}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
