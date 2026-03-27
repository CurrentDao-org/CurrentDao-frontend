import { 
  PriceLevel, 
  OrderBookEntry, 
  OrderBook, 
  MarketDepthData, 
  PriceLevelAnalysis,
  OrderFlowIndicator,
  HistoricalOrderBookData 
} from '@/types/orderbook';

export class OrderBookCalculations {
  static calculateSpread(bids: PriceLevel[], asks: PriceLevel[]): { spread: number; spreadPercentage: number } {
    if (bids.length === 0 || asks.length === 0) {
      return { spread: 0, spreadPercentage: 0 };
    }

    const bestBid = bids[0].price;
    const bestAsk = asks[0].price;
    const spread = bestAsk - bestBid;
    const spreadPercentage = (spread / bestAsk) * 100;

    return { spread, spreadPercentage };
  }

  static aggregateOrders(orders: OrderBookEntry[], groupingSize: number): PriceLevel[] {
    const priceMap = new Map<number, PriceLevel>();

    orders.forEach(order => {
      const groupedPrice = Math.floor(order.price / groupingSize) * groupingSize;
      
      if (!priceMap.has(groupedPrice)) {
        priceMap.set(groupedPrice, {
          price: groupedPrice,
          quantity: 0,
          total: 0,
          orders: 0,
          timestamp: Date.now()
        });
      }

      const level = priceMap.get(groupedPrice)!;
      level.quantity += order.quantity;
      level.total += order.price * order.quantity;
      level.orders += 1;
      level.timestamp = Math.max(level.timestamp, order.timestamp);
    });

    return Array.from(priceMap.values())
      .sort((a, b) => b.price - a.price);
  }

  static calculateMarketDepth(
    bids: PriceLevel[], 
    asks: PriceLevel[], 
    maxPrice?: number, 
    minPrice?: number
  ): MarketDepthData[] {
    const allPrices = new Set<number>();
    
    bids.forEach(bid => allPrices.add(bid.price));
    asks.forEach(ask => allPrices.add(ask.price));

    const sortedPrices = Array.from(allPrices).sort((a, b) => a - b);
    
    let cumulativeBuyVolume = 0;
    let cumulativeSellVolume = 0;

    return sortedPrices.map(price => {
      const buyDepth = bids
        .filter(bid => bid.price >= price)
        .reduce((sum, bid) => sum + bid.quantity, 0);

      const sellDepth = asks
        .filter(ask => ask.price <= price)
        .reduce((sum, ask) => sum + ask.quantity, 0);

      cumulativeBuyVolume += buyDepth;
      cumulativeSellVolume += sellDepth;

      return {
        price,
        buyDepth,
        sellDepth,
        cumulativeBuyVolume,
        cumulativeSellVolume
      };
    });
  }

  static analyzePriceLevels(
    historicalData: HistoricalOrderBookData[],
    currentPrice: number
  ): PriceLevelAnalysis[] {
    const priceMap = new Map<number, PriceLevelAnalysis>();

    historicalData.forEach(data => {
      if (!priceMap.has(data.price)) {
        priceMap.set(data.price, {
          price: data.price,
          support: 0,
          resistance: 0,
          strength: 0,
          volume: 0,
          orders: 0,
          trend: 'neutral'
        });
      }

      const analysis = priceMap.get(data.price)!;
      analysis.volume += data.volume;
      analysis.orders += 1;

      if (data.price < currentPrice) {
        analysis.support += data.volume;
      } else {
        analysis.resistance += data.volume;
      }
    });

    return Array.from(priceMap.values())
      .map(analysis => {
        analysis.strength = (analysis.support + analysis.resistance) / 2;
        
        if (analysis.support > analysis.resistance * 1.2) {
          analysis.trend = 'bullish';
        } else if (analysis.resistance > analysis.support * 1.2) {
          analysis.trend = 'bearish';
        } else {
          analysis.trend = 'neutral';
        }

        return analysis;
      })
      .sort((a, b) => b.strength - a.strength);
  }

