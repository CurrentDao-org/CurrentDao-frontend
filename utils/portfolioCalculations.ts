import { 
  Trade, 
  Portfolio, 
  Asset, 
  PerformanceMetrics, 
  ProfitLossData, 
  PnLPoint, 
  AllocationData, 
  AssetAllocation, 
  RebalancingAction, 
  TradingStatistics,
  PricePoint 
} from '@/types/portfolio';

export class PortfolioCalculator {
  static calculatePortfolio(trades: Trade[], currentPrices: Record<string, number>): Portfolio {
    const assets = this.calculateAssets(trades, currentPrices);
    const totalValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
    const totalInvestment = assets.reduce((sum, asset) => sum + asset.totalCost, 0);
    const totalProfit = totalValue - totalInvestment;
    const totalProfitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

    return {
      totalValue,
      totalInvestment,
      totalProfit,
      totalProfitPercentage,
      assets,
      lastUpdated: new Date()
    };
  }

  static calculateAssets(trades: Trade[], currentPrices: Record<string, number>): Asset[] {
    const assetMap = new Map<string, Asset>();

    trades.forEach(trade => {
      const existing = assetMap.get(trade.asset) || {
        symbol: trade.asset,
        name: trade.asset,
        amount: 0,
        averageBuyPrice: 0,
        currentPrice: currentPrices[trade.asset] || 0,
        totalValue: 0,
        totalCost: 0,
        profit: 0,
        profitPercentage: 0,
        allocation: 0,
        priceHistory: []
      };

      if (trade.type === 'buy') {
        const newTotalCost = existing.totalCost + trade.total + trade.fee;
        const newAmount = existing.amount + trade.amount;
        existing.averageBuyPrice = newAmount > 0 ? newTotalCost / newAmount : 0;
        existing.totalCost = newTotalCost;
        existing.amount = newAmount;
      } else {
        existing.amount -= trade.amount;
        existing.totalCost = existing.totalCost * (existing.amount / (existing.amount + trade.amount));
      }

      assetMap.set(trade.asset, existing);
    });

    const assets = Array.from(assetMap.values());
    const totalPortfolioValue = assets.reduce((sum, asset) => {
      asset.currentPrice = currentPrices[asset.symbol] || asset.currentPrice;
      asset.totalValue = asset.amount * asset.currentPrice;
      return sum + asset.totalValue;
    }, 0);

    assets.forEach(asset => {
      asset.profit = asset.totalValue - asset.totalCost;
      asset.profitPercentage = asset.totalCost > 0 ? (asset.profit / asset.totalCost) * 100 : 0;
      asset.allocation = totalPortfolioValue > 0 ? (asset.totalValue / totalPortfolioValue) * 100 : 0;
    });

    return assets.filter(asset => asset.amount > 0);
  }

