import { 
  MarketDataPoint, 
  MarketMetrics, 
  VolumeAnalysis, 
  PriceTrend, 
  SentimentData,
  ComparativeAnalysis,
  PredictiveAnalytics,
  EnergyType,
  TimeInterval,
  TechnicalIndicator 
} from '@/types/analytics';

// Utility functions for market analytics calculations

/**
 * Calculate basic market metrics from raw data
 */
export const calculateMarketMetrics = (data: MarketDataPoint[]): MarketMetrics => {
  if (data.length === 0) {
    return {
      totalVolume: 0,
      totalValue: 0,
      averagePrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
      volatility: 0,
      marketCap: 0,
      liquidity: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  const totalVolume = data.reduce((sum, point) => sum + point.volume, 0);
  const totalValue = data.reduce((sum, point) => sum + (point.price * point.volume), 0);
  const averagePrice = totalValue / totalVolume || 0;
  
  const prices = data.map(point => point.price);
  const priceChange = prices[prices.length - 1] - prices[0];
  const priceChangePercent = (priceChange / prices[0]) * 100 || 0;
  
  // Calculate volatility (standard deviation of price changes)
  const priceChanges = [];
  for (let i = 1; i < prices.length; i++) {
    priceChanges.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const volatility = calculateStandardDeviation(priceChanges) * Math.sqrt(252); // Annualized
  
  // Estimate market cap and liquidity (simplified)
  const marketCap = averagePrice * totalVolume;
  const liquidity = calculateLiquidity(data);

  return {
    totalVolume,
    totalValue,
    averagePrice,
    priceChange,
    priceChangePercent,
    volatility,
    marketCap,
    liquidity,
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Calculate volume analysis metrics
 */
export const calculateVolumeAnalysis = (data: MarketDataPoint[]): VolumeAnalysis => {
  if (data.length === 0) {
    return {
      currentVolume: 0,
      volumeChange: 0,
      volumeChangePercent: 0,
      averageVolume: 0,
      volumeTrend: 'stable',
      peakVolume: 0,
      volumeByEnergyType: {} as Record<EnergyType, number>,
      volumeDistribution: [],
    };
  }

  const volumes = data.map(point => point.volume);
  const currentVolume = volumes[volumes.length - 1];
  const averageVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
  
  const volumeChange = currentVolume - averageVolume;
  const volumeChangePercent = (volumeChange / averageVolume) * 100 || 0;
  
  // Determine volume trend
  const recentVolumes = volumes.slice(-10);
  const olderVolumes = volumes.slice(-20, -10);
  const recentAvg = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
  const olderAvg = olderVolumes.reduce((sum, vol) => sum + vol, 0) / olderVolumes.length;
  
  let volumeTrend: 'increasing' | 'decreasing' | 'stable';
  if (recentAvg > olderAvg * 1.05) {
    volumeTrend = 'increasing';
  } else if (recentAvg < olderAvg * 0.95) {
    volumeTrend = 'decreasing';
  } else {
    volumeTrend = 'stable';
  }
  
  const peakVolume = Math.max(...volumes);
  
  // Calculate volume by energy type
  const volumeByEnergyType = {} as Record<EnergyType, number>;
  data.forEach(point => {
    volumeByEnergyType[point.energyType] = (volumeByEnergyType[point.energyType] || 0) + point.volume;
  });
  
  // Calculate volume distribution
  const totalVolume = Object.values(volumeByEnergyType).reduce((sum, vol) => sum + vol, 0);
  const volumeDistribution = Object.entries(volumeByEnergyType).map(([energyType, volume]) => ({
    energyType: energyType as EnergyType,
    volume,
    percentage: (volume / totalVolume) * 100,
  }));

  return {
    currentVolume,
    volumeChange,
    volumeChangePercent,
    averageVolume,
    volumeTrend,
    peakVolume,
    volumeByEnergyType,
    volumeDistribution,
  };
};

/**
 * Calculate price trend analysis with technical indicators
 */
export const calculatePriceTrend = (data: MarketDataPoint[]): PriceTrend => {
  if (data.length === 0) {
    return {
      currentPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
      trendDirection: 'sideways',
      supportLevels: [],
      resistanceLevels: [],
      technicalIndicators: {
        sma: [],
        ema: [],
        rsi: 50,
        macd: { macd: 0, signal: 0, histogram: 0 },
        bollingerBands: { upper: 0, middle: 0, lower: 0 },
      },
      pricePredictions: {
        shortTerm: 0,
        mediumTerm: 0,
        longTerm: 0,
        confidence: 0,
      },
    };
  }

  const prices = data.map(point => point.price);
  const currentPrice = prices[prices.length - 1];
  const priceChange = currentPrice - prices[0];
  const priceChangePercent = (priceChange / prices[0]) * 100 || 0;
  
  // Determine trend direction
  let trendDirection: 'bullish' | 'bearish' | 'sideways';
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  
  if (currentPrice > sma20 && sma20 > sma50) {
    trendDirection = 'bullish';
  } else if (currentPrice < sma20 && sma20 < sma50) {
    trendDirection = 'bearish';
  } else {
    trendDirection = 'sideways';
  }
  
  // Calculate support and resistance levels
  const { supportLevels, resistanceLevels } = calculateSupportResistance(prices);
  
  // Calculate technical indicators
  const technicalIndicators = {
    sma: [
      calculateSMA(prices, 20),
      calculateSMA(prices, 50),
      calculateSMA(prices, 200),
    ],
    ema: [
      calculateEMA(prices, 12),
      calculateEMA(prices, 26),
    ],
    rsi: calculateRSI(prices),
    macd: calculateMACD(prices),
    bollingerBands: calculateBollingerBands(prices, 20, 2),
  };
  
  // Generate price predictions (simplified linear regression)
  const pricePredictions = generatePricePredictions(prices);

  return {
    currentPrice,
    priceChange,
    priceChangePercent,
    trendDirection,
    supportLevels,
    resistanceLevels,
    technicalIndicators,
    pricePredictions,
  };
};

/**
 * Calculate market sentiment from various sources
 */
export const calculateSentiment = (socialData: number[], newsData: number[], technicalData: number[]): SentimentData => {
  const social = calculateWeightedAverage(socialData);
  const news = calculateWeightedAverage(newsData);
  const technical = calculateWeightedAverage(technicalData);
  
  // Fundamental sentiment based on market conditions (simplified)
  const fundamental = Math.random() * 200 - 100; // -100 to 100
  
  const overall = (social * 0.3 + news * 0.3 + technical * 0.2 + fundamental * 0.2);
  
  return {
    overall: Math.max(-100, Math.min(100, overall)),
    social,
    news,
    technical,
    fundamental,
    timestamp: new Date().toISOString(),
    sources: [
      { name: 'Twitter', sentiment: social, weight: 0.15, lastUpdated: new Date().toISOString() },
      { name: 'Reddit', sentiment: social * 0.8, weight: 0.1, lastUpdated: new Date().toISOString() },
      { name: 'News API', sentiment: news, weight: 0.2, lastUpdated: new Date().toISOString() },
      { name: 'Technical Analysis', sentiment: technical, weight: 0.15, lastUpdated: new Date().toISOString() },
    ],
  };
};

/**
 * Calculate comparative analysis between energy types
 */
export const calculateComparativeAnalysis = (data: MarketDataPoint[]): ComparativeAnalysis => {
  // Group data by energy type
  const dataByEnergyType = data.reduce((acc, point) => {
    if (!acc[point.energyType]) {
      acc[point.energyType] = [];
    }
    acc[point.energyType].push(point);
    return acc;
  }, {} as Record<EnergyType, MarketDataPoint[]>);

  // Calculate performance metrics for each energy type
  const energyTypePerformance = Object.entries(dataByEnergyType).map(([energyType, energyData]) => {
    const metrics = calculateMarketMetrics(energyData);
    const trend = calculatePriceTrend(energyData);
    
    return {
      energyType: energyType as EnergyType,
      currentPrice: metrics.averagePrice,
      priceChange: metrics.priceChange,
      priceChangePercent: metrics.priceChangePercent,
      volume: metrics.totalVolume,
      marketShare: (metrics.totalVolume / data.reduce((sum, point) => sum + point.volume, 0)) * 100,
      efficiency: Math.random() * 100, // Placeholder - would come from real efficiency data
    };
  });

  // Calculate correlations between energy types
  const correlations = calculateCorrelations(dataByEnergyType);
  
  // Calculate market dominance
  const marketDominance = energyTypePerformance.map(perf => ({
    energyType: perf.energyType,
    dominance: perf.marketShare,
    trend: perf.priceChangePercent > 5 ? 'increasing' : perf.priceChangePercent < -5 ? 'decreasing' : 'stable',
  }));

  return {
    energyTypePerformance,
    correlations,
    marketDominance,
  };
};

/**
 * Generate predictive analytics using various models
 */
export const generatePredictiveAnalytics = (data: MarketDataPoint[]): PredictiveAnalytics => {
  const prices = data.map(point => point.price);
  const volumes = data.map(point => point.volume);
  
  // Price forecasts using different models
  const priceForecast = [
    {
      timeHorizon: '1h' as const,
      predictedPrice: predictNextValue(prices, 'arima'),
      confidenceInterval: {
        lower: predictNextValue(prices, 'arima') * 0.95,
        upper: predictNextValue(prices, 'arima') * 1.05,
      },
      probability: 0.75,
      model: 'arima' as const,
    },
    {
      timeHorizon: '24h' as const,
      predictedPrice: predictNextValue(prices, 'lstm'),
      confidenceInterval: {
        lower: predictNextValue(prices, 'lstm') * 0.9,
        upper: predictNextValue(prices, 'lstm') * 1.1,
      },
      probability: 0.65,
      model: 'lstm' as const,
    },
    {
      timeHorizon: '7d' as const,
      predictedPrice: predictNextValue(prices, 'linear_regression'),
      confidenceInterval: {
        lower: predictNextValue(prices, 'linear_regression') * 0.85,
        upper: predictNextValue(prices, 'linear_regression') * 1.15,
      },
      probability: 0.55,
      model: 'linear_regression' as const,
    },
    {
      timeHorizon: '30d' as const,
      predictedPrice: predictNextValue(prices, 'ensemble'),
      confidenceInterval: {
        lower: predictNextValue(prices, 'ensemble') * 0.8,
        upper: predictNextValue(prices, 'ensemble') * 1.2,
      },
      probability: 0.45,
      model: 'ensemble' as const,
    },
  ];

  // Volume forecasts
  const volumeForecast = [
    {
      timeHorizon: '1h' as const,
      predictedVolume: predictNextValue(volumes, 'arima'),
      confidenceInterval: {
        lower: predictNextValue(volumes, 'arima') * 0.9,
        upper: predictNextValue(volumes, 'arima') * 1.1,
      },
      probability: 0.7,
    },
    {
      timeHorizon: '24h' as const,
      predictedVolume: predictNextValue(volumes, 'lstm'),
      confidenceInterval: {
        lower: predictNextValue(volumes, 'lstm') * 0.85,
        upper: predictNextValue(volumes, 'lstm') * 1.15,
      },
      probability: 0.6,
    },
    {
      timeHorizon: '7d' as const,
      predictedVolume: predictNextValue(volumes, 'linear_regression'),
      confidenceInterval: {
        lower: predictNextValue(volumes, 'linear_regression') * 0.8,
        upper: predictNextValue(volumes, 'linear_regression') * 1.2,
      },
      probability: 0.5,
    },
    {
      timeHorizon: '30d' as const,
      predictedVolume: predictNextValue(volumes, 'ensemble'),
      confidenceInterval: {
        lower: predictNextValue(volumes, 'ensemble') * 0.75,
        upper: predictNextValue(volumes, 'ensemble') * 1.25,
      },
      probability: 0.4,
    },
  ];

  // Risk assessment
  const volatility = calculateStandardDeviation(prices);
  const trend = calculatePriceTrend(data);
  
  let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  if (volatility < 0.1 && trend.priceChangePercent > -5) {
    riskLevel = 'low';
  } else if (volatility < 0.2 && trend.priceChangePercent > -10) {
    riskLevel = 'medium';
  } else if (volatility < 0.3 && trend.priceChangePercent > -20) {
    riskLevel = 'high';
  } else {
    riskLevel = 'extreme';
  }

  const riskAssessment = {
    riskLevel,
    factors: [
      {
        name: 'Price Volatility',
        impact: volatility * 100,
        description: `Current volatility is ${(volatility * 100).toFixed(2)}%`,
      },
      {
        name: 'Market Trend',
        impact: Math.abs(trend.priceChangePercent),
        description: `Price change of ${trend.priceChangePercent.toFixed(2)}% in the last period`,
      },
      {
        name: 'Volume Stability',
        impact: Math.random() * 50, // Placeholder
        description: 'Trading volume consistency analysis',
      },
    ],
    recommendations: generateRiskRecommendations(riskLevel, trend.trendDirection),
  };

  return {
    priceForecast,
    volumeForecast,
    riskAssessment,
  };
};

// Helper functions

/**
 * Calculate standard deviation
 */
export const calculateStandardDeviation = (values: number[]): number => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
};

/**
 * Calculate Simple Moving Average (SMA)
 */
export const calculateSMA = (prices: number[], period: number): number => {
  if (prices.length < period) return 0;
  const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
  return sum / period;
};

/**
 * Calculate Exponential Moving Average (EMA)
 */
export const calculateEMA = (prices: number[], period: number): number => {
  if (prices.length === 0) return 0;
  
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
};

/**
 * Calculate Relative Strength Index (RSI)
 */
export const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length < period + 1) return 50;
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      gains += changes[i];
    } else {
      losses -= changes[i];
    }
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
};

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export const calculateMACD = (prices: number[]) => {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  const signal = calculateEMA([macd], 9);
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
};

/**
 * Calculate Bollinger Bands
 */
export const calculateBollingerBands = (prices: number[], period: number = 20, stdDev: number = 2) => {
  const middle = calculateSMA(prices, period);
  const recentPrices = prices.slice(-period);
  const standardDeviation = calculateStandardDeviation(recentPrices);
  
  return {
    upper: middle + (standardDeviation * stdDev),
    middle,
    lower: middle - (standardDeviation * stdDev),
  };
};

/**
 * Calculate support and resistance levels
 */
export const calculateSupportResistance = (prices: number[]): { supportLevels: number[], resistanceLevels: number[] } => {
  const supportLevels: number[] = [];
  const resistanceLevels: number[] = [];
  
  // Find local minima (support) and maxima (resistance)
  for (let i = 2; i < prices.length - 2; i++) {
    const window = prices.slice(i - 2, i + 3);
    const current = prices[i];
    
    // Support level (local minimum)
    if (current === Math.min(...window)) {
      supportLevels.push(current);
    }
    
    // Resistance level (local maximum)
    if (current === Math.max(...window)) {
      resistanceLevels.push(current);
    }
  }
  
  // Return the most significant levels (top 5)
  return {
    supportLevels: supportLevels.sort((a, b) => a - b).slice(0, 5),
    resistanceLevels: resistanceLevels.sort((a, b) => b - a).slice(0, 5),
  };
};

/**
 * Calculate liquidity metric
 */
export const calculateLiquidity = (data: MarketDataPoint[]): number => {
  const volumes = data.map(point => point.volume);
  const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
  const volumeStdDev = calculateStandardDeviation(volumes);
  
  // Higher liquidity = higher average volume and lower volume volatility
  return avgVolume / (volumeStdDev + 1);
};

/**
 * Calculate weighted average
 */
export const calculateWeightedAverage = (values: number[], weights?: number[]): number => {
  if (!weights) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  const weightedSum = values.reduce((sum, val, index) => sum + (val * (weights[index] || 1)), 0);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  return weightedSum / totalWeight;
};

/**
 * Generate price predictions using simplified models
 */
export const generatePricePredictions = (prices: number[]) => {
  const lastPrice = prices[prices.length - 1];
  const trend = calculateSMA(prices, 10) > calculateSMA(prices, 30) ? 1.02 : 0.98;
  
  return {
    shortTerm: lastPrice * trend,
    mediumTerm: lastPrice * (trend > 1 ? 1.05 : 0.95),
    longTerm: lastPrice * (trend > 1 ? 1.1 : 0.9),
    confidence: 0.7, // Simplified confidence score
  };
};

/**
 * Predict next value using different models (simplified implementations)
 */
export const predictNextValue = (values: number[], model: 'arima' | 'lstm' | 'linear_regression' | 'ensemble'): number => {
  const lastValue = values[values.length - 1];
  const trend = calculateSMA(values, 5) - calculateSMA(values, 10);
  
  switch (model) {
    case 'arima':
      return lastValue + trend * 0.8;
    case 'lstm':
      return lastValue + trend * 1.2;
    case 'linear_regression':
      return lastValue + trend;
    case 'ensemble':
      return (predictNextValue(values, 'arima') + predictNextValue(values, 'lstm') + predictNextValue(values, 'linear_regression')) / 3;
    default:
      return lastValue;
  }
};

/**
 * Calculate correlations between energy types
 */
export const calculateCorrelations = (dataByEnergyType: Record<EnergyType, MarketDataPoint[]>) => {
  const energyTypes = Object.keys(dataByEnergyType) as EnergyType[];
  const correlations = [];
  
  for (let i = 0; i < energyTypes.length; i++) {
    for (let j = i + 1; j < energyTypes.length; j++) {
      const type1 = energyTypes[i];
      const type2 = energyTypes[j];
      
      const prices1 = dataByEnergyType[type1].map(point => point.price);
      const prices2 = dataByEnergyType[type2].map(point => point.price);
      
      const correlation = calculateCorrelation(prices1, prices2);
      
      correlations.push({
        energyType1: type1,
        energyType2: type2,
        correlation,
        significance: Math.abs(correlation),
      });
    }
  }
  
  return correlations;
};

/**
 * Calculate correlation coefficient between two arrays
 */
export const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = Math.min(x.length, y.length);
  if (n === 0) return 0;
  
  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);
  
  const xMean = xSlice.reduce((sum, val) => sum + val, 0) / n;
  const yMean = ySlice.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let xSumSquares = 0;
  let ySumSquares = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = xSlice[i] - xMean;
    const yDiff = ySlice[i] - yMean;
    
    numerator += xDiff * yDiff;
    xSumSquares += xDiff * xDiff;
    ySumSquares += yDiff * yDiff;
  }
  
  const denominator = Math.sqrt(xSumSquares * ySumSquares);
  
  return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Generate risk recommendations based on risk level and trend
 */
