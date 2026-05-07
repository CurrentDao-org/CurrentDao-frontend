import { 
  Fund, 
  Budget, 
  SpendingProposal, 
  FundTransfer, 
  TreasuryTransaction,
  FinancialMetrics,
  BudgetVariance,
  SpendingTrend,
  TreasuryAnalytics,
  FundCategory,
  BudgetPeriod,
  ProposalStatus,
  VoteType,
  TransactionType
} from '../types/treasury';

export class TreasuryHelpers {
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  static formatLargeNumber(amount: number, currency: string = 'USD'): string {
    if (amount >= 1000000) {
      return `${currency} ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${currency} ${(amount / 1000).toFixed(1)}K`;
    }
    return this.formatCurrency(amount, currency);
  }

  static calculateFundUtilization(fund: Fund): number {
    if (fund.allocatedAmount === 0) return 0;
    return (fund.spentAmount / fund.allocatedAmount) * 100;
  }

  static calculateBudgetVariance(budget: Budget): number {
    return budget.actualAmount - budget.plannedAmount;
  }

  static calculateBudgetVariancePercentage(budget: Budget): number {
    if (budget.plannedAmount === 0) return 0;
    return (this.calculateBudgetVariance(budget) / budget.plannedAmount) * 100;
  }

  static getFundStatus(fund: Fund): 'healthy' | 'warning' | 'critical' | 'overBudget' {
    const utilization = this.calculateFundUtilization(fund);
    const remaining = fund.allocatedAmount - fund.spentAmount;
    const daysRemaining = Math.ceil((fund.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (fund.spentAmount > fund.allocatedAmount) {
      return 'overBudget';
    } else if (utilization > 90 || (remaining < 0 && daysRemaining > 0)) {
      return 'critical';
    } else if (utilization > 75 || (daysRemaining < 30 && utilization > 60)) {
      return 'warning';
    }
    return 'healthy';
  }

  static getProposalStatusColor(status: ProposalStatus): string {
    switch (status) {
      case ProposalStatus.APPROVED:
        return 'text-green-600 bg-green-50';
      case ProposalStatus.EXECUTED:
        return 'text-blue-600 bg-blue-50';
      case ProposalStatus.REJECTED:
      case ProposalStatus.CANCELLED:
        return 'text-red-600 bg-red-50';
      case ProposalStatus.VOTING:
        return 'text-yellow-600 bg-yellow-50';
      case ProposalStatus.UNDER_REVIEW:
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  static getCategoryDisplayName(category: FundCategory): string {
    switch (category) {
      case FundCategory.OPERATIONAL:
        return 'Operational';
      case FundCategory.DEVELOPMENT:
        return 'Development';
      case FundCategory.MARKETING:
        return 'Marketing';
      case FundCategory.COMMUNITY:
        return 'Community';
      case FundCategory.RESEARCH:
        return 'Research';
      case FundCategory.EMERGENCY:
        return 'Emergency';
      case FundCategory.RESERVES:
        return 'Reserves';
      case FundCategory.INCENTIVES:
        return 'Incentives';
      case FundCategory.LEGAL:
        return 'Legal';
      case FundCategory.OTHER:
        return 'Other';
      default:
        return 'Unknown';
    }
  }

  static getCategoryColor(category: FundCategory): string {
    switch (category) {
      case FundCategory.OPERATIONAL:
        return 'text-blue-600 bg-blue-50';
      case FundCategory.DEVELOPMENT:
        return 'text-purple-600 bg-purple-50';
      case FundCategory.MARKETING:
        return 'text-pink-600 bg-pink-50';
      case FundCategory.COMMUNITY:
        return 'text-green-600 bg-green-50';
      case FundCategory.RESEARCH:
        return 'text-indigo-600 bg-indigo-50';
      case FundCategory.EMERGENCY:
        return 'text-red-600 bg-red-50';
      case FundCategory.RESERVES:
        return 'text-yellow-600 bg-yellow-50';
      case FundCategory.INCENTIVES:
        return 'text-orange-600 bg-orange-50';
      case FundCategory.LEGAL:
        return 'text-gray-600 bg-gray-50';
      case FundCategory.OTHER:
        return 'text-slate-600 bg-slate-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  static calculateProposalVotes(proposal: SpendingProposal): { for: number; against: number; abstain: number; total: number } {
    const votes = proposal.votes.reduce(
      (acc, vote) => {
        switch (vote.vote) {
          case VoteType.FOR:
            acc.for += vote.power;
            break;
          case VoteType.AGAINST:
            acc.against += vote.power;
            break;
          case VoteType.ABSTAIN:
            acc.abstain += vote.power;
            break;
        }
        acc.total += vote.power;
        return acc;
      },
      { for: 0, against: 0, abstain: 0, total: 0 }
    );

    return votes;
  }

  static getProposalVoteResults(proposal: SpendingProposal): { percentage: number; isPassing: boolean } {
    const votes = this.calculateProposalVotes(proposal);
    const percentage = votes.total > 0 ? (votes.for / votes.total) * 100 : 0;
    const isPassing = percentage >= 50 && votes.for > votes.against;
    
    return { percentage, isPassing };
  }

  static calculateRunway(totalBalance: number, monthlyBurnRate: number): number {
    if (monthlyBurnRate <= 0) return Infinity;
    return Math.floor(totalBalance / monthlyBurnRate);
  }

  static calculateMonthlyBurnRate(transactions: TreasuryTransaction[]): number {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const monthlyTransactions = transactions.filter(
      tx => tx.type === TransactionType.WITHDRAWAL && 
             tx.createdAt >= oneMonthAgo &&
             tx.status === 'confirmed'
    );
    
    return monthlyTransactions.reduce((total, tx) => total + tx.amount, 0);
  }

  static generateFinancialMetrics(
    totalBalance: number,
    funds: Fund[],
    transactions: TreasuryTransaction[],
    proposals: SpendingProposal[]
  ): FinancialMetrics {
    const totalAllocatedFunds = funds.reduce((total, fund) => total + fund.allocatedAmount, 0);
    const totalSpentAmount = funds.reduce((total, fund) => total + fund.spentAmount, 0);
    const availableBalance = totalBalance - totalSpentAmount;
    const monthlyBurnRate = this.calculateMonthlyBurnRate(transactions);
    const runwayMonths = this.calculateRunway(availableBalance, monthlyBurnRate);
    const budgetUtilization = totalAllocatedFunds > 0 ? (totalSpentAmount / totalAllocatedFunds) * 100 : 0;
    const activeProposals = proposals.filter(p => 
      [ProposalStatus.SUBMITTED, ProposalStatus.UNDER_REVIEW, ProposalStatus.VOTING].includes(p.status)
    ).length;
    const pendingTransfers = transactions.filter(tx => tx.status === 'pending').length;

    return {
      totalTreasuryValue: totalBalance,
      totalAllocatedFunds,
      totalSpentAmount,
      availableBalance,
      monthlyBurnRate,
      runwayMonths,
      budgetUtilization,
      activeProposals,
      pendingTransfers,
      lastUpdated: new Date()
    };
  }

  static generateBudgetVariances(funds: Fund[], budgets: Budget[]): BudgetVariance[] {
    return funds.map(fund => {
      const fundBudgets = budgets.filter(budget => budget.fundId === fund.id);
      const totalPlanned = fundBudgets.reduce((total, budget) => total + budget.plannedAmount, 0);
      const totalActual = fundBudgets.reduce((total, budget) => total + budget.actualAmount, 0);
      const variance = totalActual - totalPlanned;
      const variancePercentage = totalPlanned > 0 ? (variance / totalPlanned) * 100 : 0;

      return {
        fundId: fund.id,
        fundName: fund.name,
        plannedAmount: totalPlanned,
        actualAmount: totalActual,
        variance,
        variancePercentage,
        period: BudgetPeriod.MONTHLY,
        startDate: fund.startDate,
        endDate: fund.endDate
      };
    });
  }

  static generateSpendingTrends(transactions: TreasuryTransaction[]): SpendingTrend[] {
    const trends: { [key: string]: SpendingTrend } = {};
    
    transactions
      .filter(tx => tx.type === TransactionType.WITHDRAWAL && tx.status === 'confirmed')
      .forEach(tx => {
        const period = new Date(tx.createdAt).toISOString().slice(0, 7); // YYYY-MM
        
        if (!trends[period]) {
          trends[period] = {
            period,
            amount: 0,
            category: FundCategory.OTHER,
            transactionCount: 0,
            averageTransactionSize: 0
          };
        }
        
        trends[period].amount += tx.amount;
        trends[period].transactionCount += 1;
      });

    Object.values(trends).forEach(trend => {
      trend.averageTransactionSize = trend.transactionCount > 0 
        ? trend.amount / trend.transactionCount 
        : 0;
    });

    return Object.values(trends).sort((a, b) => a.period.localeCompare(b.period));
  }

  static generateTreasuryAnalytics(
    funds: Fund[],
    transactions: TreasuryTransaction[],
    proposals: SpendingProposal[]
  ): TreasuryAnalytics {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentTransactions = transactions.filter(tx => tx.createdAt >= last30Days);
    const inflows = recentTransactions
      .filter(tx => tx.type === TransactionType.DEPOSIT && tx.status === 'confirmed')
      .reduce((total, tx) => total + tx.amount, 0);
    const outflows = recentTransactions
      .filter(tx => [TransactionType.WITHDRAWAL, TransactionType.PROPOSAL_PAYOUT].includes(tx.type) && tx.status === 'confirmed')
      .reduce((total, tx) => total + tx.amount, 0);

    const cashFlowTrend = this.generateCashFlowTrend(transactions);
    const fundPerformance = this.generateFundPerformance(funds);
    const proposalMetrics = this.generateProposalMetrics(proposals);
    const riskIndicators = this.generateRiskIndicators(funds, proposals, transactions);

    return {
      cashFlow: {
        inflows,
        outflows,
        netFlow: inflows - outflows,
        trend: cashFlowTrend
      },
      fundPerformance,
      proposalMetrics,
      riskIndicators
    };
  }

  private static generateCashFlowTrend(transactions: TreasuryTransaction[]): Array<{
    date: string;
    inflow: number;
    outflow: number;
    net: number;
  }> {
    const trend: { [key: string]: { date: string; inflow: number; outflow: number; net: number } } = {};
    
    transactions
      .filter(tx => tx.status === 'confirmed')
      .forEach(tx => {
        const date = tx.createdAt.toISOString().slice(0, 10);
        
        if (!trend[date]) {
          trend[date] = { date, inflow: 0, outflow: 0, net: 0 };
        }
        
        if (tx.type === TransactionType.DEPOSIT) {
          trend[date].inflow += tx.amount;
        } else if ([TransactionType.WITHDRAWAL, TransactionType.PROPOSAL_PAYOUT].includes(tx.type)) {
          trend[date].outflow += tx.amount;
        }
        
        trend[date].net = trend[date].inflow - trend[date].outflow;
      });

    return Object.values(trend).sort((a, b) => a.date.localeCompare(b.date));
  }

  private static generateFundPerformance(funds: Fund[]): { [fundId: string]: { utilization: number; efficiency: number; variance: number } } {
    return funds.reduce((performance, fund) => {
      const utilization = this.calculateFundUtilization(fund);
      const efficiency = fund.allocatedAmount > 0 ? (fund.spentAmount / fund.allocatedAmount) * 100 : 0;
      const variance = Math.abs(fund.spentAmount - fund.allocatedAmount);
      
      performance[fund.id] = { utilization, efficiency, variance };
      return performance;
    }, {} as { [fundId: string]: { utilization: number; efficiency: number; variance: number } });
  }

  private static generateProposalMetrics(proposals: SpendingProposal[]): {
    totalProposals: number;
    approvalRate: number;
    averageProcessingTime: number;
    topCategories: Array<{ category: FundCategory; count: number; amount: number }>;
  } {
    const totalProposals = proposals.length;
    const approvedProposals = proposals.filter(p => p.status === ProposalStatus.APPROVED || p.status === ProposalStatus.EXECUTED);
    const approvalRate = totalProposals > 0 ? (approvedProposals.length / totalProposals) * 100 : 0;
    
    const processingTimes = proposals
      .filter(p => p.updatedAt && p.createdAt)
      .map(p => (p.updatedAt.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24)); // days
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;

    const categoryStats = proposals.reduce((stats, proposal) => {
      if (!stats[proposal.category]) {
        stats[proposal.category] = { count: 0, amount: 0 };
      }
      stats[proposal.category].count += 1;
      stats[proposal.category].amount += proposal.requestedAmount;
      return stats;
    }, {} as { [category: string]: { count: number; amount: number } });

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category: category as FundCategory,
        count: stats.count,
        amount: stats.amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalProposals,
      approvalRate,
      averageProcessingTime,
      topCategories
    };
  }

  private static generateRiskIndicators(
    funds: Fund[],
    proposals: SpendingProposal[],
    transactions: TreasuryTransaction[]
  ): {
    concentrationRisk: number;
    liquidityRisk: number;
    budgetVariance: number;
    proposalBacklog: number;
  } {
    const totalAllocated = funds.reduce((total, fund) => total + fund.allocatedAmount, 0);
    const largestFund = Math.max(...funds.map(f => f.allocatedAmount), 0);
    const concentrationRisk = totalAllocated > 0 ? (largestFund / totalAllocated) * 100 : 0;

    const totalBalance = funds.reduce((total, fund) => total + (fund.allocatedAmount - fund.spentAmount), 0);
    const monthlyBurnRate = this.calculateMonthlyBurnRate(transactions);
    const liquidityRisk = monthlyBurnRate > 0 ? (monthlyBurnRate / totalBalance) * 100 : 0;

    const variances = funds.map(fund => Math.abs(fund.spentAmount - fund.allocatedAmount));
    const budgetVariance = variances.length > 0 
      ? (variances.reduce((sum, variance) => sum + variance, 0) / variances.length) / totalAllocated * 100 
      : 0;

    const proposalBacklog = proposals.filter(p => 
      [ProposalStatus.SUBMITTED, ProposalStatus.UNDER_REVIEW, ProposalStatus.VOTING].includes(p.status)
    ).length;

    return {
      concentrationRisk,
      liquidityRisk,
      budgetVariance,
      proposalBacklog
    };
  }

  static exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static validateTransferAmount(amount: number, fromFund: Fund): { isValid: boolean; error?: string } {
    if (amount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }
    
    const availableBalance = fromFund.allocatedAmount - fromFund.spentAmount;
    if (amount > availableBalance) {
      return { isValid: false, error: 'Insufficient funds available' };
    }

    return { isValid: true };
  }

  static validateProposalData(proposal: Partial<SpendingProposal>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!proposal.title?.trim()) {
      errors.push('Title is required');
    }

    if (!proposal.description?.trim()) {
      errors.push('Description is required');
    }

    if (!proposal.requestedAmount || proposal.requestedAmount <= 0) {
      errors.push('Requested amount must be greater than 0');
    }

    if (!proposal.fundId) {
      errors.push('Fund selection is required');
    }

    if (!proposal.category) {
      errors.push('Category selection is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static calculatePeriodStartDate(period: BudgetPeriod, endDate: Date): Date {
    const startDate = new Date(endDate);
    
    switch (period) {
      case BudgetPeriod.WEEKLY:
        startDate.setDate(startDate.getDate() - 7);
        break;
      case BudgetPeriod.MONTHLY:
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case BudgetPeriod.QUARTERLY:
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case BudgetPeriod.YEARLY:
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    return startDate;
  }

  static getPeriodDisplayName(period: BudgetPeriod): string {
    switch (period) {
      case BudgetPeriod.WEEKLY:
        return 'Weekly';
      case BudgetPeriod.MONTHLY:
        return 'Monthly';
      case BudgetPeriod.QUARTERLY:
        return 'Quarterly';
      case BudgetPeriod.YEARLY:
        return 'Yearly';
      case BudgetPeriod.CUSTOM:
        return 'Custom';
      default:
        return 'Unknown';
    }
  }
}
