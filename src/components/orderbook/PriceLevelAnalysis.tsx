import React, { useMemo } from 'react';
import { useMarketDepth } from '@/hooks/useMarketDepth';
import { useOrderBook } from '@/hooks/useOrderBook';
import { PriceLevelAnalysis } from '@/types/orderbook';
import { OrderBookCalculations } from '@/utils/orderBookCalculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';
import { TrendingUpIcon, TrendingDownIcon, ActivityIcon, ShieldIcon } from 'lucide-react';

interface PriceLevelAnalysisProps {
  symbol?: string;
  analysisDepth?: number;
  showChart?: boolean;
  showPredictions?: boolean;
  className?: string;
}

export function PriceLevelAnalysis({ 
  symbol = 'BTC/USD',
  analysisDepth = 20,
  showChart = true,
  showPredictions = true,
  className = ''
}: PriceLevelAnalysisProps) {
  const { orderBook } = useOrderBook({ symbol });
  
  const {
    supportResistanceLevels,
    liquidityMetrics,
    predictPriceMovement
  } = useMarketDepth({
    orderBook,
    maxPricePoints: 100
  });

  const priceAnalysis = useMemo(() => {
    if (!orderBook || !orderBook.bids.length || !orderBook.asks.length) {
      return [];
    }

    const currentPrice = (orderBook.bids[0].price + orderBook.asks[0].price) / 2;
    const historicalData = OrderBookCalculations.generateHistoricalData(currentPrice, 0.02, 100);
    
    return OrderBookCalculations.analyzePriceLevels(historicalData, currentPrice);
  }, [orderBook]);

  const volatilityAnalysis = useMemo(() => {
    if (!priceAnalysis.length) return null;

    const prices = priceAnalysis.map(level => level.price);
    const volumes = priceAnalysis.map(level => level.volume);
    
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const priceVariance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
    const volatility = Math.sqrt(priceVariance) / avgPrice * 100;

    const avgVolume = volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length;
    const volumeVariance = volumes.reduce((sum, volume) => sum + Math.pow(volume - avgVolume, 2), 0) / volumes.length;
    const volumeVolatility = Math.sqrt(volumeVariance) / avgVolume * 100;

    return {
      priceVolatility: volatility,
      volumeVolatility,
      avgPrice,
      avgVolume,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    };
  }, [priceAnalysis]);

  const trendAnalysis = useMemo(() => {
    if (!priceAnalysis.length) return null;

    const bullish = priceAnalysis.filter(level => level.trend === 'bullish');
    const bearish = priceAnalysis.filter(level => level.trend === 'bearish');
    const neutral = priceAnalysis.filter(level => level.trend === 'neutral');

    const totalStrength = priceAnalysis.reduce((sum, level) => sum + level.strength, 0);
    const bullishStrength = bullish.reduce((sum, level) => sum + level.strength, 0);
    const bearishStrength = bearish.reduce((sum, level) => sum + level.strength, 0);

    const bullishRatio = (bullishStrength / totalStrength) * 100;
    const bearishRatio = (bearishStrength / totalStrength) * 100;

    return {
      bullish: bullish.length,
      bearish: bearish.length,
      neutral: neutral.length,
      bullishRatio,
      bearishRatio,
      dominantTrend: bullishRatio > bearishRatio ? 'bullish' : bearishRatio > bullishRatio ? 'bearish' : 'neutral'
    };
  }, [priceAnalysis]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toFixed(2);
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return TrendingUpIcon;
      case 'bearish': return TrendingDownIcon;
      default: return ActivityIcon;
    }
  };

  const chartData = useMemo(() => {
    return priceAnalysis.slice(0, analysisDepth).map(level => ({
      price: level.price,
      support: level.support,
      resistance: level.resistance,
      strength: level.strength,
      volume: level.volume,
      trend: level.trend,
      trendScore: level.trend === 'bullish' ? 1 : level.trend === 'bearish' ? -1 : 0
    }));
  }, [priceAnalysis, analysisDepth]);

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

  const prediction = predictPriceMovement();
  const PredictionIcon = getTrendIcon(prediction);

  if (!priceAnalysis.length) {
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
            <h2 className="text-xl font-bold text-white">Price Level Analysis</h2>
            <span className="text-gray-400">{symbol}</span>
          </div>
          
          {showPredictions && (
            <div className={`flex items-center space-x-2 ${getTrendColor(prediction)}`}>
              <PredictionIcon className="w-4 h-4" />
              <span className="text-sm capitalize">{prediction} trend</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-750 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ActivityIcon className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-300">Volatility</h3>
            </div>
            {volatilityAnalysis && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white">{volatilityAnalysis.priceVolatility.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Volume:</span>
                  <span className="text-white">{volatilityAnalysis.volumeVolatility.toFixed(2)}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-750 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUpIcon className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-medium text-gray-300">Trend Analysis</h3>
            </div>
            {trendAnalysis && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Bullish:</span>
                  <span className="text-green-400">{trendAnalysis.bullishRatio.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Bearish:</span>
                  <span className="text-red-400">{trendAnalysis.bearishRatio.toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-750 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldIcon className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-medium text-gray-300">Key Levels</h3>
            </div>
            {supportResistanceLevels && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Support:</span>
                  <span className="text-green-400">{supportResistanceLevels.support.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Resistance:</span>
                  <span className="text-red-400">{supportResistanceLevels.resistance.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {showChart && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Support & Resistance Levels</h3>
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
                <Bar dataKey="support" fill="#10B981" name="Support" />
                <Bar dataKey="resistance" fill="#EF4444" name="Resistance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Strong Support Levels</h3>
            <div className="space-y-2">
              {priceAnalysis
                .filter(level => level.support > level.resistance && level.strength > 50)
                .slice(0, 5)
                .map((level, index) => {
                  const TrendIcon = getTrendIcon(level.trend);
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-750 rounded">
                      <div className="flex items-center space-x-2">
                        <TrendIcon className={`w-3 h-3 ${getTrendColor(level.trend)}`} />
                        <span className="text-sm text-white">{formatPrice(level.price)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-400">{formatVolume(level.volume)}</span>
                        <span className="text-xs text-green-400">{formatVolume(level.support)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Strong Resistance Levels</h3>
            <div className="space-y-2">
              {priceAnalysis
                .filter(level => level.resistance > level.support && level.strength > 50)
                .slice(0, 5)
                .map((level, index) => {
                  const TrendIcon = getTrendIcon(level.trend);
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-750 rounded">
                      <div className="flex items-center space-x-2">
                        <TrendIcon className={`w-3 h-3 ${getTrendColor(level.trend)}`} />
                        <span className="text-sm text-white">{formatPrice(level.price)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-400">{formatVolume(level.volume)}</span>
                        <span className="text-xs text-red-400">{formatVolume(level.resistance)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 p-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>
            Analysis Depth: {analysisDepth} levels
          </div>
          <div>
            {volatilityAnalysis && (
              <>
                Price Range: {formatPrice(volatilityAnalysis.priceRange.min)} - {formatPrice(volatilityAnalysis.priceRange.max)}
              </>
            )}
          </div>
          <div>
            {trendAnalysis && (
              <>Dominant: <span className={getTrendColor(trendAnalysis.dominantTrend)}>{trendAnalysis.dominantTrend}</span></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