  static calculatePerformanceMetrics(trades: Trade[], portfolio: Portfolio): PerformanceMetrics {
    const realizedTrades = this.getRealizedTrades(trades);
    const totalReturn = portfolio.totalProfit;
    const totalReturnPercentage = portfolio.totalProfitPercentage;
    
    const timeSpan = this.getTimeSpan(trades);
    const annualizedReturn = timeSpan > 0 ? Math.pow(1 + totalReturn / 100, 365 / timeSpan) - 1 : 0;

    const returns = this.calculateDailyReturns(trades, portfolio);
    const volatility = this.calculateVolatility(returns);
    const sharpeRatio = volatility > 0 ? (annualizedReturn - 0.02) / volatility : 0;
    const maxDrawdown = this.calculateMaxDrawdown(trades, portfolio);

    const winningTrades = realizedTrades.filter(trade => trade.profit! > 0);
    const losingTrades = realizedTrades.filter(trade => trade.profit! <= 0);

    const winRate = realizedTrades.length > 0 ? (winningTrades.length / realizedTrades.length) * 100 : 0;
    const totalWins = winningTrades.reduce((sum, trade) => sum + trade.profit!, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profit!, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

    return {
      totalReturn,
      totalReturnPercentage,
      annualizedReturn: annualizedReturn * 100,
      sharpeRatio,
      volatility: volatility * 100,
      maxDrawdown,
      winRate,
      profitFactor,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
      largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.profit!)) : 0,
      largestLoss: losingTrades.length > 0 ? Math.abs(Math.min(...losingTrades.map(t => t.profit!))) : 0
    };
  }

  static calculateProfitLoss(trades: Trade[]): ProfitLossData {
    const daily = this.calculatePnLByPeriod(trades, 'daily');
    const weekly = this.calculatePnLByPeriod(trades, 'weekly');
    const monthly = this.calculatePnLByPeriod(trades, 'monthly');
    const yearly = this.calculatePnLByPeriod(trades, 'yearly');
    const cumulative = this.calculateCumulativePnL(trades);

    return { daily, weekly, monthly, yearly, cumulative };
  }

  static calculateAllocation(portfolio: Portfolio, targetAllocation: Record<string, number>): AllocationData {
    const current: AssetAllocation[] = portfolio.assets.map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      currentPercentage: asset.allocation,
      targetPercentage: targetAllocation[asset.symbol] || 0,
      difference: asset.allocation - (targetAllocation[asset.symbol] || 0),
      value: asset.totalValue,
      action: this.getRebalancingAction(asset.allocation, targetAllocation[asset.symbol] || 0)
    }));

    const recommended: AssetAllocation[] = Object.entries(targetAllocation).map(([symbol, target]) => {
      const current = portfolio.assets.find(a => a.symbol === symbol);
      return {
        symbol,
        name: current?.name || symbol,
        currentPercentage: current?.allocation || 0,
        targetPercentage: target,
        difference: (current?.allocation || 0) - target,
        value: current?.totalValue || 0,
        action: this.getRebalancingAction(current?.allocation || 0, target)
      };
    });

    const rebalancingActions = this.calculateRebalancingActions(portfolio, targetAllocation);

    return { current, recommended, rebalancingActions };
  }

  static calculateTradingStatistics(trades: Trade[]): TradingStatistics {
    const totalVolume = trades.reduce((sum, trade) => sum + trade.total, 0);
    const totalFees = trades.reduce((sum, trade) => sum + trade.fee, 0);
    const averageTradeSize = trades.length > 0 ? totalVolume / trades.length : 0;
    
    const assetCounts = trades.reduce((acc, trade) => {
      acc[trade.asset] = (acc[trade.asset] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostTradedAsset = Object.entries(assetCounts).reduce((a, b) => 
      assetCounts[a[0]] > assetCounts[b[0]] ? a : b, [''])[0];

    const tradingFrequency = this.calculateTradingFrequency(trades);
    const averageHoldingPeriod = this.calculateAverageHoldingPeriod(trades);

    const realizedGains = this.calculateRealizedGains(trades);
    const unrealizedGains = 0; // Would need current prices to calculate
    const costBasis = trades.reduce((sum, trade) => sum + (trade.type === 'buy' ? trade.total + trade.fee : 0), 0);
    const taxLiability = realizedGains * 0.25; // Assuming 25% tax rate

    return {
      totalVolume,
      totalFees,
      averageTradeSize,
      mostTradedAsset,
      tradingFrequency,
      averageHoldingPeriod,
      taxLiability,
      costBasis,
      realizedGains,
      unrealizedGains
    };
  }

  private static getRealizedTrades(trades: Trade[]): (Trade & { profit?: number })[] {
    const assetMap = new Map<string, Trade[]>();
    
    trades.forEach(trade => {
      if (!assetMap.has(trade.asset)) {
        assetMap.set(trade.asset, []);
      }
      assetMap.get(trade.asset)!.push(trade);
    });

    const realizedTrades: (Trade & { profit?: number })[] = [];

    assetMap.forEach((assetTrades, symbol) => {
      const buys = assetTrades.filter(t => t.type === 'buy').sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const sells = assetTrades.filter(t => t.type === 'sell').sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      let buyIndex = 0;
      sells.forEach(sell => {
        let remainingSellAmount = sell.amount;
        
        while (remainingSellAmount > 0 && buyIndex < buys.length) {
          const buy = buys[buyIndex];
          const sellAmount = Math.min(remainingSellAmount, buy.amount);
          const profit = (sell.price - buy.price) * sellAmount - (sell.fee * (sellAmount / sell.amount)) - (buy.fee * (sellAmount / buy.amount));
          
          realizedTrades.push({
            ...sell,
            amount: sellAmount,
            profit
          });

          remainingSellAmount -= sellAmount;
          buy.amount -= sellAmount;
          
          if (buy.amount <= 0) {
            buyIndex++;
          }
        }
      });
    });

    return realizedTrades;
  }

  private static getTimeSpan(trades: Trade[]): number {
    if (trades.length === 0) return 0;
    const first = trades[0].timestamp;
    const last = trades[trades.length - 1].timestamp;
    return Math.floor((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static calculateDailyReturns(trades: Trade[], portfolio: Portfolio): number[] {
    // Simplified calculation - in real implementation would use daily portfolio values
    return this.getRealizedTrades(trades).map(trade => trade.profit! / trade.total);
  }

  private static calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0;
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  private static calculateMaxDrawdown(trades: Trade[], portfolio: Portfolio): number {
    // Simplified calculation - would need historical portfolio values
    const realizedTrades = this.getRealizedTrades(trades);
    const losses = realizedTrades.filter(t => t.profit! < 0).map(t => Math.abs(t.profit!));
    return losses.length > 0 ? Math.max(...losses) : 0;
  }

  private static calculatePnLByPeriod(trades: Trade[], period: 'daily' | 'weekly' | 'monthly' | 'yearly'): PnLPoint[] {
    const periodMap = new Map<string, number>();
    const realizedTrades = this.getRealizedTrades(trades);

    realizedTrades.forEach(trade => {
      const key = this.getPeriodKey(trade.timestamp, period);
      periodMap.set(key, (periodMap.get(key) || 0) + trade.profit!);
    });

    return Array.from(periodMap.entries()).map(([key, value]) => {
      const timestamp = new Date(key);
      return {
        timestamp,
        value,
        percentage: 0 // Would need total investment to calculate percentage
      };
    });
  }

  private static calculateCumulativePnL(trades: Trade[]): PnLPoint[] {
    const realizedTrades = this.getRealizedTrades(trades);
    const cumulative: PnLPoint[] = [];
    let runningTotal = 0;

    realizedTrades.forEach(trade => {
      runningTotal += trade.profit!;
      cumulative.push({
        timestamp: trade.timestamp,
        value: runningTotal,
        percentage: 0
      });
    });

    return cumulative;
  }

  private static getPeriodKey(date: Date, period: 'daily' | 'weekly' | 'monthly' | 'yearly'): string {
    switch (period) {
      case 'daily':
        return date.toISOString().split('T')[0];
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'monthly':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      case 'yearly':
        return date.getFullYear().toString();
    }
  }

  private static getRebalancingAction(current: number, target: number): 'buy' | 'sell' | 'hold' {
    const difference = Math.abs(current - target);
    if (difference < 1) return 'hold';
    return current > target ? 'sell' : 'buy';
  }

  private static calculateRebalancingActions(portfolio: Portfolio, targetAllocation: Record<string, number>): RebalancingAction[] {
    const actions: RebalancingAction[] = [];
    const totalValue = portfolio.totalValue;

    Object.entries(targetAllocation).forEach(([symbol, targetPercentage]) => {
      const current = portfolio.assets.find(a => a.symbol === symbol);
      const currentValue = current?.totalValue || 0;
      const targetValue = (totalValue * targetPercentage) / 100;
      const difference = targetValue - currentValue;

      if (Math.abs(difference / totalValue) > 0.01) { // Only if difference > 1%
        actions.push({
          symbol,
          action: difference > 0 ? 'buy' : 'sell',
          amount: Math.abs(difference / (current?.currentPrice || 1)),
          value: Math.abs(difference),
          reason: `Rebalancing to target allocation of ${targetPercentage}%`
        });
      }
    });

    return actions;
  }

  private static calculateTradingFrequency(trades: Trade[]): number {
    if (trades.length === 0) return 0;
    const timeSpan = this.getTimeSpan(trades);
    return timeSpan > 0 ? trades.length / (timeSpan / 30) : 0; // Trades per month
  }

  private static calculateAverageHoldingPeriod(trades: Trade[]): number {
    const realizedTrades = this.getRealizedTrades(trades);
    if (realizedTrades.length === 0) return 0;
    
    const holdingPeriods = realizedTrades.map(trade => {
      // This is simplified - would need to match buys with sells
      return 7; // Default to 7 days for demonstration
    });
    
    return holdingPeriods.reduce((sum, period) => sum + period, 0) / holdingPeriods.length;
  }

  private static calculateRealizedGains(trades: Trade[]): number {
    return this.getRealizedTrades(trades).reduce((sum, trade) => sum + Math.max(0, trade.profit!), 0);
  }

  // Utility methods for data export
  static exportToCSV(data: any[], filename: string): void {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    this.downloadFile(csv, `${filename}.csv`, 'text/csv');
  }

  static exportToJSON(data: any, filename: string): void {
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, `${filename}.json`, 'application/json');
  }

  static exportToPDF(data: any, filename: string): void {
    // This would require a PDF library like jsPDF
    console.log('PDF export would be implemented here');
  }

  static exportToExcel(data: any[], filename: string): void {
    // This would require a library like xlsx
    console.log('Excel export would be implemented here');
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
