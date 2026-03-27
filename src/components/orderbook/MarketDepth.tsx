import React, { useMemo } from 'react';
import { useMarketDepth } from '@/hooks/useMarketDepth';
import { useOrderBook } from '@/hooks/useOrderBook';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUpIcon, TrendingDownIcon, BarChart3Icon } from 'lucide-react';

interface MarketDepthProps {
  symbol?: string;
  chartType?: 'depth' | 'cumulative' | 'liquidity';
  showMetrics?: boolean;
  className?: string;
}

export function MarketDepth({ 
  symbol = 'BTC/USD',
  chartType = 'depth',
  showMetrics = true,
  className = ''
}: MarketDepthProps) {
  const { orderBook } = useOrderBook({ symbol });
  
  const {
    marketDepth,
    liquidityMetrics,
    supportResistanceLevels,
    isLoading,
    predictPriceMovement
  } = useMarketDepth({
    orderBook,
    maxPricePoints: 50
  });

  const chartData = useMemo(() => {
    if (!marketDepth.length) return [];

    return marketDepth.map(point => ({
      price: point.price,
      buyDepth: point.buyDepth,
      sellDepth: point.sellDepth,
      cumulativeBuy: point.cumulativeBuyVolume,
      cumulativeSell: point.cumulativeSellVolume,
      totalDepth: point.buyDepth + point.sellDepth,
      netDepth: point.buyDepth - point.sellDepth
    }));
  }, [marketDepth]);

  const liquidityData = useMemo(() => {
    if (!chartData.length) return [];

    return chartData.map((point, index) => ({
      price: point.price,
      buyLiquidity: point.cumulativeBuy,
      sellLiquidity: point.cumulativeSell,
      totalLiquidity: point.cumulativeBuy + point.cumulativeSell,
      imbalance: point.netDepth
    }));
  }, [chartData]);

  const formatPrice = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(2);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
          <p className="text-white font-medium">{`Price: ${formatPrice(label)}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatVolume(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderDepthChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="price" 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
          tickFormatter={formatPrice}
        />
        <YAxis 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          tickFormatter={formatVolume}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="buyDepth" fill="#10B981" name="Buy Depth" />
        <Bar dataKey="sellDepth" fill="#EF4444" name="Sell Depth" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderCumulativeChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="price" 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
          tickFormatter={formatPrice}
        />
        <YAxis 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          tickFormatter={formatVolume}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="cumulativeBuy" 
          stackId="1"
          stroke="#10B981" 
          fill="#10B981" 
          fillOpacity={0.6}
          name="Cumulative Buy"
        />
        <Area 
          type="monotone" 
          dataKey="cumulativeSell" 
          stackId="2"
          stroke="#EF4444" 
          fill="#EF4444" 
          fillOpacity={0.6}
          name="Cumulative Sell"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderLiquidityChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={liquidityData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="price" 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
          tickFormatter={formatPrice}
        />
        <YAxis 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          tickFormatter={formatVolume}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="totalLiquidity" 
          stroke="#3B82F6" 
          fill="#3B82F6" 
          fillOpacity={0.3}
          name="Total Liquidity"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const prediction = predictPriceMovement();
  const predictionColor = prediction === 'bullish' ? 'text-green-400' : 
                         prediction === 'bearish' ? 'text-red-400' : 'text-yellow-400';
  const PredictionIcon = prediction === 'bullish' ? TrendingUpIcon : 
                         prediction === 'bearish' ? TrendingDownIcon : BarChart3Icon;

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
            <h2 className="text-xl font-bold text-white">Market Depth</h2>
            <span className="text-gray-400">{symbol}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${predictionColor}`}>
              <PredictionIcon className="w-4 h-4" />
              <span className="text-sm capitalize">{prediction}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => chartType = 'depth'}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'depth' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Depth
          </button>
          <button
            onClick={() => chartType = 'cumulative'}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'cumulative' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Cumulative
          </button>
          <button
            onClick={() => chartType = 'liquidity'}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'liquidity' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Liquidity
          </button>
        </div>

        {chartType === 'depth' && renderDepthChart()}
        {chartType === 'cumulative' && renderCumulativeChart()}
        {chartType === 'liquidity' && renderLiquidityChart()}
      </div>

      {showMetrics && liquidityMetrics && (
        <div className="bg-gray-900 p-4 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-xs">Total Volume</p>
              <p className="text-white font-medium">{formatVolume(liquidityMetrics.totalVolume)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Buy Side</p>
              <p className="text-green-400 font-medium">{liquidityMetrics.buySideLiquidity.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Sell Side</p>
              <p className="text-red-400 font-medium">{liquidityMetrics.sellSideLiquidity.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Imbalance</p>
              <p className={`font-medium ${
                liquidityMetrics.imbalance > 20 ? 'text-red-400' : 
                liquidityMetrics.imbalance > 10 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {liquidityMetrics.imbalance.toFixed(1)}%
              </p>
            </div>
          </div>

          {supportResistanceLevels && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-2">Support Levels</p>
                  <div className="space-y-1">
                    {supportResistanceLevels.support.slice(0, 3).map((level, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-green-400">{formatPrice(level.price)}</span>
                        <span className="text-gray-400">{formatVolume(level.totalVolume)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-2">Resistance Levels</p>
                  <div className="space-y-1">
                    {supportResistanceLevels.resistance.slice(0, 3).map((level, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-red-400">{formatPrice(level.price)}</span>
                        <span className="text-gray-400">{formatVolume(level.totalVolume)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
