import { useState, useEffect, useCallback, useMemo } from 'react';
import { MarketDepthData, OrderBook, OrderFlowIndicator, HistoricalOrderBookData } from '@/types/orderbook';
import { OrderBookCalculations } from '@/utils/orderBookCalculations';

interface UseMarketDepthProps {
  orderBook?: OrderBook;
  historicalData?: HistoricalOrderBookData[];
  maxPricePoints?: number;
  priceRange?: {
    min: number;
    max: number;
  };
}

export function useMarketDepth({
  orderBook,
  historicalData = [],
  maxPricePoints = 100,
  priceRange
}: UseMarketDepthProps = {}) {
  const [marketDepth, setMarketDepth] = useState<MarketDepthData[]>([]);
  const [orderFlow, setOrderFlow] = useState<OrderFlowIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const calculateMarketDepth = useCallback(() => {
    if (!orderBook || !orderBook.bids.length || !orderBook.asks.length) {
      setMarketDepth([]);
      return;
    }

    setIsLoading(true);

    try {
      const depthData = OrderBookCalculations.calculateMarketDepth(
        orderBook.bids,
        orderBook.asks,
        priceRange?.max,
        priceRange?.min
      );

      const processedDepth = depthData
        .filter(point => {
          if (priceRange) {
            return point.price >= priceRange.min && point.price <= priceRange.max;
          }
          return true;
        })
        .slice(-maxPricePoints);

      setMarketDepth(processedDepth);
    } catch (error) {
      console.error('Error calculating market depth:', error);
      setMarketDepth([]);
    } finally {
      setIsLoading(false);
    }
  }, [orderBook, priceRange, maxPricePoints]);

  const calculateOrderFlow = useCallback(() => {
    if (!historicalData.length) {
      setOrderFlow([]);
      return;
    }

    try {
      const trades = historicalData.map(data => ({
        price: data.price,
        quantity: data.volume / data.price,
        side: data.bidVolume > data.askVolume ? 'buy' as const : 'sell' as const,
        timestamp: data.timestamp
      }));

      const flowData = OrderBookCalculations.calculateOrderFlow(trades);
      setOrderFlow(flowData);
    } catch (error) {
      console.error('Error calculating order flow:', error);
      setOrderFlow([]);
    }
  }, [historicalData]);

  const liquidityMetrics = useMemo(() => {
    if (!marketDepth.length) return null;

    const totalBuyVolume = marketDepth.reduce((sum, point) => sum + point.buyDepth, 0);
    const totalSellVolume = marketDepth.reduce((sum, point) => sum + point.sellDepth, 0);
    const totalVolume = totalBuyVolume + totalSellVolume;

    const buySideLiquidity = (totalBuyVolume / totalVolume) * 100;
    const sellSideLiquidity = (totalSellVolume / totalVolume) * 100;

    const midPrice = marketDepth[Math.floor(marketDepth.length / 2)]?.price || 0;
    const priceRange = {
      min: Math.min(...marketDepth.map(p => p.price)),
      max: Math.max(...marketDepth.map(p => p.price))
    };

    const liquidityDensity = totalVolume / (priceRange.max - priceRange.min || 1);

    return {
      totalBuyVolume,
      totalSellVolume,
      totalVolume,
      buySideLiquidity,
      sellSideLiquidity,
      midPrice,
      priceRange,
      liquidityDensity,
      imbalance: Math.abs(buySideLiquidity - sellSideLiquidity)
    };
  }, [marketDepth]);

  const priceLevels = useMemo(() => {
    if (!marketDepth.length) return [];

    return marketDepth
      .filter(point => point.buyDepth > 0 || point.sellDepth > 0)
      .map(point => ({
        price: point.price,
        totalVolume: point.buyDepth + point.sellDepth,
        buyVolume: point.buyDepth,
        sellVolume: point.sellDepth,
        buyRatio: point.buyDepth / (point.buyDepth + point.sellDepth) * 100,
        sellRatio: point.sellDepth / (point.buyDepth + point.sellDepth) * 100,
        cumulativeBuy: point.cumulativeBuyVolume,
        cumulativeSell: point.cumulativeSellVolume
      }))
      .sort((a, b) => a.price - b.price);
  }, [marketDepth]);

  const supportResistanceLevels = useMemo(() => {
    if (!priceLevels.length) return { support: [], resistance: [] };

    const avgVolume = priceLevels.reduce((sum, level) => sum + level.totalVolume, 0) / priceLevels.length;
    const threshold = avgVolume * 1.5;

    const support = priceLevels
      .filter(level => level.buyVolume > level.sellVolume && level.totalVolume > threshold)
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 5);

    const resistance = priceLevels
      .filter(level => level.sellVolume > level.buyVolume && level.totalVolume > threshold)
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 5);

    return { support, resistance };
  }, [priceLevels]);

  const orderFlowMetrics = useMemo(() => {
    if (!orderFlow.length) return null;

    const recentFlow = orderFlow.slice(-10);
    const avgBuyPressure = recentFlow.reduce((sum, flow) => sum + flow.buyPressure, 0) / recentFlow.length;
    const avgSellPressure = recentFlow.reduce((sum, flow) => sum + flow.sellPressure, 0) / recentFlow.length;
    const avgNetFlow = recentFlow.reduce((sum, flow) => sum + flow.netFlow, 0) / recentFlow.length;
    const totalVolume = recentFlow.reduce((sum, flow) => sum + flow.volume, 0);

    const pressure = {
      buy: avgBuyPressure,
      sell: avgSellPressure,
      net: avgNetFlow,
      ratio: avgBuyPressure / (avgSellPressure || 1),
      dominance: avgBuyPressure > avgSellPressure ? 'buy' : 'sell' as const
    };

    const trend = avgNetFlow > 1000 ? 'bullish' : avgNetFlow < -1000 ? 'bearish' : 'neutral' as const;

    return {
      pressure,
      trend,
      totalVolume,
      intensity: Math.abs(avgNetFlow) / totalVolume * 100
    };
  }, [orderFlow]);

  const getDepthAtPrice = useCallback((price: number): MarketDepthData | null => {
    return marketDepth.find(point => Math.abs(point.price - price) < 0.01) || null;
  }, [marketDepth]);

  const getLiquidityAtPrice = useCallback((price: number): { buy: number; sell: number; total: number } => {
    const depth = getDepthAtPrice(price);
    if (!depth) return { buy: 0, sell: 0, total: 0 };

    return {
      buy: depth.buyDepth,
      sell: depth.sellDepth,
      total: depth.buyDepth + depth.sellDepth
    };
  }, [getDepthAtPrice]);

  const predictPriceMovement = useCallback(() => {
    if (!liquidityMetrics || !orderFlowMetrics) return 'neutral';

    const liquidityImbalance = liquidityMetrics.imbalance;
    const flowStrength = orderFlowMetrics.intensity;
    const flowDirection = orderFlowMetrics.trend;

    if (liquidityImbalance > 20 && flowStrength > 5) {
      return flowDirection;
    } else if (liquidityImbalance > 30) {
      return liquidityMetrics.buySideLiquidity > liquidityMetrics.sellSideLiquidity ? 'bullish' : 'bearish';
    }

    return 'neutral';
  }, [liquidityMetrics, orderFlowMetrics]);

  useEffect(() => {
    calculateMarketDepth();
  }, [calculateMarketDepth]);

  useEffect(() => {
    calculateOrderFlow();
  }, [calculateOrderFlow]);

  return {
    marketDepth,
    orderFlow,
    priceLevels,
    liquidityMetrics,
    supportResistanceLevels,
    orderFlowMetrics,
    isLoading,
    getDepthAtPrice,
    getLiquidityAtPrice,
    predictPriceMovement,
    refresh: () => {
      calculateMarketDepth();
      calculateOrderFlow();
    }
  };
}