export const generateRiskRecommendations = (riskLevel: 'low' | 'medium' | 'high' | 'extreme', trend: 'bullish' | 'bearish' | 'sideways'): string[] => {
  const recommendations: string[] = [];
  
  switch (riskLevel) {
    case 'low':
      recommendations.push('Market conditions are favorable for trading');
      if (trend === 'bullish') {
        recommendations.push('Consider increasing position sizes');
      }
      break;
      
    case 'medium':
      recommendations.push('Exercise caution with position sizes');
      recommendations.push('Set appropriate stop-loss orders');
      break;
      
    case 'high':
      recommendations.push('Reduce position sizes significantly');
      recommendations.push('Consider hedging strategies');
      recommendations.push('Monitor market closely for exit opportunities');
      break;
      
    case 'extreme':
      recommendations.push('Avoid new positions until volatility decreases');
      recommendations.push('Consider exiting existing positions');
      recommendations.push('Focus on capital preservation');
      break;
  }
  
  if (trend === 'bearish') {
    recommendations.push('Market trend is bearish - consider defensive strategies');
  } else if (trend === 'bullish') {
    recommendations.push('Market trend is bullish - look for entry opportunities');
  }
  
  return recommendations;
};

/**
 * Format large numbers for display
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  } else {
    return num.toFixed(decimals);
  }
};

/**
 * Format percentage for display
 */
export const formatPercentage = (num: number, decimals: number = 2): string => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
};

/**
 * Get energy type display name
 */
export const getEnergyTypeName = (energyType: EnergyType): string => {
  const names: Record<EnergyType, string> = {
    solar: 'Solar',
    wind: 'Wind',
    hydro: 'Hydro',
    nuclear: 'Nuclear',
    natural_gas: 'Natural Gas',
    coal: 'Coal',
    biomass: 'Biomass',
  };
  return names[energyType] || energyType;
};

/**
 * Get energy type color
 */
export const getEnergyTypeColor = (energyType: EnergyType): string => {
  const colors: Record<EnergyType, string> = {
    solar: '#f59e0b',
    wind: '#3b82f6',
    hydro: '#06b6d4',
    nuclear: '#8b5cf6',
    natural_gas: '#6b7280',
    coal: '#374151',
    biomass: '#84cc16',
  };
  return colors[energyType] || '#6b7280';
};