  static calculateOrderFlow(
    trades: { price: number; quantity: number; side: 'buy' | 'sell'; timestamp: number }[],
    windowSize: number = 60000 // 1 minute window
  ): OrderFlowIndicator[] {
    const flowMap = new Map<number, OrderFlowIndicator>();
    const now = Date.now();

    trades.forEach(trade => {
      const windowStart = Math.floor(trade.timestamp / windowSize) * windowSize;
      
      if (!flowMap.has(windowStart)) {
        flowMap.set(windowStart, {
          timestamp: windowStart,
          buyPressure: 0,
          sellPressure: 0,
          netFlow: 0,
          volume: 0,
          trades: 0
        });
      }

      const flow = flowMap.get(windowStart)!;
      
      if (trade.side === 'buy') {
        flow.buyPressure += trade.quantity * trade.price;
      } else {
        flow.sellPressure += trade.quantity * trade.price;
      }
      
      flow.volume += trade.quantity * trade.price;
      flow.trades += 1;
    });

    return Array.from(flowMap.values())
      .map(flow => {
        flow.netFlow = flow.buyPressure - flow.sellPressure;
        return flow;
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  static calculateVWAP(orders: OrderBookEntry[]): number {
    if (orders.length === 0) return 0;

    const totalValue = orders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
    const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);

    return totalValue / totalQuantity;
  }

  static calculateLiquidityScore(priceLevels: PriceLevel[]): number {
    if (priceLevels.length === 0) return 0;

    const totalVolume = priceLevels.reduce((sum, level) => sum + level.quantity, 0);
    const weightedVolume = priceLevels.reduce((sum, level) => {
      const distanceFromMid = Math.abs(level.price - priceLevels[0].price);
      const weight = 1 / (1 + distanceFromMid);
      return sum + (level.quantity * weight);
    }, 0);

    return (weightedVolume / totalVolume) * 100;
  }

  static predictPriceMovement(
    orderBook: OrderBook,
    orderFlow: OrderFlowIndicator[]
  ): 'up' | 'down' | 'neutral' {
    const recentFlow = orderFlow.slice(-5);
    const avgNetFlow = recentFlow.reduce((sum, flow) => sum + flow.netFlow, 0) / recentFlow.length;
    
    const bidVolume = orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0);
    const askVolume = orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0);
    const volumeRatio = bidVolume / askVolume;

    if (avgNetFlow > 1000 && volumeRatio > 1.2) {
      return 'up';
    } else if (avgNetFlow < -1000 && volumeRatio < 0.8) {
      return 'down';
    } else {
      return 'neutral';
    }
  }

  static calculateSlippage(
    order: { quantity: number; side: 'buy' | 'sell' },
    orderBook: OrderBook
  ): number {
    const levels = order.side === 'buy' ? orderBook.asks : orderBook.bids;
    let remainingQuantity = order.quantity;
    let totalCost = 0;

    for (const level of levels) {
      if (remainingQuantity <= 0) break;

      const filledQuantity = Math.min(remainingQuantity, level.quantity);
      totalCost += filledQuantity * level.price;
      remainingQuantity -= filledQuantity;
    }

    if (remainingQuantity > 0) return Infinity;

    const avgPrice = totalCost / order.quantity;
    const midPrice = (orderBook.bids[0]?.price + orderBook.asks[0]?.price) / 2;
    
    return Math.abs(avgPrice - midPrice) / midPrice * 100;
  }

  static generateHistoricalData(
    basePrice: number,
    volatility: number = 0.02,
    points: number = 100
  ): HistoricalOrderBookData[] {
    const data: HistoricalOrderBookData[] = [];
    let currentPrice = basePrice;

    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * 2 * volatility;
      currentPrice = currentPrice * (1 + change);

      const volume = Math.random() * 1000 + 100;
      const bidVolume = volume * (0.4 + Math.random() * 0.2);
      const askVolume = volume - bidVolume;
      const spread = currentPrice * (0.001 + Math.random() * 0.002);

      data.push({
        timestamp: Date.now() - (points - i) * 60000,
        price: currentPrice,
        volume,
        bidVolume,
        askVolume,
        spread
      });
    }

    return data;
  }
}
